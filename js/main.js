// js/main.js
import * as State from './state.js';
import * as API from './api.js';
import * as UI from './ui.js';
import { imprimirPresupuesto, exportarPresupuestoPDF, capturaYWhatsApp, generarTextoPresupuesto } from './export.js';
import { isValidNumber, isNotEmpty, isValidNIF, isValidPhone } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Estado local para filtros de historial
    let filtrosHist = { nombre: '', telefono: '', numero: '' };
    // Botón Volver en historial
    const btnVolver = document.getElementById('btnVolverPresupuestos');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            handleShowView('presupuestos-view');
        });
    }
    // --- Event Listeners ---

    // Navigation
    UI.DOMElements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = e.target.getAttribute('href').substring(1);
            handleShowView(viewId);
        });
    });

    // Buttons
    document.getElementById('btnAgregarMarca').addEventListener('click', handleAddMarca);
    document.getElementById('btnAgregarOtroTrabajo').addEventListener('click', handleAddTrabajo);
    document.getElementById('btnAgregarGrupo').addEventListener('click', handleAddGrupo);
    document.getElementById('btnGuardarPresupuesto').addEventListener('click', handleSavePresupuesto);
    document.getElementById('btnCancelarEdicion').addEventListener('click', handleResetPresupuestoForm);
    // Botón Ver historial
    document.getElementById('btnVerHistorial').addEventListener('click', () => {
        handleShowView('historial-view');
    });

    // Historial: buscar/limpiar
    const btnBuscarHist = document.getElementById('hist-buscar-btn');
    const btnLimpiarHist = document.getElementById('hist-limpiar-btn');
    const inpNom = document.getElementById('hist-buscar-nombre');
    const inpTel = document.getElementById('hist-buscar-telefono');
    const inpNum = document.getElementById('hist-buscar-numero');
    if (btnBuscarHist && btnLimpiarHist && inpNom && inpTel && inpNum) {
        btnBuscarHist.addEventListener('click', () => {
            filtrosHist = {
                nombre: inpNom.value.trim(),
                telefono: inpTel.value.trim(),
                numero: inpNum.value.trim(),
            };
            handleFetchPresupuestos(1);
        });
        btnLimpiarHist.addEventListener('click', () => {
            filtrosHist = { nombre: '', telefono: '', numero: '' };
            inpNom.value = '';
            inpTel.value = '';
            inpNum.value = '';
            M.updateTextFields();
            handleFetchPresupuestos(1);
        });
        // Enter en campos → buscar
        [inpNom, inpTel, inpNum].forEach(inp => inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnBuscarHist.click();
            }
        }));
    }
    // Botón Guardar como nuevo
    const btnGuardarComoNuevo = document.getElementById('btnGuardarComoNuevo');
    if (btnGuardarComoNuevo) {
        btnGuardarComoNuevo.addEventListener('click', () => {
            handleSavePresupuesto(true); // true = guardar como nuevo
        });
    }

    // Flujo de teclado para añadir varias marcas rápidamente
    const marcaInput = document.getElementById('presupuesto-marca-temp');
    const netoInput = document.getElementById('presupuesto-neto-temp');
    if (marcaInput && netoInput) {
        // Enter en Marca → ir a Neto
        marcaInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                netoInput.focus();
            }
        });
        // Tab o Enter en Neto → añadir y volver a Marca (si valores válidos)
        netoInput.addEventListener('keydown', (e) => {
            const key = e.key;
            const tryAdd = () => {
                const m = marcaInput.value?.trim();
                const n = netoInput.value;
                if (m && isValidNumber(n, { min: 0, allowNegative: false })) {
                    handleAddMarca();
                    marcaInput.focus();
                    return true;
                }
                return false;
            };
            if (key === 'Enter') {
                e.preventDefault();
                tryAdd();
            } else if (key === 'Tab' && !e.shiftKey) {
                // Solo interceptamos Tab hacia delante si podemos añadir
                const added = tryAdd();
                if (added) e.preventDefault();
            }
        });
    }

    // Botones de exportación / compartir
    const btnImprimir = document.getElementById('btnImprimirPresupuesto');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            imprimirPresupuesto();
        });
    }
    const btnDescargarPDF = document.getElementById('btnDescargarPDF');
    if (btnDescargarPDF) {
        btnDescargarPDF.addEventListener('click', async () => {
            await exportarPresupuestoPDF('presupuesto.pdf');
        });
    }
    const btnCapturaWA = document.getElementById('btnCapturaWhatsApp');
    if (btnCapturaWA) {
        btnCapturaWA.addEventListener('click', async () => {
            await capturaYWhatsApp();
        });
    }
    const btnCompartirWA = document.getElementById('btnCompartirWhatsApp');
    if (btnCompartirWA) {
        btnCompartirWA.addEventListener('click', () => {
            const texto = generarTextoPresupuesto();
            const telRaw = UI.DOMElements.presupuestoTelefonoCliente?.value || '';
            let tel = (telRaw || '').replace(/\D/g, '');
            if (!tel) {
                M.toast({ html: 'Introduce el teléfono del cliente', classes: 'red' });
                return;
            }
            if (tel.length === 9) tel = '34' + tel;
            const url = `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
            window.open(url, '_blank');
        });
    }

    // Eliminados listeners de inventario
    
    // Event Delegation for dynamic elements
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        // Historial Actions
        if (target.matches('.edit-presupuesto')) {
            handleLoadPresupuestoForEdit(target.dataset.id);
        }
        if (target.matches('.delete-presupuesto')) {
            handleDeletePresupuesto(target.dataset.id);
        }
    // Botón convertir a pedido eliminado (endpoint no existe)
    // Eliminadas acciones de inventario
        // Pagination
    if (target.closest('.page-link')) {
            const page = parseInt(target.closest('.page-link').dataset.page);
            if (!isNaN(page)) {
        handleFetchPresupuestos(page);
            }
        }
        // Temp items
        if (target.matches('.remove-temp-item')) {
            const { id, type } = target.dataset;
            if (type === 'neumatico') {
                State.removeTempNeumatico(id);
            } else if (type === 'trabajo') {
                State.removeTempTrabajo(id);
            }
            UI.renderTemporaryItems(State.getCurrentPresupuesto());
        }
        // Presupuesto items
        if (target.matches('.action-delete')) {
            const { groupId, elementId, tipo } = target.dataset;
            if (groupId && elementId && tipo) {
                State.removeElementFromGroup(groupId, elementId, tipo);
                UI.renderPresupuestoFinal(State.getCurrentPresupuesto());
            }
        }
        // Elegir una marca dentro de un grupo
        if (target.matches('.choose-marca')) {
            e.preventDefault();
            const { groupId, neumaticoId } = target.dataset;
            if (groupId && neumaticoId) {
                State.chooseMarcaForGroup(groupId, neumaticoId);
                UI.renderPresupuestoFinal(State.getCurrentPresupuesto());
                M.toast({ html: 'Marca seleccionada para el grupo.', classes: 'green' });
            }
        }
        // Elegir marca y limpiar grupos de la misma medida
        if (target.matches('.choose-marca-clean')) {
            e.preventDefault();
            const { groupId, neumaticoId } = target.dataset;
            if (groupId && neumaticoId) {
                State.chooseMarcaAndRemoveSameMeasure(groupId, neumaticoId);
                UI.renderPresupuestoFinal(State.getCurrentPresupuesto());
                M.toast({ html: 'Marca elegida y medidas duplicadas limpiadas.', classes: 'green' });
            }
        }
        // Vaciar temporales
        if (target.matches('#btnVaciarTemporales')) {
            e.preventDefault();
            State.clearTemporales();
            UI.renderTemporaryItems(State.getCurrentPresupuesto());
            M.toast({ html: 'Temporales vaciados.', classes: 'blue' });
        }
    });

    // Toggle mostrar info interna (solo en pantalla)
    document.body.addEventListener('change', (e) => {
        const target = e.target;
        if (target && target.id === 'toggleInterno') {
            const show = !!target.checked;
            document.querySelectorAll('.solo-interno').forEach(el => {
                el.style.display = show ? '' : 'none';
            });
            try { localStorage.setItem('mostrarInfoInterna', show ? '1' : '0'); } catch (_) {}
        }
    });

    // Other Listeners
    document.getElementById('toggleCompacto').addEventListener('change', (e) => {
        document.body.classList.toggle('compacto', e.target.checked);
    });


    // --- Handlers ---

    function handleShowView(viewId) {
        UI.showView(viewId);
        State.setCurrentView(viewId);
        if (viewId === 'historial-view') {
            handleFetchPresupuestos();
        }
    }

    function handleResetPresupuestoForm() {
        State.resetState();
        UI.resetPresupuestoForm();
        const btnGuardarComoNuevo = document.getElementById('btnGuardarComoNuevo');
        if (btnGuardarComoNuevo) btnGuardarComoNuevo.style.display = 'none';
    }

    async function handleFetchPresupuestos(page = 1) {
        try {
            const data = await API.fetchHistorial(page, filtrosHist);
            State.setHistorial(data.presupuestos);
            State.setPaginacion(data);
            UI.renderPresupuestosList(State.getHistorial());
            UI.renderPagination(State.getPaginacion());
            // Rellenar de nuevo los inputs con filtros actuales
            const inpNom = document.getElementById('hist-buscar-nombre');
            const inpTel = document.getElementById('hist-buscar-telefono');
            const inpNum = document.getElementById('hist-buscar-numero');
            if (inpNom && inpTel && inpNum) {
                inpNom.value = filtrosHist.nombre || '';
                inpTel.value = filtrosHist.telefono || '';
                inpNum.value = filtrosHist.numero || '';
                M.updateTextFields();
            }
        } catch (error) {
            const toastId = 'toast-error-' + Date.now();
            const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
            const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
            M.toast({
                html: `<span id='${toastId}' style='white-space:pre-line;'>Error: ${error.message || error}</span>${copyBtn}${closeBtn}`,
                classes: 'red',
                displayLength: Infinity
            });
        }
    }

    async function handleSavePresupuesto() {
        State.calculateTotalGeneral();
        const currentPresupuesto = State.getCurrentPresupuesto();
        const clienteData = {
            nombre: UI.DOMElements.presupuestoNombreCliente.value,
            telefono: UI.DOMElements.presupuestoTelefonoCliente.value,
            nif: UI.DOMElements.presupuestoNifCliente.value
        };

        // El backend genera el número, así que no lo envíes si es nuevo
        let fecha = UI.DOMElements.presupuestoFechaPresupuesto.value;
        if (!fecha) {
            const hoy = new Date();
            const yyyy = hoy.getFullYear();
            const mm = String(hoy.getMonth() + 1).padStart(2, '0');
            const dd = String(hoy.getDate()).padStart(2, '0');
            fecha = `${yyyy}-${mm}-${dd}`;
            if (UI.DOMElements.presupuestoFechaPresupuesto) {
                UI.DOMElements.presupuestoFechaPresupuesto.value = fecha;
            }
        }
        // Capturar borrador (parámetros del formulario + temporales)
        const draftParams = {
            medida: document.getElementById('presupuesto-medida')?.value || '',
            cantidad: document.getElementById('presupuesto-cantidad')?.value || '',
            ganancia: document.getElementById('presupuesto-ganancia')?.value || '',
            ecotasa: document.getElementById('presupuesto-ecotasa')?.value || '',
            iva: document.getElementById('presupuesto-iva')?.value || ''
        };

        const presupuestoData = {
            cliente: clienteData,
            fecha: fecha,
            vista_cliente: {
                grupos: currentPresupuesto.grupos,
                totalGeneral: currentPresupuesto.totalGeneral
            },
            vista_interna: {
                grupos: currentPresupuesto.grupos,
                totalGeneral: currentPresupuesto.totalGeneral,
                draft: {
                    params: draftParams,
                    tempNeumaticos: currentPresupuesto.tempNeumaticos,
                    tempOtrosTrabajos: currentPresupuesto.tempOtrosTrabajos
                }
            }
        };

        try {
            // Si se pasa true como argumento, forzar guardar como nuevo (POST)
            let guardarComoNuevo = false;
            if (arguments.length > 0 && arguments[0] === true) guardarComoNuevo = true;
            const idParaGuardar = guardarComoNuevo ? null : State.getCurrentEditPresupuestoId();
            const saved = await API.savePresupuesto(idParaGuardar, presupuestoData);
            // Mostrar el número generado si es nuevo
            if (saved && saved.numero) {
                if (UI.DOMElements.presupuestoNumeroPresupuesto) {
                    UI.DOMElements.presupuestoNumeroPresupuesto.value = saved.numero;
                }
                M.toast({html: `Presupuesto guardado con éxito. Nº: <b>${saved.numero}</b>`, classes: 'green'});
            } else {
                M.toast({html: 'Presupuesto guardado con éxito!', classes: 'green'});
            }
            handleResetPresupuestoForm();
            handleShowView('historial-view');
        } catch (error) {
            // Mostrar mensaje detallado del backend si existe
            let msg = error.message || 'Error desconocido al guardar presupuesto.';
            if (error.stack) {
                msg += `<br><small>${error.stack}</small>`;
            }
            // Botón copiar
            const toastId = 'toast-error-' + Date.now();
            const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
            const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
            M.toast({
                html: `<span id='${toastId}' style='white-space:pre-line;'>Error: ${msg}</span>${copyBtn}${closeBtn}`,
                classes: 'red',
                displayLength: Infinity
            });
        }
    }

    async function handleLoadPresupuestoForEdit(presupuestoId) {
        try {
            const presupuesto = await API.fetchPresupuestoById(presupuestoId);
            State.loadPresupuestoForEdit(presupuesto);
            const loadedState = State.getCurrentPresupuesto();
            // Usar el objeto crudo del API para rellenar parámetros desde draft
            UI.fillPresupuestoForm(presupuesto);
            UI.renderPresupuestoFinal(loadedState);
            UI.renderTemporaryItems(loadedState);
            handleShowView('presupuestos-view');
            // Mostrar botón Guardar como nuevo
            const btnGuardarComoNuevo = document.getElementById('btnGuardarComoNuevo');
            if (btnGuardarComoNuevo) btnGuardarComoNuevo.style.display = 'inline-block';
        } catch (error) {
            const toastId = 'toast-error-' + Date.now();
            const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
            const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
            M.toast({
                html: `<span id='${toastId}' style='white-space:pre-line;'>Error: ${error.message || error}</span>${copyBtn}${closeBtn}`,
                classes: 'red',
                displayLength: Infinity
            });
        }
    }

    async function handleDeletePresupuesto(presupuestoId) {
        if (confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
            try {
                await API.deletePresupuestoById(presupuestoId);
                M.toast({html: 'Presupuesto eliminado con éxito!', classes: 'green'});
                handleFetchPresupuestos();
            } catch (error) {
                const toastId = 'toast-error-' + Date.now();
                const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
                const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
                M.toast({
                    html: `<span id='${toastId}' style='white-space:pre-line;'>Error: ${error.message || error}</span>${copyBtn}${closeBtn}`,
                    classes: 'red',
                    displayLength: Infinity
                });
            }
        }
    }

    // función convertir a pedido eliminada

    // Eliminadas funciones de inventario
    
    function handleAddMarca() {
        const medida = document.getElementById('presupuesto-medida').value;
        const cantidad = document.getElementById('presupuesto-cantidad').value;
        const ganancia = document.getElementById('presupuesto-ganancia').value;
        const ecotasa = document.getElementById('presupuesto-ecotasa').value;
        const iva = document.getElementById('presupuesto-iva').value;
        const marca = document.getElementById('presupuesto-marca-temp').value;
        const neto = document.getElementById('presupuesto-neto-temp').value;

        let errores = [];
        if (!isNotEmpty(medida)) errores.push('La medida es obligatoria.');
        if (!isValidNumber(cantidad, { min: 1, allowNegative: false })) errores.push('Cantidad inválida.');
        if (!isNotEmpty(marca)) errores.push('La marca es obligatoria.');
        if (!isValidNumber(neto, { min: 0, allowNegative: false })) errores.push('Neto inválido.');
        if (!isValidNumber(ganancia, { min: 0, allowNegative: false })) errores.push('Ganancia inválida.');
        if (!isValidNumber(ecotasa, { min: 0, allowNegative: false })) errores.push('Ecotasa inválida.');
        if (!isValidNumber(iva, { min: 0, max: 100, allowNegative: false })) errores.push('IVA inválido.');

        if (errores.length > 0) {
            UI.showFormErrors('producto-form', errores);
            return;
        }
        UI.clearFormErrors('producto-form');

        const nCantidad = parseInt(cantidad);
        const nGanancia = parseFloat(ganancia);
        const nEcotasa = parseFloat(ecotasa);
        const nIva = parseFloat(iva);
        const nNeto = parseFloat(neto);
    // Fórmula solicitada: (NETO + ECOTASA + IVA) y DESPUÉS se suma GANANCIA
    // Por unidad: PU = round((neto + ecotasa) * (1 + IVA) + ganancia)
    // Total: round( ((neto + ecotasa) * (1 + IVA)) * cantidad + ganancia * cantidad )
    const baseSinGanancia = (nNeto + nEcotasa);
    const puSinGanancia = baseSinGanancia * (1 + (nIva / 100));
    const precioUnidad = Math.round(puSinGanancia + nGanancia);
    const total = Math.round((puSinGanancia * nCantidad) + (nGanancia * nCantidad));
        const neumatico = {
            id: `neumatico-${Date.now()}`,
            medida,
            cantidad: nCantidad,
            ganancia: nGanancia,
            ecotasa: nEcotasa,
            iva: nIva,
            nombre: marca,
            neto: nNeto,
            precioUnidad,
            total
        };
        State.addTempNeumatico(neumatico);
        UI.renderTemporaryItems(State.getCurrentPresupuesto());
        document.getElementById('presupuesto-marca-temp').value = '';
        document.getElementById('presupuesto-neto-temp').value = '';
        M.updateTextFields();
    // Volver a enfocar Marca para facilitar múltiples entradas
    const marcaRef = document.getElementById('presupuesto-marca-temp');
    if (marcaRef) marcaRef.focus();
    }

    function handleAddTrabajo() {
        const concepto = document.getElementById('presupuesto-otro-concepto').value;
        const precioFinal = document.getElementById('presupuesto-otro-precio').value;
        let errores = [];
        if (!isNotEmpty(concepto)) errores.push('El concepto es obligatorio.');
        if (!isValidNumber(precioFinal, { min: 0, allowNegative: false })) errores.push('Precio inválido.');
        if (errores.length > 0) {
            UI.showFormErrors('producto-form', errores);
            return;
        }
        UI.clearFormErrors('producto-form');
        const nPrecioFinal = Math.round(parseFloat(precioFinal));
        const trabajo = {
            id: `trabajo-${Date.now()}`,
            concepto,
            cantidad: 1,
            precioUnidad: nPrecioFinal,
            total: nPrecioFinal
        };
        State.addTempTrabajo(trabajo);
        UI.renderTemporaryItems(State.getCurrentPresupuesto());
        document.getElementById('presupuesto-otro-concepto').value = '';
        document.getElementById('presupuesto-otro-precio').value = '';
        M.updateTextFields();
    }
    
    function handleAddGrupo() {
        const added = State.addGroupToPresupuesto();
        if (added) {
            UI.renderTemporaryItems(State.getCurrentPresupuesto());
            State.calculateTotalGeneral();
            UI.renderPresupuestoFinal(State.getCurrentPresupuesto());
        }
    }

    // --- Initial Load ---
    function init() {
        handleShowView('presupuestos-view'); 
        M.AutoInit();
    }

    init();
});
