#!/usr/bin/env python3
"""
Script maestro para automatizar completamente el despliegue en Render.com
Ejecuta todo el proceso paso a paso.
"""

import os
import subprocess
import sys
import time


def run_command(command, description, check=True):
    """Ejecutar comando y mostrar resultado"""
    print(f"\n🔧 {description}")
    print("=" * 50)

    try:
        if isinstance(command, str):
            result = subprocess.run(
                command, shell=True, check=check, capture_output=True, text=True
            )
        else:
            result = subprocess.run(command, check=check, capture_output=True, text=True)

        if result.stdout:
            print(result.stdout)
        if result.stderr and not check:
            print(f"⚠️ Warning: {result.stderr}")

        print(f"✅ {description} - Completado")
        return True

    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Error")
        if e.stdout:
            print(f"Stdout: {e.stdout}")
        if e.stderr:
            print(f"Stderr: {e.stderr}")
        return False


def check_prerequisites():
    """Verificar prerrequisitos"""
    print("🔍 Verificando prerrequisitos...")

    # Verificar Git
    try:
        subprocess.run(["git", "--version"], check=True, capture_output=True)
        print("✅ Git disponible")
    except subprocess.CalledProcessError:
        print("❌ Git no está instalado")
        return False

    # Verificar Python
    try:
        subprocess.run([sys.executable, "--version"], check=True, capture_output=True)
        print("✅ Python disponible")
    except subprocess.CalledProcessError:
        print("❌ Python no está disponible")
        return False

    # Verificar que estamos en el directorio correcto
    if not os.path.exists("app.py"):
        print("❌ No estás en el directorio del proyecto (no se encuentra app.py)")
        return False

    print("✅ Directorio del proyecto correcto")
    return True


def setup_github_cli():
    """Configurar GitHub CLI si no está instalado"""
    print("\n🔧 Verificando GitHub CLI...")

    try:
        subprocess.run(["gh", "--version"], check=True, capture_output=True)
        print("✅ GitHub CLI ya está instalado")
        return True
    except subprocess.CalledProcessError:
        print("❌ GitHub CLI no está instalado")
        print("💡 Instalando GitHub CLI...")

        # Intentar instalar via winget en Windows
        try:
            subprocess.run(
                ["winget", "install", "--id", "GitHub.cli"],
                check=True,
                capture_output=True,
                text=True,
            )
            print("✅ GitHub CLI instalado via winget")
            return True
        except subprocess.CalledProcessError:
            print("❌ No se pudo instalar GitHub CLI automáticamente")
            print("📋 Instala manualmente desde: https://cli.github.com/")
            return False


def main():
    """Proceso principal de automatización"""
    print("🚀 AUTOMATIZADOR COMPLETO DE RENDER.COM")
    print("=" * 60)
    print("Este script configurará automáticamente:")
    print("✅ Repositorio y commits")
    print("✅ GitHub Actions y Secrets")
    print("✅ Render.com (BD + Web Service)")
    print("✅ Validación del despliegue")
    print("=" * 60)

    # Verificar prerrequisitos
    if not check_prerequisites():
        print("\n❌ Prerrequisitos no cumplidos. Abortando.")
        sys.exit(1)

    # Configurar GitHub CLI
    if not setup_github_cli():
        print("\n❌ GitHub CLI requerido. Abortando.")
        sys.exit(1)

    # Paso 1: Verificar estado del repo
    print("\n" + "=" * 60)
    print("📋 PASO 1: VERIFICAR REPOSITORIO")
    print("=" * 60)

    run_command("git status", "Verificando estado del repositorio")

    # Hacer commit de cambios pendientes si los hay
    result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    if result.stdout.strip():
        print("📝 Hay cambios pendientes, haciendo commit...")
        run_command("git add .", "Agregando archivos al staging")
        run_command(
            'git commit -m "feat: configuración automática para Render.com"',
            "Haciendo commit de cambios",
        )

    # Push a GitHub
    run_command("git push origin main", "Subiendo cambios a GitHub")

    # Paso 2: Configurar GitHub Secrets
    print("\n" + "=" * 60)
    print("🔐 PASO 2: CONFIGURAR GITHUB SECRETS")
    print("=" * 60)

    secrets_script = os.path.join("scripts", "github_secrets.py")
    if os.path.exists(secrets_script):
        run_command([sys.executable, secrets_script], "Configurando GitHub Secrets")
    else:
        print("⚠️ Script de secrets no encontrado, configuración manual requerida")

    # Paso 3: Configurar Render
    print("\n" + "=" * 60)
    print("🌐 PASO 3: CONFIGURAR RENDER.COM")
    print("=" * 60)

    render_api_key = input(
        "🔑 Ingresa tu Render API Key " "(desde https://dashboard.render.com/account/api-keys): "
    ).strip()

    if render_api_key:
        os.environ["RENDER_API_KEY"] = render_api_key

        render_script = os.path.join("scripts", "render_setup.py")
        if os.path.exists(render_script):
            run_command([sys.executable, render_script], "Configurando Render.com automáticamente")
    else:
        print("⚠️ Sin API key, configuración manual de Render requerida")

    # Paso 4: Esperar y validar despliegue
    print("\n" + "=" * 60)
    print("⏳ PASO 4: VALIDAR DESPLIEGUE")
    print("=" * 60)

    app_url = input(
        "🌍 Ingresa la URL de tu app en Render " "(ej: https://taller-presupuesto.onrender.com): "
    ).strip()

    if app_url:
        print("⏳ Esperando que el despliegue termine (puede tomar 5-10 min)...")
        time.sleep(300)  # Esperar 5 minutos

        validation_script = os.path.join("scripts", "validate_deployment.py")
        if os.path.exists(validation_script):
            run_command(
                [sys.executable, validation_script, app_url], "Validando despliegue", check=False
            )

    # Resumen final
    print("\n" + "=" * 60)
    print("🎉 PROCESO COMPLETADO")
    print("=" * 60)
    print("📋 Resumen de lo configurado:")
    print("✅ Repositorio sincronizado con GitHub")
    print("✅ GitHub Actions configurado")
    print("✅ Secrets de GitHub configurados")
    if render_api_key:
        print("✅ Render.com configurado automáticamente")
    else:
        print("⚠️ Render.com requiere configuración manual")

    print("\n🔗 Enlaces importantes:")
    repo_url = "https://github.com/neumaticopalmones/taller-presupuesto"
    print(f"📊 GitHub Actions: {repo_url}/actions")
    print("🌐 Render Dashboard: https://dashboard.render.com")
    if app_url:
        print(f"🚀 Tu aplicación: {app_url}")

    print("\n💡 Próximos pasos:")
    print("1. Revisa que GitHub Actions se ejecute sin errores")
    print("2. Verifica que tu app responda en Render")
    print("3. Cada push a 'main' desplegará automáticamente")


if __name__ == "__main__":
    main()
