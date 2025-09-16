import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_debug_auto_add():
    """
    Test de debugging detallado para entender por qué no funciona el auto-add
    """

    driver = webdriver.Chrome()
    try:
        # Paso 1: Abrir aplicación
        driver.get("http://localhost:5000")
        wait = WebDriverWait(driver, 5)

        print("🌐 Navegando a la aplicación...")

        # Esperar a que cargue la aplicación
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Limpiar logs previos
        driver.get_log('browser')

        # Paso 2: Llenar campos básicos
        print("📝 Llenando campos básicos...")
        medida_input = driver.find_element(By.ID, "presupuesto-medida")
        medida_input.clear()
        medida_input.send_keys("205/55/16")

        cantidad_input = driver.find_element(By.ID, "presupuesto-cantidad")
        cantidad_input.clear()
        cantidad_input.send_keys("4")

        time.sleep(1)

        # Paso 3: Cargar sugerencias
        print("🔍 Cargando sugerencias...")
        btn_cargar = driver.find_element(By.ID, "btnCargarSugerencias")
        btn_cargar.click()

        time.sleep(2)

        # Paso 4: Buscar chips que contengan marca y precio
        chips = driver.find_elements(By.CSS_SELECTOR, ".chip")
        chips_con_precio = [chip for chip in chips if "—" in chip.text and any(marca in chip.text.lower() for marca in ["michelin", "hankook", "bridgestone"])]

        print(f"✅ Encontrados {len(chips)} chips totales")
        print(f"🎯 Encontrados {len(chips_con_precio)} chips con precio")

        if chips_con_precio:
            chip_seleccionado = chips_con_precio[0]
            print(f"🖱️  Haciendo click en: '{chip_seleccionado.text}'")

            # LIMPIAR LOGS ANTES DEL CLICK
            driver.get_log('browser')

            # CLICK EN EL CHIP
            chip_seleccionado.click()

            # Esperar a que se procesen todas las funciones
            print("⏳ Esperando 3 segundos para procesar...")
            time.sleep(3)

            # CAPTURAR TODOS LOS LOGS
            logs = driver.get_log('browser')

            print(f"\n📋 TODOS LOS LOGS DE CONSOLA ({len(logs)} mensajes):")
            for i, log in enumerate(logs):
                print(f"   {i+1}. [{log['level']}] {log['message']}")

            # Verificar campos específicamente
            print("\n🔍 ESTADO FINAL DE LOS CAMPOS:")
            medida_val = driver.find_element(By.ID, "presupuesto-medida").get_attribute("value")
            cantidad_val = driver.find_element(By.ID, "presupuesto-cantidad").get_attribute("value")
            marca_val = driver.find_element(By.ID, "presupuesto-marca-temp").get_attribute("value")
            neto_val = driver.find_element(By.ID, "presupuesto-neto-temp").get_attribute("value")

            print(f"   Medida: '{medida_val}'")
            print(f"   Cantidad: '{cantidad_val}'")
            print(f"   Marca: '{marca_val}'")
            print(f"   Neto: '{neto_val}'")

            # Verificar si el botón existe
            try:
                btn_add = driver.find_element(By.ID, "btnAgregarMarca")
                print(f"\n🔘 BOTÓN 'Añadir Marca':")
                print(f"   Existe: ✅")
                print(f"   Disabled: {btn_add.get_attribute('disabled')}")
                print(f"   Display: {btn_add.value_of_css_property('display')}")
                print(f"   Texto: '{btn_add.text}'")
            except:
                print("\n❌ BOTÓN 'Añadir Marca' NO ENCONTRADO")

            # Verificar lista de marcas
            marcas_lista = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item")
            print(f"\n📦 LISTA DE MARCAS: {len(marcas_lista)} items")

            if len(marcas_lista) > 0:
                print("✅ HAY MARCAS EN LA LISTA:")
                for i, marca in enumerate(marcas_lista):
                    print(f"   {i+1}. {marca.text[:100]}")
            else:
                print("❌ NO HAY MARCAS EN LA LISTA")

        else:
            print("❌ No se encontraron chips con precio")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("\n⏳ Manteniendo navegador abierto 10 segundos...")
        time.sleep(10)
        driver.quit()

if __name__ == "__main__":
    print("🔍 TEST DE DEBUGGING DETALLADO")
    print("=" * 50)

    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo")
            test_debug_auto_add()
        else:
            print("❌ Servidor no responde")
    except requests.exceptions.ConnectionError:
        print("❌ Servidor no está corriendo")
