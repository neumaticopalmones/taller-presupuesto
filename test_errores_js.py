import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_errores_javascript():
    """
    Test específico para detectar errores JavaScript que impiden
    el funcionamiento del botón
    """

    driver = webdriver.Chrome()
    try:
        print("🌐 Cargando aplicación...")

        # Capturar TODOS los logs desde el inicio
        driver.get("http://localhost:5000")
        wait = WebDriverWait(driver, 5)
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Capturar logs de carga inicial
        logs_iniciales = driver.get_log('browser')
        print(f"\n📋 LOGS DE CARGA INICIAL ({len(logs_iniciales)}):")
        errores_criticos = []

        for log in logs_iniciales:
            level = log['level']
            message = log['message']

            if level == 'SEVERE':
                print(f"   🔴 ERROR: {message}")
                errores_criticos.append(message)
            elif level == 'WARNING':
                print(f"   🟡 WARN: {message}")
            else:
                print(f"   ℹ️  INFO: {message}")

        if errores_criticos:
            print(f"\n⚠️  ENCONTRADOS {len(errores_criticos)} ERRORES CRÍTICOS:")
            for error in errores_criticos:
                print(f"   - {error}")
            print("\n💡 Estos errores pueden impedir que funcionen los event listeners")
        else:
            print("\n✅ No hay errores críticos en la carga inicial")

        # Verificar que el botón existe y tiene event listener
        print("\n🔍 VERIFICANDO BOTÓN:")
        try:
            btn = driver.find_element(By.ID, "btnAgregarMarca")
            print(f"   ✅ Botón encontrado: {btn.tag_name}")
            print(f"   ✅ Texto: '{btn.text}'")
            print(f"   ✅ Enabled: {not btn.get_attribute('disabled')}")

            # Verificar si tiene event listeners usando JavaScript
            has_listeners = driver.execute_script("""
                const btn = document.getElementById('btnAgregarMarca');
                return btn && typeof btn.onclick === 'function' ||
                       (btn && btn.addEventListener !== undefined);
            """)
            print(f"   {'✅' if has_listeners else '❌'} Event listeners: {has_listeners}")

        except Exception as e:
            print(f"   ❌ Error al encontrar botón: {e}")

        # Verificar que la función handleAddMarca existe
        print("\n🔍 VERIFICANDO FUNCIÓN handleAddMarca:")
        function_exists = driver.execute_script("""
            return typeof handleAddMarca === 'function';
        """)
        print(f"   {'✅' if function_exists else '❌'} Función existe: {function_exists}")

        if not function_exists:
            print("   💡 La función handleAddMarca no está definida o no es accesible")

        # Test simple: intentar ejecutar la función directamente
        if function_exists:
            print("\n🧪 PROBANDO FUNCIÓN DIRECTAMENTE:")

            # Llenar campos primero
            medida_input = driver.find_element(By.ID, "presupuesto-medida")
            medida_input.clear()
            medida_input.send_keys("205/55/16")
            medida_input.send_keys("\t")

            time.sleep(2)

            # Seleccionar marca del recuadro
            chips = driver.find_elements(By.CSS_SELECTOR, "#precios-por-medida .chip")
            if chips:
                for chip in chips:
                    if "michelin" in chip.text.lower() and "—" in chip.text:
                        chip.click()
                        break

                time.sleep(1)

                # Llenar cantidad
                cantidad_input = driver.find_element(By.ID, "presupuesto-cantidad")
                cantidad_input.clear()
                cantidad_input.send_keys("4")

                # Limpiar logs
                driver.get_log('browser')

                # Ejecutar función directamente por JavaScript
                print("   🔧 Ejecutando handleAddMarca() directamente...")
                driver.execute_script("handleAddMarca();")

                time.sleep(2)

                # Capturar logs
                logs_direct = driver.get_log('browser')
                print(f"\n📋 LOGS DE EJECUCIÓN DIRECTA ({len(logs_direct)}):")
                for log in logs_direct:
                    if 'MANUAL-ADD' in log['message'] or log['level'] == 'SEVERE':
                        level_icon = "🔴" if log['level'] == 'SEVERE' else "🟢"
                        print(f"   {level_icon} {log['message']}")

                # Verificar resultado
                marcas = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item, .marca-item")
                print(f"\n📦 RESULTADO EJECUCIÓN DIRECTA: {len(marcas)} marcas")

                if len(marcas) > 0:
                    print("✅ ¡La función SÍ funciona cuando se ejecuta directamente!")
                    print("💡 El problema está en el event listener del click")
                else:
                    print("❌ La función no funciona ni siquiera ejecutándola directamente")

        print(f"\n🔍 RESUMEN:")
        print(f"   Errores críticos: {len(errores_criticos)}")
        print(f"   Botón existe: {'✅' if 'btn' in locals() else '❌'}")
        print(f"   Función existe: {'✅' if function_exists else '❌'}")

    except Exception as e:
        print(f"❌ Error en test: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("\n⏳ Manteniendo navegador 8 segundos...")
        time.sleep(8)
        driver.quit()

if __name__ == "__main__":
    print("🔍 TEST DE ERRORES JAVASCRIPT")
    print("=" * 40)

    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo")
            test_errores_javascript()
        else:
            print("❌ Servidor no responde")
    except requests.exceptions.ConnectionError:
        print("❌ Servidor no está corriendo")
