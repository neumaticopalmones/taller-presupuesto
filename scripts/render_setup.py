#!/usr/bin/env python3
"""
Script para configurar automáticamente Render.com usando su API.
Crea el servicio web y la base de datos PostgreSQL automáticamente.
"""

import os
import secrets
import time
from typing import Any, Dict

import requests


class RenderAutomator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.render.com/v1"
        self.headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    def create_postgres_database(self) -> Dict[str, Any]:
        """Crear base de datos PostgreSQL en Render"""
        print("🗄️ Creando base de datos PostgreSQL...")

        payload = {
            "name": "taller-presupuesto-db",
            "databaseName": "taller_presupuesto",
            "databaseUser": "admin",
            "plan": "free",
            "region": "frankfurt",
        }

        response = requests.post(f"{self.base_url}/postgres", headers=self.headers, json=payload)

        if response.status_code == 201:
            db_data = response.json()
            print(f"✅ Base de datos creada: {db_data['name']}")
            print(f"📄 Database URL: {db_data['databaseUrl']}")
            return db_data
        else:
            print(f"❌ Error creando BD: {response.status_code} - {response.text}")
            return {}

    def create_web_service(self, repo_url: str, database_url: str) -> Dict[str, Any]:
        """Crear servicio web en Render"""
        print("🌐 Creando servicio web...")

        # Generar SECRET_KEY segura
        secret_key = secrets.token_hex(32)

        payload = {
            "name": "taller-presupuesto-web",
            "runtime": "python3",
            "plan": "free",
            "region": "frankfurt",
            "buildCommand": "pip install --upgrade pip && pip install -r requirements.txt",
            "startCommand": "chmod +x start.sh && ./start.sh",
            "repo": repo_url,
            "autoDeploy": "yes",
            "envVars": [
                {"key": "DATABASE_URL", "value": database_url},
                {"key": "FLASK_ENV", "value": "production"},
                {"key": "SECRET_KEY", "value": secret_key},
                {"key": "WEB_CONCURRENCY", "value": "4"},
                {"key": "PYTHON_VERSION", "value": "3.11.0"},
            ],
        }

        response = requests.post(f"{self.base_url}/services", headers=self.headers, json=payload)

        if response.status_code == 201:
            service_data = response.json()
            print(f"✅ Servicio web creado: {service_data['name']}")
            print(f"🌍 URL: https://{service_data['name']}.onrender.com")
            return service_data
        else:
            print(f"❌ Error creando servicio: {response.status_code} - {response.text}")
            return {}

    def wait_for_deployment(self, service_id: str) -> bool:
        """Esperar que el despliegue termine"""
        print("⏳ Esperando despliegue...")

        max_attempts = 30
        for attempt in range(max_attempts):
            response = requests.get(f"{self.base_url}/services/{service_id}", headers=self.headers)

            if response.status_code == 200:
                service = response.json()
                status = service.get("serviceDetails", {}).get("status", "unknown")

                if status == "live":
                    print("✅ Despliegue completado exitosamente!")
                    return True
                elif status == "build_failed" or status == "crashed":
                    print(f"❌ Despliegue falló: {status}")
                    return False
                else:
                    print(f"📊 Estado: {status}")

            time.sleep(20)

        print("⏰ Timeout esperando despliegue")
        return False

    def setup_complete_environment(self, repo_url: str) -> Dict[str, Any]:
        """Configurar ambiente completo: BD + Web Service"""
        print("🚀 Iniciando configuración completa en Render...")

        # Crear base de datos
        db_data = self.create_postgres_database()
        if not db_data:
            return {}

        database_url = db_data.get("databaseUrl", "")
        if not database_url:
            print("❌ No se pudo obtener la URL de la base de datos")
            return {}

        # Esperar que la BD esté lista
        print("⏳ Esperando que la base de datos esté lista...")
        time.sleep(30)

        # Crear servicio web
        service_data = self.create_web_service(repo_url, database_url)
        if not service_data:
            return {}

        service_id = service_data.get("id", "")

        # Esperar despliegue
        deployment_success = self.wait_for_deployment(service_id)

        return {
            "database": db_data,
            "service": service_data,
            "deployment_success": deployment_success,
            "app_url": f"https://{service_data['name']}.onrender.com" if service_data else "",
            "service_id": service_id,
        }


def main():
    """Función principal"""
    print("🔧 Render.com Automator")
    print("=" * 50)

    # Obtener API key
    api_key = os.environ.get("RENDER_API_KEY")
    if not api_key:
        print("❌ RENDER_API_KEY no encontrada en variables de entorno")
        print("💡 Obtén tu API key en: https://dashboard.render.com/account/api-keys")
        return

    # URL del repositorio
    repo_url = "https://github.com/neumaticopalmones/taller-presupuesto"

    # Configurar ambiente
    automator = RenderAutomator(api_key)
    result = automator.setup_complete_environment(repo_url)

    if result.get("deployment_success"):
        print("\n🎉 ¡Configuración completada exitosamente!")
        print(f"🌍 Tu aplicación está disponible en: {result['app_url']}")
        print(f"🔑 Service ID para GitHub Actions: {result['service_id']}")
        print("\n📋 Próximos pasos:")
        print("1. Agrega RENDER_SERVICE_ID a los secrets de GitHub")
        print("2. Tu app se desplegará automáticamente con cada push")
    else:
        print("\n❌ Hubo problemas en la configuración")
        print("🔍 Revisa los logs de Render Dashboard")


if __name__ == "__main__":
    main()
