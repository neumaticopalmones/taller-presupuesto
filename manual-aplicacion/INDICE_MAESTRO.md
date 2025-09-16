# 🗄️ ÍNDICE MAESTRO - BASE DE CONOCIMIENTO

> 📍 **UBICACIÓN**: `manual-aplicacion/` - Toda la documentación técnica está aquí

## 📍 NAVEGACIÓN RÁPIDA

### 🚀 **EMPEZAR AQUÍ** (Nuevos desarrolladores)

1. **../README.md** → Información general del proyecto
2. **README.md** → Navegación del manual (5 min de lectura)
3. **BASE_CONOCIMIENTO.md** → Esta guía de uso
4. **DOCUMENTACION_TECNICA.md** → Arquitectura completa (15 min)
5. **INSTRUCCIONES_APLICACION.md** → Cómo usar la aplicación

### 🔄 **GESTIÓN DEL PROYECTO**

- **BACKLOG.md** → Tareas pendientes por implementar
- **ROADMAP.md** → Visión y plan de desarrollo futuro
- **RESTORE_POINTS.md** → Puntos de restauración y versiones estables
- **HOJA_RAPIDA.md** → Comandos y shortcuts más usados

### 🔍 **BUSCAR POR PROBLEMA**

- **GUIA_RESOLUCION_PROBLEMAS.md** → Diagnóstico y soluciones paso a paso

### 🛠️ **BUSCAR POR FUNCIÓN**

- **MAPEO_FUNCIONES.md** → Todas las funciones organizadas por archivo

### 🛠️ **HERRAMIENTAS Y EXTENSIONES**

- **GUIA_EXTENSIONES_VSCODE.md** → VS Code + GitHub Copilot setup
- **TUTORIAL_RECREAR_CON_IA.md** → Recrear app completa con IA
- **SNIPPETS_PERSONALIZADOS.md** → Snippets para desarrollo rápido

---

## 🎯 BÚSQUEDA RÁPIDA POR CATEGORÍA

### 🔧 **DESARROLLO**

| Necesidad             | Documento                | Sección           |
| --------------------- | ------------------------ | ----------------- |
| Setup inicial         | DOCUMENTACION_TECNICA.md | #desarrollo       |
| Añadir función        | MAPEO_FUNCIONES.md       | Todo el documento |
| Entender arquitectura | DOCUMENTACION_TECNICA.md | #arquitectura     |

### 🐛 **RESOLUCIÓN DE BUGS**

| Tipo de Bug             | Documento                    | Sección                   |
| ----------------------- | ---------------------------- | ------------------------- |
| Auto-añadir no funciona | GUIA_RESOLUCION_PROBLEMAS.md | #auto-añadir-no-funciona  |
| Sugerencias no aparecen | GUIA_RESOLUCION_PROBLEMAS.md | #sugerencias-no-aparecen  |
| Interfaz rota           | GUIA_RESOLUCION_PROBLEMAS.md | #interfaz-rota            |
| APIs fallan             | GUIA_RESOLUCION_PROBLEMAS.md | #herramientas-diagnostico |

### 🧪 **TESTING**

| Necesidad            | Documento                    | Sección               |
| -------------------- | ---------------------------- | --------------------- |
| Ejecutar tests       | DOCUMENTACION_TECNICA.md     | #testing              |
| Crear nuevo test     | GUIA_RESOLUCION_PROBLEMAS.md | #testing-verificacion |
| Debug con Playwright | DOCUMENTACION_TECNICA.md     | #testing              |

### 📊 **FUNCIONES ESPECÍFICAS**

| Función              | Archivo    | Documento Referencia            |
| -------------------- | ---------- | ------------------------------- |
| Auto-añadir marcas   | js/main.js | MAPEO_FUNCIONES.md #auto-añadir |
| Gestión presupuestos | js/main.js | MAPEO_FUNCIONES.md #gestión     |
| API comunicación     | js/api.js  | MAPEO_FUNCIONES.md #api         |
| Interfaz usuario     | js/ui.js   | MAPEO_FUNCIONES.md #ui          |

---

## 🔍 BÚSQUEDA POR PALABRAS CLAVE

### **Auto-añadir**

- MAPEO_FUNCIONES.md → #funciones-auto-añadir
- GUIA_RESOLUCION_PROBLEMAS.md → #auto-añadir-no-funciona
- DOCUMENTACION_TECNICA.md → #problemas (Auto-añadir resuelto)

### **Sugerencias**

- MAPEO_FUNCIONES.md → #funciones-gestión (handleLoadSugerencias)
- GUIA_RESOLUCION_PROBLEMAS.md → #sugerencias-no-aparecen
- DOCUMENTACION_TECNICA.md → #funcionalidades (Sistema de Sugerencias)

### **API/Backend**

- MAPEO_FUNCIONES.md → #apis-endpoints
- app.py → Código backend
- DOCUMENTACION_TECNICA.md → #arquitectura

### **Testing/Playwright**

- DOCUMENTACION_TECNICA.md → #testing
- GUIA_RESOLUCION_PROBLEMAS.md → #testing-verificacion
- tests/playwright/ → Código de tests

### **CSS/Interfaz**

- GUIA_RESOLUCION_PROBLEMAS.md → #interfaz-rota
- style.css → Estilos principales
- DOCUMENTACION_TECNICA.md → #problemas (Íconos solapando)

---

## 📋 CHECKLIST DE DOCUMENTOS

### ✅ **Documentos Principales**

- [x] **BASE_CONOCIMIENTO.md** → Este archivo (índice maestro)
- [x] **DOCUMENTACION_TECNICA.md** → Arquitectura, setup, problemas resueltos
- [x] **MAPEO_FUNCIONES.md** → Todas las funciones por archivo
- [x] **GUIA_RESOLUCION_PROBLEMAS.md** → Debugging y soluciones
- [x] **GUIA_EXTENSIONES_VSCODE.md** → Setup VS Code + herramientas IA
- [x] **TUTORIAL_RECREAR_CON_IA.md** → Tutorial completo para recrear app
- [x] **SNIPPETS_PERSONALIZADOS.md** → Snippets para desarrollo rápido
- [x] **README.md** → Navegación principal del manual

### ✅ **Documentos de Gestión**

- [x] **INSTRUCCIONES_APLICACION.md** → Manual de uso de la aplicación
- [x] **HOJA_RAPIDA.md** → Referencia rápida de comandos
- [x] **BACKLOG.md** → Tareas pendientes por implementar
- [x] **ROADMAP.md** → Plan de desarrollo futuro
- [x] **RESTORE_POINTS.md** → Puntos de restauración

### ✅ **Código y Tests**

- [x] **tests/playwright/** → Tests automáticos
- [x] **js/main.js** → Lógica principal documentada
- [x] **app.py** → Backend documentado

---

## 🎯 FLUJO DE USO RECOMENDADO

### Para **Resolver un Bug**:

```
1. GUIA_RESOLUCION_PROBLEMAS.md (buscar síntomas)
   ↓
2. Aplicar diagnóstico
   ↓
3. Si necesitas entender función → MAPEO_FUNCIONES.md
   ↓
4. Si necesitas contexto → DOCUMENTACION_TECNICA.md
   ↓
5. Verificar con tests
```

### Para **Añadir Funcionalidad**:

```
1. DOCUMENTACION_TECNICA.md (entender arquitectura)
   ↓
2. MAPEO_FUNCIONES.md (ver patrón similar)
   ↓
3. Implementar código
   ↓
4. Crear/actualizar tests
   ↓
5. Actualizar documentación
```

### Para **Mantenimiento General**:

```
1. README.md (overview rápido)
   ↓
2. DOCUMENTACION_TECNICA.md (estado actual)
   ↓
3. ROADMAP.md (qué hacer después)
   ↓
4. npm test (verificar todo funciona)
```

---

## 🔧 COMANDOS DE NAVEGACIÓN RÁPIDA

### En **VS Code**:

```
Ctrl+P → Escribir nombre de archivo
Ctrl+F → Buscar dentro del archivo abierto
Ctrl+Shift+F → Buscar en todo el proyecto
```

### **Archivos más Usados**:

```
Ctrl+P → "base_conocimiento" → Este índice
Ctrl+P → "guia_resolucion" → Para bugs
Ctrl+P → "mapeo_funciones" → Para encontrar funciones
Ctrl+P → "documentacion_tecnica" → Para arquitectura
```

---

## 🚀 ACTUALIZACIÓN DE ESTE ÍNDICE

### Cuando Añadas Nuevo Documento:

1. Añadir a "Checklist de Documentos"
2. Añadir a "Navegación Rápida" si es principal
3. Añadir a "Búsqueda por Categoría" si corresponde

### Cuando Modifiques Función Importante:

1. Verificar que esté en MAPEO_FUNCIONES.md
2. Si es problemática → Añadir a GUIA_RESOLUCION_PROBLEMAS.md
3. Actualizar este índice si cambia la navegación

---

**🎯 PROPÓSITO**: Ser el punto de entrada único a toda la documentación de la aplicación

**📅 Creado**: Septiembre 16, 2025
**📝 Documentos incluidos**: 14 archivos completos (8 principales + 5 gestión + código)
**🔄 Última actualización**: Septiembre 16, 2025
