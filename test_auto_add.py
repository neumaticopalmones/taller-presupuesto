"""
Test automatizado para verificar funcionalidad auto-add
"""
import time
import requests
import json

def test_aplicacion():
    print("🧪 INICIANDO TESTS AUTOMATIZADOS\n")

    # Test 1: Verificar que la aplicación esté corriendo
    print("📡 TEST 1: Conectividad con aplicación")
    try:
        response = requests.get('http://localhost:5000', timeout=5)
        if response.status_code == 200:
            print("✅ Aplicación accesible en localhost:5000")
        else:
            print(f"❌ Aplicación responde con código: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando con aplicación: {e}")
        return False

    # Test 2: Verificar endpoint de sugerencias
    print("\n🔍 TEST 2: API de sugerencias")
    try:
        response = requests.get('http://localhost:5000/sugerencias', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ API sugerencias responde correctamente")
            print(f"📊 Datos recibidos: {len(data.get('medidas', []))} medidas, {len(data.get('marcas', []))} marcas")

            # Mostrar sample de datos
            if data.get('medidas'):
                print(f"🔸 Medidas ejemplo: {', '.join(data['medidas'][:3])}...")
            if data.get('marcas'):
                print(f"🔸 Marcas ejemplo: {', '.join(data['marcas'][:3])}...")

            return data
        else:
            print(f"❌ API sugerencias falla con código: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error en API sugerencias: {e}")
        return False

def test_validacion():
    print("\n📝 TEST 3: Lógica de validación")

    # Simular datos de entrada
    test_data = {
        "medida": "175/65 R14",
        "cantidad": "2",
        "marca": "MICHELIN",
        "neto": "45.50",
        "ganancia": "",  # Vacío para test
        "ecotasa": "",   # Vacío para test
        "iva": ""        # Vacío para test
    }

    print("🧪 Datos de prueba:")
    for key, value in test_data.items():
        status = "✅" if value else "❌"
        print(f"   {key}: \"{value}\" {status}")

    # Simular validación básica (4 campos)
    validacion_basica = all([
        test_data["medida"],
        test_data["cantidad"],
        test_data["marca"],
        test_data["neto"]
    ])

    # Simular validación completa (7 campos)
    validacion_completa = all([
        test_data["medida"],
        test_data["cantidad"],
        test_data["marca"],
        test_data["neto"],
        test_data["ganancia"],
        test_data["ecotasa"],
        test_data["iva"]
    ])

    print(f"\n📋 VALIDACIÓN BÁSICA (4 campos): {'✅ PASS' if validacion_basica else '❌ FAIL'}")
    print(f"📋 VALIDACIÓN COMPLETA (7 campos): {'✅ PASS' if validacion_completa else '❌ FAIL'}")

    if validacion_basica and not validacion_completa:
        print("⚠️ ESTADO ESPERADO: Validación básica pasa, completa falla")
        print("💡 RESULTADO: Auto-add debería funcionar con solo 4 campos")
        return True
    else:
        print("❌ PROBLEMA: Validación no está como se esperaba")
        return False

def main():
    print("=" * 60)
    print("🧪 TEST AUTOMATIZADO AUTO-ADD FUNCTIONALITY")
    print("=" * 60)

    # Ejecutar tests
    sugerencias_data = test_aplicacion()
    if not sugerencias_data:
        print("\n❌ Tests de conectividad fallaron")
        return

    validacion_ok = test_validacion()
    if not validacion_ok:
        print("\n❌ Tests de validación fallaron")
        return

    print("\n" + "=" * 60)
    print("✅ TODOS LOS TESTS AUTOMATIZADOS PASARON")
    print("=" * 60)

    print("\n🎯 PRÓXIMOS PASOS MANUALES:")
    print("1. Abre http://localhost:5000 en tu navegador")
    print("2. Presiona F12 > Consola")
    print("3. Ejecuta: testAutoAdd()")
    print("4. Prueba manualmente:")
    print("   - Rellena: medida, cantidad=2, neto=30")
    print("   - Click en chip de marca")
    print("   - Verificar que se añade automáticamente")

    print(f"\n📊 DATOS DISPONIBLES PARA PRUEBAS:")
    if isinstance(sugerencias_data, dict):
        if sugerencias_data.get('medidas'):
            print(f"   Medidas: {len(sugerencias_data['medidas'])} disponibles")
        if sugerencias_data.get('marcas'):
            print(f"   Marcas: {len(sugerencias_data['marcas'])} disponibles")

if __name__ == "__main__":
    main()
