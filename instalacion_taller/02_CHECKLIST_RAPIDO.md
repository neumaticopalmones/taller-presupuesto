# ⚡ CHECKLIST RÁPIDO - INSTALACIÓN EXPRESS

_Configuración PC Taller en 30 minutos_

## 🕐 CRONÓMETRO INSTALACIÓN

### ⏰ **5 MIN** - DESCARGAS

```
□ VS Code → https://code.visualstudio.com/
□ Python → https://python.org/downloads/ ⚠️ MARCAR "Add to PATH"
□ Git → https://git-scm.com/downloads
□ Node.js → https://nodejs.org/
```

### ⏰ **5 MIN** - CONFIGURAR GIT

```bash
□ Abrir PowerShell
□ git config --global user.name "TuNombre"
□ git config --global user.email "tu@email.com"
□ Verificar: git config --list
```

### ⏰ **5 MIN** - CLONAR PROYECTO

```bash
□ cd Desktop
□ git clone https://github.com/neumaticopalmones/taller-presupuesto.git
□ cd taller-presupuesto
□ Verificar: ls (debe mostrar archivos del proyecto)
```

### ⏰ **5 MIN** - ENTORNO PYTHON

```bash
□ python -m venv venv
□ venv\Scripts\Activate.ps1
□ pip install -r requirements.txt
□ Verificar: python --version
```

### ⏰ **10 MIN** - VS CODE + EXTENSIONES

```
□ Abrir VS Code
□ Ejecutar script: install_vscode_extensions.bat
□ Login GitHub Copilot
□ Abrir carpeta: taller-presupuesto
□ Verificar Python interpreter detectado
```

## 🎯 VERIFICACIÓN EXPRESS

### ✅ **TODO FUNCIONA SI:**

```
□ python --version → Muestra versión Python
□ git --version → Muestra versión Git
□ VS Code abre proyecto sin errores
□ GitHub Copilot responde en chat
□ python app.py → Ejecuta sin errores
□ localhost:5000 → Muestra página web
```

## 🚨 PROBLEMAS EXPRESS

### ❌ Python no funciona

```
SOLUCIÓN: Reinstalar Python con "Add to PATH"
REINICIAR: PowerShell después instalación
```

### ❌ Git no funciona

```
SOLUCIÓN: Reiniciar PowerShell
VERIFICAR: git config --global user.name
```

### ❌ VS Code no ve Python

```
SOLUCIÓN: Ctrl+Shift+P → "Python: Select Interpreter"
ELEGIR: ./venv/Scripts/python.exe
```

### ❌ Copilot no activa

```
SOLUCIÓN:
1. Ctrl+Shift+P → "GitHub: Sign In"
2. Login con tu cuenta GitHub
3. Verificar suscripción activa
```

## 📱 **USO DIARIO - 2 COMANDOS**

### 🌅 **AL LLEGAR al taller:**

```bash
cd Desktop/taller-presupuesto
git pull origin main
venv\Scripts\Activate.ps1
python app.py
```

### 🌅 **AL IRSE del taller:**

```bash
git add .
git commit -m "Cambios taller"
git push origin main
```

## 🏆 **RESULTADO FINAL**

### ✅ **TENDRÁS:**

- ✅ Mismo entorno que en casa
- ✅ GitHub Copilot funcionando
- ✅ Sincronización automática casa ⟷ taller
- ✅ Desarrollo fluido en ambos PCs
- ✅ Base de datos local independiente
- ✅ Todas las extensiones necesarias

---

_⚡ Express Setup: Casa → Taller en 30 minutos_
