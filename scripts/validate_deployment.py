#!/usr/bin/env python3
"""
Script de validación y health check para el despliegue.
Verifica que todos los servicios estén funcionando correctamente.
"""

import json
import sys
import time
from typing import Any, Dict

import requests


class DeploymentValidator:
    def __init__(self, app_url: str):
        self.app_url = app_url.rstrip("/")
        self.session = requests.Session()
        self.session.timeout = 30

    def check_health_endpoint(self) -> Dict[str, Any]:
        """Verificar endpoint de health"""
        print("🏥 Verificando health endpoint...")

        try:
            response = self.session.get(f"{self.app_url}/health")

            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    print("✅ Health check OK")
                    return {"status": "ok", "response_time": response.elapsed.total_seconds()}
                else:
                    print(f"⚠️ Health check responde pero status inesperado: {data}")
                    return {"status": "warning", "data": data}
            else:
                print(f"❌ Health check falló: {response.status_code}")
                return {"status": "error", "code": response.status_code}

        except Exception as e:
            print(f"❌ Error en health check: {e}")
            return {"status": "error", "error": str(e)}

    def check_main_page(self) -> Dict[str, Any]:
        """Verificar que la página principal cargue"""
        print("🏠 Verificando página principal...")

        try:
            response = self.session.get(self.app_url)

            if response.status_code == 200:
                content = response.text
                # Verificar que contenga elementos esperados
                if "Taller de Presupuestos" in content or "presupuesto" in content.lower():
                    print("✅ Página principal carga correctamente")
                    return {"status": "ok", "size": len(content)}
                else:
                    print("⚠️ Página carga pero contenido inesperado")
                    return {"status": "warning", "size": len(content)}
            else:
                print(f"❌ Error cargando página: {response.status_code}")
                return {"status": "error", "code": response.status_code}

        except Exception as e:
            print(f"❌ Error accediendo página: {e}")
            return {"status": "error", "error": str(e)}

    def check_api_endpoints(self) -> Dict[str, Any]:
        """Verificar endpoints de API principales"""
        print("🔌 Verificando endpoints de API...")

        endpoints_to_check = ["/sugerencias", "/api/stats"]

        results = {}

        for endpoint in endpoints_to_check:
            try:
                response = self.session.get(f"{self.app_url}{endpoint}")

                if response.status_code == 200:
                    print(f"✅ {endpoint} - OK")
                    results[endpoint] = {"status": "ok", "code": 200}
                elif response.status_code == 429:
                    print(f"⚠️ {endpoint} - Rate limited (normal)")
                    results[endpoint] = {"status": "rate_limited", "code": 429}
                else:
                    print(f"❌ {endpoint} - Error {response.status_code}")
                    results[endpoint] = {"status": "error", "code": response.status_code}

            except Exception as e:
                print(f"❌ {endpoint} - Exception: {e}")
                results[endpoint] = {"status": "error", "error": str(e)}

        return results

    def check_database_connection(self) -> Dict[str, Any]:
        """Verificar conexión a base de datos a través de API"""
        print("🗄️ Verificando conexión a base de datos...")

        try:
            # Intentar un endpoint que requiera BD
            response = self.session.get(f"{self.app_url}/sugerencias?limit=1")

            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and "medidas" in data:
                    print("✅ Base de datos conectada correctamente")
                    return {"status": "ok", "data_sample": data}
                else:
                    print("⚠️ Respuesta inesperada de la BD")
                    return {"status": "warning", "data": data}
            else:
                print(f"❌ Error consultando BD: {response.status_code}")
                return {"status": "error", "code": response.status_code}

        except Exception as e:
            print(f"❌ Error verificando BD: {e}")
            return {"status": "error", "error": str(e)}

    def check_static_files(self) -> Dict[str, Any]:
        """Verificar que archivos estáticos se sirvan correctamente"""
        print("📁 Verificando archivos estáticos...")

        static_files = ["/style.css", "/js/main.js"]

        results = {}

        for file_path in static_files:
            try:
                response = self.session.head(f"{self.app_url}{file_path}")

                if response.status_code == 200:
                    print(f"✅ {file_path} - OK")
                    results[file_path] = {"status": "ok", "code": 200}
                else:
                    print(f"❌ {file_path} - Error {response.status_code}")
                    results[file_path] = {"status": "error", "code": response.status_code}

            except Exception as e:
                print(f"❌ {file_path} - Exception: {e}")
                results[file_path] = {"status": "error", "error": str(e)}

        return results

    def run_full_validation(self) -> Dict[str, Any]:
        """Ejecutar validación completa"""
        print("🔍 Iniciando validación completa del despliegue")
        print("=" * 60)

        results = {"timestamp": time.time(), "app_url": self.app_url, "checks": {}}

        # Ejecutar todas las verificaciones
        checks = [
            ("health", self.check_health_endpoint),
            ("main_page", self.check_main_page),
            ("api_endpoints", self.check_api_endpoints),
            ("database", self.check_database_connection),
            ("static_files", self.check_static_files),
        ]

        for check_name, check_function in checks:
            print(f"\n{'='*20} {check_name.upper()} {'='*20}")
            results["checks"][check_name] = check_function()

        # Resumen final
        print("\n" + "=" * 60)
        print("📊 RESUMEN DE VALIDACIÓN")
        print("=" * 60)

        total_checks = 0
        passed_checks = 0

        for check_name, check_result in results["checks"].items():
            status = check_result.get("status", "unknown")
            if status == "ok":
                print(f"✅ {check_name}: OK")
                passed_checks += 1
            elif status == "warning":
                print(f"⚠️ {check_name}: WARNING")
                passed_checks += 0.5
            else:
                print(f"❌ {check_name}: ERROR")
            total_checks += 1

        success_rate = (passed_checks / total_checks) * 100 if total_checks > 0 else 0
        results["success_rate"] = success_rate

        print(f"\n📈 Tasa de éxito: {success_rate:.1f}% ({passed_checks}/{total_checks})")

        if success_rate >= 80:
            print("🎉 ¡Despliegue exitoso! La aplicación está funcionando correctamente.")
            results["overall_status"] = "success"
        elif success_rate >= 60:
            print("⚠️ Despliegue parcial. Algunos componentes tienen problemas.")
            results["overall_status"] = "partial"
        else:
            print("❌ Despliegue con problemas. Revisa los logs de Render.")
            results["overall_status"] = "failed"

        return results


def main():
    """Función principal"""
    if len(sys.argv) != 2:
        print("Uso: python validate_deployment.py <URL_DE_LA_APP>")
        print("Ejemplo: python validate_deployment.py https://taller-presupuesto.onrender.com")
        sys.exit(1)

    app_url = sys.argv[1]

    print("🔧 Deployment Validator")
    print("=" * 50)
    print(f"🎯 URL objetivo: {app_url}")

    validator = DeploymentValidator(app_url)
    results = validator.run_full_validation()

    # Guardar resultados
    timestamp = int(time.time())
    results_file = f"deployment_validation_{timestamp}.json"

    try:
        with open(results_file, "w") as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Resultados guardados en: {results_file}")
    except Exception as e:
        print(f"\n⚠️ No se pudieron guardar resultados: {e}")

    # Exit code basado en el resultado
    if results["overall_status"] == "success":
        sys.exit(0)
    elif results["overall_status"] == "partial":
        sys.exit(1)
    else:
        sys.exit(2)


if __name__ == "__main__":
    main()
