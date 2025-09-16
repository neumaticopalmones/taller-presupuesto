# 📄 SNIPPETS PERSONALIZADOS - APLICACIÓN PRESUPUESTOS

## 🎯 CÓMO USAR

1. **VS Code** → File → Preferences → Configure User Snippets
2. **Seleccionar lenguaje** (JavaScript, Python, HTML, etc.)
3. **Copiar snippets** de abajo al archivo correspondiente

---

## 🔥 JAVASCRIPT SNIPPETS

### Copiar a: `javascript.json`

```json
{
  "console-debug": {
    "prefix": "cdebug",
    "body": ["console.log('🔥 [DEBUG] $1:', $2);"],
    "description": "Console debug con emoji"
  },

  "auto-add-function": {
    "prefix": "autoadd",
    "body": [
      "// Función auto-añadir con validación y timeout",
      "function executeAutoAdd$1() {",
      "    console.log('🔥 [AUTO-ADD] INICIANDO AUTO-ADD');",
      "    ",
      "    setTimeout(() => {",
      "        const validation = validateEssentialFields();",
      "        console.log('🎯 [AUTO-ADD] RESULTADO VALIDACIÓN:', validation);",
      "        ",
      "        if (validation.valid) {",
      "            console.log('🚀 [AUTO-ADD] EJECUTANDO CLICK AUTOMÁTICO');",
      "            document.getElementById('$2').click();",
      "            console.log('✅ [AUTO-ADD] CLICK EJECUTADO');",
      "        } else {",
      "            console.error('❌ [AUTO-ADD] VALIDACIÓN FALLÓ:', validation.errors);",
      "        }",
      "    }, $3);",
      "}"
    ],
    "description": "Función auto-añadir completa con logging"
  },

  "fetch-api": {
    "prefix": "fetchapi",
    "body": [
      "async function fetch$1() {",
      "    try {",
      "        const response = await fetch('$2');",
      "        if (!response.ok) {",
      "            throw new Error(`HTTP error! status: ${response.status}`);",
      "        }",
      "        const data = await response.json();",
      "        return data;",
      "    } catch (error) {",
      "        console.error('🚨 Error en fetch$1:', error);",
      "        throw error;",
      "    }",
      "}"
    ],
    "description": "Función fetch con manejo de errores"
  },

  "validate-form": {
    "prefix": "validate",
    "body": [
      "function validate$1Fields() {",
      "    const fields = {",
      "        $2: document.getElementById('$2')?.value,",
      "        $3: document.getElementById('$3')?.value",
      "    };",
      "    ",
      "    const errors = [];",
      "    ",
      "    if (!fields.$2) {",
      "        errors.push('$2 es requerido');",
      "    }",
      "    ",
      "    if (!fields.$3) {",
      "        errors.push('$3 es requerido');",
      "    }",
      "    ",
      "    return {",
      "        valid: errors.length === 0,",
      "        errors: errors,",
      "        fields: fields",
      "    };",
      "}"
    ],
    "description": "Función de validación de formulario"
  },

  "materialize-toast": {
    "prefix": "toast",
    "body": [
      "M.toast({",
      "    html: '$1',",
      "    classes: '$2',",
      "    displayLength: ${3:3000}",
      "});"
    ],
    "description": "Toast notification Materialize"
  }
}
```

---

## 🐍 PYTHON SNIPPETS

### Copiar a: `python.json`

```json
{
  "flask-endpoint": {
    "prefix": "endpoint",
    "body": [
      "@app.route('$1', methods=['$2'])",
      "def $3():",
      "    try:",
      "        # TODO: Implementar lógica",
      "        $4",
      "        return jsonify({'success': True})",
      "    except Exception as e:",
      "        return jsonify({'error': str(e)}), 500"
    ],
    "description": "Endpoint Flask con manejo de errores"
  },

  "sqlalchemy-model": {
    "prefix": "model",
    "body": [
      "class $1(db.Model):",
      "    __tablename__ = '$2'",
      "    ",
      "    id = db.Column(db.Integer, primary_key=True)",
      "    $3 = db.Column(db.String(100), nullable=False)",
      "    created_at = db.Column(db.DateTime, default=datetime.utcnow)",
      "    ",
      "    def to_dict(self):",
      "        return {",
      "            'id': self.id,",
      "            '$3': self.$3,",
      "            'created_at': self.created_at.isoformat() if self.created_at else None",
      "        }",
      "    ",
      "    def __repr__(self):",
      "        return f'<$1 {self.id}>'"
    ],
    "description": "Modelo SQLAlchemy completo"
  },

  "debug-print": {
    "prefix": "dprint",
    "body": ["print(f'🔥 [DEBUG] $1: {$2}')"],
    "description": "Debug print con emoji"
  }
}
```

---

## 🌐 HTML SNIPPETS

### Copiar a: `html.json`

```json
{
  "materialize-form": {
    "prefix": "mform",
    "body": [
      "<div class=\"input-field col s12 m$1\">",
      "    <i class=\"material-icons prefix\">$2</i>",
      "    <input id=\"$3\" type=\"$4\" class=\"validate\">",
      "    <label for=\"$3\">$5</label>",
      "</div>"
    ],
    "description": "Input field Materialize con ícono"
  },

  "materialize-button": {
    "prefix": "mbtn",
    "body": [
      "<a class=\"btn waves-effect waves-light $1\" id=\"$2\">",
      "    <i class=\"material-icons left\">$3</i>$4",
      "</a>"
    ],
    "description": "Botón Materialize con ícono"
  },

  "chip-container": {
    "prefix": "chips",
    "body": [
      "<div class=\"chips-container\" id=\"$1\">",
      "    <!-- Chips generados dinámicamente -->",
      "</div>"
    ],
    "description": "Contenedor para chips"
  }
}
```

---

## 🎭 PLAYWRIGHT TEST SNIPPETS

### Copiar a: `javascript.json` (añadir)

```json
{
  "playwright-test": {
    "prefix": "pwtest",
    "body": [
      "test('$1', async ({ page }) => {",
      "    await page.goto('http://localhost:5000');",
      "    ",
      "    // TODO: Implementar test",
      "    $2",
      "    ",
      "    await expect(page.locator('$3')).toBeVisible();",
      "});"
    ],
    "description": "Test básico Playwright"
  },

  "playwright-fill-form": {
    "prefix": "pwfill",
    "body": [
      "// Llenar formulario",
      "await page.fill('#$1', '$2');",
      "await page.fill('#$3', '$4');",
      "await page.click('#$5');"
    ],
    "description": "Llenar formulario en Playwright"
  },

  "playwright-debug": {
    "prefix": "pwdebug",
    "body": [
      "// Debug: Capturar screenshot",
      "await page.screenshot({ path: '$1-debug.png' });",
      "",
      "// Debug: Ver console logs",
      "page.on('console', msg => console.log('BROWSER:', msg.text()));",
      "",
      "// Debug: Pausar para inspección",
      "await page.pause();"
    ],
    "description": "Herramientas debug Playwright"
  }
}
```

---

## 🎨 CSS SNIPPETS

### Copiar a: `css.json`

```json
{
  "materialize-fix": {
    "prefix": "mfix",
    "body": [
      "/* Fix para íconos que solapan texto */",
      ".input-field input[type=text] {",
      "    padding-left: 50px !important;",
      "}",
      "",
      ".input-field .prefix {",
      "    left: 0;",
      "    top: 0.8rem;",
      "}"
    ],
    "description": "Fix común Materialize para íconos"
  },

  "chip-style": {
    "prefix": "chip",
    "body": [
      ".chip-$1 {",
      "    margin: 5px;",
      "    cursor: pointer;",
      "    transition: all 0.3s ease;",
      "}",
      "",
      ".chip-$1:hover {",
      "    transform: translateY(-2px);",
      "    box-shadow: 0 4px 8px rgba(0,0,0,0.2);",
      "}"
    ],
    "description": "Estilo para chips con hover"
  }
}
```

---

## 🚀 CÓMO CONFIGURAR

### 1. **Acceso Rápido a Snippets**

```
Ctrl+Shift+P → "Configure User Snippets"
```

### 2. **Usar Snippets**

```
Escribir prefix → Tab
Ejemplo: "cdebug" → Tab → console.log('🔥 [DEBUG] :', );
```

### 3. **Snippets Específicos del Proyecto**

Para snippets solo para este proyecto, crear:

```
.vscode/snippets.code-snippets
```

---

## 💡 SNIPPETS AVANZADOS CON COPILOT

### Snippet que Activa Copilot

```json
{
  "copilot-function": {
    "prefix": "aifunc",
    "body": [
      "// Función para $1",
      "// Debe: $2",
      "// Usar: $3",
      "// Retornar: $4",
      "function $5() {",
      "    $6",
      "}"
    ],
    "description": "Template para función con Copilot"
  }
}
```

**Uso**: Escribir "aifunc" → Tab → Llenar descripción → Copilot completará

---

**💡 BENEFICIO**: Snippets + Copilot = **Código 10x más rápido**

- Snippets: Estructura base
- Copilot: Lógica específica
- Combinados: Desarrollo ultra-eficiente

**📅 Última actualización**: Septiembre 16, 2025
