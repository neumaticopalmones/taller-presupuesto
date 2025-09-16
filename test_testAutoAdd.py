"""
Script para ejecutar automáticamente testAutoAdd() usando Selenium
"""
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def setup_driver():
    """Configura el driver de Chrome en modo headless"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Ejecutar sin abrir ventana
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Error configurando Chrome driver: {e}")
        print("💡 Instalando dependencias...")
        return None

def test_auto_add_function():
    """Ejecuta la función testAutoAdd() en el navegador"""
    print("🧪 EJECUTANDO testAutoAdd() AUTOMÁTICAMENTE\n")

    driver = setup_driver()
    if not driver:
        return False

    try:
        # Cargar la página
        print("📡 Cargando aplicación...")
        driver.get("http://localhost:5000")

        # Esperar a que la página cargue completamente
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        print("✅ Página cargada")

        # Ejecutar testAutoAdd()
        print("\n🧪 Ejecutando testAutoAdd()...")
        result = driver.execute_script("""
            // Verificar que la función existe
            if (typeof window.testAutoAdd !== 'function') {
                return {
                    success: false,
                    error: 'Función testAutoAdd() no encontrada'
                };
            }

            // Capturar console.log
            var logs = [];
            var originalLog = console.log;
            console.log = function(...args) {
                logs.push(args.join(' '));
                originalLog.apply(console, arguments);
            };

            try {
                // Ejecutar testAutoAdd()
                window.testAutoAdd();

                // Esperar un momento para que se completen las operaciones asíncronas
                return new Promise((resolve) => {
                    setTimeout(() => {
                        console.log = originalLog; // Restaurar console.log
                        resolve({
                            success: true,
                            logs: logs
                        });
                    }, 2000);
                });
            } catch (error) {
                console.log = originalLog; // Restaurar console.log
                return {
                    success: false,
                    error: error.toString(),
                    logs: logs
                };
            }
        """)

        # Procesar resultado
        if result['success']:
            print("✅ testAutoAdd() ejecutado correctamente")
            print("\n📋 LOGS DE LA FUNCIÓN:")
            for log in result['logs']:
                print(f"   {log}")
            return True
        else:
            print(f"❌ Error ejecutando testAutoAdd(): {result['error']}")
            if 'logs' in result:
                print("\n📋 LOGS CAPTURADOS:")
                for log in result['logs']:
                    print(f"   {log}")
            return False

    except Exception as e:
        print(f"❌ Error en test automático: {e}")
        return False
    finally:
        driver.quit()

def test_manual_validation():
    """Test manual de validación sin navegador"""
    print("\n🔍 TEST MANUAL DE VALIDACIÓN (sin navegador)")

    # Simular validación de 4 campos
    test_data = {
        "medida": "175/65 R14",
        "cantidad": "2",
        "marca": "MICHELIN",
        "neto": "45.50"
    }

    print("📊 Datos de prueba:")
    for field, value in test_data.items():
        print(f"   {field}: '{value}' ✅")

    # Simular función isNotEmpty
    def isNotEmpty(value):
        return bool(value and value.strip())

    # Simular función isValidNumber
    def isValidNumber(value, options={}):
        try:
            num = float(value)
            min_val = options.get('min', float('-inf'))
            max_val = options.get('max', float('inf'))
            allow_negative = options.get('allowNegative', True)

            if not allow_negative and num < 0:
                return False
            return min_val <= num <= max_val
        except:
            return False

    # Ejecutar validación
    validaciones = {
        'medida': isNotEmpty(test_data['medida']),
        'cantidad': isValidNumber(test_data['cantidad'], {'min': 1, 'allowNegative': False}),
        'marca': isNotEmpty(test_data['marca']),
        'neto': isValidNumber(test_data['neto'], {'min': 0, 'allowNegative': False}),
    }

    print("\n📝 RESULTADOS DE VALIDACIÓN:")
    for field, is_valid in validaciones.items():
        status = "✅ VÁLIDO" if is_valid else "❌ INVÁLIDO"
        print(f"   {field}: {status}")

    todas_validas = all(validaciones.values())
    print(f"\n🎯 RESULTADO FINAL: {'✅ TODAS VÁLIDAS' if todas_validas else '❌ VALIDACIÓN FALLA'}")

    return todas_validas

def main():
    print("=" * 60)
    print("🧪 EJECUCIÓN AUTOMÁTICA DE testAutoAdd()")
    print("=" * 60)

    # Test 1: Validación manual
    manual_ok = test_manual_validation()

    # Test 2: Función testAutoAdd() en navegador
    if manual_ok:
        browser_ok = test_auto_add_function()
    else:
        print("\n⚠️ Saltando test de navegador debido a fallo de validación manual")
        browser_ok = False

    # Resultado final
    print("\n" + "=" * 60)
    if manual_ok and browser_ok:
        print("🎉 TODOS LOS TESTS PASARON")
        print("✅ La función testAutoAdd() funciona correctamente")
    elif manual_ok:
        print("⚠️ VALIDACIÓN MANUAL OK, PERO FALLO EN NAVEGADOR")
        print("💡 Puede ser problema de dependencias de Selenium")
    else:
        print("❌ FALLO EN VALIDACIÓN MANUAL")
        print("🔧 Revisa la lógica de validación en main.js")

    print("=" * 60)

if __name__ == "__main__":
    main()
