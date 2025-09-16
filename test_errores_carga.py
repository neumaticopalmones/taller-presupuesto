import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_capturar_errores_carga():
    """
    Test específico para capturar errores de carga de JavaScript
    """

    driver = webdriver.Chrome()
    try:
        print("🌐 Cargando aplicación y capturando TODOS los errores...")

        driver.get("http://localhost:5000")

        # Esperar a que cargue completamente
        wait = WebDriverWait(driver, 10)
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Dar tiempo extra para que se ejecuten todos los scripts
        time.sleep(3)

        # Capturar TODOS los logs
        all_logs = driver.get_log('browser')

        print(f"\n📋 TODOS LOS LOGS DE CARGA ({len(all_logs)}):")
        errores_criticos = []
        warnings = []
        infos = []

        for log in all_logs:
            level = log['level']
            message = log['message']

            if level == 'SEVERE':
                print(f"   🔴 ERROR: {message}")
                errores_criticos.append(message)
            elif level == 'WARNING':
                print(f"   🟡 WARN: {message}")
                warnings.append(message)
            else:
                print(f"   ℹ️  INFO: {message}")
                infos.append(message)

        print(f"\n📊 RESUMEN:")
        print(f"   🔴 Errores críticos: {len(errores_criticos)}")
        print(f"   🟡 Advertencias: {len(warnings)}")
        print(f"   ℹ️  Información: {len(infos)}")

        # Verificar si handleAddMarca existe
        print(f"\n🔍 VERIFICANDO FUNCIONES:")
        try:
            handleAddMarca_exists = driver.execute_script("return typeof handleAddMarca === 'function';")
            print(f"   handleAddMarca: {'✅ Definida' if handleAddMarca_exists else '❌ No definida'}")
        except Exception as e:
            print(f"   handleAddMarca: ❌ Error al verificar: {e}")

        # Verificar si hay variables globales importantes
        try:
            window_vars = driver.execute_script("""
                const vars = {};
                vars.isNotEmpty = typeof isNotEmpty;
                vars.isValidNumber = typeof isValidNumber;
                vars.API = typeof API;
                vars.State = typeof State;
                vars.UI = typeof UI;
                return vars;
            """)
            print(f"\n🔍 VARIABLES GLOBALES:")
            for var, type_val in window_vars.items():
                status = "✅" if type_val != "undefined" else "❌"
                print(f"   {var}: {status} {type_val}")
        except Exception as e:
            print(f"   ❌ Error al verificar variables: {e}")

        # Intentar encontrar donde se define handleAddMarca
        try:
            scripts = driver.find_elements(By.TAG_NAME, "script")
            print(f"\n🔍 SCRIPTS CARGADOS: {len(scripts)}")
            for i, script in enumerate(scripts):
                src = script.get_attribute("src")
                if src:
                    print(f"   {i+1}. {src}")
        except:
            pass

        # Si hay errores críticos, analizarlos
        if errores_criticos:
            print(f"\n⚠️  ANÁLISIS DE ERRORES CRÍTICOS:")
            for error in errores_criticos:
                if "main.js" in error:
                    print(f"   🎯 Error en main.js: {error}")
                elif "Uncaught" in error:
                    print(f"   🎯 Error no capturado: {error}")
                elif "ReferenceError" in error:
                    print(f"   🎯 Variable no definida: {error}")
                elif "SyntaxError" in error:
                    print(f"   🎯 Error de sintaxis: {error}")

        print(f"\n💡 CONCLUSIÓN:")
        if not handleAddMarca_exists:
            print("   ❌ La función handleAddMarca no se está definiendo")
            print("   🔍 Esto puede ser por:")
            print("     - Error JavaScript que impide la carga completa del script")
            print("     - Función definida dentro de un scope no global")
            print("     - Script main.js no se está cargando correctamente")
        else:
            print("   ✅ La función handleAddMarca existe")
            print("   🤔 El problema está en otro lado")

    except Exception as e:
        print(f"❌ Error en test: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("\n⏳ Manteniendo navegador 8 segundos...")
        time.sleep(8)
        driver.quit()

if __name__ == "__main__":
    print("🔍 TEST CAPTURA DE ERRORES DE CARGA")
    print("=" * 50)

    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo")
            test_capturar_errores_carga()
        else:
            print("❌ Servidor no responde")
    except requests.exceptions.ConnectionError:
        print("❌ Servidor no está corriendo")
