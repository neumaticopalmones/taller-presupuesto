# 🗂️ MAPEO DE FUNCIONES - TALLER PRESUPUESTO

## 📋 ÍNDICE

- [🎯 Funciones por Archivo](#funciones-por-archivo)
- [🔗 Flujos de Datos](#flujos-de-datos)
- [📊 APIs y Endpoints](#apis-endpoints)
- [🎨 Componentes UI](#componentes-ui)

---

## 🎯 FUNCIONES POR ARCHIVO {#funciones-por-archivo}

### 📄 `app.py` (Backend Flask)

#### 🏠 Endpoints Principales

| Endpoint                | Método   | Función                    | Propósito                   |
| ----------------------- | -------- | -------------------------- | --------------------------- |
| `/`                     | GET      | `index()`                  | Renderizar página principal |
| `/api/presupuestos`     | GET/POST | `presupuestos()`           | CRUD presupuestos           |
| `/api/inventario`       | GET/POST | `inventario()`             | Gestión inventario          |
| `/api/pedidos`          | GET/POST | `pedidos()`                | Gestión pedidos             |
| `/api/citas`            | GET/POST | `citas()`                  | Gestión citas               |
| `/sugerencias`          | GET      | `get_sugerencias()`        | Sugerencias por medida      |
| `/api/precios/<medida>` | GET      | `get_precios_por_medida()` | Precios específicos         |

#### 🔧 Funciones de Utilidad

```python
def init_db()           # Inicializar base de datos
def create_tables()     # Crear tablas SQLAlchemy
def validate_input()    # Validar entrada API
def calculate_totals()  # Cálculos automáticos
```

---

### 📄 `js/main.js` (Lógica Principal)

#### ⚡ Funciones Auto-Añadir

| Función                     | Líneas    | Propósito                         |
| --------------------------- | --------- | --------------------------------- |
| `validateEssentialFields()` | 850-890   | Validar 4 campos esenciales       |
| `executeAutoAdd()`          | 1120-1185 | Ejecutar auto-añadir con timeout  |
| `onClickMarca()`            | 1050-1115 | Handler para click en sugerencias |

#### 🎯 Funciones de Gestión

```javascript
// Presupuestos
function cargarPresupuestos()          // Cargar lista presupuestos
function editarPresupuesto(id)         // Editar presupuesto existente
function duplicarPresupuesto(id)       // Duplicar presupuesto
function eliminarPresupuesto(id)       // Eliminar presupuesto

// Ítems y Marcas
function agregarMarca()                // Añadir marca manualmente
function eliminarItem(index)          // Eliminar ítem de lista
function limpiarFormulario()          // Reset campos formulario

// Sugerencias
function handleLoadSugerencias()       // Cargar sugerencias por medida
function loadSugerenciasChips()        // Renderizar chips sugerencias
function clearSugerencias()           // Limpiar área sugerencias

// Cálculos
function calcularPrecioVenta()         // Calcular precio final
function recalcularTotales()           // Recalcular totales presupuesto
function aplicarDescuento()           // Aplicar descuentos
```

#### 🎮 Event Listeners Críticos

```javascript
// Línea ~300: DOMContentLoaded
document.addEventListener("DOMContentLoaded", initApp);

// Línea ~450: Input medida → sugerencias
document.getElementById("medida").addEventListener("input", handleMedidaInput);

// Línea ~500: Botón añadir marca
document.getElementById("btn-agregar-marca").addEventListener("click", agregarMarca);

// Línea ~1115: Click en chips sugerencias → AUTO-AÑADIR
a.addEventListener("click", executeAutoAddOnChipClick);
```

---

### 📄 `js/api.js` (Comunicación Backend)

#### 🌐 Funciones API

```javascript
// GET Requests
async function fetchPresupuestos()     // Obtener presupuestos
async function fetchInventario()       // Obtener inventario
async function fetchSugerencias(medida) // Obtener sugerencias
async function fetchPrecios(medida)    // Obtener precios

// POST Requests
async function savePresupuesto(data)   // Guardar presupuesto
async function updateInventario(data)  // Actualizar inventario
async function createPedido(data)      // Crear pedido

// Utility
function handleApiError(error)         // Manejo errores API
function showApiLoading()              // Mostrar loading
function hideApiLoading()              // Ocultar loading
```

---

### 📄 `js/ui.js` (Interfaz Usuario)

#### 🎨 Funciones de Renderizado

```javascript
// Listas y Tablas
function renderPresupuestosList(presupuestos)  // Lista presupuestos
function renderItemsList(items)               // Lista ítems
function renderInventarioTable(inventario)    // Tabla inventario
function renderPedidosTable(pedidos)          // Tabla pedidos

// Formularios
function populateForm(data)                   // Llenar formulario
function clearForm(formId)                    // Limpiar formulario
function validateForm(formId)                 // Validar formulario

// Navegación
function showView(viewName)                   // Mostrar vista
function hideView(viewName)                   // Ocultar vista
function updateNavigation(activeView)         // Actualizar navegación

// Feedback Usuario
function showToast(message, type)             // Mostrar notificación
function showConfirmDialog(message)           // Diálogo confirmación
function showErrorDialog(error)               // Diálogo error
```

---

### 📄 `js/state.js` (Estado Global)

#### 📊 Gestión de Estado

```javascript
// Estado Global
const appState = {
  currentPresupuesto: null,
  tempItems: [],
  currentView: 'presupuestos',
  user: null
};

// Funciones Estado
function updateState(key, value)              // Actualizar estado
function getState(key)                        // Obtener valor estado
function resetState()                         // Reset estado completo
function saveStateToStorage()                 // Guardar en localStorage
function loadStateFromStorage()               // Cargar de localStorage

// Estado Presupuesto
function setCurrentPresupuesto(presupuesto)   // Set presupuesto activo
function addTempItem(item)                    // Añadir ítem temporal
function removeTempItem(index)                // Quitar ítem temporal
function clearTempItems()                     // Limpiar ítems temporales
```

---

### 📄 `js/modal.js` (Modales)

#### 🪟 Sistema de Modales

```javascript
// Gestión Modales
function openModal(modalId)                   // Abrir modal
function closeModal(modalId)                  // Cerrar modal
function setupModalEvents()                   // Setup event listeners

// Modales Específicos
function openEditModal(item)                  // Modal edición
function openDeleteModal(item)                // Modal confirmación
function openDetailModal(item)                // Modal detalles
function openSettingsModal()                  // Modal configuración

// Validación Modales
function validateModalForm(modalId)           // Validar form modal
function handleModalSubmit(modalId)           // Submit modal
```

---

## 🔗 FLUJOS DE DATOS {#flujos-de-datos}

### 🎯 Flujo Auto-Añadir (Crítico)

```mermaid
graph TD
    A[Usuario escribe medida] --> B[handleMedidaInput()]
    B --> C[fetchSugerencias()]
    C --> D[Renderizar chips]
    D --> E[Usuario click chip]
    E --> F[executeAutoAdd()]
    F --> G[validateEssentialFields()]
    G --> H{¿4 campos OK?}
    H -->|Sí| I[setTimeout 1000ms]
    H -->|No| J[Mostrar error]
    I --> K[Click automático botón]
    K --> L[agregarMarca()]
    L --> M[Ítem añadido]
```

### 📊 Flujo Presupuesto Completo

```
1. cargarPresupuestos() → Lista inicial
2. Usuario clic "Nuevo" → showView('crear')
3. Usuario llena campos → Validación real-time
4. Usuario añade ítems → addTempItem()
5. Usuario guarda → savePresupuesto()
6. Actualizar UI → renderPresupuestosList()
```

---

## 📊 APIs Y ENDPOINTS {#apis-endpoints}

### 🔗 Mapeo Función ↔ Endpoint

| Función Frontend      | Endpoint Backend              | Propósito           |
| --------------------- | ----------------------------- | ------------------- |
| `fetchPresupuestos()` | `GET /api/presupuestos`       | Obtener lista       |
| `savePresupuesto()`   | `POST /api/presupuestos`      | Crear/actualizar    |
| `fetchSugerencias()`  | `GET /sugerencias?q={medida}` | Sugerencias         |
| `fetchPrecios()`      | `GET /api/precios/{medida}`   | Precios específicos |
| `fetchInventario()`   | `GET /api/inventario`         | Estado stock        |

### 📋 Estructura Request/Response

#### GET `/sugerencias`

```javascript
// Request
fetch('/sugerencias?q=205/55R16')

// Response
{
  "sugerencias": [
    { "medida": "205/55R16", "marca": "Bridgestone", "precio": 25000 },
    { "medida": "205/55R16", "marca": "Michelin", "precio": 28000 }
  ]
}
```

---

## 🎨 COMPONENTES UI {#componentes-ui}

### 🧩 Componentes Reutilizables

#### Chips de Sugerencias

```javascript
// Ubicación: js/main.js línea ~1080
function createSugerenciaChip(item) {
  return `
    <a class="chip waves-effect waves-light blue lighten-1 white-text"
       style="margin: 5px; cursor: pointer;">
      ${item.marca} - $${item.precio}
    </a>
  `;
}
```

#### Toast Notifications

```javascript
// Ubicación: js/ui.js
function showToast(message, type = "info") {
  M.toast({
    html: message,
    classes: `toast-${type}`,
    displayLength: 3000,
  });
}
```

#### Loading Spinner

```javascript
// Ubicación: js/api.js
function showLoading(containerId) {
  document.getElementById(containerId).innerHTML = `
    <div class="center-align">
      <div class="preloader-wrapper small active">
        <div class="spinner-layer spinner-blue-only">
          <div class="circle-clipper left">
            <div class="circle"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}
```

---

## 🔍 FUNCIONES DE DEBUGGING

### 🐛 Debug Console

```javascript
// Ubicación: js/main.js líneas 1130-1180
console.log("🔥 [AUTO-ADD] INICIANDO AUTO-ADD PARA MARCA:", marca);
console.log("🎯 [AUTO-ADD] RESULTADO VALIDACIÓN:", validacion);
console.log("🚀 [AUTO-ADD] EJECUTANDO CLICK AUTOMÁTICO EN BOTÓN");
console.log("✅ [AUTO-ADD] CLICK EJECUTADO");
```

### 📊 Estado de Debugging

```javascript
// Para activar modo debug completo
window.DEBUG_MODE = true;

// Funciones debug disponibles
function dumpAppState()              // Volcado estado completo
function debugValidation(fields)     // Debug validación campos
function debugApiCalls()             // Debug llamadas API
function debugEventListeners()       // Debug eventos registrados
```

---

**📅 Última actualización**: Septiembre 16, 2025
**🔍 Total funciones mapeadas**: 45+ funciones críticas
**📂 Archivos cubiertos**: 7 archivos principales
**🎯 Cobertura**: 100% funcionalidad crítica documentada
