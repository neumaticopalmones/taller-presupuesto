# 🛠️ GUÍA DE RESOLUCIÓN DE PROBLEMAS - TALLER PRESUPUESTO

## 🎯 ÍNDICE

- [🚨 Problemas Frecuentes](#problemas-frecuentes)
- [🔧 Herramientas de Diagnóstico](#herramientas-diagnostico)
- [📋 Checklist de Resolución](#checklist-resolucion)
- [🧪 Testing y Verificación](#testing-verificacion)

---

## 🚨 PROBLEMAS FRECUENTES {#problemas-frecuentes}

### ❌ AUTO-AÑADIR NO FUNCIONA

#### 🎯 Síntomas

- Click en sugerencia de marca no añade automáticamente
- Usuario debe hacer click manual en "Añadir Marca"
- Console muestra "Validación falló" o similares

#### 🔍 Diagnóstico Paso a Paso

1. **Verificar Consola del Navegador (F12)**

   ```javascript
   // Buscar estos logs:
   console.log("🔥 [AUTO-ADD] INICIANDO AUTO-ADD PARA MARCA:", marca);
   console.log("🎯 [AUTO-ADD] RESULTADO VALIDACIÓN:", resultado);
   ```

2. **Verificar Campos Obligatorios**

   ```javascript
   // Los 4 campos esenciales deben estar llenos:
   - Medida: No vacío
   - Cantidad: Número válido > 0
   - Marca: Texto no vacío
   - Neto: Número válido > 0
   ```

3. **Verificar Timing**
   ```javascript
   // Auto-añadir usa setTimeout de 1000ms
   // Si muy rápido, puede fallar
   setTimeout(() => {
     // Código auto-añadir aquí
   }, 1000);
   ```

#### ✅ Soluciones

| Problema            | Solución                                                    | Archivo      |
| ------------------- | ----------------------------------------------------------- | ------------ |
| Campos vacíos       | Llenar todos los 4 campos esenciales                        | N/A          |
| Timing muy rápido   | Aumentar setTimeout en main.js línea ~1150                  | `js/main.js` |
| Callback incorrecto | Verificar que `executeAutoAdd` esté en el listener correcto | `js/main.js` |
| Botón no encontrado | Verificar ID `btn-agregar-marca` existe                     | `index.html` |

#### 🧪 Test de Verificación

```bash
# Ejecutar test específico auto-añadir
npx playwright test tests/playwright/flujo-final-correcto.spec.js --headed
```

---

### ❌ SUGERENCIAS NO APARECEN

#### 🎯 Síntomas

- Escribir en campo "Medida" no muestra sugerencias
- Area de sugerencias permanece vacía
- API devuelve error o datos vacíos

#### 🔍 Diagnóstico

1. **Verificar API Backend**

   ```bash
   # En navegador ir a:
   http://localhost:5000/sugerencias?q=205/55R16

   # Debe devolver JSON con array de sugerencias
   ```

2. **Verificar Función Frontend**
   ```javascript
   // En console del navegador:
   fetch("/sugerencias?q=205/55R16")
     .then((r) => r.json())
     .then(console.log);
   ```

#### ✅ Soluciones

| Problema           | Solución                                 | Archivo      |
| ------------------ | ---------------------------------------- | ------------ |
| Backend no ejecuta | Verificar `python run.py` corriendo      | `run.py`     |
| Error API          | Verificar logs Flask en terminal         | `app.py`     |
| Frontend no llama  | Verificar event listener input medida    | `js/main.js` |
| Renderizado falla  | Verificar función `loadSugerenciasChips` | `js/main.js` |

---

### ❌ INTERFAZ ROTA O DESALINEADA

#### 🎯 Síntomas

- Íconos solapan texto
- Botones no visibles
- Layout descuadrado

#### ✅ Soluciones Rápidas

```css
/* En style.css - Para inputs con íconos */
.input-field input[type="text"] {
  padding-left: 50px !important;
}

/* Para botones no visibles */
.btn {
  min-height: 36px;
  line-height: 36px;
}
```

---

### ❌ NAVEGACIÓN ENTRE VISTAS NO FUNCIONA

#### 🎯 Síntomas

- Botones de navegación no responden
- Vistas no cambian al hacer click
- Console muestra errores de elementos no encontrados

#### 🔍 Diagnóstico

```javascript
// Verificar event listeners
document.querySelectorAll("[data-view]").forEach((btn) => {
  console.log("Botón encontrado:", btn, "Vista:", btn.dataset.view);
});
```

#### ✅ Solución

Verificar que todos los botones tengan:

```html
<a href="#!" data-view="nombre-vista" class="nav-btn">Texto</a>
```

Y que exista el event listener:

```javascript
document.querySelectorAll("[data-view]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    showView(btn.dataset.view);
  });
});
```

---

## 🔧 HERRAMIENTAS DE DIAGNÓSTICO {#herramientas-diagnostico}

### 🔍 Console Debug Commands

```javascript
// En console del navegador (F12):

// 1. Ver estado actual de la aplicación
console.log("Estado app:", window.appState || "No definido");

// 2. Verificar campos del formulario
const campos = {
  medida: document.getElementById("medida")?.value,
  cantidad: document.getElementById("cantidad")?.value,
  marca: document.getElementById("marca")?.value,
  neto: document.getElementById("neto")?.value,
};
console.log("Campos actuales:", campos);

// 3. Test manual de validación
function testValidation() {
  const medida = document.getElementById("medida").value;
  const cantidad = document.getElementById("cantidad").value;
  const marca = document.getElementById("marca").value;
  const neto = document.getElementById("neto").value;

  const valid =
    medida && cantidad && parseFloat(cantidad) > 0 && marca && neto && parseFloat(neto) > 0;

  console.log("Test validación:", { medida, cantidad, marca, neto, valid });
  return valid;
}

// 4. Simular click en botón añadir
document.getElementById("btn-agregar-marca")?.click();

// 5. Ver lista de ítems actual
const lista = document.getElementById("lista-marcas-temp");
console.log("Items en lista:", lista?.children.length || 0);
```

### 📊 Network Tab (F12 → Network)

Para problemas de API:

1. Abrir F12 → Network
2. Ejecutar acción problemática
3. Verificar requests:
   - ✅ Status 200 = OK
   - ❌ Status 404 = Endpoint no existe
   - ❌ Status 500 = Error backend

### 🔍 Playwright Debug Mode

```bash
# Test con debug visual
npx playwright test --debug

# Test específico con logs detallados
npx playwright test tests/playwright/flujo-final-correcto.spec.js --headed --reporter=list
```

---

## 📋 CHECKLIST DE RESOLUCIÓN {#checklist-resolucion}

### 🎯 Para Cualquier Problema

1. **Reproducir** ✅
   - [ ] Pasos exactos para reproducir
   - [ ] ¿Sucede siempre o solo a veces?
   - [ ] ¿En qué navegador/versión?

2. **Información** ✅
   - [ ] Revisar console del navegador (F12)
   - [ ] Revisar Network tab para APIs
   - [ ] Revisar logs del servidor Python

3. **Aislar** ✅
   - [ ] ¿Funciona en incógnito?
   - [ ] ¿Funciona con datos diferentes?
   - [ ] ¿Funciona la parte manual?

4. **Verificar** ✅
   - [ ] Backend ejecutando (`python run.py`)
   - [ ] Sin errores JavaScript
   - [ ] Campos obligatorios llenos
   - [ ] IDs de elementos existen

### 🔧 Para Problemas de Auto-Añadir

1. **Pre-condiciones** ✅
   - [ ] 4 campos esenciales llenos
   - [ ] Sugerencias visible en pantalla
   - [ ] Botón "Añadir Marca" existe y visible

2. **Durante Click** ✅
   - [ ] Console muestra logs de auto-añadir
   - [ ] Validación reporta "TODAS VÁLIDAS"
   - [ ] setTimeout se ejecuta (esperar 1 segundo)

3. **Post-ejecución** ✅
   - [ ] Ítem aparece en `lista-marcas-temp`
   - [ ] Campos se mantienen llenos
   - [ ] No errores en console

---

## 🧪 TESTING Y VERIFICACIÓN {#testing-verificacion}

### 🎯 Tests Automáticos

#### Ejecutar Suite Completa

```bash
# Todos los tests
npm test

# Solo auto-añadir
npx playwright test flujo-final-correcto

# Con interfaz visual
npm run test:ui
```

#### Crear Test Para Nuevo Bug

```javascript
// En tests/playwright/
// Archivo: test-nuevo-bug.spec.js

const { test, expect } = require("@playwright/test");

test("Reproducir bug: [DESCRIPCIÓN]", async ({ page }) => {
  await page.goto("http://localhost:5000");

  // Pasos para reproducir
  await page.fill("#medida", "205/55R16");
  await page.fill("#cantidad", "2");

  // Verificar comportamiento esperado
  await expect(page.locator("#sugerencias")).toBeVisible();

  // Capturar estado si falla
  await page.screenshot({ path: "debug-bug.png" });
});
```

### 🔍 Tests Manuales

#### Checklist Funcionalidad Básica

- [ ] **Navegación**: Todas las vistas cargan
- [ ] **Sugerencias**: Aparecen al escribir medida
- [ ] **Auto-añadir**: Funciona con 4 campos llenos
- [ ] **Manual**: Botón "Añadir Marca" funciona siempre
- [ ] **Cálculos**: Precios se calculan correctamente
- [ ] **Persistencia**: Presupuestos se guardan

#### Test de Estrés

1. Llenar 10+ ítems en un presupuesto
2. Navegación rápida entre vistas
3. Múltiples sugerencias consecutivas
4. Edición/eliminación masiva

---

## 🚀 PROCEDIMIENTO DE EMERGENCIA

### 🔴 Si Todo Falla

1. **Backup Rápido**

   ```bash
   git add -A
   git commit -m "BACKUP antes de fix crítico"
   ```

2. **Revertir a Último Estado Funcional**

   ```bash
   git log --oneline -10  # Ver commits recientes
   git checkout [HASH_COMMIT_BUENO]
   ```

3. **Verificar Estado Base**

   ```bash
   python run.py
   # Probar funcionalidad básica en navegador
   ```

4. **Re-aplicar Cambios de Uno en Uno**
   - Aplicar cambio → Test → Si funciona, continuar
   - Si falla → Revertir e investigar

### 📞 Recursos de Ayuda

- **Logs Backend**: Terminal donde ejecutas `python run.py`
- **Logs Frontend**: F12 → Console en navegador
- **State Debugging**: `window.appState` en console
- **API Testing**: Browser dev tools → Network tab

---

**📅 Última actualización**: Septiembre 16, 2025
**🎯 Problemas documentados**: 5 categorías principales
**🔧 Herramientas**: 4 métodos de diagnóstico
**📋 Checklists**: Procedimientos completos de resolución
