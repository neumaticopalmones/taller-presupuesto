# 🛠️ GUÍA DE EXTENSIONES VS CODE - TALLER PRESUPUESTO

## 🎯 ÍNDICE

- [🚀 Extensiones Esenciales](#extensiones-esenciales)
- [🤖 Trabajar con IA (GitHub Copilot)](#trabajar-con-ia)
- [🔧 Setup y Configuración](#setup-configuracion)
- [📋 Workflow Recomendado](#workflow-recomendado)
- [🎓 Tutorial Paso a Paso](#tutorial-paso-a-paso)

---

## 🚀 EXTENSIONES ESENCIALES {#extensiones-esenciales}

### 🔥 **CRÍTICAS (Instalar YA)**

#### 1. **GitHub Copilot** 🤖

- **ID**: `GitHub.copilot`
- **Propósito**: IA que escribe código contigo
- **Por qué**: Auto-completado inteligente, genera funciones completas
- **Uso en tu app**: Escribir nuevas funciones, debugging, explicar código

#### 2. **Python** 🐍

- **ID**: `ms-python.python`
- **Propósito**: Soporte completo Python
- **Por qué**: Tu backend es Flask (Python)
- **Uso**: Debugging, linting, IntelliSense para `app.py`

#### 3. **Playwright Test for VSCode** 🎭

- **ID**: `ms-playwright.playwright`
- **Propósito**: Ejecutar y debug tests desde VS Code
- **Por qué**: Ya tienes tests en `tests/playwright/`
- **Uso**: Run tests con interfaz visual, debugging

#### 4. **Live Server** 🌐

- **ID**: `ritwickdey.LiveServer`
- **Propósito**: Servidor local con auto-reload
- **Por qué**: Para frontend HTML/CSS/JS
- **Uso**: Alternativa a Flask para desarrollo frontend

#### 5. **ES6 String HTML** 📝

- **ID**: `Tobermory.es6-string-html`
- **Propósito**: Syntax highlighting en template strings
- **Por qué**: Para HTML dentro de JavaScript
- **Uso**: Mejor legibilidad en `js/main.js` cuando creas elementos

### 🎨 **ÚTILES (Recomendadas)**

#### 6. **Auto Rename Tag** 🏷️

- **ID**: `formulahendry.auto-rename-tag`
- **Propósito**: Renombrar tags HTML automáticamente
- **Uso**: Editar `index.html` más fácil

#### 7. **Bracket Pair Colorizer** 🌈

- **ID**: `CoenraadS.bracket-pair-colorizer-2`
- **Propósito**: Colorear llaves/paréntesis
- **Uso**: JavaScript complejo más legible

#### 8. **GitLens** 📊

- **ID**: `eamodio.gitlens`
- **Propósito**: Git supercharged
- **Uso**: Ver historial de cambios, blame code

#### 9. **REST Client** 🔌

- **ID**: `humao.rest-client`
- **Propósito**: Testear APIs desde VS Code
- **Uso**: Probar endpoints de `app.py`

#### 10. **Todo Tree** ✅

- **ID**: `Gruntfuggly.todo-tree`
- **Propósito**: Encontrar TODOs en código
- **Uso**: Trackear tareas pendientes

---

## 🤖 TRABAJAR CON IA (GITHUB COPILOT) {#trabajar-con-ia}

### 🎯 **Cómo Usar Copilot Efectivamente**

#### ✨ **Para Escribir Funciones Nuevas**

1. **Describe lo que quieres en comentario**:

   ```javascript
   // Función para validar todos los campos del formulario presupuesto
   // Debe verificar: medida, cantidad, marca, neto, ganancia
   // Retorna objeto con isValid y errores específicos
   function validatePresupuestoForm() {
     // Copilot completará automáticamente
   }
   ```

2. **Usa nombres descriptivos**:

   ```javascript
   // ✅ BUENO
   function calculateTotalWithTaxAndDiscount(subtotal, tax, discount) {

   // ❌ MALO
   function calc(a, b, c) {
   ```

#### 🔍 **Para Debug y Análisis**

1. **Selecciona código problemático → Ctrl+I**:

   ```
   Prompt: "Explica qué hace esta función y por qué podría fallar"
   ```

2. **Pide mejoras específicas**:
   ```
   Prompt: "Optimiza esta función para mejor rendimiento"
   Prompt: "Añade validación de errores a esta función"
   Prompt: "Convierte esto a async/await"
   ```

#### 🧪 **Para Testing**

```javascript
// Genera test automáticamente para esta función
// Debe probar casos: éxito, campos vacíos, valores inválidos
test("validateEssentialFields should validate form fields", () => {
  // Copilot generará test completo
});
```

### 🎯 **Prompts Específicos para Tu App**

#### Para **Funciones de Validación**:

```
"Crea función JavaScript que valide formulario de presupuesto con campos: medida, cantidad, marca, neto. Debe usar Material Design para mostrar errores"
```

#### Para **Funciones API**:

```
"Crea función async que llame a Flask API endpoint /api/presupuestos con fetch, maneje errores y muestre loading spinner"
```

#### Para **Debugging**:

```
"Explica por qué esta función de auto-añadir podría fallar y sugiere mejoras con console.log para debugging"
```

#### Para **CSS/UI**:

```
"Crea CSS para botón Material Design que no se superponga con íconos, responsive y con hover effects"
```

---

## 🔧 SETUP Y CONFIGURACIÓN {#setup-configuracion}

### ⚙️ **Configuración VS Code para Tu Proyecto**

#### 1. **Crear `.vscode/settings.json`**:

```json
{
  "python.defaultInterpreterPath": "./venv/Scripts/python.exe",
  "python.terminal.activateEnvironment": true,
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "javascript.suggest.autoImports": true,
  "html.format.wrapLineLength": 80,
  "files.associations": {
    "*.html": "html"
  },
  "emmet.includeLanguages": {
    "javascript": "html"
  },
  "playwright.reuseBrowser": true,
  "playwright.showTrace": true
}
```

#### 2. **Crear `.vscode/tasks.json`**:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Ejecutar App",
      "type": "shell",
      "command": "python",
      "args": ["run.py"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Run Tests Playwright",
      "type": "shell",
      "command": "npm",
      "args": ["test"],
      "group": "test"
    }
  ]
}
```

#### 3. **Crear `.vscode/launch.json`** (Para debugging):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Flask",
      "type": "python",
      "request": "launch",
      "program": "run.py",
      "env": {
        "FLASK_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### 📁 **Estructura de Archivos VS Code**

```
📁 .vscode/
├── settings.json     # Configuración del proyecto
├── tasks.json       # Tareas automatizadas
├── launch.json      # Configuración debugging
└── extensions.json  # Extensiones recomendadas
```

#### 4. **Crear `.vscode/extensions.json`**:

```json
{
  "recommendations": [
    "GitHub.copilot",
    "ms-python.python",
    "ms-playwright.playwright",
    "ritwickdey.LiveServer",
    "Tobermory.es6-string-html",
    "formulahendry.auto-rename-tag",
    "eamodio.gitlens",
    "humao.rest-client"
  ]
}
```

---

## 📋 WORKFLOW RECOMENDADO {#workflow-recomendado}

### 🎯 **Flujo Diario de Desarrollo**

#### 1. **Setup (Una vez)**

```bash
# En VS Code terminal
Ctrl+Shift+` # Abrir terminal
.\venv\Scripts\Activate.ps1 # Activar entorno
python run.py # Ejecutar app
```

#### 2. **Desarrollar Nueva Función**

```
1. Abrir archivo relevante (ej: js/main.js)
2. Escribir comentario describiendo función
3. Dejar que Copilot complete
4. Testear manualmente en navegador
5. Crear test Playwright si es crítica
6. Actualizar documentación en MAPEO_FUNCIONES.md
```

#### 3. **Debugging**

```
1. F12 en navegador → Console
2. Si es Python → F5 (Debug mode)
3. Si es test → Playwright extension → Run test
4. Si no sabes qué pasa → Copilot Chat: "explica este error"
```

#### 4. **Testing**

```
1. Ctrl+Shift+P → "Playwright: Run tests"
2. O terminal: npm test
3. Ver resultados en Test Explorer
```

### 🔄 **Hotkeys Esenciales**

| Hotkey          | Acción                    | Cuándo Usar             |
| --------------- | ------------------------- | ----------------------- |
| `Ctrl+Space`    | IntelliSense/autocomplete | Siempre al escribir     |
| `Ctrl+I`        | Copilot inline chat       | Explicar/mejorar código |
| `Ctrl+Shift+P`  | Command palette           | Ejecutar comandos       |
| `F5`            | Debug Python              | Debugging backend       |
| `Ctrl+Shift+\`` | Terminal                  | Comandos rápidos        |
| `Ctrl+P`        | Quick open file           | Navegar archivos        |
| `Ctrl+F`        | Find in file              | Buscar en archivo       |
| `Ctrl+Shift+F`  | Find in project           | Buscar en proyecto      |

---

## 🎓 TUTORIAL PASO A PASO {#tutorial-paso-a-paso}

### 🚀 **Ejemplo: Crear Nueva Función con IA**

Vamos a crear una función para **exportar presupuesto a PDF** usando Copilot:

#### Paso 1: **Preparar el Contexto**

```javascript
// En js/main.js, añadir al final:

// Función para exportar presupuesto actual a PDF
// Debe usar jsPDF library para generar PDF con:
// - Datos del cliente
// - Lista de ítems con precios
// - Total calculado
// - Logo del taller (opcional)
function exportPresupuestoToPDF() {
```

#### Paso 2: **Dejar que Copilot Complete**

- Copilot sugerirá implementación completa
- **Acepta** con `Tab` si se ve bien
- **Modifica** si necesitas cambios específicos

#### Paso 3: **Mejorar con Chat**

```
Ctrl+I → "Añade validación para verificar que hay ítems antes de exportar"
```

#### Paso 4: **Testear**

```
1. F12 → Console → exportPresupuestoToPDF()
2. Verificar que funciona
3. Si hay errores → Ctrl+I → "Por qué falla esto?"
```

#### Paso 5: **Documentar**

- Añadir función a `MAPEO_FUNCIONES.md`
- Crear test en Playwright si es crítica

### 🎯 **Ejemplo: Debugging con IA**

Si tu **auto-añadir falla**:

#### Paso 1: **Seleccionar Código Problemático**

```javascript
// Seleccionar la función executeAutoAdd completa
setTimeout(() => {
  const validation = validateEssentialFields();
  if (validation.valid) {
    document.getElementById("btn-agregar-marca").click();
  }
}, 1000);
```

#### Paso 2: **Preguntar a Copilot**

```
Ctrl+I → "Por qué esta función podría fallar? Qué debugging añadirías?"
```

#### Paso 3: **Aplicar Sugerencias**

- Copilot sugerirá console.logs, validaciones extra, etc.
- Implementar mejoras sugeridas

### 🛠️ **Configurar Testing con IA**

#### Paso 1: **Instalar Playwright Extension**

```
Ctrl+Shift+X → Buscar "Playwright" → Instalar
```

#### Paso 2: **Crear Test con Copilot**

```javascript
// En tests/playwright/nuevo-test.spec.js

// Test para verificar que el botón de exportar PDF funciona
// Debe llenar formulario, añadir ítems, y hacer click en exportar
// Verificar que se descarga archivo PDF
test("should export presupuesto to PDF", async ({ page }) => {
  // Copilot completará test completo
});
```

#### Paso 3: **Ejecutar Desde VS Code**

```
1. Abrir Test Explorer (izquierda)
2. Click en ▶️ junto al test
3. Ver resultados en tiempo real
```

---

## 🔧 HERRAMIENTAS ADICIONALES

### 📊 **REST Client para APIs**

Crear archivo `api-tests.http`:

```http
### Test sugerencias endpoint
GET http://localhost:5000/sugerencias?q=205/55R16

### Test crear presupuesto
POST http://localhost:5000/api/presupuestos
Content-Type: application/json

{
  "cliente": "Test Cliente",
  "items": []
}
```

### 🎨 **Emmet para HTML Rápido**

En `index.html`:

```
div.container>div.row>div.col.s12>h1{Título}+p{Descripción}
```

**Tab** → Se expande a HTML completo

### 🔍 **GitLens para Historial**

- Ver quién cambió cada línea
- Histórico de archivo
- Comparar versiones

---

## 🚀 COMANDOS RÁPIDOS DE EXTENSIONES

### En **Command Palette** (`Ctrl+Shift+P`):

```
> Python: Select Interpreter        # Cambiar versión Python
> Playwright: Record New Test       # Grabar test automáticamente
> Live Server: Open with Live Server # Servidor local
> GitLens: Open File History        # Ver cambios históricos
> REST Client: Send Request         # Testear API
> Copilot: Explain This            # Explicar código seleccionado
```

---

## 💡 TIPS PRO

### 🎯 **Para Máxima Productividad**

1. **Usa Copilot Chat para planificación**:

   ```
   "Necesito añadir funcionalidad de inventario a mi app Flask.
   ¿Qué archivos debo modificar y en qué orden?"
   ```

2. **Snippets personalizados**:

   ```javascript
   // Crear en VS Code Settings → User Snippets
   "console-debug": {
     "prefix": "cdebug",
     "body": [
       "console.log('🔥 [DEBUG] $1:', $2);"
     ]
   }
   ```

3. **Workspace settings por proyecto**:
   - Configuración específica para tu app
   - Auto-activar entorno Python
   - Paths personalizados

---

**📅 Última actualización**: Septiembre 16, 2025
**🎯 Extensiones cubiertas**: 10 esenciales + configuración
**🤖 IA Integration**: GitHub Copilot completo
**🛠️ Workflow**: Setup completo para desarrollo eficiente
