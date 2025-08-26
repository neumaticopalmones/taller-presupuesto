// Objeto para almacenar el estado centralizado de la aplicación
let state = {
    // Vista actual (ej: 'presupuestos-view', 'inventario-view')
    currentView: 'presupuestos-view',
    
    // Presupuesto que se está creando o editando
    currentPresupuesto: {
        cliente: {},
        grupos: [],
        totalGeneral: 0,
        // Almacenamiento temporal para elementos antes de agruparlos
    tempNeumaticos: [],
    tempOtrosTrabajos: []
    },
    currentEditPresupuestoId: null,

    // Inventario
    inventario: [],
    currentEditInventarioItem: null,

    // Historial y Paginación
    historial: [],
    paginacion: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false
    }
};

// --- Inicialización y Reseteo ---

/**
 * Inicializa o resetea el objeto del presupuesto actual a su estado por defecto.
 */
function initCurrentPresupuesto() {
    state.currentPresupuesto = {
        id: null,
        cliente: { nombre: '', telefono: '', nif: '' },
        numero: '',
        fecha: '',
        grupos: [],
        totalGeneral: 0,
    tempNeumaticos: [],
    tempOtrosTrabajos: []
    };
    state.currentEditPresupuestoId = null;
}

/**
 * Resetea todo el estado de la aplicación a sus valores iniciales.
 */
export function resetState() {
    initCurrentPresupuesto();
    state.currentView = 'presupuestos-view';
    state.inventario = [];
    state.currentEditInventarioItem = null;
    state.historial = [];
    state.paginacion = { currentPage: 1, totalPages: 1, totalItems: 0, hasNext: false, hasPrev: false };
}


// --- Getters (Selectores) ---

export function getState() { return { ...state }; }
export function getCurrentView() { return state.currentView; }
export function getCurrentPresupuesto() { return state.currentPresupuesto; }
export function getCurrentEditPresupuestoId() { return state.currentEditPresupuestoId; }
export function getInventario() { return state.inventario; }
export function getCurrentEditInventarioItem() { return state.currentEditInventarioItem; }
export function getHistorial() { return state.historial; }
export function getPaginacion() { return state.paginacion; }


// --- Setters (Mutaciones) ---

export function setCurrentView(viewId) {
    state.currentView = viewId;
}

export function setPaginacion(data) {
    state.paginacion = {
    current_page: data.current_page,
    pages: data.pages,
    total: data.total,
    has_next: data.has_next,
    has_prev: data.has_prev
    };
}

export function setHistorial(presupuestos) {
    state.historial = presupuestos;
}

export function setInventario(items) {
    state.inventario = items;
}

// --- Utilidades de temporales ---
export function clearTemporales() {
    state.currentPresupuesto.tempNeumaticos = [];
    state.currentPresupuesto.tempOtrosTrabajos = [];
}

/**
 * Carga los datos de un presupuesto existente en el estado para su edición.
 * @param {object} presupuesto - El objeto completo del presupuesto a editar.
 */
export function loadPresupuestoForEdit(presupuesto) {
    state.currentPresupuesto = {
        id: presupuesto.id,
        cliente: presupuesto.cliente || { nombre: '', telefono: '', nif: '' },
        numero: presupuesto.numero || '',
        fecha: presupuesto.fecha || '',
        // Aseguramos que los grupos y totales vienen de la vista_cliente
        grupos: presupuesto.vista_cliente?.grupos || [],
        totalGeneral: presupuesto.vista_cliente?.totalGeneral || 0,
    tempNeumaticos: presupuesto.vista_interna?.draft?.tempNeumaticos || [],
    tempOtrosTrabajos: presupuesto.vista_interna?.draft?.tempOtrosTrabajos || []
    };
    state.currentEditPresupuestoId = presupuesto.id;
}

/**
 * Carga un item de inventario en el estado para su edición.
 * @param {object} item - El item del inventario a editar.
 */
export function loadInventarioItemForEdit(item) {
    state.currentEditInventarioItem = item;
}

export function resetInventarioEdit() {
    state.currentEditInventarioItem = null;
}


// --- Lógica de Negocio sobre el Estado del Presupuesto ---

/**
 * Añade un neumático a la lista temporal del grupo actual.
 * @param {object} neumatico - El objeto del neumático a añadir.
 */
export function addTempNeumatico(neumatico) {
    state.currentPresupuesto.tempNeumaticos.push(neumatico);
}

/**
 * Elimina un neumático de la lista temporal.
 * @param {string} id - El ID del neumático a eliminar.
 */
export function removeTempNeumatico(id) {
    state.currentPresupuesto.tempNeumaticos = state.currentPresupuesto.tempNeumaticos.filter(n => n.id !== id);
}

/**
 * Añade un trabajo a la lista temporal del grupo actual.
 * @param {object} trabajo - El objeto del trabajo a añadir.
 */
export function addTempTrabajo(trabajo) {
    state.currentPresupuesto.tempOtrosTrabajos.push(trabajo);
}

/**
 * Elimina un trabajo de la lista temporal.
 * @param {string} id - El ID del trabajo a eliminar.
 */
export function removeTempTrabajo(id) {
    state.currentPresupuesto.tempOtrosTrabajos = state.currentPresupuesto.tempOtrosTrabajos.filter(t => t.id !== id);
}

/**
 * Agrega los items temporales como un nuevo grupo al presupuesto actual
 * y limpia las listas temporales.
 */
export function addGroupToPresupuesto() {
    const neumaticos = state.currentPresupuesto.tempNeumaticos;
    const otrosTrabajos = state.currentPresupuesto.tempOtrosTrabajos;

    if (neumaticos.length === 0 && otrosTrabajos.length === 0) {
        return false; // No añadir grupo vacío
    }

    // Clonar para aislar el grupo de futuras modificaciones en las listas temporales
    const neumaticosSnapshot = (neumaticos || []).map(n => ({ ...n }));
    const otrosTrabajosSnapshot = (otrosTrabajos || []).map(t => ({ ...t }));

    let totalGrupo = 0;
    neumaticosSnapshot.forEach(n => totalGrupo += n.total);
    otrosTrabajosSnapshot.forEach(t => totalGrupo += t.total);
    totalGrupo = Math.round(totalGrupo);

    const n0 = neumaticosSnapshot[0] || {};
    state.currentPresupuesto.grupos.push({
        id: `grupo-${Date.now()}`,
        neumaticos: neumaticosSnapshot,
        otrosTrabajos: otrosTrabajosSnapshot,
        totalGrupo,
        // Snapshot de parámetros comunes del grupo
        medida: n0.medida,
        cantidad: n0.cantidad,
        ganancia: n0.ganancia,
        ecotasa: n0.ecotasa,
        iva: n0.iva
    });

    // Mantener temporales (según petición del usuario)
    return true;
}

/**
 * Elimina un elemento (neumático o trabajo) de un grupo específico en el presupuesto.
 * @param {string} grupoId 
 * @param {string} elementoId 
 * @param {string} tipo 'neumatico' o 'trabajo'
 */
export function removeElementFromGroup(grupoId, elementoId, tipo) {
    const grupo = state.currentPresupuesto.grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    if (tipo === 'neumatico') {
        grupo.neumaticos = grupo.neumaticos.filter(n => n.id !== elementoId);
    } else if (tipo === 'trabajo') {
        grupo.otrosTrabajos = grupo.otrosTrabajos.filter(t => t.id !== elementoId);
    }

    // Si el grupo queda vacío, eliminarlo
    if (grupo.neumaticos.length === 0 && grupo.otrosTrabajos.length === 0) {
        state.currentPresupuesto.grupos = state.currentPresupuesto.grupos.filter(g => g.id !== grupoId);
    } else {
        // Recalcular total del grupo
    let totalGrupo = 0;
    grupo.neumaticos.forEach(n => totalGrupo += n.total);
    grupo.otrosTrabajos.forEach(t => totalGrupo += t.total);
    grupo.totalGrupo = Math.round(totalGrupo);
    }
    
    // Recalcular total general
    calculateTotalGeneral();
}

/**
 * Elige una marca (neumático) dentro de un grupo: deja solo ese neumático y recalcula totales.
 * @param {string} grupoId
 * @param {string} neumaticoId
 */
export function chooseMarcaForGroup(grupoId, neumaticoId) {
    const grupo = state.currentPresupuesto.grupos.find(g => g.id === grupoId);
    if (!grupo) return;
    if (!Array.isArray(grupo.neumaticos)) return;
    const elegido = grupo.neumaticos.find(n => n.id === neumaticoId);
    if (!elegido) return;
    // Dejar solo ese neumático
    grupo.neumaticos = [elegido];
    // Recalcular total del grupo
    let totalGrupo = 0;
    totalGrupo += (elegido.total || 0);
    (grupo.otrosTrabajos || []).forEach(t => totalGrupo += (t.total || 0));
    grupo.totalGrupo = Math.round(totalGrupo);
    // Mantener snapshot de parámetros desde el neumático elegido
    grupo.medida = elegido.medida;
    grupo.cantidad = elegido.cantidad;
    grupo.ganancia = elegido.ganancia;
    grupo.ecotasa = elegido.ecotasa;
    grupo.iva = elegido.iva;
    // Recalcular total general
    calculateTotalGeneral();
}

/**
 * Elige una marca y elimina otros grupos con la misma medida (deja solo la marca elegida para esa medida).
 * @param {string} grupoId
 * @param {string} neumaticoId
 */
export function chooseMarcaAndRemoveSameMeasure(grupoId, neumaticoId) {
    const grupo = state.currentPresupuesto.grupos.find(g => g.id === grupoId);
    if (!grupo) return;
    const elegido = (grupo.neumaticos || []).find(n => n.id === neumaticoId);
    if (!elegido) return;
    const medidaElegida = elegido.medida || grupo.medida;
    // Primero elegir la marca en el grupo actual
    chooseMarcaForGroup(grupoId, neumaticoId);
    // Eliminar otros grupos con la misma medida
    state.currentPresupuesto.grupos = state.currentPresupuesto.grupos.filter(g => {
        const medidaGrupo = g.medida || (g.neumaticos && g.neumaticos[0] && g.neumaticos[0].medida) || null;
        if (!medidaElegida || !medidaGrupo) return true; // no comparable, dejar
        if (g.id === grupoId) return true; // mantener el grupo elegido
        return medidaGrupo !== medidaElegida; // eliminar si coincide
    });
    // Recalcular total general
    calculateTotalGeneral();
}

/**
 * Calcula el total general del presupuesto y lo actualiza en el estado.
 */
export function calculateTotalGeneral() {
    let totalGeneral = 0;
    state.currentPresupuesto.grupos.forEach(grupo => {
        totalGeneral += grupo.totalGrupo;
    });
    state.currentPresupuesto.totalGeneral = Math.round(totalGeneral);
}

// Inicializar el estado la primera vez que se carga el módulo
initCurrentPresupuesto();
