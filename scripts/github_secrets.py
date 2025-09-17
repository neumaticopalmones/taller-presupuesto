#!/usr/bin/env python3
"""
Configurador automático de secrets de GitHub para Render.com
"""

import os
import subprocess
import sys
from typing import List


class GitHubSecretsManager:
    def __init__(self, repo_owner: str, repo_name: str):
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.repo_full = f"{repo_owner}/{repo_name}"

    def check_gh_cli(self) -> bool:
        """Verificar que GitHub CLI esté instalado y autenticado"""
        try:
            subprocess.run(["gh", "auth", "status"], capture_output=True, text=True, check=True)
            print("✅ GitHub CLI autenticado correctamente")
            return True
        except subprocess.CalledProcessError:
            print("❌ GitHub CLI no está autenticado")
            print("🔑 Ejecuta: gh auth login")
            return False

    def get_current_repo(self) -> str:
        """Obtener el repositorio actual desde git remote"""
        try:
            result = subprocess.run(
                ["git", "remote", "get-url", "origin"], capture_output=True, text=True, check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError:
            return ""

    def set_secret(self, secret_name: str, secret_value: str) -> bool:
        """Configurar un secret en GitHub"""
        print(f"🔐 Configurando secret: {secret_name}")

        try:
            cmd = [
                "gh",
                "secret",
                "set",
                secret_name,
                "--repo",
                self.repo_full,
                "--body",
                secret_value,
            ]

            subprocess.run(cmd, capture_output=True, text=True, check=True)

            print(f"✅ Secret '{secret_name}' configurado exitosamente")
            return True

        except subprocess.CalledProcessError as e:
            print(f"❌ Error configurando secret '{secret_name}': {e.stderr}")
            return False

    def configure_render_secrets(self) -> bool:
        """Configurar todos los secrets necesarios para Render"""
        print("🚀 Configurando secrets para Render.com...")

        # Secrets necesarios para Render
        secrets_to_configure = [
            {
                "name": "RENDER_API_KEY",
                "prompt": "🔑 Render API Key (dashboard.render.com/account/api-keys)",
                "required": True,
            },
            {
                "name": "DATABASE_URL",
                "prompt": "🗄️ Database URL (postgres://user:pass@host:port/db)",
                "required": False,
                "default": "postgresql://user:password@localhost:5432/dbname",
            },
        ]

        success_count = 0

        for secret_config in secrets_to_configure:
            secret_name = secret_config["name"]
            prompt = secret_config["prompt"]
            required = secret_config.get("required", False)
            default = secret_config.get("default", "")

            # Verificar si ya existe como variable de entorno
            env_value = os.environ.get(secret_name)
            if env_value:
                print(f"📝 Usando {secret_name} desde variable de entorno")
                if self.set_secret(secret_name, env_value):
                    success_count += 1
                continue

            # Solicitar valor al usuario
            if default:
                value = input(f"{prompt} [{default}]: ").strip()
                if not value:
                    value = default
            else:
                value = input(f"{prompt}: ").strip()

            if not value and required:
                print(f"❌ {secret_name} es requerido")
                continue

            if value and self.set_secret(secret_name, value):
                success_count += 1

        return success_count > 0

    def list_secrets(self) -> List[str]:
        """Listar secrets existentes"""
        try:
            result = subprocess.run(
                ["gh", "secret", "list", "--repo", self.repo_full],
                capture_output=True,
                text=True,
                check=True,
            )
            return result.stdout.strip().split("\n") if result.stdout else []
        except subprocess.CalledProcessError:
            return []


def main():
    """Función principal"""
    print("🔐 CONFIGURADOR DE GITHUB SECRETS PARA RENDER")
    print("=" * 60)

    # Detectar repositorio automáticamente
    manager = GitHubSecretsManager("neumaticopalmones", "taller-presupuesto")

    # Verificar GitHub CLI
    if not manager.check_gh_cli():
        print("\n❌ GitHub CLI requerido. Instala con:")
        print("   winget install GitHub.cli")
        print("   Luego ejecuta: gh auth login")
        sys.exit(1)

    # Mostrar repositorio actual
    current_repo = manager.get_current_repo()
    if current_repo:
        print(f"📋 Repositorio detectado: {current_repo}")

    # Listar secrets existentes
    existing_secrets = manager.list_secrets()
    if existing_secrets and existing_secrets[0]:
        print("\n📝 Secrets existentes:")
        for secret in existing_secrets:
            if secret.strip():
                print(f"   • {secret}")
    else:
        print("\n📝 No hay secrets configurados")

    # Configurar secrets
    print("\n🔧 Configurando secrets necesarios para Render...")
    if manager.configure_render_secrets():
        print("\n✅ Secrets configurados exitosamente")
        print("\n💡 Próximos pasos:")
        print("1. Verifica los secrets en GitHub:")
        print(f"   https://github.com/{manager.repo_full}/settings/secrets/actions")
        print("2. El workflow de GitHub Actions ya puede usar estos secrets")
        print("3. Ejecuta el script de configuración de Render")
    else:
        print("\n❌ Error configurando secrets")
        sys.exit(1)


if __name__ == "__main__":
    main()
