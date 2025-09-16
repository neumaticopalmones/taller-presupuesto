# 📚 DOCUMENTACIÓN TÉCNICA - TALLER PRESUPUESTO

## 🎯 ÍNDICE GENERAL

- [🏗️ ARQUITECTURA](#arquitectura)
- [📁 ESTRUCTURA DE ARCHIVOS](#estructura)
- [🔧 FUNCIONALIDADES](#funcionalidades)
- [🐛 PROBLEMAS Y SOLUCIONES](#problemas)
- [🧪 TESTING](#testing)
- [🚀 DESARROLLO](#desarrollo)

---

## 🏗️ ARQUITECTURA {#arquitectura}

### Stack Tecnológico

- **Backend**: Python Flask
- **Frontend**: Vanilla JavaScript + Materialize CSS
- **Base de Datos**: PostgreSQL (vía SQLAlchemy)
- **Testing**: Playwright (automático) + Selenium (legacy)

### Patrón de Diseño

```
Frontend (JS) ↔ API REST (Flask) ↔ Base de Datos (PostgreSQL)
```

---

## 📁 ESTRUCTURA DE ARCHIVOS {#estructura}

### 📂 Archivos Principales

| Archivo       | Propósito          | Funciones Clave                              |
| ------------- | ------------------ | -------------------------------------------- |
| `app.py`      | Backend Flask      | API endpoints, lógica de negocio             |
| `index.html`  | Interfaz principal | Estructura HTML de la aplicación             |
| `js/main.js`  | Lógica frontend    | Manejo de eventos, auto-añadir, validaciones |
| `js/api.js`   | Comunicación API   | Métodos fetch para backend                   |
| `js/ui.js`    | Interfaz usuario   | Renderizado dinámico, modales                |
| `js/state.js` | Estado global      | Gestión de datos temporales                  |
| `js/modal.js` | Modales            | Funcionalidad de ventanas emergentes         |
| `style.css`   | Estilos            | CSS personalizado                            |

### 📂 Configuración y Testing

| Archivo                      | Propósito                          |
| ---------------------------- | ---------------------------------- |
| `playwright.config.js`       | Configuración de tests automáticos |
| `tests/playwright/*.spec.js` | Tests de funcionalidad             |
| `package.json`               | Dependencias Node.js               |
| `requirements.txt`           | Dependencias Python                |
| `run.py`                     | Launcher de la aplicación          |

---

## 🔧 FUNCIONALIDADES {#funcionalidades}

### 🎯 Funcionalidades Principales

#### 1. **Auto-Añadir Marcas** ⚡

- **Archivo**: `js/main.js` (líneas 1115-1185)
- **Trigger**: Click en sugerencia de marca
- **Validación**: 4 campos esenciales (medida, cantidad, marca, neto)
- **Timeout**: 1000ms para dar tiempo al llenado de campos

#### 2. **Gestión de Presupuestos** 📊

- **Archivos**: `js/main.js`, `js/state.js`, `js/ui.js`
- **CRUD**: Crear, editar, duplicar, eliminar presupuestos
- **Cálculos**: Automáticos con ganancia, ecotasa, IVA

#### 3. **Sistema de Sugerencias** 💡

- **Archivo**: `js/main.js` (función `handleLoadSugerencias`)
- **API**: `/sugerencias` endpoint
- **Filtros**: Por código de neumático

#### 4. **Inventario y Pedidos** 📦

- **Gestión**: Stock, proveedores, citas
- **Integración**: Con presupuestos y precios

### 🔗 Flujos de Usuario Críticos

#### Flujo Auto-Añadir

```
1. Usuario escribe medida → Aparecen sugerencias
2. Usuario llena cantidad, ganancia, etc.
3. Usuario click en sugerencia → Auto-añadir ejecuta
4. Validación de 4 campos esenciales
5. Click automático en botón "Añadir Marca"
6. Ítem se añade a la lista
```

---

## 🐛 PROBLEMAS Y SOLUCIONES {#problemas}

### ❌ PROBLEMA RESUELTO: Auto-añadir no funcionaba

**📅 Fecha**: Septiembre 2025
**🎯 Síntoma**: Al hacer click en sugerencias de marca, no se añadía automáticamente
**🔍 Causa Raíz**: Función `onClickMarca` con auto-añadir solo existía en `handleLoadSugerencias`, pero cuando usuario escribía medida se usaba callback diferente sin auto-añadir
**✅ Solución**: Se agregó código de auto-añadir al callback de chips en líneas 1115-1185 de `main.js`
**📝 Archivos Modificados**: `js/main.js`
**🧪 Verificación**: Tests en `tests/playwright/flujo-final-correcto.spec.js`

```javascript
// ANTES: Solo llenaba campos
a.addEventListener("click", (e) => {
  // Solo llenado básico
});

// DESPUÉS: Llena campos + auto-añadir
a.addEventListener("click", (e) => {
  // Llenado + setTimeout con validación + click automático
});
```

### ❌ PROBLEMA RESUELTO: Íconos solapando texto

**📅 Fecha**: Septiembre 2025
**🎯 Síntoma**: Íconos de Material Design se superponían con texto en inputs
**✅ Solución**: CSS padding-left: 50px en inputs con íconos
**📝 Archivo**: `style.css`

### ❌ PROBLEMA RESUELTO: Navegación entre vistas

**📅 Fecha**: Septiembre 2025
**🎯 Síntoma**: Botones de navegación no funcionaban
**✅ Solución**: Event listeners reparados para botones de vista
**📝 Archivo**: `js/main.js`

---

## 🧪 TESTING {#testing}

### Herramientas de Testing

#### Playwright (Moderno - Recomendado)

- **Configuración**: `playwright.config.js`
- **Tests**: `tests/playwright/*.spec.js`
- **Ventajas**: Mejor debugging, capturas automáticas, múltiples navegadores

#### Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Test con interfaz visual
npm run test:ui

# Test con navegador visible
npm run test:headed

# Ver reportes
npm run test:report
```

### Tests Críticos

| Test           | Archivo                        | Propósito                         |
| -------------- | ------------------------------ | --------------------------------- |
| Auto-añadir    | `flujo-final-correcto.spec.js` | Verificar funcionalidad principal |
| Manual añadir  | `flujo-final-correcto.spec.js` | Verificar fallback manual         |
| Debug completo | `debug-boton-manual.spec.js`   | Diagnosticar problemas            |

---

## 🚀 DESARROLLO {#desarrollo}

### 🔧 Setup del Entorno

```bash
# 1. Activar entorno Python
.\venv\Scripts\Activate.ps1

# 2. Instalar dependencias Python
pip install -r requirements.txt

# 3. Instalar dependencias Node.js
npm install

# 4. Instalar navegadores Playwright
npx playwright install

# 5. Ejecutar aplicación
python run.py
```

### 🎯 Workflow de Desarrollo

#### Para Nuevas Funcionalidades:

1. **Planificar** → Crear issue/tarea
2. **Desarrollar** → Implementar en archivos correspondientes
3. **Testear** → Crear test en Playwright
4. **Documentar** → Actualizar esta documentación
5. **Desplegar** → Commit y push

#### Para Bugs:

1. **Reproducir** → Crear test que falle
2. **Investigar** → Usar browser dev tools + logs
3. **Arreglar** → Implementar solución
4. **Verificar** → Test debe pasar
5. **Documentar** → Añadir a sección Problemas Resueltos

### 📋 Checklist Pre-Deploy

- [ ] Tests pasan (`npm test`)
- [ ] No errores en consola del navegador
- [ ] Funcionalidad crítica verificada manualmente
- [ ] Documentación actualizada
- [ ] Commit con mensaje descriptivo

---

## 📞 CONTACTOS Y RECURSOS

### Archivos de Referencia Rápida

- **Logs**: Abrir F12 → Console en navegador
- **API**: Documentar endpoints en `app.py`
- **Estilos**: Referencia Materialize CSS + `style.css`

### Comandos Útiles

```bash
# Ver logs de aplicación
python run.py

# Linting y formato
npm run lint:fix
npm run format

# Debugging específico
npx playwright test --debug

# Estado de git
git status
git log --oneline -5
```

---

**📅 Última actualización**: Septiembre 16, 2025
**✨ Versión**: 1.0 - Auto-añadir implementado
**👨‍💻 Mantenedor**: neumaticopalmones
