import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_flujo_manual_usuario():
    """
    Test que replica exactamente el flujo manual del usuario:
    1. Llenar medida manualmente (escribir)
    2. Seleccionar marca del recuadro de abajo
    3. Hacer click en botón verde
    """

    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5000")
        wait = WebDriverWait(driver, 5)

        print("🌐 Navegando a la aplicación...")
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # PASO 1: Llenar medida MANUALMENTE (escribiendo)
        print("📝 PASO 1: Escribiendo medida manualmente...")
        medida_input = driver.find_element(By.ID, "presupuesto-medida")
        medida_input.clear()
        medida_input.send_keys("205/55/16")

        # Simular pérdida de foco (como cuando el usuario hace tab o click fuera)
        medida_input.send_keys("\t")  # Tab para disparar blur/change

        # Esperar a que aparezcan las marcas en el recuadro de abajo
        print("⏳ Esperando a que aparezcan marcas en el recuadro...")
        time.sleep(3)

        # VERIFICAR: Ver si aparecieron chips de marcas
        precios_chips = driver.find_elements(By.CSS_SELECTOR, "#precios-por-medida .chip")
        print(f"📊 Encontrados {len(precios_chips)} chips de marcas en recuadro")

        if precios_chips:
            print("📋 Marcas disponibles en recuadro:")
            for i, chip in enumerate(precios_chips[:5]):  # Mostrar solo los primeros 5
                print(f"   {i+1}. '{chip.text}'")

            # PASO 2: Seleccionar una marca del recuadro (como hace el usuario)
            chip_marca = None
            for chip in precios_chips:
                if "michelin" in chip.text.lower() and "—" in chip.text:
                    chip_marca = chip
                    break

            if chip_marca:
                print(f"\n🎯 PASO 2: Seleccionando marca del recuadro: '{chip_marca.text}'")

                # Verificar campos ANTES de seleccionar marca
                print("\n🔍 CAMPOS ANTES DE SELECCIONAR MARCA:")
                medida_val = driver.find_element(By.ID, "presupuesto-medida").get_attribute("value")
                cantidad_val = driver.find_element(By.ID, "presupuesto-cantidad").get_attribute("value")
                marca_val = driver.find_element(By.ID, "presupuesto-marca-temp").get_attribute("value")
                neto_val = driver.find_element(By.ID, "presupuesto-neto-temp").get_attribute("value")

                print(f"   Medida: '{medida_val}'")
                print(f"   Cantidad: '{cantidad_val}'")
                print(f"   Marca: '{marca_val}'")
                print(f"   Neto: '{neto_val}'")

                # Click en la marca (del recuadro)
                chip_marca.click()
                time.sleep(1)

                # Verificar campos DESPUÉS de seleccionar marca
                print("\n🔍 CAMPOS DESPUÉS DE SELECCIONAR MARCA:")
                medida_val = driver.find_element(By.ID, "presupuesto-medida").get_attribute("value")
                cantidad_val = driver.find_element(By.ID, "presupuesto-cantidad").get_attribute("value")
                marca_val = driver.find_element(By.ID, "presupuesto-marca-temp").get_attribute("value")
                neto_val = driver.find_element(By.ID, "presupuesto-neto-temp").get_attribute("value")

                print(f"   Medida: '{medida_val}' {'✅' if medida_val else '❌'}")
                print(f"   Cantidad: '{cantidad_val}' {'✅' if cantidad_val else '❌'}")
                print(f"   Marca: '{marca_val}' {'✅' if marca_val else '❌'}")
                print(f"   Neto: '{neto_val}' {'✅' if neto_val else '❌'}")

                # Llenar TODOS los campos (como hace el usuario)
                print("\n📝 PASO 2.5: Llenando TODOS los campos como el usuario...")

                cantidad_input = driver.find_element(By.ID, "presupuesto-cantidad")
                cantidad_input.clear()
                cantidad_input.send_keys("2")
                print("   ✅ Cantidad: 2")

                ganancia_input = driver.find_element(By.ID, "presupuesto-ganancia")
                ganancia_input.clear()
                ganancia_input.send_keys("25")
                print("   ✅ Ganancia: 25")

                ecotasa_input = driver.find_element(By.ID, "presupuesto-ecotasa")
                ecotasa_input.clear()
                ecotasa_input.send_keys("2")
                print("   ✅ Ecotasa: 2")

                iva_input = driver.find_element(By.ID, "presupuesto-iva")
                iva_input.clear()
                iva_input.send_keys("21")
                print("   ✅ IVA: 21")

                # PASO 3: Click en botón verde (como hace el usuario)
                print("\n🟢 PASO 3: Haciendo click en botón verde...")

                # Limpiar logs antes del click
                driver.get_log('browser')

                btn_verde = driver.find_element(By.ID, "btnAgregarMarca")
                print(f"   Estado del botón: enabled={not btn_verde.get_attribute('disabled')}")

                btn_verde.click()
                time.sleep(2)

                # Capturar logs del click
                logs = driver.get_log('browser')
                print(f"\n📋 LOGS DEL BOTÓN ({len(logs)}):")
                for log in logs:
                    if 'MANUAL-ADD' in log['message'] or log['level'] == 'SEVERE':
                        level_icon = "🔴" if log['level'] == 'SEVERE' else "🟢"
                        print(f"   {level_icon} {log['message']}")

                # Verificar resultado
                marcas_lista = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item, .marca-item, [class*='marca']")
                print(f"\n📦 RESULTADO: {len(marcas_lista)} marcas añadidas")

                if len(marcas_lista) > 0:
                    print("✅ ¡EL BOTÓN FUNCIONA CON EL FLUJO MANUAL!")
                    for i, marca in enumerate(marcas_lista):
                        texto = marca.text.strip()
                        if texto:
                            print(f"   {i+1}. {texto[:80]}...")
                else:
                    print("❌ El botón no funcionó con el flujo manual")

                    # Buscar errores en la UI
                    try:
                        errores = driver.find_elements(By.CSS_SELECTOR, ".error, .red-text, .invalid")
                        if errores:
                            print("⚠️  Errores encontrados en UI:")
                            for error in errores:
                                if error.text.strip():
                                    print(f"     - {error.text}")
                    except:
                        pass

            else:
                print("❌ No se encontró chip de marca michelin en el recuadro")
        else:
            print("❌ No aparecieron marcas en el recuadro después de llenar medida")
            print("   Esto puede indicar que no hay precios guardados para esta medida")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("\n⏳ Manteniendo navegador 10 segundos para verificación manual...")
        time.sleep(10)
        driver.quit()

if __name__ == "__main__":
    print("👤 TEST FLUJO MANUAL DEL USUARIO")
    print("=" * 50)

    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo")
            test_flujo_manual_usuario()
        else:
            print("❌ Servidor no responde")
    except requests.exceptions.ConnectionError:
        print("❌ Servidor no está corriendo")
        print("   Ejecuta: python run.py")
