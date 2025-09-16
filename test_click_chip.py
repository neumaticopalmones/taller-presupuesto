import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_click_chip_directo():
    """
    Test específico: verificar si el click en chip llena los campos
    """

    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5000")
        wait = WebDriverWait(driver, 5)

        print("🌐 Navegando a la aplicación...")
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Llenar SOLO medida para generar chips de precios
        print("📝 Llenando solo medida...")
        medida_input = driver.find_element(By.ID, "presupuesto-medida")
        medida_input.clear()
        medida_input.send_keys("205/55/16")

        # Disparar evento input para que cargue los precios por medida
        driver.execute_script("arguments[0].dispatchEvent(new Event('input'));", medida_input)

        # Esperar a que se carguen los chips de precios
        time.sleep(3)

        # Buscar chips en el contenedor de precios por medida
        print("🔍 Buscando chips de precios por medida...")
        precios_chips = driver.find_elements(By.CSS_SELECTOR, "#precios-por-medida .chip")

        print(f"📊 Encontrados {len(precios_chips)} chips de precios")

        if precios_chips:
            # Mostrar todos los chips disponibles
            print("📋 Chips disponibles:")
            for i, chip in enumerate(precios_chips):
                print(f"   {i+1}. '{chip.text}'")

            # Seleccionar un chip que contenga marca y precio
            chip_objetivo = None
            for chip in precios_chips:
                if "—" in chip.text and any(marca in chip.text.lower() for marca in ["michelin", "hankook", "bridgestone"]):
                    chip_objetivo = chip
                    break

            if chip_objetivo:
                print(f"\n🎯 Chip seleccionado: '{chip_objetivo.text}'")

                # Verificar estado ANTES del click
                print("\n🔍 ESTADO ANTES DEL CLICK:")
                marca_antes = driver.find_element(By.ID, "presupuesto-marca-temp").get_attribute("value")
                neto_antes = driver.find_element(By.ID, "presupuesto-neto-temp").get_attribute("value")
                print(f"   Marca: '{marca_antes}'")
                print(f"   Neto: '{neto_antes}'")

                # CLICK EN EL CHIP
                print("\n🖱️  HACIENDO CLICK EN CHIP...")
                driver.execute_script("arguments[0].click();", chip_objetivo)

                # Esperar un momento
                time.sleep(1)

                # Verificar estado DESPUÉS del click
                print("\n🔍 ESTADO DESPUÉS DEL CLICK:")
                marca_despues = driver.find_element(By.ID, "presupuesto-marca-temp").get_attribute("value")
                neto_despues = driver.find_element(By.ID, "presupuesto-neto-temp").get_attribute("value")
                print(f"   Marca: '{marca_despues}' {'✅' if marca_despues != marca_antes else '❌'}")
                print(f"   Neto: '{neto_despues}' {'✅' if neto_despues != neto_antes else '❌'}")

                # Análisis
                if marca_despues != marca_antes or neto_despues != neto_antes:
                    print("\n✅ CONCLUSIÓN: El chip SÍ llena los campos")

                    # Ahora probar el botón manual con campos llenos
                    print("\n🟢 Probando botón manual con campos llenos...")

                    # Llenar cantidad
                    cantidad_input = driver.find_element(By.ID, "presupuesto-cantidad")
                    cantidad_input.clear()
                    cantidad_input.send_keys("4")

                    # Limpiar logs
                    driver.get_log('browser')

                    # Click manual en botón
                    btn_manual = driver.find_element(By.ID, "btnAgregarMarca")
                    btn_manual.click()

                    time.sleep(2)

                    # Capturar logs
                    logs = driver.get_log('browser')

                    print("📋 Logs del botón manual:")
                    for log in logs:
                        if 'MANUAL-ADD' in log['message'] or log['level'] == 'SEVERE':
                            print(f"   {log['message']}")

                    # Verificar resultado
                    marcas_lista = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item, .marca-item")
                    print(f"\n📦 Marcas añadidas: {len(marcas_lista)}")

                    if len(marcas_lista) > 0:
                        print("✅ ¡EL BOTÓN MANUAL FUNCIONA!")
                    else:
                        print("❌ El botón manual no funciona")

                else:
                    print("\n❌ CONCLUSIÓN: El chip NO llena los campos")
                    print("   Problema: El evento click del chip no funciona")

            else:
                print("❌ No se encontraron chips con marca y precio")
        else:
            print("❌ No se encontraron chips de precios")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("\n⏳ Manteniendo navegador 8 segundos...")
        time.sleep(8)
        driver.quit()

if __name__ == "__main__":
    print("🔍 TEST ESPECÍFICO: CLICK EN CHIP")
    print("=" * 40)

    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo")
            test_click_chip_directo()
        else:
            print("❌ Servidor no responde")
    except requests.exceptions.ConnectionError:
        print("❌ Servidor no está corriendo")
