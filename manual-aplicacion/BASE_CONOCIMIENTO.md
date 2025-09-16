# 📚 BASE DE CONOCIMIENTO - APLICACIÓN TALLER PRESUPUESTO

## 🎯 CÓMO USAR ESTA BASE DE CONOCIMIENTO

Esta base de conocimiento está diseñada para facilitar el **mantenimiento futuro** de la aplicación. Úsala así:

### 🔍 Para Resolver un Problema:

1. **GUIA_RESOLUCION_PROBLEMAS.md** → Diagnóstico y soluciones rápidas
2. **MAPEO_FUNCIONES.md** → Encontrar qué archivo/función modificar
3. **DOCUMENTACION_TECNICA.md** → Entender arquitectura y contexto

### 🚀 Para Añadir Nueva Funcionalidad:

1. **DOCUMENTACION_TECNICA.md** → Entender estructura actual
2. **MAPEO_FUNCIONES.md** → Ver dónde encaja tu nueva función
3. **GUIA_RESOLUCION_PROBLEMAS.md** → Crear tests y verificación

### 🧪 Para Testing:

- **tests/playwright/** → Tests automáticos existentes
- **DOCUMENTACION_TECNICA.md#testing** → Cómo ejecutar y crear tests

---

## 📋 DOCUMENTOS INCLUIDOS

| Documento                        | Propósito                                         | Cuándo Usar                 |
| -------------------------------- | ------------------------------------------------- | --------------------------- |
| **DOCUMENTACION_TECNICA.md**     | Arquitectura completa, problemas resueltos, setup | Entender sistema completo   |
| **MAPEO_FUNCIONES.md**           | Todas las funciones por archivo, flujos de datos  | Saber qué archivo modificar |
| **GUIA_RESOLUCION_PROBLEMAS.md** | Debugging, diagnóstico, soluciones                | Resolver bugs específicos   |
| **README.md**                    | Información general del proyecto                  | Primera lectura             |

---

## 🎯 ESCENARIOS COMUNES

### ❓ "No funciona [X funcionalidad]"

1. **GUIA_RESOLUCION_PROBLEMAS.md** → Buscar síntomas
2. Aplicar diagnóstico paso a paso
3. Si no está documentado → Seguir checklist general

### ❓ "¿Dónde está la función que hace [X]?"

1. **MAPEO_FUNCIONES.md** → Buscar por nombre o propósito
2. **DOCUMENTACION_TECNICA.md** → Ver contexto completo

### ❓ "Quiero añadir [nueva función]"

1. **DOCUMENTACION_TECNICA.md** → Entender arquitectura
2. **MAPEO_FUNCIONES.md** → Ver patrón de funciones similares
3. Crear → Testear → Documentar en estos archivos

### ❓ "¿Cómo hacer testing?"

1. **DOCUMENTACION_TECNICA.md#testing** → Setup inicial
2. Ver `tests/playwright/` para ejemplos
3. **GUIA_RESOLUCION_PROBLEMAS.md#testing** → Verificación

---

## 🔧 CONFIGURACIÓN INICIAL RÁPIDA

### Para Desarrollador Nuevo:

```bash
# 1. Leer documentación (5 min)
# - README.md (overview)
# - DOCUMENTACION_TECNICA.md (arquitectura)

# 2. Setup entorno (10 min)
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
npm install
npx playwright install

# 3. Ejecutar aplicación (2 min)
python run.py
# → Ir a http://localhost:5000

# 4. Ejecutar tests (3 min)
npm test
```

### Para Debugging Rápido:

```bash
# 1. Reproducir problema
# 2. F12 → Console en navegador
# 3. Buscar error en GUIA_RESOLUCION_PROBLEMAS.md
# 4. Aplicar solución
# 5. Verificar con test
```

---

## 🗂️ ESTRUCTURA DE ARCHIVOS CON DOCUMENTACIÓN

```
📁 APLICACIÓN/
├── 📄 README.md                           # ← Info general
├── 📄 DOCUMENTACION_TECNICA.md           # ← Arquitectura completa
├── 📄 MAPEO_FUNCIONES.md                 # ← Funciones por archivo
├── 📄 GUIA_RESOLUCION_PROBLEMAS.md       # ← Debugging y soluciones
├── 📄 ROADMAP.md                         # ← Planes futuros
├── 📄 RESTORE_POINTS.md                  # ← Backup points
│
├── 📁 js/                                # ← Frontend
│   ├── main.js                          # ← Lógica principal + auto-añadir
│   ├── api.js                           # ← Comunicación backend
│   ├── ui.js                            # ← Interfaz usuario
│   └── ...
│
├── 📁 tests/                            # ← Testing
│   └── playwright/                      # ← Tests automáticos
│       ├── flujo-final-correcto.spec.js # ← Test auto-añadir
│       └── ...
│
├── 📄 app.py                            # ← Backend Flask
├── 📄 index.html                        # ← UI principal
├── 📄 style.css                         # ← Estilos
└── ...
```

---

## ⚡ COMANDOS RÁPIDOS DE REFERENCIA

### 🔧 Desarrollo

```bash
# Activar entorno
.\venv\Scripts\Activate.ps1

# Ejecutar app
python run.py

# Instalar nuevas dependencias
pip install [paquete]
npm install [paquete]
```

### 🧪 Testing

```bash
# Todos los tests
npm test

# Test específico con debug
npx playwright test [archivo] --headed --debug

# Tests con reporte visual
npm run test:ui
```

### 🔍 Debugging

```bash
# Ver logs backend
python run.py  # En terminal

# Ver logs frontend
# F12 → Console en navegador

# Estado de git
git status
git log --oneline -5
```

### 💾 Backup

```bash
# Crear punto de restore
git add -A
git commit -m "CHECKPOINT: [descripción]"

# Ver puntos anteriores
git log --oneline -10
```

---

## 🎯 ACTUALIZACIÓN DE DOCUMENTACIÓN

### Cuando Añadas Nueva Funcionalidad:

1. **Código** → Implementar + Test
2. **MAPEO_FUNCIONES.md** → Añadir función nueva
3. **DOCUMENTACION_TECNICA.md** → Actualizar si es arquitectural
4. **GUIA_RESOLUCION_PROBLEMAS.md** → Si es propenso a bugs

### Cuando Resuelvas un Bug:

1. **GUIA_RESOLUCION_PROBLEMAS.md** → Añadir problema + solución
2. **DOCUMENTACION_TECNICA.md** → Actualizar sección "Problemas Resueltos"

### Plantilla Para Nuevos Problemas:

```markdown
### ❌ PROBLEMA: [TÍTULO]

**📅 Fecha**: [FECHA]
**🎯 Síntoma**: [Descripción del problema]
**🔍 Causa Raíz**: [Qué lo causaba]
**✅ Solución**: [Cómo se arregló]
**📝 Archivos Modificados**: [Lista de archivos]
**🧪 Verificación**: [Cómo probar que funciona]
```

---

## 🚀 PLAN DE MEJORA CONTINUA

### Cada Semana:

- [ ] Revisar si hay nuevos bugs documentados
- [ ] Actualizar tests con nuevos casos
- [ ] Mejorar documentación basado en uso

### Cada Mes:

- [ ] Review completo de toda la documentación
- [ ] Optimizar tests (añadir, quitar, mejorar)
- [ ] Backup completo de código + documentación

### Cada Proyecto:

- [ ] Documentar todas las funciones nuevas
- [ ] Crear tests para funcionalidad crítica
- [ ] Actualizar ROADMAP.md

---

**🎯 OBJETIVO**: Que cualquier desarrollador pueda mantener esta aplicación con facilidad usando esta base de conocimiento

**📅 Creado**: Septiembre 16, 2025
**✨ Versión**: 1.0 - Base de conocimiento completa
**🔄 Última actualización**: Septiembre 16, 2025
**👨‍💻 Mantenedor**: neumaticopalmones

---

## 📞 AYUDA RÁPIDA

### 🔴 En Caso de Emergencia:

1. **BACKUP**: `git add -A && git commit -m "EMERGENCY BACKUP"`
2. **REVERTIR**: `git checkout [commit-anterior-funcional]`
3. **VERIFICAR**: Probar funcionalidad básica
4. **DOCUMENTAR**: Añadir problema a GUIA_RESOLUCION_PROBLEMAS.md

### ✅ Todo Funciona:

1. **COMMIT**: `git add -A && git commit -m "Mejora: [descripción]"`
2. **TEST**: `npm test`
3. **ACTUALIZAR DOCS**: Si añadiste funcionalidad nueva

### 🤔 No Sabes Cómo Hacer Algo:

1. **BUSCAR**: En los 3 archivos de documentación
2. **PROBAR**: Con tests existentes como ejemplo
3. **PREGUNTAR**: Stack Overflow, documentación oficial
4. **DOCUMENTAR**: La solución que encuentres
