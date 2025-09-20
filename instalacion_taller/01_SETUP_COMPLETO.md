# 🔧 SETUP COMPLETO PC TALLER

_Lista completa de instalación para desarrollo_

## 📋 LISTA DE INSTALACIÓN ORDENADA

### PASO 1 - SOFTWARE BASE OBLIGATORIO

```
□ Visual Studio Code → https://code.visualstudio.com/
□ Python 3.11+ → https://python.org/downloads/ (⚠️ MARCAR "Add to PATH")
□ Git → https://git-scm.com/downloads
□ Node.js LTS → https://nodejs.org/
□ Google Chrome (navegador)
```

### PASO 2 - SOFTWARE RECOMENDADO

```
□ PowerShell 7 → https://github.com/PowerShell/PowerShell
□ Windows Terminal → Microsoft Store
□ GitHub CLI → https://cli.github.com/
□ 7-Zip → https://7-zip.org/
```

### PASO 3 - EXTENSIONES VS CODE CRÍTICAS

```
□ Python (Microsoft) ⭐
□ Pylance (Microsoft) ⭐
□ Python Debugger (Microsoft) ⭐
□ GitHub Copilot ⭐
□ GitHub Copilot Chat ⭐
□ GitLens (Eric Amodio) ⭐
```

### PASO 4 - EXTENSIONES DESARROLLO WEB

```
□ Thunder Client (API testing)
□ Live Server (Five Server)
□ Auto Rename Tag
□ Auto Close Tag
□ HTML CSS Support
□ JavaScript (ES6) code snippets
□ Prettier - Code formatter
□ ESLint
```

### PASO 5 - EXTENSIONES UTILIDADES

```
□ Error Lens (errores inline)
□ indent-rainbow (identación visual)
□ TODO Highlight
□ Better Comments
□ Code Spell Checker
□ Path Intellisense
□ Material Icon Theme
□ One Dark Pro (tema)
```

### PASO 6 - CONFIGURACIÓN GIT

```bash
# Configurar usuario (OBLIGATORIO)
git config --global user.name "Tu Nombre Completo"
git config --global user.email "tu@email.com"

# SSH Key (RECOMENDADO para GitHub)
ssh-keygen -t rsa -b 4096 -C "tu@email.com"
# Después: Agregar clave pública a GitHub → Settings → SSH Keys
```

### PASO 7 - CLONAR PROYECTO

```bash
# Ir al escritorio
cd Desktop

# Clonar repositorio
git clone https://github.com/neumaticopalmones/taller-presupuesto.git

# Entrar al proyecto
cd taller-presupuesto

# Verificar que se clonó bien
ls
```

### PASO 8 - ENTORNO PYTHON

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno (PowerShell)
venv\Scripts\Activate.ps1

# Verificar activación (debe aparecer (venv) al inicio)
python --version

# Instalar dependencias
pip install -r requirements.txt
```

### PASO 9 - CONFIGURAR VARIABLES ENTORNO

```env
# Crear archivo .env en la carpeta del proyecto
DATABASE_URL=sqlite:///app.db
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key-123
```

### PASO 10 - PRIMERA EJECUCIÓN

```bash
# Asegurar entorno activado
venv\Scripts\Activate.ps1

# Inicializar base de datos
python -c "from app import db; db.create_all()"

# Ejecutar aplicación
python app.py

# Debe abrir en: http://localhost:5000
# ✅ Si ves la página del taller = TODO CORRECTO
```

## 🎯 ORDEN DE PRIORIDAD

### 🔴 CRÍTICO (Instalar SÍ O SÍ)

1. Visual Studio Code
2. Python 3.11+
3. Git
4. Extensión Python + Pylance
5. GitHub Copilot

### 🟡 IMPORTANTE (Instalar después)

1. Node.js
2. PowerShell 7
3. GitLens extensión
4. Thunder Client
5. Error Lens

### 🟢 OPCIONAL (Si tienes tiempo)

1. Todas las demás extensiones
2. Temas y personalización
3. Herramientas adicionales

## 📱 COMANDOS ESENCIALES TALLER

### Sincronización Diaria Casa ⟷ Taller

```bash
# AL LLEGAR: Descargar cambios de casa
git pull origin main

# AL IRSE: Subir cambios al repositorio
git add .
git commit -m "Cambios taller $(Get-Date -Format 'dd/MM/yyyy')"
git push origin main
```

### Trabajo Diario

```bash
# Activar entorno Python
venv\Scripts\Activate.ps1

# Ejecutar aplicación
python app.py

# Ver aplicación: http://localhost:5000
```

### Comandos Git Útiles

```bash
# Ver estado actual
git status

# Ver historial de cambios
git log --oneline -5

# Ver diferencias
git diff
```

## 🔍 VERIFICACIÓN FINAL

### Lista Verificación Funcionamiento

```
□ VS Code abre correctamente
□ Python responde: python --version
□ Git configurado: git config --list
□ GitHub Copilot activo en VS Code
□ Proyecto clonado en Desktop/taller-presupuesto
□ Entorno virtual creado y funciona
□ Base de datos SQLite creada
□ Aplicación ejecuta sin errores
□ Página web carga en localhost:5000
□ Git pull/push funciona con GitHub
```

## 🚨 SOLUCIÓN PROBLEMAS COMUNES

### ❌ "Python no reconocido"

```
SOLUCIÓN: Reinstalar Python marcando "Add Python to PATH"
VERIFICAR: python --version debe funcionar
```

### ❌ "Git no funciona"

```
SOLUCIÓN: Reiniciar PowerShell después de instalar Git
VERIFICAR: git --version debe funcionar
```

### ❌ "VS Code no encuentra Python"

```
SOLUCIÓN: Ctrl+Shift+P → "Python: Select Interpreter" → Elegir venv
VERIFICAR: Esquina inferior derecha debe mostrar Python (venv)
```

### ❌ "GitHub Copilot no responde"

```
SOLUCIÓN:
1. Ctrl+Shift+P → "GitHub: Sign In"
2. Autenticarse con tu cuenta GitHub
3. Verificar que tienes suscripción activa
VERIFICAR: Copilot Chat debe responder
```

### ❌ "Aplicación no ejecuta"

```
SOLUCIÓN:
1. Verificar entorno virtual activado (venv)
2. pip install -r requirements.txt
3. Verificar puerto 5000 libre
VERIFICAR: python app.py debe funcionar sin errores
```

## 📞 AYUDA EMERGENCIA

Si algo no funciona:

1. ✅ Seguir esta guía paso a paso
2. ✅ Revisar sección "Solución Problemas"
3. ✅ Usar GitHub Copilot Chat para ayuda específica
4. ✅ Google el error específico
5. ✅ Verificar documentación oficial

---

_🏠 Configuración Casa → 🔧 Configuración Taller_
_Mantener este archivo actualizado_
