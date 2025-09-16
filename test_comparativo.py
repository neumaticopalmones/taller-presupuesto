import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_comparativo_auto_vs_manual():
    """
    Test comparativo: Auto-add vs Manual
    Para identificar qué diferencia hay entre ambos métodos
    """

    driver = webdriver.Chrome()
    try:
        # ========================
        # PRUEBA 1: AUTO-ADD
        # ========================
        print("🤖 PRUEBA 1: AUTO-ADD")
        print("=" * 40)

        driver.get("http://localhost:5000")
        wait = WebDriverWait(driver, 5)

        # Esperar carga
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Llenar campos básicos
        print("📝 Llenando campos para auto-add...")
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

        # Buscar chip con precio
        chips = driver.find_elements(By.CSS_SELECTOR, ".chip")
        chips_con_precio = [chip for chip in chips if "—" in chip.text and any(marca in chip.text.lower() for marca in ["michelin", "hankook"])]

        if chips_con_precio:
            # Limpiar logs
            driver.get_log('browser')

            # Click en chip
            chip_auto = chips_con_precio[0]
            print(f"🖱️  AUTO-ADD: Click en '{chip_auto.text}'")
            chip_auto.click()

            # Esperar y capturar logs
            time.sleep(3)
            logs_auto = driver.get_log('browser')

            # Verificar resultado
            marcas_auto = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item")
            print(f"📦 AUTO-ADD: {len(marcas_auto)} marcas añadidas")

            # Mostrar logs relevantes
            logs_auto_add = [log for log in logs_auto if 'AUTO-ADD' in log['message']]
            print(f"📋 AUTO-ADD: {len(logs_auto_add)} logs encontrados")
            for log in logs_auto_add:
                print(f"   {log['message']}")

            if len(marcas_auto) > 0:
                print("✅ AUTO-ADD: ¡FUNCIONÓ!")
            else:
                print("❌ AUTO-ADD: No funcionó")

        # ========================
        # PRUEBA 2: MANUAL (NUEVA SESIÓN)
        # ========================
        print("\n" + "=" * 40)
        print("👨 PRUEBA 2: MANUAL")
        print("=" * 40)

        # Recargar página para empezar limpio
        driver.get("http://localhost:5000")
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Llenar campos básicos IDÉNTICOS
        print("📝 Llenando campos para manual...")
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

        # Buscar el MISMO chip
        chips = driver.find_elements(By.CSS_SELECTOR, ".chip")
        chips_con_precio = [chip for chip in chips if "—" in chip.text and any(marca in chip.text.lower() for marca in ["michelin", "hankook"])]

        if chips_con_precio:
            # Limpiar logs
            driver.get_log('browser')

            # Click en chip (SIN esperar auto-add)
            chip_manual = chips_con_precio[0]
            print(f"🖱️  MANUAL: Click en '{chip_manual.text}'")
            chip_manual.click()

            # Esperar solo a que se llenen los campos
            time.sleep(1)

            # Verificar que los campos se llenaron
            medida_val = driver.find_element(By.ID, "presupuesto-medida").get_attribute("value")
            cantidad_val = driver.find_element(By.ID, "presupuesto-cantidad").get_attribute("value")
            marca_val = driver.find_element(By.ID, "presupuesto-marca-temp").get_attribute("value")
            neto_val = driver.find_element(By.ID, "presupuesto-neto-temp").get_attribute("value")

            print("🔍 MANUAL: Estado de campos antes del click manual:")
            print(f"   Medida: '{medida_val}' {'✅' if medida_val else '❌'}")
            print(f"   Cantidad: '{cantidad_val}' {'✅' if cantidad_val else '❌'}")
            print(f"   Marca: '{marca_val}' {'✅' if marca_val else '❌'}")
            print(f"   Neto: '{neto_val}' {'✅' if neto_val else '❌'}")

            # CLICK MANUAL EN EL BOTÓN VERDE
            try:
                btn_manual = driver.find_element(By.ID, "btnAgregarMarca")
                print(f"🟢 MANUAL: Click en botón 'Añadir Marca'")
                print(f"   Estado botón: Disabled={btn_manual.get_attribute('disabled')}")

                btn_manual.click()
                time.sleep(1)

                # Verificar resultado manual
                marcas_manual = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item")
                print(f"📦 MANUAL: {len(marcas_manual)} marcas añadidas")

                if len(marcas_manual) > 0:
                    print("✅ MANUAL: ¡FUNCIONÓ!")
                    print(f"   Marca añadida: {marcas_manual[0].text[:100]}")
                else:
                    print("❌ MANUAL: No funcionó")

                # Capturar logs del manual
                logs_manual = driver.get_log('browser')
                error_logs = [log for log in logs_manual if log['level'] == 'SEVERE']
                if error_logs:
                    print("⚠️  MANUAL: Errores encontrados:")
                    for log in error_logs:
                        print(f"   {log['message']}")

            except Exception as e:
                print(f"❌ MANUAL: Error al hacer click en botón: {e}")

        # ========================
        # COMPARACIÓN FINAL
        # ========================
        print("\n" + "=" * 40)
        print("🔍 ANÁLISIS COMPARATIVO")
        print("=" * 40)

        print("📊 RESUMEN:")
        print(f"   AUTO-ADD: {len(marcas_auto) if 'marcas_auto' in locals() else 0} marcas")
        print(f"   MANUAL:   {len(marcas_manual) if 'marcas_manual' in locals() else 0} marcas")

        if len(marcas_manual) > 0 and len(marcas_auto) == 0:
            print("\n💡 CONCLUSIÓN:")
            print("   ✅ El botón manual SÍ funciona")
            print("   ❌ El auto-add NO funciona")
            print("   🔍 Problema: Auto-add no ejecuta correctamente el click")
        elif len(marcas_auto) > 0 and len(marcas_manual) > 0:
            print("\n💡 CONCLUSIÓN:")
            print("   ✅ Ambos métodos funcionan")
        else:
            print("\n💡 CONCLUSIÓN:")
            print("   ❌ Ningún método funciona - problema en el formulario")

    except Exception as e:
        print(f"❌ Error en test: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("\n⏳ Manteniendo navegador 8 segundos para revisión...")
        time.sleep(8)
        driver.quit()

if __name__ == "__main__":
    print("🔬 TEST COMPARATIVO: AUTO-ADD vs MANUAL")
    print("=" * 50)

    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo en localhost:5000")
            test_comparativo_auto_vs_manual()
        else:
            print("❌ Servidor no responde correctamente")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Servidor no está corriendo")
        print("   Ejecuta: python run.py")
