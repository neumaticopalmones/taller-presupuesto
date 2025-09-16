import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_auto_add_with_precio_search():
    """
    Test mejorado que incluye la búsqueda automática de precios
    """

    driver = webdriver.Chrome()
    try:
        # Paso 1: Abrir aplicación
        driver.get("http://localhost:5000")
        wait = WebDriverWait(driver, 5)

        print("🌐 Navegando a la aplicación...")

        # Esperar a que cargue la aplicación
        wait.until(EC.presence_of_element_located((By.ID, "presupuesto-medida")))

        # Paso 2: Llenar solo medida
        print("📝 Llenando el campo medida...")
        medida_input = driver.find_element(By.ID, "presupuesto-medida")
        medida_input.clear()
        medida_input.send_keys("205/55/16")

        # Agregar cantidad para que esté completo
        print("📝 Llenando el campo cantidad...")
        cantidad_input = driver.find_element(By.ID, "presupuesto-cantidad")
        cantidad_input.clear()
        cantidad_input.send_keys("4")

        # Paso 3: Cargar sugerencias
        print("🔍 Cargando sugerencias...")
        btn_cargar = driver.find_element(By.ID, "btnCargarSugerencias")
        btn_cargar.click()

        # Esperar a que aparezcan las sugerencias
        time.sleep(2)

        # Buscar chips que contengan una marca específica (no "Todos")
        chips = driver.find_elements(By.CSS_SELECTOR, ".chip")
        chips_marcas = [chip for chip in chips if "hankook" in chip.text.lower() or "michelin" in chip.text.lower()]

        print(f"✅ Encontrados {len(chips)} chips totales")
        print(f"🎯 Encontrados {len(chips_marcas)} chips de marcas específicas")

        if chips_marcas:
            # Hacer click en el primer chip de marca
            chip_seleccionado = chips_marcas[0]
            print(f"🖱️  Haciendo click en el chip: '{chip_seleccionado.text}'")
            chip_seleccionado.click()

            # Esperar a que se procese
            time.sleep(3)

            # Obtener logs de la consola
            logs = driver.get_log('browser')
            auto_logs = [log for log in logs if any(keyword in log['message'] for keyword in ['AUTO-ADD', 'AUTO-PRECIO'])]

            print("\n📋 LOGS DE AUTO-FUNCIONES:")
            for log in auto_logs:
                print(f"   {log['message']}")

            # Verificar estado de los campos después del click
            print("\n🔍 ESTADO DE LOS CAMPOS DESPUÉS DEL CLICK:")
            medida_val = driver.find_element(By.ID, "presupuesto-medida").get_attribute("value")
            cantidad_val = driver.find_element(By.ID, "presupuesto-cantidad").get_attribute("value")
            marca_val = driver.find_element(By.ID, "presupuesto-marca-temp").get_attribute("value")
            neto_val = driver.find_element(By.ID, "presupuesto-neto-temp").get_attribute("value")

            print(f"   Medida: '{medida_val}' {'✅' if medida_val else '❌ VACÍO'}")
            print(f"   Cantidad: '{cantidad_val}' {'✅' if cantidad_val else '❌ VACÍO'}")
            print(f"   Marca: '{marca_val}' {'✅' if marca_val else '❌ VACÍO'}")
            print(f"   Neto: '{neto_val}' {'✅' if neto_val else '❌ VACÍO'}")

            # Calcular cuántos campos esenciales están llenos
            campos_llenos = sum([
                bool(medida_val),
                bool(cantidad_val),
                bool(marca_val),
                bool(neto_val)
            ])

            print(f"\n📊 ANÁLISIS: {campos_llenos}/4 campos esenciales completos")

            if campos_llenos == 4:
                print("🎯 ¡TODOS LOS CAMPOS ESENCIALES ESTÁN LLENOS!")
                print("   Esperando auto-add...")

                # Esperar un poco más para el auto-add
                time.sleep(2)

                # Verificar si se añadió automáticamente
                marcas_lista = driver.find_elements(By.CSS_SELECTOR, "#marcasLista .marca-item")
                print(f"\n📦 MARCAS EN LA LISTA: {len(marcas_lista)}")

                if len(marcas_lista) > 0:
                    print("✅ ¡SE AÑADIÓ AUTOMÁTICAMENTE!")
                    for i, marca in enumerate(marcas_lista):
                        print(f"   {i+1}. {marca.text[:100]}...")
                else:
                    print("❌ NO SE AÑADIÓ AUTOMÁTICAMENTE")

            else:
                print(f"⚠️  Faltan {4-campos_llenos} campos esenciales")
                if not neto_val:
                    print("   💡 IMPORTANTE: Falta el precio (neto) - puede que no esté guardado en la BD")

        else:
            print("❌ No se encontraron chips de marcas específicas")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("\n⏳ Esperando 5 segundos para que puedas ver el resultado...")
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    print("🧪 INICIANDO TEST DE AUTO-ADD CON BÚSQUEDA DE PRECIOS")
    print("=" * 60)

    # Verificar que el servidor esté corriendo
    try:
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✅ Servidor corriendo en localhost:5000")
            test_auto_add_with_precio_search()
        else:
            print("❌ Servidor no responde correctamente")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Servidor no está corriendo en localhost:5000")
        print("   Ejecuta: python run.py")
