# 🧩 EXTENSIONES VS CODE - LISTA COMPLETA

## ⭐ **EXTENSIONES CRÍTICAS** (Instalar SÍ O SÍ)

### Python Development

```
□ Python (ms-python.python) - Microsoft
□ Pylance (ms-python.vscode-pylance) - Microsoft
□ Python Debugger (ms-python.debugpy) - Microsoft
```

### GitHub Integration

```
□ GitHub Copilot (github.copilot)
□ GitHub Copilot Chat (github.copilot-chat)
□ GitLens (eamodio.gitlens)
```

## 🔧 **EXTENSIONES DESARROLLO** (Muy Recomendadas)

### Web Development

```
□ Thunder Client (rangav.vscode-thunder-client) - Testing API
□ Live Server (yandeu.five-server) - Servidor local
□ Auto Rename Tag (formulahendry.auto-rename-tag)
□ Auto Close Tag (formulahendry.auto-close-tag)
□ HTML CSS Support (ecmel.vscode-html-css)
```

### JavaScript/Node

```
□ JavaScript (ES6) code snippets (xabikos.javascriptsnippets)
□ Path Intellisense (christian-kohler.path-intellisense)
```

### Code Quality

```
□ Prettier - Code formatter (esbenp.prettier-vscode)
□ ESLint (ms-vscode.vscode-eslint)
```

## 💡 **EXTENSIONES UTILIDADES** (Opcionales pero útiles)

### Visual Aids

```
□ Error Lens (usernamehw.errorlens) - Errores inline
□ indent-rainbow (oderwat.indent-rainbow) - Indentación visual
□ TODO Highlight (wayou.vscode-todo-highlight) - Resaltar TODOs
□ Better Comments (aaron-bond.better-comments) - Comentarios mejorados
```

### Productivity

```
□ Code Spell Checker (streetsidesoftware.code-spell-checker)
□ Bracket Pair Colorizer 2 (coenraads.bracket-pair-colorizer-2)
```

## 🎨 **TEMAS E ICONOS** (Personalización)

### Themes

```
□ One Dark Pro (zhuangtongfa.material-theme)
□ Material Theme (equinusocio.vsc-material-theme)
□ Dracula Official (dracula-theme.theme-dracula)
```

### Icons

```
□ Material Icon Theme (pkief.material-icon-theme)
□ VSCode Icons (vscode-icons-team.vscode-icons)
```

## 🔄 **COMANDOS INSTALACIÓN**

### Método 1: Script Automático (RECOMENDADO)

```bash
# Ejecutar el archivo: install_vscode_extensions.bat
# Instala todas las extensiones automáticamente
```

### Método 2: Manual desde VS Code

```
1. Ctrl+Shift+X (abrir extensiones)
2. Buscar cada extensión por nombre
3. Click "Install"
4. Reiniciar VS Code cuando termine
```

### Método 3: Terminal VS Code

```bash
# Copiar y pegar cada línea en terminal VS Code

# Críticas
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension ms-python.debugpy
code --install-extension github.copilot
code --install-extension github.copilot-chat
code --install-extension eamodio.gitlens

# Desarrollo Web
code --install-extension rangav.vscode-thunder-client
code --install-extension yandeu.five-server
code --install-extension formulahendry.auto-rename-tag
code --install-extension formulahendry.auto-close-tag

# Utilidades
code --install-extension usernamehw.errorlens
code --install-extension oderwat.indent-rainbow
code --install-extension wayou.vscode-todo-highlight

# Formateo
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint

# Temas
code --install-extension pkief.material-icon-theme
code --install-extension zhuangtongfa.material-theme
```

## ⚙️ **CONFIGURACIÓN POST-INSTALACIÓN**

### GitHub Copilot Setup

```
1. Ctrl+Shift+P
2. "GitHub: Sign In"
3. Autenticarse con GitHub
4. Verificar en chat: @copilot hello
```

### Python Interpreter

```
1. Abrir proyecto taller-presupuesto
2. Ctrl+Shift+P
3. "Python: Select Interpreter"
4. Elegir: ./venv/Scripts/python.exe
```

### Settings Recomendados

```json
{
  "python.defaultInterpreterPath": "./venv/Scripts/python.exe",
  "python.terminal.activateEnvironment": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.autoSave": "afterDelay",
  "workbench.iconTheme": "material-icon-theme",
  "workbench.colorTheme": "One Dark Pro"
}
```

## 🔍 **VERIFICACIÓN EXTENSIONES**

### ✅ **Check Lista Funcionamiento:**

```
□ Python - Aparece intérprete en barra inferior
□ Pylance - Autocompletado Python funciona
□ Copilot - Chat responde preguntas
□ GitLens - Muestra información Git en archivos
□ Thunder Client - Panel testing API disponible
□ Error Lens - Errores aparecen inline en código
□ Prettier - Formateo automático al guardar
□ Material Icons - Iconos bonitos en explorador
```

### 🚨 **Si algo no funciona:**

```
1. Reiniciar VS Code
2. Ctrl+Shift+P → "Developer: Reload Window"
3. Verificar que extensión está habilitada
4. Revisar output de extensión (Ctrl+Shift+U)
```

---

_🧩 Extensiones esenciales para desarrollo profesional_
_Total instalación: ~15-20 extensiones críticas_
