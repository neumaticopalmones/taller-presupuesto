// --- Feedback visual de errores de formulario ---
export function showFormErrors(formId, errores) {
  const form = document.getElementById(formId);
  if (!form) return;
  let errorDiv = form.querySelector(".form-errors");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "form-errors";
    errorDiv.setAttribute("role", "alert");
    errorDiv.setAttribute("aria-live", "assertive");
    errorDiv.style.color = "red";
    errorDiv.style.marginBottom = "8px";
    form.prepend(errorDiv);
  }
  errorDiv.innerHTML = errores.map((e) => `<span>${sanitizeHTML(e)}</span>`).join("<br>");
  errorDiv.style.display = "block";
}

export function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const errorDiv = form.querySelector(".form-errors");
  if (errorDiv) {
    errorDiv.innerHTML = "";
    errorDiv.style.display = "none";
  }
}

// --- Sanitización básica para innerHTML ---
export function sanitizeHTML(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
import { gruposPorMarca } from "./utils.js";
import * as State from "./state.js";
// js/ui.js

// --- DOM Elements ---
export const DOMElements = {
  navLinks: document.querySelectorAll(".nav-link"),
  appSections: document.querySelectorAll(".app-section"),
  clienteForm: document.getElementById("cliente-form"),
  productoForm: document.getElementById("producto-form"),
  presupuestoNombreCliente: document.getElementById("presupuesto-nombreCliente"),
  presupuestoTelefonoCliente: document.getElementById("presupuesto-telefonoCliente"),
  presupuestoNifCliente: document.getElementById("presupuesto-nifCliente"),
  presupuestoNumeroPresupuesto: document.getElementById("presupuesto-numeroPresupuesto"),
  presupuestoFechaPresupuesto: document.getElementById("presupuesto-fechaPresupuesto"),
  presupuestoDistribuidor: document.getElementById("presupuesto-distribuidor"),
  presupuestoDescripcion: document.getElementById("presupuesto-descripcion"),
  presupuestoObservaciones: document.getElementById("presupuesto-observaciones"),
  listaMarcasTemp: document.getElementById("lista-marcas-temp"),
  listaOtrosTrabajosTemp: document.getElementById("lista-otros-trabajos-temp"),
  presupuestoMeta: document.getElementById("presupuesto-meta"),
  presupuestoFinalRender: document.getElementById("presupuesto-final-render"),
  listaHistorial: document.getElementById("lista-historial"),
  paginacionContainer: document.getElementById("paginacion-container"),
  btnCancelarEdicion: document.getElementById("btnCancelarEdicion"),
  btnCancelarInventario: document.getElementById("btnCancelarInventario"),
};

// --- View Management ---

export function showView(viewId) {
  // Ocultar todas las secciones y modales
  const dashboardGrid = document.querySelector(".dashboard-grid");
  const allModals = document.querySelectorAll(".modal-overlay");

  // Ocultar dashboard y modales
  if (dashboardGrid) {
    dashboardGrid.style.display = "none";
  }
  allModals.forEach((modal) => {
    modal.style.display = "none";
  });

  // Mostrar la vista solicitada
  if (viewId === "presupuestos-view") {
    // Vista principal - mostrar dashboard grid
    if (dashboardGrid) {
      dashboardGrid.style.display = "grid";
    }
  } else if (viewId === "historial-view") {
    // Mostrar modal de historial
    const historialModal = document.getElementById("historial-modal");
    if (historialModal) {
      historialModal.style.display = "flex";
    }
  } else if (viewId === "pedidos-view") {
    // Mostrar modal de pedidos
    const pedidosModal = document.getElementById("pedidos-modal");
    if (pedidosModal) {
      pedidosModal.style.display = "flex";
    }
  }

  // Configurar botones de cerrar modales
  setupModalCloseButtons();
}

function setupModalCloseButtons() {
  // Configurar botones de cerrar modales
  const closeButtons = document.querySelectorAll(".modal-close");
  closeButtons.forEach((button) => {
    button.onclick = () => {
      // Cerrar modal y volver a vista principal
      const allModals = document.querySelectorAll(".modal-overlay");
      allModals.forEach((modal) => {
        modal.style.display = "none";
      });

      // Mostrar vista principal
      const dashboardGrid = document.querySelector(".dashboard-grid");
      if (dashboardGrid) {
        dashboardGrid.style.display = "grid";
      }
    };
  });

  // Cerrar modal al hacer clic en el overlay
  const modals = document.querySelectorAll(".modal-overlay");
  modals.forEach((modal) => {
    modal.onclick = (e) => {
      if (e.target === modal) {
        // Cerrar modal y volver a vista principal
        modal.style.display = "none";
        const dashboardGrid = document.querySelector(".dashboard-grid");
        if (dashboardGrid) {
          dashboardGrid.style.display = "grid";
        }
      }
    };
  });
}

// --- Form & UI Reset ---

export function resetPresupuestoForm() {
  DOMElements.clienteForm.reset();
  DOMElements.productoForm.reset();
  // Poner fecha de hoy automáticamente
  if (DOMElements.presupuestoFechaPresupuesto) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    DOMElements.presupuestoFechaPresupuesto.value = `${yyyy}-${mm}-${dd}`;
  }
  // Limpiar el campo de número de presupuesto (el backend lo genera)
  if (DOMElements.presupuestoNumeroPresupuesto) {
    DOMElements.presupuestoNumeroPresupuesto.value = "";
  }
  // No vaciar las listas temporales: se mantienen según petición del usuario
  // Render actual del estado
  const p = safeGetState();
  if (p) {
    renderTemporaryItems(p);
    renderPresupuestoFinal(p);
  }
  DOMElements.presupuestoMeta.innerHTML = "";
  DOMElements.btnCancelarEdicion.style.display = "none";
  M.updateTextFields();
}

function safeGetState() {
  try {
    return State.getCurrentPresupuesto();
  } catch (_) {
    return null;
  }
}

// --- Rendering Functions ---

export function renderPresupuestoFinal(presupuesto) {
  const { grupos } = presupuesto;
  // Usar gruposPorMarca para procesar los grupos antes de renderizar
  const gruposProcesados = gruposPorMarca(grupos)
    .slice()
    .sort((a, b) => (a.totalGrupo || 0) - (b.totalGrupo || 0));
  const totalGeneral = gruposProcesados.reduce((acc, g) => acc + (g.totalGrupo || 0), 0);

  const eur0 = (n) => `${Math.round(n).toLocaleString("es-ES")}€`;

  let html = `
        <div class="budget-table-container">
            <table class="budget-table highlight">
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Cantidad</th>
                        <th>Precio/Ud</th>
                        <th>Total</th>
                        <th class="no-imprimir">Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

  gruposProcesados.forEach((grupo, grupoIndex) => {
    if (grupoIndex > 0) {
      html += `<tr class="group-separator"><td colspan="5"></td></tr>`;
    }
    grupo.otrosTrabajos.forEach((trabajo) => {
      html += `
                <tr>
                    <td>${trabajo.concepto}</td>
                    <td>${trabajo.cantidad}</td>
                    <td>${eur0(trabajo.precioUnidad)}</td>
                    <td>${eur0(trabajo.total)}</td>
                    <td class="no-imprimir"><i class="material-icons action-delete" data-group-id="${grupo.id}" data-element-id="${trabajo.id}" data-tipo="trabajo">delete_forever</i></td>
                </tr>
            `;
    });
    // Fila de cabecera de grupo con parámetros guardados
    if (grupo.medida || grupo.cantidad || grupo.ganancia || grupo.ecotasa || grupo.iva) {
      html += `
                <tr class="group-params no-imprimir solo-interno">
                    <td colspan="5">
                        <small class="grey-text">Medida: <strong>${grupo.medida || "-"}</strong> · Cantidad: <strong>${grupo.cantidad ?? "-"}</strong> · Ganancia: <strong>${grupo.ganancia ?? "-"}</strong> · Ecotasa: <strong>${grupo.ecotasa ?? "-"}</strong> · IVA: <strong>${grupo.iva ?? "-"}</strong>%</small>
                    </td>
                </tr>
            `;
    }

    grupo.neumaticos.forEach((neumatico) => {
      html += `
                <tr>
                    <td>
                        <span class="light">Neumático: </span>
                        <strong>${neumatico.nombre}</strong> <br>
                        <span class="light">${neumatico.medida}</span>
                        <br><small class="grey-text no-imprimir solo-interno">Neto: ${eur0(neumatico.neto)}</small>
                    </td>
                    <td>${neumatico.cantidad}</td>
                    <td>${eur0(neumatico.precioUnidad)}</td>
                    <td>${eur0(neumatico.total)}</td>
                    <td class="no-imprimir">
                        <i class="material-icons action-delete" data-group-id="${grupo.id}" data-element-id="${neumatico.id}" data-tipo="neumatico" title="Eliminar">delete_forever</i>
                        <a href="#!" class="btn-small blue lighten-1 choose-marca" data-group-id="${grupo.id}" data-neumatico-id="${neumatico.id}" style="margin-left:6px;">Elegir esta marca</a>
            <a href="#!" class="btn-small orange lighten-1 choose-marca-clean" data-group-id="${grupo.id}" data-neumatico-id="${neumatico.id}" style="margin-left:6px;" title="Elegir esta marca y eliminar otras de la misma medida">Elegir y limpiar medida</a>
            <a href="#!" class="btn-small green lighten-1 crear-pedido-linea" data-group-id="${grupo.id}" data-linea-id="${neumatico.id}" title="Crear pedido de esta línea" style="margin-left:6px;">Pedido</a>
                    </td>
                </tr>
            `;
    });
    // Etiqueta profesional del total por grupo
    let etiqueta = "Subtotal trabajos";
    if (grupo.neumaticos && grupo.neumaticos.length > 0) {
      const n0 = grupo.neumaticos[0];
      const marca = n0?.nombre || "Grupo";
      etiqueta = `Total ${marca}`;
    }
    html += `
            <tr class="group-total">
                <td colspan="5" class="right-align"><strong>${etiqueta}: ${eur0(grupo.totalGrupo)}</strong></td>
            </tr>
        `;
  });

  html += `
                </tbody>
            </table>
        </div>
    <h4 class="right-align" style="margin-top: 20px;">TOTAL GENERAL: ${eur0(totalGeneral)}</h4>
    `;

  // Botón extra para vaciar temporales
  html += `
        <div class="right-align no-imprimir" style="margin-top: 10px; display:flex; gap:12px; justify-content:flex-end; align-items:center;">
            <label style="display:flex; align-items:center; gap:6px;">
                <input type="checkbox" id="toggleInterno" checked />
                <span>Mostrar info interna</span>
            </label>
            <a href="#!" id="btnVaciarTemporales" class="btn-flat red-text">Vaciar temporales</a>
        </div>
    `;

  DOMElements.presupuestoFinalRender.innerHTML = html;

  // Aplicar preferencia persistida de "Mostrar info interna"
  try {
    const pref = localStorage.getItem("mostrarInfoInterna");
    const show = pref === null ? true : pref === "1";
    const toggle = document.getElementById("toggleInterno");
    if (toggle) toggle.checked = show;
    document.querySelectorAll(".solo-interno").forEach((el) => {
      el.style.display = show ? "" : "none";
    });
  } catch (_) {}

  const nombreCli = sanitizeHTML(DOMElements.presupuestoNombreCliente?.value || "N/A");
  const telCli = sanitizeHTML(DOMElements.presupuestoTelefonoCliente?.value || "N/A");

  // Verificación defensiva para evitar TypeError
  if (!DOMElements.presupuestoMeta) {
    console.error("❌ Elemento presupuesto-meta no encontrado en el DOM");
    return;
  }

  DOMElements.presupuestoMeta.innerHTML = `
        <div class="meta-line">
            <span><strong>Cliente:</strong> ${nombreCli} &nbsp;&nbsp; <strong>Tel:</strong> ${telCli}</span>
        </div>
        <div class="meta-line">
            <span><strong>Nº Presupuesto:</strong> ${sanitizeHTML(DOMElements.presupuestoNumeroPresupuesto.value || "N/A")}</span>
        </div>
        <div class="meta-line">
            <span><strong>Fecha:</strong> ${sanitizeHTML(DOMElements.presupuestoFechaPresupuesto.value || "N/A")}</span>
        </div>
    `;
}

export function renderTemporaryItems(presupuesto) {
  const { tempNeumaticos, tempOtrosTrabajos } = presupuesto;
  DOMElements.listaMarcasTemp.innerHTML = "";
  if (tempNeumaticos) {
    // ordenar por neto ascendente
    const ordenados = [...tempNeumaticos].sort((a, b) => (a.neto || 0) - (b.neto || 0));
    ordenados.forEach((neumatico) => {
      const li = document.createElement("li");
      li.className = "collection-item";
      li.innerHTML = `
                <div class="row" style="margin-bottom: 0;">
                    <div class="col s11">
                        <span aria-label="Marca">${sanitizeHTML(neumatico.nombre)}</span> - <span aria-label="Medida">${sanitizeHTML(neumatico.medida)}</span> - Neto: ${Math.round(neumatico.neto)}€
                    </div>
                    <div class="col s1 right-align">
                        <i class="material-icons red-text remove-temp-item" data-id="${neumatico.id}" data-type="neumatico" style="cursor:pointer;" aria-label="Eliminar neumático" tabindex="0">delete</i>
                    </div>
                </div>
            `;
      DOMElements.listaMarcasTemp.appendChild(li);
    });
  }

  DOMElements.listaOtrosTrabajosTemp.innerHTML = "";
  if (tempOtrosTrabajos) {
    tempOtrosTrabajos.forEach((trabajo) => {
      const li = document.createElement("li");
      li.className = "collection-item";
      li.innerHTML = `
                <div class="row" style="margin-bottom: 0;">
                    <div class="col s11">
                        <span aria-label="Concepto">${sanitizeHTML(trabajo.concepto)}</span> - ${Math.round(trabajo.total)}€
                    </div>
                    <div class="col s1 right-align">
                        <i class="material-icons red-text remove-temp-item" data-id="${trabajo.id}" data-type="trabajo" style="cursor:pointer;" aria-label="Eliminar trabajo" tabindex="0">delete</i>
                    </div>
                </div>
            `;
      DOMElements.listaOtrosTrabajosTemp.appendChild(li);
    });
  }
}

export function renderPresupuestosList(presupuestos) {
  DOMElements.listaHistorial.innerHTML = "";
  if (!presupuestos || presupuestos.length === 0) {
    DOMElements.listaHistorial.innerHTML =
      '<li class="collection-item">No hay presupuestos para mostrar.</li>';
    return;
  }
  presupuestos.forEach((p) => {
    const li = document.createElement("li");
    li.className = "collection-item";
    const nombreCliente = p.cliente && p.cliente.nombre ? p.cliente.nombre : "Sin nombre";
    li.innerHTML = `
            <div>
        <strong>Nº: ${p.numero}</strong> - Cliente: ${nombreCliente} - Fecha: ${p.fecha}
                <a href="#!" class="secondary-content">
                    <i class="material-icons edit-presupuesto" data-id="${p.id}">edit</i>
                    <i class="material-icons delete-presupuesto" data-id="${p.id}">delete</i>
                </a>
            </div>
        `;
    DOMElements.listaHistorial.appendChild(li);
  });
}

export function renderPagination(paginacionData) {
  DOMElements.paginacionContainer.innerHTML = "";
  if (!paginacionData || paginacionData.pages <= 1) return;

  const ul = document.createElement("ul");
  ul.className = "pagination";

  const prevLi = document.createElement("li");
  prevLi.className = !paginacionData.has_prev ? "disabled" : "waves-effect";
  prevLi.innerHTML = `<a href="#!"><i class="material-icons">chevron_left</i></a>`;
  if (paginacionData.has_prev) {
    prevLi.dataset.page = paginacionData.current_page - 1;
    prevLi.classList.add("page-link");
  }
  ul.appendChild(prevLi);

  for (let i = 1; i <= paginacionData.pages; i++) {
    const pageLi = document.createElement("li");
    pageLi.className = i === paginacionData.current_page ? "active blue" : "waves-effect page-link";
    pageLi.dataset.page = i;
    pageLi.innerHTML = `<a href="#!">${i}</a>`;
    ul.appendChild(pageLi);
  }

  const nextLi = document.createElement("li");
  nextLi.className = !paginacionData.has_next ? "disabled" : "waves-effect";
  nextLi.innerHTML = `<a href="#!"><i class="material-icons">chevron_right</i></a>`;
  if (paginacionData.has_next) {
    nextLi.dataset.page = paginacionData.current_page + 1;
    nextLi.classList.add("page-link");
  }
  ul.appendChild(nextLi);

  DOMElements.paginacionContainer.appendChild(ul);
}

export function fillPresupuestoForm(presupuesto) {
  DOMElements.presupuestoNombreCliente.value = presupuesto.cliente.nombre || "";
  DOMElements.presupuestoTelefonoCliente.value = presupuesto.cliente.telefono || "";
  DOMElements.presupuestoNifCliente.value = presupuesto.cliente.nif || "";
  DOMElements.presupuestoNumeroPresupuesto.value = presupuesto.numero || "";
  DOMElements.presupuestoFechaPresupuesto.value = presupuesto.fecha || "";
  // Extras
  if (DOMElements.presupuestoDistribuidor)
    DOMElements.presupuestoDistribuidor.value = presupuesto.vista_interna?.distribuidor || "";
  if (DOMElements.presupuestoDescripcion)
    DOMElements.presupuestoDescripcion.value = presupuesto.vista_interna?.descripcion || "";
  if (DOMElements.presupuestoObservaciones)
    DOMElements.presupuestoObservaciones.value = presupuesto.vista_interna?.observaciones || "";
  // Usar parámetros del borrador si existen; si no, usar el primer grupo
  const draftParams = presupuesto?.vista_interna?.draft?.params;
  if (draftParams) {
    const medidaEl = document.getElementById("presupuesto-medida");
    const cantidadEl = document.getElementById("presupuesto-cantidad");
    const gananciaEl = document.getElementById("presupuesto-ganancia");
    const ecotasaEl = document.getElementById("presupuesto-ecotasa");
    const ivaEl = document.getElementById("presupuesto-iva");
    if (medidaEl) medidaEl.value = draftParams.medida || "";
    if (cantidadEl) cantidadEl.value = draftParams.cantidad || "";
    if (gananciaEl) gananciaEl.value = draftParams.ganancia || "";
    if (ecotasaEl) ecotasaEl.value = draftParams.ecotasa || "";
    if (ivaEl) ivaEl.value = draftParams.iva || "";
  } else if (presupuesto.grupos && presupuesto.grupos.length > 0) {
    const g0 = presupuesto.grupos[0];
    const medidaEl = document.getElementById("presupuesto-medida");
    const cantidadEl = document.getElementById("presupuesto-cantidad");
    const gananciaEl = document.getElementById("presupuesto-ganancia");
    const ecotasaEl = document.getElementById("presupuesto-ecotasa");
    const ivaEl = document.getElementById("presupuesto-iva");
    if (medidaEl) medidaEl.value = g0.medida || "";
    if (cantidadEl) cantidadEl.value = g0.cantidad ?? "";
    if (gananciaEl) gananciaEl.value = g0.ganancia ?? "";
    if (ecotasaEl) ecotasaEl.value = g0.ecotasa ?? "";
    if (ivaEl) ivaEl.value = g0.iva ?? "";
  }
  M.updateTextFields();
  DOMElements.btnCancelarEdicion.style.display = "inline-block";
}

export function updateLoadedBudgetBadge(presupuesto) {
  const badge = document.getElementById("loaded-presupuesto-badge");
  if (!badge) return;

  if (presupuesto && presupuesto.id && presupuesto.numero) {
    badge.setAttribute("data-badge-caption", `#${presupuesto.numero}`);
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
    badge.setAttribute("data-badge-caption", "");
  }
}
