import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Test de auto-añadir con datos reales
def test_auto_add_real_scenario():
    """
    Replica exactamente el escenario del usuario:
    1. Llenar solo medida (IMPORTANTE: no llenar cantidad ni ganancia)
    2. Cargar sugerencias
    3. Hacer click en un chip
    4. Ver si auto-añade (esperamos que NO lo haga porque faltan campos)
    """

    driver = webdriver.Chrome()
    try:
        # Paso 1: Abrir aplicación
        driver.get("http://localhost:5000")
        wait = WebDriverWait(driver, 5)

        print("🌐 Navegando a la aplicación...")

        # Esperar a que cargue la aplicación
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Paso 2: SOLO llenar medida (como en tu screenshot)
        print("📝 Llenando SOLO el campo medida...")
        medida_input = driver.find_element(By.ID, "presupuesto-medida")
        medida_input.clear()
        medida_input.send_keys("205/55/16")

        print("⚠️  IMPORTANTE: NO llenamos cantidad ni otros campos (como en tu caso)")

        # Paso 3: Cargar sugerencias
        print("🔍 Cargando sugerencias...")
        btn_cargar = driver.find_element(By.ID, "btnCargarSugerencias")
        btn_cargar.click()

        # Esperar a que aparezcan las sugerencias
        time.sleep(2)

        # Verificar que hay chips
        chips = driver.find_elements(By.CSS_SELECTOR, ".chip")
        print(f"✅ Encontrados {len(chips)} chips de sugerencias")

        if chips:
            # Paso 4: Click en el primer chip
            print(f"🖱️  Haciendo click en el chip: '{chips[0].text}'")
            chips[0].click()

            # Paso 5: Esperar y verificar el debug en la consola
            time.sleep(3)

            # Obtener logs de la consola
            logs = driver.get_log('browser')
            auto_add_logs = [log for log in logs if 'AUTO-ADD' in log['message']]

            print("\n📋 LOGS DE AUTO-ADD:")
            for log in auto_add_logs:
                print(f"   {log['message']}")

            # Verificar estado de los campos después del click
            print("\n🔍 ESTADO DE LOS CAMPOS DESPUÉS DEL CLICK:")
            medida_val = driver.find_element(By.ID, "presupuesto-medida").get_attribute("value")
            cantidad_val = driver.find_element(By.ID, "presupuesto-cantidad").get_attribute("value")
            neto_val = driver.find_element(By.ID, "presupuesto-neto-temp").get_attribute("value")

            print(f"   Medida: '{medida_val}'")
            print(f"   Cantidad: '{cantidad_val}' {'✅' if cantidad_val else '❌ VACÍO'}")
            print(f"   Neto: '{neto_val}' {'✅' if neto_val else '❌ VACÍO'}")

            # Verificar si se añadió automáticamente
            marcas_lista = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item")
            print(f"\n📦 MARCAS EN LA LISTA: {len(marcas_lista)}")

            if len(marcas_lista) > 0:
                print("✅ SE AÑADIÓ AUTOMÁTICAMENTE!")
            else:
                print("❌ NO SE AÑADIÓ AUTOMÁTICAMENTE (esperado si faltan campos)")

        else:
            print("❌ No se encontraron chips de sugerencias")

    except Exception as e:
        print(f"❌ Error: {e}")

    finally:
        print("\n⏳ Esperando 5 segundos para que puedas ver el resultado...")
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    print("🧪 INICIANDO TEST DE AUTO-ADD REAL")
    print("=" * 50)

    # Verificar que el servidor esté corriendo
    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo en localhost:5000")
            test_auto_add_real_scenario()
        else:
            print("❌ Servidor no responde correctamente")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Servidor no está corriendo en localhost:5000")
        print("   Ejecuta: python run.py")
