import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_debug_completo():
    """
    Test de debugging completo que captura TODOS los logs
    """

    # Habilitar logging completo en Chrome
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--enable-logging")
    chrome_options.add_argument("--log-level=0")

    driver = webdriver.Chrome(options=chrome_options)

    try:
        driver.get("http://localhost:5000")
        wait = WebDriverWait(driver, 5)

        print("🌐 Navegando a la aplicación...")
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Limpiar logs iniciales
        driver.get_log('browser')

        # Llenar campos
        print("📝 Llenando campos...")
        medida_input = driver.find_element(By.ID, "presupuesto-medida")
        medida_input.clear()
        medida_input.send_keys("205/55/16")

        cantidad_input = driver.find_element(By.ID, "presupuesto-cantidad")
        cantidad_input.clear()
        cantidad_input.send_keys("4")

        # Cargar sugerencias
        print("🔍 Cargando sugerencias...")
        btn_cargar = driver.find_element(By.ID, "btnCargarSugerencias")
        btn_cargar.click()
        time.sleep(2)

        # Buscar chips con precio
        chips = driver.find_elements(By.CSS_SELECTOR, ".chip")
        chips_con_precio = [chip for chip in chips if "—" in chip.text and "michelin" in chip.text.lower()]

        if chips_con_precio:
            print(f"🖱️  Haciendo click en: '{chips_con_precio[0].text}'")

            # Limpiar logs antes del click
            driver.get_log('browser')

            # CLICK EN CHIP
            chips_con_precio[0].click()
            time.sleep(2)

            # CLICK MANUAL EN BOTÓN
            print("🟢 Haciendo click manual en botón...")

            # Limpiar logs antes del click manual
            driver.get_log('browser')

            btn_manual = driver.find_element(By.ID, "btnAgregarMarca")
            btn_manual.click()

            # Esperar y capturar logs
            time.sleep(2)

            # CAPTURAR TODOS LOS LOGS
            all_logs = driver.get_log('browser')

            print(f"\n📋 TODOS LOS LOGS DESPUÉS DEL CLICK MANUAL ({len(all_logs)}):")
            for i, log in enumerate(all_logs):
                level = log['level']
                message = log['message']

                # Colorear según nivel
                if level == 'SEVERE':
                    print(f"   {i+1}. 🔴 [ERROR] {message}")
                elif level == 'WARNING':
                    print(f"   {i+1}. 🟡 [WARN] {message}")
                elif 'MANUAL-ADD' in message:
                    print(f"   {i+1}. 🟢 [MANUAL] {message}")
                elif 'AUTO-ADD' in message:
                    print(f"   {i+1}. 🤖 [AUTO] {message}")
                else:
                    print(f"   {i+1}. ℹ️  [INFO] {message}")

            # Verificar estado final
            print("\n🔍 ESTADO FINAL:")
            marcas_lista = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item")
            print(f"   Marcas en lista: {len(marcas_lista)}")

            # Verificar si hay mensajes de error en la UI
            try:
                error_msgs = driver.find_elements(By.CSS_SELECTOR, ".error, .invalid, .red-text")
                if error_msgs:
                    print("   Errores UI:")
                    for error in error_msgs:
                        if error.text.strip():
                            print(f"     - {error.text}")
                else:
                    print("   No hay errores en UI")
            except:
                pass

            # Verificar elementos del formulario
            print("\n🔍 VERIFICACIÓN DE ELEMENTOS:")
            elementos = [
                "presupuesto-medida",
                "presupuesto-cantidad",
                "presupuesto-marca-temp",
                "presupuesto-neto-temp",
                "btnAgregarMarca",
                "marcasLista"
            ]

            for elem_id in elementos:
                try:
                    elem = driver.find_element(By.ID, elem_id)
                    if elem_id.startswith("presupuesto-"):
                        value = elem.get_attribute("value") or "(vacío)"
                        print(f"   {elem_id}: '{value}'")
                    else:
                        print(f"   {elem_id}: ✅ Existe")
                except:
                    print(f"   {elem_id}: ❌ No encontrado")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("\n⏳ Manteniendo navegador 10 segundos...")
        time.sleep(10)
        driver.quit()

if __name__ == "__main__":
    print("🔍 TEST DE DEBUGGING COMPLETO")
    print("=" * 50)

    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo")
            test_debug_completo()
        else:
            print("❌ Servidor no responde")
    except requests.exceptions.ConnectionError:
        print("❌ Servidor no está corriendo")
