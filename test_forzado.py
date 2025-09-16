import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_forzar_ejecucion():
    """
    Test que fuerza la ejecución directa de handleAddMarca
    para probar si el auto-add funciona una vez que se ejecuta
    """

    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5000")
        wait = WebDriverWait(driver, 5)

        print("🌐 Navegando a la aplicación...")
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Llenar medida
        print("📝 Llenando medida...")
        medida_input = driver.find_element(By.ID, "presupuesto-medida")
        medida_input.clear()
        medida_input.send_keys("205/55/16")
        medida_input.send_keys("\t")

        time.sleep(2)

        # Seleccionar marca del recuadro
        print("🎯 Seleccionando marca...")
        chips = driver.find_elements(By.CSS_SELECTOR, "#precios-por-medida .chip")
        for chip in chips:
            if "michelin" in chip.text.lower() and "—" in chip.text:
                chip.click()
                break

        time.sleep(1)

        # Llenar TODOS los campos como el usuario
        print("📝 Llenando todos los campos...")

        cantidad_input = driver.find_element(By.ID, "presupuesto-cantidad")
        cantidad_input.clear()
        cantidad_input.send_keys("2")

        ganancia_input = driver.find_element(By.ID, "presupuesto-ganancia")
        ganancia_input.clear()
        ganancia_input.send_keys("25")

        ecotasa_input = driver.find_element(By.ID, "presupuesto-ecotasa")
        ecotasa_input.clear()
        ecotasa_input.send_keys("2")

        iva_input = driver.find_element(By.ID, "presupuesto-iva")
        iva_input.clear()
        iva_input.send_keys("21")

        # Verificar que todos los campos están llenos
        print("\n🔍 VERIFICANDO CAMPOS:")
        medida_val = driver.find_element(By.ID, "presupuesto-medida").get_attribute("value")
        cantidad_val = driver.find_element(By.ID, "presupuesto-cantidad").get_attribute("value")
        marca_val = driver.find_element(By.ID, "presupuesto-marca-temp").get_attribute("value")
        neto_val = driver.find_element(By.ID, "presupuesto-neto-temp").get_attribute("value")
        ganancia_val = driver.find_element(By.ID, "presupuesto-ganancia").get_attribute("value")
        ecotasa_val = driver.find_element(By.ID, "presupuesto-ecotasa").get_attribute("value")
        iva_val = driver.find_element(By.ID, "presupuesto-iva").get_attribute("value")

        print(f"   Medida: '{medida_val}' {'✅' if medida_val else '❌'}")
        print(f"   Cantidad: '{cantidad_val}' {'✅' if cantidad_val else '❌'}")
        print(f"   Marca: '{marca_val}' {'✅' if marca_val else '❌'}")
        print(f"   Neto: '{neto_val}' {'✅' if neto_val else '❌'}")
        print(f"   Ganancia: '{ganancia_val}' {'✅' if ganancia_val else '❌'}")
        print(f"   Ecotasa: '{ecotasa_val}' {'✅' if ecotasa_val else '❌'}")
        print(f"   IVA: '{iva_val}' {'✅' if iva_val else '❌'}")

        # EJECUTAR FUNCIÓN DIRECTAMENTE (como si fueras tú)
        print("\n🚀 EJECUTANDO handleAddMarca() DIRECTAMENTE...")

        # Limpiar logs
        driver.get_log('browser')

        # Ejecutar función usando JavaScript (bypass del event listener)
        driver.execute_script("handleAddMarca();")

        time.sleep(2)

        # Capturar logs
        logs = driver.get_log('browser')
        print(f"\n📋 LOGS DE EJECUCIÓN DIRECTA ({len(logs)}):")
        manual_logs = []
        for log in logs:
            if 'MANUAL-ADD' in log['message']:
                print(f"   🟢 {log['message']}")
                manual_logs.append(log['message'])
            elif log['level'] == 'SEVERE':
                print(f"   🔴 ERROR: {log['message']}")

        # Verificar si se añadió la marca
        marcas_lista = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item, .marca-item")
        print(f"\n📦 RESULTADO EJECUCIÓN DIRECTA: {len(marcas_lista)} marcas")

        if len(marcas_lista) > 0:
            print("✅ ¡FUNCIONA! La función handleAddMarca SÍ añade marcas")
            print("💡 El problema está en el event listener del botón en Selenium")

            # Ahora probemos el auto-add
            print("\n" + "="*50)
            print("🤖 AHORA PROBANDO AUTO-ADD...")
            print("="*50)

            # Cargar sugerencias para probar auto-add
            print("🔍 Cargando sugerencias...")
            btn_cargar = driver.find_element(By.ID, "btnCargarSugerencias")
            btn_cargar.click()
            time.sleep(2)

            # Buscar chips de sugerencias
            sugerencias_chips = driver.find_elements(By.CSS_SELECTOR, "#sugerencias-medidas .chip, #sugerencias-marcas .chip")
            if sugerencias_chips:
                print(f"📊 Encontrados {len(sugerencias_chips)} chips de sugerencias")

                # Buscar un chip de marca específica
                chip_marca = None
                for chip in sugerencias_chips:
                    if len(chip.text) > 3 and "bridgestone" in chip.text.lower():
                        chip_marca = chip
                        break

                if chip_marca:
                    print(f"🎯 Probando auto-add con chip: '{chip_marca.text}'")

                    # Limpiar logs
                    driver.get_log('browser')

                    # Click en chip de marca para probar auto-add
                    chip_marca.click()

                    # Esperar timeout del auto-add (1000ms)
                    time.sleep(2)

                    # Capturar logs de auto-add
                    logs_auto = driver.get_log('browser')
                    print(f"\n📋 LOGS DE AUTO-ADD ({len(logs_auto)}):")
                    for log in logs_auto:
                        if 'AUTO-ADD' in log['message']:
                            print(f"   🤖 {log['message']}")
                        elif log['level'] == 'SEVERE':
                            print(f"   🔴 ERROR: {log['message']}")

                    # Verificar resultado auto-add
                    marcas_lista_auto = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item, .marca-item")
                    print(f"\n📦 RESULTADO AUTO-ADD: {len(marcas_lista_auto)} marcas totales")

                    if len(marcas_lista_auto) > len(marcas_lista):
                        print("✅ ¡AUTO-ADD TAMBIÉN FUNCIONA!")
                    else:
                        print("❌ Auto-add no funcionó")
                else:
                    print("❌ No se encontró chip de marca para probar auto-add")
            else:
                print("❌ No se encontraron chips de sugerencias")

        else:
            print("❌ La función handleAddMarca no funcionó ni ejecutándola directamente")
            print("💡 Hay un problema en la función misma")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("\n⏳ Manteniendo navegador 10 segundos...")
        time.sleep(10)
        driver.quit()

if __name__ == "__main__":
    print("🚀 TEST FORZADO: EJECUCIÓN DIRECTA + AUTO-ADD")
    print("=" * 50)

    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo")
            test_forzar_ejecucion()
        else:
            print("❌ Servidor no responde")
    except requests.exceptions.ConnectionError:
        print("❌ Servidor no está corriendo")
