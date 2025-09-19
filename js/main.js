// js/main.js (restaurado correctamente)
import * as State from "./state.js";
import * as API from "./api.js";
import * as UI from "./ui.js";
import { showConfirmModal } from "./modal.js";
import {
  imprimirPresupuesto,
  descargarPDFServidor,
  capturaYWhatsApp,
  generarTextoPresupuesto,
  copiarParaCalendar,
  abrirEnCalendar,
} from "./export.js";
import { isValidNumber, isNotEmpty } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Estado local para filtros de historial
  let filtrosHist = { nombre: "", telefono: "", numero: "", medida: "" };

  // Listener botón NUEVO (remplaza onclick inline roto)
  const btnNuevo = document.getElementById("btnNuevoPresupuesto");
  if (btnNuevo) {
    btnNuevo.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("[Nuevo] Click detectado sobre #btnNuevoPresupuesto");
      const launch = () => {
        try {
          showConfirmModal(
            "Nuevo Presupuesto",
            "¿Quieres empezar un nuevo presupuesto? Se limpiará el formulario actual.",
            () => {
              console.log("[Nuevo] Confirmado por el usuario, reseteando formulario");
              handleResetPresupuestoForm();
              if (window.M && M.toast) {
                M.toast({ html: "Formulario listo para un nuevo presupuesto.", classes: "blue" });
              } else {
                console.log("[Nuevo] Toast no disponible (Materialize no cargado)");
              }
            }
          );
        } catch (err) {
          console.warn("[Nuevo] showConfirmModal falló, usando confirm():", err);
          if (window.confirm("¿Empezar un nuevo presupuesto? Se limpiará el formulario actual.")) {
            handleResetPresupuestoForm();
          }
        }
      };
      launch();
    });
  }

  // Botón Volver en historial (podía haberse perdido en refactor)
  const btnVolver = document.getElementById("btnVolverPresupuestos");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => handleShowView("presupuestos-view"));
  }
  // Buttons
  document.getElementById("btnAgregarMarca")?.addEventListener("click", handleAddMarca);
  document.getElementById("btnAgregarOtroTrabajo")?.addEventListener("click", handleAddTrabajo);
  document.getElementById("btnAgregarGrupo")?.addEventListener("click", handleAddGrupo);
  document
    .getElementById("btnGuardarPresupuesto")
    ?.addEventListener("click", handleSavePresupuesto);
  document
    .getElementById("btnCancelarEdicion")
    ?.addEventListener("click", handleResetPresupuestoForm);
  // Botón Ver historial
  // ... (código existente)

  document.getElementById("btnVerHistorial").addEventListener("click", () => {
    handleShowView("historial-view");
  });

  // Historial: buscar/limpiar
  const btnBuscarHist = document.getElementById("hist-buscar-btn");
  const btnLimpiarHist = document.getElementById("hist-limpiar-btn");
  const inpNom = document.getElementById("hist-buscar-nombre");
  const inpTel = document.getElementById("hist-buscar-telefono");
  const inpNum = document.getElementById("hist-buscar-numero");
  const inpMedida = document.getElementById("hist-buscar-medida");
  if (btnBuscarHist && btnLimpiarHist && inpNom && inpTel && inpNum && inpMedida) {
    btnBuscarHist.addEventListener("click", () => {
      filtrosHist = {
        nombre: inpNom.value.trim(),
        telefono: inpTel.value.trim(),
        numero: inpNum.value.trim(),
        medida: inpMedida.value.trim(),
      };
      handleFetchPresupuestos(1);
    });
    btnLimpiarHist.addEventListener("click", () => {
      filtrosHist = { nombre: "", telefono: "", numero: "", medida: "" };
      inpNom.value = "";
      inpTel.value = "";
      inpNum.value = "";
      inpMedida.value = "";
      M.updateTextFields();
      handleFetchPresupuestos(1);
    });
    // Enter en campos → buscar
    [inpNom, inpTel, inpNum, inpMedida].forEach((inp) =>
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          btnBuscarHist.click();
        }
      })
    );
  }
  // Botón Guardar como nuevo
  const btnGuardarComoNuevo = document.getElementById("btnGuardarComoNuevo");
  if (btnGuardarComoNuevo) {
    btnGuardarComoNuevo.addEventListener("click", () => {
      handleSavePresupuesto(true); // true = guardar como nuevo
    });
  }

  // Flujo de teclado para añadir varias marcas rápidamente
  const marcaInput = document.getElementById("presupuesto-marca-temp");
  const netoInput = document.getElementById("presupuesto-neto-temp");
  if (marcaInput && netoInput) {
    // Enter en Marca → ir a Neto
    marcaInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        netoInput.focus();
      }
    });
    // Tab o Enter en Neto → añadir y volver a Marca (si valores válidos)
    netoInput.addEventListener("keydown", (e) => {
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
      if (key === "Enter") {
        e.preventDefault();
        tryAdd();
      } else if (key === "Tab" && !e.shiftKey) {
        // Solo interceptamos Tab hacia delante si podemos añadir
        const added = tryAdd();
        if (added) e.preventDefault();
      }
    });
  }

  // Botones de exportación / compartir
  const btnImprimir = document.getElementById("btnImprimirPresupuesto");
  if (btnImprimir) {
    btnImprimir.addEventListener("click", () => {
      imprimirPresupuesto();
    });
  }
  const btnDescargarPDF = document.getElementById("btnDescargarPDF");
  if (btnDescargarPDF) {
    btnDescargarPDF.addEventListener("click", async () => {
      await descargarPDFServidor("presupuesto.pdf");
    });
  }
  const btnCapturaWA = document.getElementById("btnCapturaWhatsApp");
  if (btnCapturaWA) {
    btnCapturaWA.addEventListener("click", async () => {
      await capturaYWhatsApp();
    });
  }
  const btnCompartirWA = document.getElementById("btnCompartirWhatsApp");
  if (btnCompartirWA) {
    btnCompartirWA.addEventListener("click", () => {
      const texto = generarTextoPresupuesto();
      const telRaw = UI.DOMElements.presupuestoTelefonoCliente?.value || "";
      let tel = (telRaw || "").replace(/\D/g, "");
      if (!tel) {
        M.toast({ html: "Introduce el teléfono del cliente", classes: "red" });
        return;
      }
      if (tel.length === 9) tel = "34" + tel;
      const url = `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
      window.open(url, "_blank");
    });
  }
  const btnCopiarCalendar = document.getElementById("btnCopiarCalendar");
  if (btnCopiarCalendar) {
    btnCopiarCalendar.addEventListener("click", () => copiarParaCalendar());
  }
  const btnAbrirCalendar = document.getElementById("btnAbrirCalendar");
  if (btnAbrirCalendar) {
    btnAbrirCalendar.addEventListener("click", () => abrirEnCalendar());
  }
  const btnVaciarGrupos = document.getElementById("btnVaciarGrupos");
  if (btnVaciarGrupos) {
    btnVaciarGrupos.addEventListener("click", () => {
      showConfirmModal(
        "Vaciar Presupuesto",
        "¿Estás seguro de que quieres vaciar la lista de productos del cliente? (Los temporales no se verán afectados)",
        () => {
          State.clearGrupos();
          UI.renderPresupuestoFinal(State.getCurrentPresupuesto());
          M.toast({ html: "Presupuesto vaciado.", classes: "blue" });
        }
      );
    });
  }

  // --- Medidor de tamaño del recuadro "Datos del cliente" ---
  (function attachMeasureBadge() {
    try {
      const fieldset = document.querySelector("#presupuestos-view fieldset");
      if (!fieldset) return;
      fieldset.style.position = fieldset.style.position || "relative";
      let badge = document.getElementById("cliente-measure-badge");
      if (!badge) {
        badge = document.createElement("div");
        badge.id = "cliente-measure-badge";
        badge.className = "measure-badge no-imprimir";
        badge.title = "Ancho × Alto del recuadro (px)";
        fieldset.appendChild(badge);
      }
      const update = () => {
        const r = fieldset.getBoundingClientRect();
        badge.textContent = `${Math.round(r.width)} × ${Math.round(r.height)} px`;
      };
      update();
      window.addEventListener("resize", update);
      if ("ResizeObserver" in window) {
        const ro = new ResizeObserver(update);
        ro.observe(fieldset);
      }
    } catch (_) {}
  })();

  // --- Sugerencias (medidas y marcas desde historial) ---
  const btnCargarSugerencias = document.getElementById("btnCargarSugerencias");
  const sugLimit = document.getElementById("sug-limit");
  const sugMedidas = document.getElementById("sug-medidas");
  const sugMarcas = document.getElementById("sug-marcas");
  let ultSugerencias = null;

  function showToast(msg, level = "info") {
    const classes = {
      info: "blue",
      success: "green",
      error: "red",
      warning: "orange",
    };
    if (window.M && M.toast) M.toast({ html: msg, classes: classes[level] || "blue" });
    else alert(msg);
  }

  // Helper para leer inputs de forma segura (evita crashes si no existen en el DOM)
  function gv(id, fallback = "") {
    try {
      const v = document.getElementById(id)?.value;
      if (v === null || v === undefined) return fallback;
      return typeof v === "string" ? v.trim() : v;
    } catch (_) {
      return fallback;
    }
  }

  function renderChips(container, items, onClick) {
    if (!container) return;
    container.innerHTML = "";
    if (!items || !items.length) {
      container.textContent = "Sin datos";
      return;
    }
    items.forEach((txt) => {
      const chip = document.createElement("a");
      chip.href = "#!";
      chip.textContent = txt;
      chip.className = "chip";
      chip.style.marginRight = "6px";
      chip.addEventListener("click", (e) => {
        e.preventDefault();
        onClick(txt);
      });
      container.appendChild(chip);
    });
  }

  // Función para cargar sugerencias (reutilizable)
  async function handleLoadSugerencias() {
    try {
      console.log("🔄 Cargando sugerencias automáticamente...");
      const limitVal = sugLimit?.value ? Number(sugLimit.value) : undefined;
      const data = await API.fetchSugerencias(limitVal);
      ultSugerencias = data;

      // Handler para click en marca (declarado antes de primer uso)
      const onClickMarca = async (val) => {
        const inputMarca = document.getElementById("presupuesto-marca-temp");
        if (inputMarca) {
          inputMarca.value = val;
          inputMarca.dispatchEvent(new Event("input"));
          if (window.M) M.updateTextFields();
        }

        // 🔥 NUEVO: Buscar precio automáticamente para esta marca y medida
        const medidaActual = gv("presupuesto-medida");
        if (medidaActual) {
          try {
            console.log(
              `🔍 [AUTO-PRECIO] Buscando precio para medida: "${medidaActual}", marca: "${val}"`
            );

            // Obtener precios guardados para esta medida
            const preciosPorMedida = await API.getPreciosPorMedida(medidaActual);
            console.log(
              `📊 [AUTO-PRECIO] Encontrados ${preciosPorMedida.length} precios para medida "${medidaActual}"`
            );

            // Buscar precio específico para esta marca
            const precioEncontrado = preciosPorMedida.find(
              (p) => p.marca && p.marca.toLowerCase() === val.toLowerCase()
            );

            if (precioEncontrado) {
              const netoInput = document.getElementById("presupuesto-neto-temp");
              if (netoInput) {
                netoInput.value = precioEncontrado.neto;
                netoInput.dispatchEvent(new Event("input"));
                if (window.M) M.updateTextFields();

                console.log(
                  `✅ [AUTO-PRECIO] Precio automático aplicado: ${precioEncontrado.neto}`
                );
                showToast(
                  `💰 Precio aplicado automáticamente: ${precioEncontrado.neto}`,
                  "success"
                );
              }
            } else {
              console.log(
                `❌ [AUTO-PRECIO] No se encontró precio guardado para marca "${val}" en medida "${medidaActual}"`
              );
              showToast(`⚠️ No hay precio guardado para ${val} en ${medidaActual}`, "warning");
            }
          } catch (error) {
            console.log(`❌ [AUTO-PRECIO] Error al buscar precio:`, error);
          }
        }

        showToast(`Marca seleccionada: ${val}`, "success");

        // Auto-añadir la marca si todos los campos están completos
        setTimeout(() => {
          console.log("🔥 [AUTO-ADD] Procesando auto-añadir para marca:", val);

          const medida = gv("presupuesto-medida");
          const cantidad = gv("presupuesto-cantidad");
          const neto = gv("presupuesto-neto-temp");

          // Verificar que todos los campos requeridos están completos (SIMPLIFICADO - solo 4 campos esenciales)
          const validaciones = {
            medida: isNotEmpty(medida),
            cantidad: isValidNumber(cantidad, { min: 1, allowNegative: false }),
            marca: isNotEmpty(val),
            neto: isValidNumber(neto, { min: 0, allowNegative: false }),
          };

          const todasValidas = Object.values(validaciones).every((v) => v);
          console.log("🎯 [AUTO-ADD] Validación:", todasValidas ? "✅ VÁLIDA" : "❌ FALTAN CAMPOS");

          if (todasValidas) {
            // Simular click en el botón "Añadir Marca" en lugar de llamar directamente a la función
            const btnAddMarca = document.getElementById("btnAgregarMarca");
            if (btnAddMarca) {
              console.log("🚀 [AUTO-ADD] Ejecutando auto-añadir...");
              btnAddMarca.click();
              console.log("✅ [AUTO-ADD] Marca añadida automáticamente!");
              showToast(`¡Marca ${val} añadida automáticamente!`, "success");
            } else {
              console.log("❌ [AUTO-ADD] ERROR: Botón 'Añadir Marca' no encontrado");
            }
          } else {
            const erroresDetallados = [];
            if (!validaciones.medida) erroresDetallados.push("Medida vacía");
            if (!validaciones.cantidad) erroresDetallados.push("Cantidad inválida");
            if (!validaciones.marca) erroresDetallados.push("Marca vacía");
            if (!validaciones.neto) erroresDetallados.push("Neto inválido");

            console.log("❌ [AUTO-ADD] Faltan campos:", erroresDetallados.join(", "));
            showToast(`⚠️ Para auto-add faltan: ${erroresDetallados.join(", ")}`, "warning");
          }
        }, 1000); // Aumenté el timeout a 1 segundo para dar tiempo a que se llene el precio
      };

      // Render medidas; al hacer clic, rellenar input y actualizar marcas por combo
      renderChips(sugMedidas, data.medidas, (val) => {
        const inputMedida = document.getElementById("presupuesto-medida");
        if (inputMedida) {
          inputMedida.value = val;
          inputMedida.dispatchEvent(new Event("input"));
          if (window.M) M.updateTextFields();
        }
        const marcasParaMedida =
          (ultSugerencias?.combos && ultSugerencias.combos[val]) || ultSugerencias?.marcas || [];
        renderChips(sugMarcas, marcasParaMedida, onClickMarca);
        showToast(`Medida seleccionada: ${val}`, "success");

        // Auto-añadir si todos los campos están completos
        setTimeout(() => {
          const cantidad = gv("presupuesto-cantidad");
          const marca = gv("presupuesto-marca-temp");
          const neto = gv("presupuesto-neto-temp");

          // Verificar que todos los campos requeridos están completos (SIMPLIFICADO - solo 4 campos esenciales)
          const validaciones = {
            medida: isNotEmpty(val),
            cantidad: isValidNumber(cantidad, { min: 1, allowNegative: false }),
            marca: isNotEmpty(marca),
            neto: isValidNumber(neto, { min: 0, allowNegative: false }),
          };

          const todasValidas = Object.values(validaciones).every((v) => v);
          console.log(
            "🔍 [AUTO-ADD] Desde medida - Validación:",
            todasValidas ? "✅ VÁLIDA" : "❌ FALTAN CAMPOS"
          );

          if (todasValidas) {
            // Simular click en el botón "Añadir Marca" en lugar de llamar directamente a la función
            const btnAddMarca = document.getElementById("btnAgregarMarca");
            if (btnAddMarca) {
              console.log("✅ Auto-añadiendo producto...");
              btnAddMarca.click();
              showToast("¡Producto añadido automáticamente!", "success");
            } else {
              console.log("❌ Botón 'Añadir Marca' no encontrado");
            }
          } else {
            const erroresDetallados = [];
            if (!validaciones.medida) erroresDetallados.push("Medida vacía");
            if (!validaciones.cantidad) erroresDetallados.push("Cantidad inválida (min: 1)");
            if (!validaciones.marca) erroresDetallados.push("Marca vacía");
            if (!validaciones.neto) erroresDetallados.push("Neto inválido (min: 0)");

            console.log(
              "❌ Validaciones fallidas (desde medida - 4 campos esenciales):",
              erroresDetallados.join(", ")
            );
            showToast(`Faltan campos esenciales: ${erroresDetallados.join(", ")}`, "warning");
          }
        }, 150);
      });

      // Render marcas generales; al hacer clic, rellenar marca
      renderChips(sugMarcas, data.marcas, onClickMarca);
      showToast("Sugerencias cargadas", "success");
    } catch (e) {
      showToast(`Error cargando sugerencias: ${e.message || e}`, "error");
    }
  }

  if (btnCargarSugerencias) {
    btnCargarSugerencias.addEventListener("click", handleLoadSugerencias);
  }

  // Eliminados listeners de inventario

  // Event Delegation for dynamic elements
  document.body.addEventListener("click", (e) => {
    const target = e.target;
    // Historial Actions
    if (target.matches(".edit-presupuesto")) {
      handleLoadPresupuestoForEdit(target.dataset.id);
    }
    if (target.matches(".delete-presupuesto")) {
      handleDeletePresupuesto(target.dataset.id);
    }
    // Botón convertir a pedido eliminado (endpoint no existe)
    // Eliminadas acciones de inventario
    // Pagination
    if (target.closest(".page-link")) {
      const page = parseInt(target.closest(".page-link").dataset.page, 10);
      if (!isNaN(page)) {
        handleFetchPresupuestos(page);
      }
    }
    // Temp items
    if (target.matches(".remove-temp-item")) {
      const { id, type } = target.dataset;
      if (type === "neumatico") {
        State.removeTempNeumatico(id);
      } else if (type === "trabajo") {
        State.removeTempTrabajo(id);
      }
      UI.renderTemporaryItems(State.getCurrentPresupuesto());
    }
    // Presupuesto items
    if (target.matches(".action-delete")) {
      const { groupId, elementId, tipo } = target.dataset;
      if (groupId && elementId && tipo) {
        State.removeElementFromGroup(groupId, elementId, tipo);
        UI.renderPresupuestoFinal(State.getCurrentPresupuesto());
      }
    }
    // Crear pedido desde una línea de neumático
    if (target.matches(".crear-pedido-linea")) {
      e.preventDefault();
      const { groupId, lineaId } = target.dataset;
      const presupuestoId = State.getCurrentEditPresupuestoId();
      if (!presupuestoId) {
        M.toast({ html: "Primero guarda el presupuesto antes de crear el pedido", classes: "red" });
        return;
      }
      const presu = State.getCurrentPresupuesto();
      // Buscar la línea
      let linea = null;
      presu.grupos.forEach((g) => {
        if (g.id === groupId) {
          g.neumaticos.forEach((n) => {
            if (n.id === lineaId) linea = n;
          });
        }
      });
      if (!linea) {
        M.toast({ html: "Línea no encontrada", classes: "red" });
        return;
      }
      // Llamar API
      (async () => {
        try {
          await API.crearPedidoDesdePresupuesto(presupuestoId, linea);
          M.toast({ html: "Pedido creado a partir de la línea", classes: "green" });
        } catch (err) {
          M.toast({ html: `Error creando pedido: ${err.message || err}`, classes: "red" });
        }
      })();
    }
    // Elegir una marca dentro de un grupo
    if (target.matches(".choose-marca")) {
      e.preventDefault();
      const { groupId, neumaticoId } = target.dataset;
      if (groupId && neumaticoId) {
        State.chooseMarcaForGroup(groupId, neumaticoId);
        UI.renderPresupuestoFinal(State.getCurrentPresupuesto());
        M.toast({ html: "Marca seleccionada para el grupo.", classes: "green" });
      }
    }
    // Elegir marca y limpiar grupos de la misma medida
    if (target.matches(".choose-marca-clean")) {
      e.preventDefault();
      const { groupId, neumaticoId } = target.dataset;
      if (groupId && neumaticoId) {
        State.chooseMarcaAndRemoveSameMeasure(groupId, neumaticoId);
        UI.renderPresupuestoFinal(State.getCurrentPresupuesto());
        M.toast({ html: "Marca elegida y medidas duplicadas limpiadas.", classes: "green" });
      }
    }
    // Vaciar temporales
    if (target.matches("#btnVaciarTemporales")) {
      e.preventDefault();
      State.clearTemporales();
      UI.renderTemporaryItems(State.getCurrentPresupuesto());
      M.toast({ html: "Temporales vaciados.", classes: "blue" });
    }
  });

  // Toggle mostrar info interna (solo en pantalla)
  document.body.addEventListener("change", (e) => {
    const target = e.target;
    if (target && target.id === "toggleInterno") {
      const show = !!target.checked;
      document.querySelectorAll(".solo-interno").forEach((el) => {
        el.style.display = show ? "" : "none";
      });
      try {
        localStorage.setItem("mostrarInfoInterna", show ? "1" : "0");
      } catch (_) {}
    }
  });

  // Other Listeners
  const toggleCompacto = document.getElementById("toggleCompacto");
  const toggleCompactoTop = document.getElementById("toggleCompactoTop");
  if (toggleCompacto) {
    // init from localStorage
    try {
      const saved = localStorage.getItem("ui.compacto");
      const onSaved = saved === "1";
      if (toggleCompacto) toggleCompacto.checked = onSaved;
      if (toggleCompactoTop) toggleCompactoTop.checked = onSaved;
      if (onSaved) {
        document.body.classList.add("compacto");
      }
    } catch (_) {}
    const applyCompact = (on) => {
      document.body.classList.toggle("compacto", on);
      try {
        localStorage.setItem("ui.compacto", on ? "1" : "0");
      } catch (_) {}
      if (toggleCompacto && toggleCompacto.checked !== on) toggleCompacto.checked = on;
      if (toggleCompactoTop && toggleCompactoTop.checked !== on) toggleCompactoTop.checked = on;
    };
    toggleCompacto.addEventListener("change", (e) => applyCompact(!!e.target.checked));
    if (toggleCompactoTop)
      toggleCompactoTop.addEventListener("change", (e) => applyCompact(!!e.target.checked));
  }

  // Extra-compacto toggle
  const toggleExtraCompacto = document.getElementById("toggleExtraCompacto");
  const toggleExtraCompactoTop = document.getElementById("toggleExtraCompactoTop");
  if (toggleExtraCompacto) {
    // init from localStorage
    try {
      const saved = localStorage.getItem("ui.extraCompacto");
      const onSaved = saved === "1";
      if (toggleExtraCompacto) toggleExtraCompacto.checked = onSaved;
      if (toggleExtraCompactoTop) toggleExtraCompactoTop.checked = onSaved;
      if (onSaved) document.body.classList.add("extra-compacto");
    } catch (_) {}
    const applyExtra = (on) => {
      document.body.classList.toggle("extra-compacto", on);
      try {
        localStorage.setItem("ui.extraCompacto", on ? "1" : "0");
      } catch (_) {}
      if (toggleExtraCompacto && toggleExtraCompacto.checked !== on)
        toggleExtraCompacto.checked = on;
      if (toggleExtraCompactoTop && toggleExtraCompactoTop.checked !== on)
        toggleExtraCompactoTop.checked = on;
    };
    toggleExtraCompacto.addEventListener("change", (e) => applyExtra(!!e.target.checked));
    if (toggleExtraCompactoTop)
      toggleExtraCompactoTop.addEventListener("change", (e) => applyExtra(!!e.target.checked));
  }

  // Botón Cancelar en barra superior: reusa el inferior
  const btnCancelarTop = document.getElementById("btnCancelarEdicionTop");
  const btnCancelar = document.getElementById("btnCancelarEdicion");
  if (btnCancelarTop && btnCancelar) {
    // Visibilidad sincronizada
    const obs = new MutationObserver(() => {
      btnCancelarTop.style.display = btnCancelar.style.display || "none";
    });
    obs.observe(btnCancelar, { attributes: true, attributeFilter: ["style", "class"] });
    btnCancelarTop.addEventListener("click", () => btnCancelar.click());
    // Estado inicial
    btnCancelarTop.style.display = btnCancelar.style.display || "none";
  }

  // --- Handlers ---

  function handleShowView(viewId) {
    UI.showView(viewId);
    State.setCurrentView(viewId);
    if (viewId === "historial-view") {
      handleFetchPresupuestos();
    }
    if (viewId === "pedidos-view") {
      handleFetchPedidos();
    }
    // Auto-cargar sugerencias al entrar en vista de presupuestos
    if (viewId === "presupuestos-view") {
      handleLoadSugerencias();
    }
  }

  function handleResetPresupuestoForm() {
    State.resetState();
    UI.resetPresupuestoForm();
    UI.updateLoadedBudgetBadge(null);
    const btnGuardarComoNuevo = document.getElementById("btnGuardarComoNuevo");
    if (btnGuardarComoNuevo) btnGuardarComoNuevo.style.display = "none";
  }

  async function handleFetchPresupuestos(page = 1) {
    try {
      const data = await API.fetchHistorial(page, filtrosHist);
      State.setHistorial(data.presupuestos);
      State.setPaginacion(data);
      UI.renderPresupuestosList(State.getHistorial());
      UI.renderPagination(State.getPaginacion());
      // Rellenar de nuevo los inputs con filtros actuales
      const inpNom = document.getElementById("hist-buscar-nombre");
      const inpTel = document.getElementById("hist-buscar-telefono");
      const inpNum = document.getElementById("hist-buscar-numero");
      const inpMedida = document.getElementById("hist-buscar-medida");
      if (inpNom && inpTel && inpNum && inpMedida) {
        inpNom.value = filtrosHist.nombre || "";
        inpTel.value = filtrosHist.telefono || "";
        inpNum.value = filtrosHist.numero || "";
        inpMedida.value = filtrosHist.medida || "";
        M.updateTextFields();
      }
    } catch (error) {
      const toastId = "toast-error-" + Date.now();
      const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
      const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
      M.toast({
        html: `<span id='${toastId}' style='white-space:pre-line;'>Error: ${error.message || error}</span>${copyBtn}${closeBtn}`,
        classes: "red",
        displayLength: Infinity,
      });
    }
  }

  async function handleSavePresupuesto() {
    if (handleSavePresupuesto._inFlight) {
      console.log("[Guardar] Ignorado doble clic mientras se procesa");
      return;
    }
    handleSavePresupuesto._inFlight = true;
    // Desactivar botones de guardado mientras se procesa
    const btnGuardar = document.getElementById("btnGuardarPresupuesto");
    const btnGuardarNuevo = document.getElementById("btnGuardarComoNuevo");
    const prevStates = {
      guardar: btnGuardar ? btnGuardar.disabled : null,
      guardarNuevo: btnGuardarNuevo ? btnGuardarNuevo.disabled : null,
    };
    if (btnGuardar) btnGuardar.disabled = true;
    if (btnGuardarNuevo) btnGuardarNuevo.disabled = true;
    State.calculateTotalGeneral();
    const currentPresupuesto = State.getCurrentPresupuesto();
    const clienteData = {
      nombre: UI.DOMElements.presupuestoNombreCliente.value,
      telefono: UI.DOMElements.presupuestoTelefonoCliente.value,
      nif: UI.DOMElements.presupuestoNifCliente.value,
    };

    // El backend genera el número, así que no lo envíes si es nuevo
    let fecha = UI.DOMElements.presupuestoFechaPresupuesto.value;
    if (!fecha) {
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, "0");
      const dd = String(hoy.getDate()).padStart(2, "0");
      fecha = `${yyyy}-${mm}-${dd}`;
      if (UI.DOMElements.presupuestoFechaPresupuesto) {
        UI.DOMElements.presupuestoFechaPresupuesto.value = fecha;
      }
    }
    // Capturar borrador (parámetros del formulario + temporales)
    const draftParams = {
      medida: document.getElementById("presupuesto-medida")?.value || "",
      cantidad: document.getElementById("presupuesto-cantidad")?.value || "",
      ganancia: document.getElementById("presupuesto-ganancia")?.value || "",
      ecotasa: document.getElementById("presupuesto-ecotasa")?.value || "",
      iva: document.getElementById("presupuesto-iva")?.value || "",
    };

    const distribuidor = UI.DOMElements.presupuestoDistribuidor?.value || "";
    const descripcion = UI.DOMElements.presupuestoDescripcion?.value || "";
    const observaciones = UI.DOMElements.presupuestoObservaciones?.value || "";

    const presupuestoData = {
      cliente: clienteData,
      fecha: fecha,
      vista_cliente: {
        grupos: currentPresupuesto.grupos,
        totalGeneral: currentPresupuesto.totalGeneral,
      },
      vista_interna: {
        grupos: currentPresupuesto.grupos,
        totalGeneral: currentPresupuesto.totalGeneral,
        distribuidor,
        descripcion,
        observaciones,
        draft: {
          params: draftParams,
          tempNeumaticos: currentPresupuesto.tempNeumaticos,
          tempOtrosTrabajos: currentPresupuesto.tempOtrosTrabajos,
        },
      },
    };

    try {
      // Si se pasa true como argumento, forzar guardar como nuevo (POST)
      let guardarComoNuevo = false;
      if (arguments.length > 0 && arguments[0] === true) guardarComoNuevo = true;
      const idParaGuardar = guardarComoNuevo ? null : State.getCurrentEditPresupuestoId();
      const saved = await API.savePresupuesto(idParaGuardar, presupuestoData);

      M.toast({
        html: `Presupuesto guardado con éxito. Nº: <b>${saved.numero}</b>`,
        classes: "green",
      });

      // Cargar directamente por ID devuelto (sin buscar por número)
      if (saved && saved.id) {
        // Forzar la actualización del estado en memoria inmediatamente
        State.loadPresupuestoForEdit(saved);
        // Recargar el resto del formulario y las vistas con todos los datos
        await handleLoadPresupuestoForEdit(saved.id);
      } else {
        // Fallback: si por alguna razón no viene id, resetear formulario
        handleResetPresupuestoForm();
      }
    } catch (error) {
      // Mostrar mensaje detallado del backend si existe
      let msg = error.message || "Error desconocido al guardar presupuesto.";
      if (error.stack) {
        msg += `<br><small>${error.stack}</small>`;
      }
      // Botón copiar
      const toastId = "toast-error-" + Date.now();
      const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
      const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
      M.toast({
        html: `<span id='${toastId}' style='white-space:pre-line;'>Error: ${msg}</span>${copyBtn}${closeBtn}`,
        classes: "red",
        displayLength: Infinity,
      });
    } finally {
      // Restaurar botones
      if (btnGuardar && prevStates.guardar !== null) btnGuardar.disabled = prevStates.guardar;
      if (btnGuardarNuevo && prevStates.guardarNuevo !== null)
        btnGuardarNuevo.disabled = prevStates.guardarNuevo;
      handleSavePresupuesto._inFlight = false;
    }
  }

  async function handleLoadPresupuestoForEdit(presupuestoId) {
    try {
      const presupuesto = await API.fetchPresupuestoById(presupuestoId);
      State.loadPresupuestoForEdit(presupuesto);
      UI.updateLoadedBudgetBadge(presupuesto); // Actualizar el badge
      const loadedState = State.getCurrentPresupuesto();
      // Usar el objeto crudo del API para rellenar parámetros desde draft
      UI.fillPresupuestoForm(presupuesto);
      UI.renderPresupuestoFinal(loadedState);
      UI.renderTemporaryItems(loadedState);
      handleShowView("presupuestos-view");
      // Mostrar botón Guardar como nuevo
      const btnGuardarComoNuevo = document.getElementById("btnGuardarComoNuevo");
      if (btnGuardarComoNuevo) btnGuardarComoNuevo.style.display = "inline-block";
    } catch (error) {
      const toastId = "toast-error-" + Date.now();
      const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
      const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
      M.toast({
        html: `<span id='${toastId}' style='white-space:pre-line;'>Error: ${error.message || error}</span>${copyBtn}${closeBtn}`,
        classes: "red",
        displayLength: Infinity,
      });
    }
  }

  async function handleDeletePresupuesto(presupuestoId) {
    showConfirmModal(
      "Eliminar Presupuesto",
      "¿Estás seguro de que quieres eliminar este presupuesto? Esta acción no se puede deshacer.",
      async () => {
        try {
          await API.deletePresupuestoById(presupuestoId);
          M.toast({ html: "Presupuesto eliminado con éxito!", classes: "green" });
          handleFetchPresupuestos();
        } catch (error) {
          const toastId = "toast-error-" + Date.now();
          const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
          const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
          M.toast({
            html: `<span id='${toastId}' style='white-space:pre-line;'>Error: ${error.message || error}</span>${copyBtn}${closeBtn}`,
            classes: "red",
            displayLength: Infinity,
          });
        }
      }
    );
  }

  // función convertir a pedido eliminada

  // Eliminadas funciones de inventario

  function handleAddMarca() {
    console.log("🟢 [MANUAL-ADD] Iniciando añadir marca manual...");

    const medida = document.getElementById("presupuesto-medida")?.value ?? "";
    const cantidad = document.getElementById("presupuesto-cantidad")?.value ?? "";
    const ganancia = document.getElementById("presupuesto-ganancia")?.value ?? "";
    // En el diseño compacto puede no existir ecotasa: por defecto 0
    const ecotasa = document.getElementById("presupuesto-ecotasa")?.value ?? "0";
    const iva = document.getElementById("presupuesto-iva")?.value ?? "0";
    const marca = document.getElementById("presupuesto-marca-temp")?.value ?? "";
    const neto = document.getElementById("presupuesto-neto-temp")?.value ?? "";

    console.log("🔍 [MANUAL-ADD] Valores capturados:");
    console.log("  Medida:", medida || "(vacío)");
    console.log("  Cantidad:", cantidad || "(vacío)");
    console.log("  Marca:", marca || "(vacío)");
    console.log("  Neto:", neto || "(vacío)");
    console.log("  Ganancia:", ganancia || "(vacío - opcional)");
    console.log("  Ecotasa:", ecotasa || "(vacío - opcional)");
    console.log("  IVA:", iva || "(vacío - opcional)");

    // 🔥 NUEVA LÓGICA: Solo validar campos esenciales (igual que auto-add)
    const errores = [];
    if (!isNotEmpty(medida)) errores.push("La medida es obligatoria.");
    if (!isValidNumber(cantidad, { min: 1, allowNegative: false }))
      errores.push("Cantidad inválida (mínimo 1).");
    if (!isNotEmpty(marca)) errores.push("La marca es obligatoria.");
    if (!isValidNumber(neto, { min: 0, allowNegative: false }))
      errores.push("Neto inválido (mínimo 0).");

    // Campos opcionales: usar valores por defecto si están vacíos
    const nGanancia = isValidNumber(ganancia, { min: 0, allowNegative: false })
      ? parseFloat(ganancia)
      : 0;
    const nEcotasa = isValidNumber(ecotasa, { min: 0, allowNegative: false })
      ? parseFloat(ecotasa)
      : 0;
    const nIva = isValidNumber(iva, { min: 0, max: 100, allowNegative: false })
      ? parseFloat(iva)
      : 0;

    console.log("🔍 [MANUAL-ADD] Valores procesados:");
    console.log("  Ganancia final:", nGanancia, "(0 si vacío)");
    console.log("  Ecotasa final:", nEcotasa, "(0 si vacío)");
    console.log("  IVA final:", nIva, "(0 si vacío)");

    if (errores.length > 0) {
      console.log("❌ [MANUAL-ADD] Errores de validación:", errores);
      UI.showFormErrors("producto-form", errores);
      return;
    }

    console.log("✅ [MANUAL-ADD] Validación exitosa, procesando...");
    UI.clearFormErrors("producto-form");

    const nCantidad = parseInt(cantidad, 10);
    const nNeto = parseFloat(neto);
    // Fórmula solicitada: (NETO + ECOTASA + IVA) y DESPUÉS se suma GANANCIA
    // Por unidad: PU = round((neto + ecotasa) * (1 + IVA) + ganancia)
    // Total: round( ((neto + ecotasa) * (1 + IVA)) * cantidad + ganancia * cantidad )
    const baseSinGanancia = nNeto + nEcotasa;
    const puSinGanancia = baseSinGanancia * (1 + nIva / 100);
    const precioUnidad = Math.round(puSinGanancia + nGanancia);
    const total = Math.round(puSinGanancia * nCantidad + nGanancia * nCantidad);
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
      total,
    };
    State.addTempNeumatico(neumatico);
    // Guardar/actualizar precio por medida y marca
    try {
      API.upsertPrecio({ medida, marca, neto: nNeto });
    } catch (_) {
      /* silencioso */
    }
    UI.renderTemporaryItems(State.getCurrentPresupuesto());
    const marcaInp2 = document.getElementById("presupuesto-marca-temp");
    const netoInp2 = document.getElementById("presupuesto-neto-temp");
    if (marcaInp2) marcaInp2.value = "";
    if (netoInp2) netoInp2.value = "";
    M.updateTextFields();
    // Volver a enfocar Marca para facilitar múltiples entradas
    const marcaRef = document.getElementById("presupuesto-marca-temp");
    if (marcaRef) marcaRef.focus();
  }

  function handleAddTrabajo() {
    const conceptoEl = document.getElementById("presupuesto-otro-concepto");
    const precioEl = document.getElementById("presupuesto-otro-precio");
    let concepto = conceptoEl?.value?.trim() ?? "";
    let precioFinal = precioEl?.value?.trim() ?? "";

    // Si los inputs no existen en el diseño compacto, pedir datos por prompt
    if (!conceptoEl || !precioEl) {
      if (!concepto) concepto = window.prompt("Concepto del trabajo:") || "";
      if (!precioFinal) precioFinal = window.prompt("Precio final (€):") || "";
    }
    const errores = [];
    if (!isNotEmpty(concepto)) errores.push("El concepto es obligatorio.");
    if (!isValidNumber(precioFinal, { min: 0, allowNegative: false }))
      errores.push("Precio inválido.");
    if (errores.length > 0) {
      UI.showFormErrors("producto-form", errores);
      return;
    }
    UI.clearFormErrors("producto-form");
    const nPrecioFinal = Math.round(parseFloat(precioFinal));
    const trabajo = {
      id: `trabajo-${Date.now()}`,
      concepto,
      cantidad: 1,
      precioUnidad: nPrecioFinal,
      total: nPrecioFinal,
    };
    State.addTempTrabajo(trabajo);
    UI.renderTemporaryItems(State.getCurrentPresupuesto());
    if (conceptoEl) conceptoEl.value = "";
    if (precioEl) precioEl.value = "";
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
    handleShowView("presupuestos-view");
    M.AutoInit(); // Inicializa la mayoría de los componentes de Materialize
  }

  init();

  // Recalcular tempNeumaticos al cambiar parámetros comunes
  const medidaEl = document.getElementById("presupuesto-medida");
  const cantidadEl = document.getElementById("presupuesto-cantidad");
  const gananciaEl = document.getElementById("presupuesto-ganancia");
  const ecotasaEl = document.getElementById("presupuesto-ecotasa");
  const ivaEl = document.getElementById("presupuesto-iva");
  const inputsParams = [medidaEl, cantidadEl, gananciaEl, ecotasaEl, ivaEl].filter(Boolean);
  if (inputsParams.length) {
    const handler = async () => {
      State.updateTempNeumaticosParams({
        medida: medidaEl?.value,
        cantidad: cantidadEl?.value,
        ganancia: gananciaEl?.value,
        ecotasa: ecotasaEl?.value,
        iva: ivaEl?.value,
      });
      State.updateGroupsWithParams({
        medida: medidaEl?.value,
        cantidad: cantidadEl?.value,
        ganancia: gananciaEl?.value,
        ecotasa: ecotasaEl?.value,
        iva: ivaEl?.value,
      });
      State.calculateTotalGeneral();
      UI.renderTemporaryItems(State.getCurrentPresupuesto());
      UI.renderPresupuestoFinal(State.getCurrentPresupuesto());
      // Cargar precios por medida y mostrar chips
      try {
        const list = medidaEl?.value ? await API.getPreciosPorMedida(medidaEl.value) : [];
        const cont = document.getElementById("precios-por-medida");
        const contFiltros = document.getElementById("precios-filtros-codigo");
        if (cont) {
          cont.innerHTML = "";
          if (!list || !list.length) {
            cont.textContent = medidaEl?.value ? "Sin precios guardados para esta medida" : "";
          } else {
            // Construir filtros por código (lo que va tras la base) ej: 91V, 94W...
            const codigos = new Set();
            const re = /(\d{3})\/(\d{2})\/?R?(\d{2})\s+(.+)$/i;
            list.forEach(({ medida }) => {
              const m = String(medida || "").toUpperCase();
              const mm = m.match(re);
              if (mm && mm[4]) {
                const code = mm[4].trim();
                if (code) codigos.add(code);
              }
            });
            let filtroActivo = null;
            // Render filtros
            if (contFiltros) {
              contFiltros.innerHTML = "";
              if (codigos.size) {
                // Botón limpiar
                const clear = document.createElement("a");
                clear.href = "#!";
                clear.className = "chip grey lighten-3";
                clear.textContent = "Todos";
                clear.addEventListener("click", (e) => {
                  e.preventDefault();
                  filtroActivo = null;
                  renderLista();
                });
                contFiltros.appendChild(clear);
                [...codigos].sort().forEach((code) => {
                  const chip = document.createElement("a");
                  chip.href = "#!";
                  chip.className = "chip";
                  chip.textContent = code;
                  chip.addEventListener("click", (e) => {
                    e.preventDefault();
                    filtroActivo = code;
                    renderLista();
                  });
                  contFiltros.appendChild(chip);
                });
              }
            }

            function coincideFiltro(item) {
              if (!filtroActivo) return true;
              const m = String(item.medida || "").toUpperCase();
              return m.endsWith(filtroActivo.toUpperCase());
            }

            function renderLista() {
              cont.innerHTML = "";
              const filtered = list.filter(coincideFiltro);
              filtered.forEach(({ marca, neto, medida }) => {
                const a = document.createElement("a");
                a.href = "#!";
                a.className = "chip";
                a.textContent = `${medida} · ${marca} — ${neto}`;
                a.title = "Click para rellenar";
                a.addEventListener("click", (e) => {
                  e.preventDefault();
                  const marcaInp = document.getElementById("presupuesto-marca-temp");
                  const netoInp = document.getElementById("presupuesto-neto-temp");
                  if (marcaInp) marcaInp.value = marca;
                  if (netoInp) netoInp.value = neto;
                  if (window.M) M.updateTextFields();

                  // 🔥 AGREGADO: Auto-añadir después de llenar campos (igual que en onClickMarca)
                  showToast(`Marca seleccionada: ${marca}`, "success");

                  // Auto-añadir la marca si todos los campos están completos
                  setTimeout(() => {
                    console.log("🔥 [AUTO-ADD] INICIANDO AUTO-ADD PARA MARCA:", marca);

                    const medida =
                      document.getElementById("presupuesto-medida")?.value?.trim() ?? "";
                    const cantidad =
                      document.getElementById("presupuesto-cantidad")?.value?.trim() ?? "";
                    const ganancia =
                      document.getElementById("presupuesto-ganancia")?.value?.trim() ?? "";
                    const ecotasa =
                      document.getElementById("presupuesto-ecotasa")?.value?.trim() ?? "0"; // puede no existir en diseño compacto
                    const iva = document.getElementById("presupuesto-iva")?.value?.trim() ?? "0";
                    const neto =
                      document.getElementById("presupuesto-neto-temp")?.value?.trim() ?? "";

                    // Debug SUPER detallado
                    console.log("🔍 [AUTO-ADD] VALORES CAPTURADOS:");
                    console.log("  Medida:", `"${medida}"`, medida ? "✅" : "❌ VACÍO");
                    console.log("  Cantidad:", `"${cantidad}"`, cantidad ? "✅" : "❌ VACÍO");
                    console.log("  Marca:", `"${marca}"`, marca ? "✅" : "❌ VACÍO");
                    console.log("  Neto:", `"${neto}"`, neto ? "✅" : "❌ VACÍO");
                    console.log(
                      "  Ganancia:",
                      `"${ganancia}"`,
                      ganancia ? "⚠️" : "❌ VACÍO (opcional)"
                    );
                    console.log(
                      "  Ecotasa:",
                      `"${ecotasa}"`,
                      ecotasa ? "⚠️" : "❌ VACÍO (opcional)"
                    );
                    console.log("  IVA:", `"${iva}"`, iva ? "⚠️" : "❌ VACÍO (opcional)");

                    // Verificar que todos los campos requeridos están completos (SIMPLIFICADO - solo 4 campos esenciales)
                    const validaciones = {
                      medida: isNotEmpty(medida),
                      cantidad: isValidNumber(cantidad, { min: 1, allowNegative: false }),
                      marca: isNotEmpty(marca),
                      neto: isValidNumber(neto, { min: 0, allowNegative: false }),
                    };

                    console.log("🔍 [AUTO-ADD] VALIDACIONES DETALLADAS (4 campos esenciales):");
                    Object.keys(validaciones).forEach((campo) => {
                      const status = validaciones[campo] ? "✅ VÁLIDO" : "❌ INVÁLIDO";
                      console.log(`  ${campo}: ${status}`);
                    });

                    const todasValidas = Object.values(validaciones).every((v) => v);
                    console.log(
                      "🎯 [AUTO-ADD] RESULTADO VALIDACIÓN:",
                      todasValidas ? "✅ TODAS VÁLIDAS" : "❌ FALTAN CAMPOS"
                    );

                    if (todasValidas) {
                      // Simular click en el botón "Añadir Marca" en lugar de llamar directamente a la función
                      const btnAddMarca = document.getElementById("btnAgregarMarca");
                      if (btnAddMarca) {
                        console.log("🚀 [AUTO-ADD] EJECUTANDO CLICK AUTOMÁTICO EN BOTÓN...");
                        console.log("🔘 [AUTO-ADD] Estado del botón antes del click:");
                        console.log("  Disabled:", btnAddMarca.disabled);
                        console.log("  Visible:", btnAddMarca.style.display !== "none");
                        console.log("  Texto:", btnAddMarca.textContent);

                        btnAddMarca.click();

                        console.log(
                          "✅ [AUTO-ADD] CLICK EJECUTADO - Marca añadida automáticamente!"
                        );
                        showToast(`¡Marca ${marca} añadida automáticamente!`, "success");
                      } else {
                        console.log(
                          "❌ [AUTO-ADD] ERROR: Botón 'Añadir Marca' no encontrado en DOM"
                        );
                      }
                    } else {
                      const erroresDetallados = [];
                      if (!validaciones.medida) erroresDetallados.push("Medida vacía");
                      if (!validaciones.cantidad)
                        erroresDetallados.push("Cantidad inválida (min: 1)");
                      if (!validaciones.marca) erroresDetallados.push("Marca vacía");
                      if (!validaciones.neto) erroresDetallados.push("Neto inválido (min: 0)");

                      console.log(
                        "❌ [AUTO-ADD] VALIDACIÓN FALLÓ. Errores:",
                        erroresDetallados.join(", ")
                      );
                      showToast(
                        `⚠️ Para auto-add faltan: ${erroresDetallados.join(", ")}`,
                        "warning"
                      );
                    }
                  }, 1000); // Aumenté el timeout a 1 segundo para dar tiempo a que se llene el precio
                });
                cont.appendChild(a);
              });
              if (!filtered.length) {
                const p = document.createElement("span");
                p.textContent = "No hay resultados para ese código";
                cont.appendChild(p);
              }
            }

            renderLista();
          }
        }
      } catch (_err) {
        // silencioso
      }
    };
    inputsParams.forEach((inp) => {
      inp.addEventListener("input", handler);
      inp.addEventListener("change", handler);
    });
    // Ejecutar una vez al iniciar por si ya hay medida cargada
    handler();
  }

  // Panel de conexión: ping periódico a /health
  const connDot = document.getElementById("connDot");
  const connText = document.getElementById("connText");
  async function pingHealth() {
    try {
      const res = await fetch("/health", { cache: "no-store" });
      if (res.ok) {
        connDot?.classList.add("status-ok");
        connDot?.classList.remove("status-bad");
        if (connText) connText.textContent = "Conectado";
      } else {
        throw new Error("bad");
      }
    } catch (_) {
      connDot?.classList.add("status-bad");
      connDot?.classList.remove("status-ok");
      if (connText) connText.textContent = "Sin conexión";
    }
  }
  pingHealth();
  setInterval(pingHealth, 10000);

  // Botón copiar URL del host
  const btnCopyHostURL = document.getElementById("btnCopyHostURL");
  if (btnCopyHostURL) {
    btnCopyHostURL.addEventListener("click", async () => {
      try {
        const url = window.location.origin;
        await navigator.clipboard.writeText(url);
        M.toast({ html: `Enlace copiado: ${url}`, classes: "green" });
      } catch (_e) {
        M.toast({ html: "No se pudo copiar el enlace.", classes: "red" });
      }
    });
  }

  // ====== Pedidos ======
  let pedidosFiltros = { q: "", proveedor: "", estado: "", desde: "", hasta: "" };
  const pedidosPaginacion = { page: 1, per_page: 25 };

  // Función para traducir estados de pedidos
  function traducirEstadoPedido(status) {
    const traducciones = {
      pending: "Pendiente de pedir",
      ordered: "Pedido confirmado",
      received: "Recibido",
    };
    return traducciones[status] || status;
  }

  // Función para formatear fechas
  function formatearFecha(fechaISO) {
    if (!fechaISO) return "";
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const año = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${año} ${horas}:${minutos}`;
  }

  // Función para crear historial de estados
  function crearHistorialEstados(pedido) {
    const historial = [];

    // Creado
    if (pedido.created_at) {
      historial.push(`📝 Creado: ${formatearFecha(pedido.created_at)}`);
    }

    // Confirmado
    if (pedido.confirmed_at) {
      historial.push(`✅ Confirmado: ${formatearFecha(pedido.confirmed_at)}`);
    }

    // Recibido
    if (pedido.received_at) {
      historial.push(`📦 Recibido: ${formatearFecha(pedido.received_at)}`);
    }

    return historial.join("<br>");
  }

  // Función para mostrar estado de carga en pedidos
  function mostrarCargandoPedidos() {
    const ul = document.getElementById("pedidos-lista");
    if (ul) {
      ul.innerHTML = `
        <li class="collection-item">
          <div class="pedidos-loading">
            <div class="preloader-wrapper small active">
              <div class="spinner-layer spinner-blue">
                <div class="circle-clipper left">
                  <div class="circle"></div>
                </div>
                <div class="gap-patch">
                  <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                  <div class="circle"></div>
                </div>
              </div>
            </div>
            <p style="margin-top: 16px;">Cargando pedidos...</p>
          </div>
        </li>
      `;
    }
  }

  function renderPedidosLista(data) {
    console.log("[DEBUG] renderPedidosLista data:", data);
    const ul = document.getElementById("pedidos-lista");
    if (!ul) {
      console.error("[DEBUG] Element 'pedidos-lista' not found!");
      return;
    }

    ul.innerHTML = "";

    // Si no hay pedidos
    if (!data.pedidos || data.pedidos.length === 0) {
      ul.innerHTML = `
        <li class="collection-item">
          <div class="pedidos-empty">
            <i class="material-icons">inbox</i>
            <h5>No hay pedidos</h5>
            <p>No se encontraron pedidos que coincidan con los filtros aplicados.</p>
          </div>
        </li>
      `;
      return;
    }

    (data.pedidos || []).forEach((p, index) => {
      console.log(`[DEBUG] Pedido ${index}:`, {
        id: p.id,
        medida: p.medida,
        presupuesto_numero: p.presupuesto_numero,
        cliente_nombre: p.cliente_nombre,
        presupuesto_id: p.presupuesto_id,
        presupuesto: p.presupuesto,
      });
      const li = document.createElement("li");
      li.className = "collection-item";

      // Crear estructura mejorada
      li.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
          <div style="flex: 1; min-width: 300px;">
            <div class="pedido-header">
              <span class="pedido-medida">${p.medida || "(sin medida)"}</span>
              ${p.marca ? `<span class="pedido-marca">${p.marca}</span>` : ""}
              <span class="pedido-unidades">x${p.unidades}</span>
              ${p.proveedor ? `<span class="pedido-proveedor">${p.proveedor}</span>` : ""}
            </div>

            <div class="pedido-status-badge">
              <span class="new badge pedido-${p.status}" data-badge-caption="${traducirEstadoPedido(p.status)}"></span>
            </div>

            ${p.descripcion ? `<div class="pedido-descripcion">"${p.descripcion}"</div>` : ""}

            <div class="pedido-fechas">
              ${crearHistorialEstados(p)}
            </div>

            ${(() => {
              const numero = p.presupuesto_numero || p.presupuesto?.numero;
              const presupuestoId = p.presupuesto_id || p.presupuesto?.id;
              const cNombre = p.cliente_nombre || p.presupuesto?.cliente?.nombre;
              const cTel = p.cliente_telefono || p.presupuesto?.cliente?.telefono;
              const distribuidor = p.presupuesto?.vista_interna?.distribuidor;
              const descripcionPresup = p.presupuesto?.vista_interna?.descripcion;

              console.log(`[DEBUG] Pedido ${p.id} render data:`, {
                numero,
                presupuestoId,
                cNombre,
                cTel,
                distribuidor,
                descripcionPresup,
              });

              if (numero || cNombre || cTel) {
                let infoCliente = "";
                if (cNombre) infoCliente += `👤 ${cNombre}`;
                if (cTel) infoCliente += ` 📞 ${cTel}`;

                let infoExtra = "";
                if (distribuidor) infoExtra += `<br>🏪 Distribuidor: ${distribuidor}`;
                if (descripcionPresup) infoExtra += `<br>📝 ${descripcionPresup}`;

                if (presupuestoId) {
                  return `<div class="pedido-presupuesto">
                    📋 Presupuesto: <a href="#!" class="link-cargar-presupuesto" data-presupuesto-id="${presupuestoId}">#${numero || "—"}</a><br>
                    ${infoCliente}${infoExtra}
                  </div>`;
                }
                return `<div class="pedido-presupuesto">
                  📋 Presupuesto: #${numero || "—"}<br>
                  ${infoCliente}${infoExtra}
                </div>`;
              }
              return `<div class="pedido-presupuesto" style="background: #ffebee; border-left-color: #f44336;">
                ⚠️ Presupuesto: (no vinculado)
              </div>`;
            })()}
          </div>

          <div class="pedido-actions">
            <a href="#!" class="btn-small orange ped-toggle-confirm tooltipped" data-id="${p.id}" data-tooltip="Confirmar / Deshacer">
              <i class="material-icons">assignment_turned_in</i>
            </a>
            <a href="#!" class="btn-small teal ped-toggle-recibir tooltipped" data-id="${p.id}" data-tooltip="Recibido / Deshacer">
              <i class="material-icons">inventory_2</i>
            </a>
            <a href="#!" class="btn-small blue ped-editar tooltipped" data-id="${p.id}" data-tooltip="Editar">
              <i class="material-icons">edit</i>
            </a>
            <a href="#!" class="btn-small red ped-borrar tooltipped" data-id="${p.id}" data-tooltip="Borrar">
              <i class="material-icons">delete</i>
            </a>
          </div>
        </div>`;
      ul.appendChild(li);
    });

    // Inicializar tooltips para los botones de acción
    setTimeout(() => {
      M.Tooltip.init(document.querySelectorAll(".tooltipped"));
    }, 100);

    renderPedidosPaginacion(data);
  }

  function renderPedidosPaginacion(data) {
    const cont = document.getElementById("pedidos-paginacion");
    if (!cont) return;
    cont.innerHTML = "";
    if (!data.pages || data.pages <= 1) return;
    for (let p = 1; p <= data.pages; p++) {
      const a = document.createElement("a");
      a.href = "#!";
      a.textContent = p;
      a.dataset.page = p;
      a.className = "page-link btn-flat" + (p === data.current_page ? " purple-text" : "");
      a.addEventListener("click", (e) => {
        e.preventDefault();
        pedidosPaginacion.page = p;
        handleFetchPedidos();
      });
      cont.appendChild(a);
    }
  }

  async function handleFetchPedidos() {
    try {
      // Mostrar indicador de carga
      mostrarCargandoPedidos();

      const params = {
        page: pedidosPaginacion.page,
        per_page: pedidosPaginacion.per_page,
        ...pedidosFiltros,
      };
      const data = await API.fetchPedidos(params);
      renderPedidosLista(data);
    } catch (e) {
      M.toast({ html: `Error cargando pedidos: ${e.message || e}`, classes: "red" });
      // En caso de error, mostrar mensaje de error en lugar de carga
      const ul = document.getElementById("pedidos-lista");
      if (ul) {
        ul.innerHTML = `
          <li class="collection-item">
            <div class="pedidos-empty">
              <i class="material-icons" style="color: #f44336;">error</i>
              <h5>Error al cargar pedidos</h5>
              <p>${e.message || e}</p>
            </div>
          </li>
        `;
      }
    }
  }

  function abrirDialogoNuevoPedido() {
    let vinculoInfo = "";
    try {
      const pActual = State.getCurrentPresupuesto?.();
      if (pActual && pActual.id) {
        vinculoInfo = `<div class='col s12'><small class='green-text'>Se vinculará al presupuesto #${pActual.numero || pActual.id}</small></div>`;
      } else {
        vinculoInfo = `<div class='col s12'><small class='grey-text'>No hay presupuesto cargado guardado (se creará sin vincular). Guarda primero el presupuesto si quieres asociarlo.</small></div>`;
      }
    } catch (_) {
      /* ignore */
    }
    const html = `
      <div class="row" style="margin-bottom:0;">
        <div class="input-field col s4"><input id="ped-nuevo-medida" type="text"><label for="ped-nuevo-medida">Medida</label></div>
        <div class="input-field col s4"><input id="ped-nuevo-marca" type="text"><label for="ped-nuevo-marca">Marca</label></div>
        <div class="input-field col s4"><input id="ped-nuevo-unidades" type="number" value="2"><label for="ped-nuevo-unidades" class="active">Unidades</label></div>
        ${vinculoInfo}
      </div>
      <div class="row" style="margin-bottom:0;">
        <div class="input-field col s4"><input id="ped-nuevo-proveedor" type="text"><label for="ped-nuevo-proveedor">Proveedor</label></div>
        <div class="input-field col s8"><input id="ped-nuevo-descripcion" type="text"><label for="ped-nuevo-descripcion">Descripción</label></div>
      </div>
      <div class="row" style="margin-bottom:0;">
        <div class="input-field col s12"><textarea id="ped-nuevo-notas" class="materialize-textarea"></textarea><label for="ped-nuevo-notas">Notas</label></div>
      </div>`;
    showConfirmModal("Nuevo Pedido", html, async () => {
      const payload = {
        medida: gv("ped-nuevo-medida"),
        marca: gv("ped-nuevo-marca"),
        unidades: gv("ped-nuevo-unidades", 1) || 1,
        proveedor: gv("ped-nuevo-proveedor"),
        descripcion: gv("ped-nuevo-descripcion"),
        notas: gv("ped-nuevo-notas"),
      };
      // Si hay un presupuesto cargado en memoria lo vinculamos automáticamente
      try {
        const pActual = State.getCurrentPresupuesto?.();
        if (pActual && pActual.id) {
          payload.presupuesto_id = pActual.id;
          payload.linea_ref = "manual";
        }
      } catch (_) {
        /* silencioso */
      }
      console.log("[DEBUG crearPedido] payload", payload);
      try {
        await API.crearPedido(payload);
        M.toast({ html: "Pedido creado", classes: "green" });
        handleFetchPedidos();
      } catch (e) {
        M.toast({ html: `Error: ${e.message || e}`, classes: "red" });
      }
    });
  }

  function abrirDialogoEditarPedido(p) {
    const html = `
      <div class="row" style="margin-bottom:0;">
        <div class="input-field col s4"><input id="ped-edit-medida" type="text" value="${
          p.medida || ""
        }"><label class="active" for="ped-edit-medida">Medida</label></div>
        <div class="input-field col s4"><input id="ped-edit-marca" type="text" value="${
          p.marca || ""
        }"><label class="active" for="ped-edit-marca">Marca</label></div>
        <div class="input-field col s4"><input id="ped-edit-unidades" type="number" value="${
          p.unidades || 1
        }"><label class="active" for="ped-edit-unidades">Unidades</label></div>
      </div>
      <div class="row" style="margin-bottom:0;">
        <div class="input-field col s4"><input id="ped-edit-proveedor" type="text" value="${
          p.proveedor || ""
        }"><label class="active" for="ped-edit-proveedor">Proveedor</label></div>
        <div class="input-field col s8"><input id="ped-edit-descripcion" type="text" value="${
          p.descripcion || ""
        }"><label class="active" for="ped-edit-descripcion">Descripción</label></div>
      </div>
      <div class="row" style="margin-bottom:0;">
        <div class="input-field col s12"><textarea id="ped-edit-notas" class="materialize-textarea">${
          p.notas || ""
        }</textarea><label class="active" for="ped-edit-notas">Notas</label></div>
      </div>`;
    showConfirmModal("Editar Pedido", html, async () => {
      const payload = {
        medida: gv("ped-edit-medida"),
        marca: gv("ped-edit-marca"),
        unidades: gv("ped-edit-unidades", 1) || 1,
        proveedor: gv("ped-edit-proveedor"),
        descripcion: gv("ped-edit-descripcion"),
        notas: gv("ped-edit-notas"),
      };
      try {
        await API.editarPedido(p.id, payload);
        M.toast({ html: "Pedido actualizado", classes: "green" });
        handleFetchPedidos();
      } catch (e) {
        M.toast({ html: `Error: ${e.message || e}`, classes: "red" });
      }
    });
  }

  // Listeners Pedidos (delegación)
  document.body.addEventListener("click", async (e) => {
    const target = e.target;
    const linkPresu = target.closest(".link-cargar-presupuesto");
    const pedAction = target.closest(
      ".ped-toggle-confirm, .ped-toggle-recibir, .ped-editar, .ped-borrar"
    );

    if (linkPresu) {
      e.preventDefault();
      const presupuestoId = linkPresu.dataset.presupuestoId;
      if (presupuestoId) {
        await handleLoadPresupuestoForEdit(presupuestoId);
      }
      return;
    }

    if (!pedAction) return;
    const id = pedAction.dataset.id;
    if (!id) return;

    if (pedAction.classList.contains("ped-toggle-confirm")) {
      try {
        await API.toggleConfirmado(id);
        handleFetchPedidos();
      } catch (e2) {
        M.toast({ html: `Error: ${e2.message || e2}`, classes: "red" });
      }
    } else if (pedAction.classList.contains("ped-toggle-recibir")) {
      try {
        await API.toggleRecibido(id);
        handleFetchPedidos();
      } catch (e2) {
        const msg = String(e2?.message || e2 || "");
        if (msg.includes("HTTP 409") || msg.toLowerCase().includes("conflict")) {
          M.toast({
            html: "Primero confirma el pedido antes de marcarlo como recibido (estado requerido).",
            classes: "orange",
          });
        } else {
          M.toast({ html: `Error: ${msg}`, classes: "red" });
        }
      }
    } else if (pedAction.classList.contains("ped-editar")) {
      try {
        const pedido = await API.fetchPedidoById(id);
        if (pedido) {
          abrirDialogoEditarPedido(pedido);
        } else {
          M.toast({ html: "No se encontraron datos para el pedido.", classes: "red" });
        }
      } catch (e) {
        M.toast({ html: `Error al cargar el pedido: ${e.message || e}`, classes: "red" });
      }
    } else if (pedAction.classList.contains("ped-borrar")) {
      showConfirmModal("Borrar Pedido", "¿Seguro que deseas borrar el pedido?", async () => {
        try {
          await API.borrarPedido(id);
          M.toast({ html: "Pedido borrado", classes: "green" });
          handleFetchPedidos();
        } catch (e3) {
          M.toast({ html: `Error: ${e3.message || e3}`, classes: "red" });
        }
      });
    }
  });

  // Botones barra y filtros pedidos
  document
    .getElementById("btnVerPedidos")
    ?.addEventListener("click", () => handleShowView("pedidos-view"));
  document
    .getElementById("ped-btn-volver")
    ?.addEventListener("click", () => handleShowView("presupuestos-view"));
  document.getElementById("ped-btn-nuevo")?.addEventListener("click", abrirDialogoNuevoPedido);
  document.getElementById("ped-btn-filtrar")?.addEventListener("click", () => {
    pedidosFiltros = {
      q: gv("ped-filtro-texto"),
      proveedor: gv("ped-filtro-proveedor"),
      estado: gv("ped-filtro-estado"),
      desde: gv("ped-filtro-desde"),
      hasta: gv("ped-filtro-hasta"),
    };
    pedidosPaginacion.page = 1;
    handleFetchPedidos();
  });
  document.getElementById("ped-btn-limpiar")?.addEventListener("click", () => {
    [
      "ped-filtro-texto",
      "ped-filtro-proveedor",
      "ped-filtro-estado",
      "ped-filtro-desde",
      "ped-filtro-hasta",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const sel = document.getElementById("ped-filtro-estado");
    if (sel) sel.value = "";
    if (window.M) M.FormSelect.init(sel);
    pedidosFiltros = { q: "", proveedor: "", estado: "", desde: "", hasta: "" };
    pedidosPaginacion.page = 1;
    handleFetchPedidos();
  });

  // Inicializar select estado si materialize cargado
  const selectEstado = document.getElementById("ped-filtro-estado");
  if (selectEstado && window.M && M.FormSelect) M.FormSelect.init(selectEstado);

  // Test simple para verificar auto-add
  console.log("🧪 INICIANDO TEST AUTO-ADD");

  // Función para test manual en consola del navegador
  function testAutoAdd() {
    console.log("=== TEST AUTO-ADD ===");

    // 1. Verificar que todos los elementos existen
    const elementos = {
      medida: document.getElementById("presupuesto-medida"),
      cantidad: document.getElementById("presupuesto-cantidad"),
      marca: document.getElementById("presupuesto-marca-temp"),
      neto: document.getElementById("presupuesto-neto-temp"),
      ganancia: document.getElementById("presupuesto-ganancia"),
      ecotasa: document.getElementById("presupuesto-ecotasa"),
      iva: document.getElementById("presupuesto-iva"),
      btnAgregarMarca: document.getElementById("btnAgregarMarca"),
    };

    console.log("📋 ELEMENTOS EN DOM:");
    Object.keys(elementos).forEach((key) => {
      console.log(`  ${key}:`, elementos[key] ? "✅ Existe" : "❌ NO EXISTE");
    });

    // 2. Verificar valores actuales
    console.log("\n📊 VALORES ACTUALES:");
    Object.keys(elementos).forEach((key) => {
      if (elementos[key] && key !== "btnAgregarMarca") {
        console.log(`  ${key}:`, elementos[key].value || "(vacío)");
      }
    });

    // 3. Verificar estado del botón
    const btn = elementos.btnAgregarMarca;
    if (btn) {
      console.log("\n🔘 ESTADO BOTÓN:");
      console.log("  Existe:", !!btn);
      console.log("  Disabled:", btn.disabled);
      console.log("  Visible:", btn.style.display !== "none");
      console.log("  Texto:", btn.textContent);
    }

    // 4. Simular click en marca
    console.log("\n🖱️ SIMULANDO CLICK EN MARCA 'MICHELIN':");

    // Llenar campos básicos para test
    if (elementos.medida) elementos.medida.value = "175/65 R14";
    if (elementos.cantidad) elementos.cantidad.value = "2";
    if (elementos.neto) elementos.neto.value = "45.50";
    if (elementos.marca) elementos.marca.value = "MICHELIN";

    // Actualizar Materialize
    if (window.M) M.updateTextFields();

    console.log("✅ Campos llenados para test");

    // Verificar validación
    setTimeout(() => {
      console.log("\n🔍 VERIFICANDO VALIDACIÓN:");
      const medida = elementos.medida?.value.trim();
      const cantidad = elementos.cantidad?.value.trim();
      const marca = elementos.marca?.value.trim();
      const neto = elementos.neto?.value.trim();
      const ganancia = elementos.ganancia?.value.trim();
      const ecotasa = elementos.ecotasa?.value.trim();
      const iva = elementos.iva?.value.trim();

      console.log("Valores después del llenado:");
      console.log("  medida:", medida || "(vacío)");
      console.log("  cantidad:", cantidad || "(vacío)");
      console.log("  marca:", marca || "(vacío)");
      console.log("  neto:", neto || "(vacío)");
      console.log("  ganancia:", ganancia || "(vacío)");
      console.log("  ecotasa:", ecotasa || "(vacío)");
      console.log("  iva:", iva || "(vacío)");

      // Test validación básica (4 campos)
      const validacionBasica = medida && cantidad && marca && neto;
      console.log("\n📝 VALIDACIÓN BÁSICA (4 campos):", validacionBasica ? "✅ PASS" : "❌ FAIL");

      // Test validación completa (7 campos)
      const validacionCompleta = medida && cantidad && marca && neto && ganancia && ecotasa && iva;
      console.log("📝 VALIDACIÓN COMPLETA (7 campos):", validacionCompleta ? "✅ PASS" : "❌ FAIL");

      // Test click manual del botón
      if (btn && !btn.disabled) {
        console.log("\n🖱️ SIMULANDO CLICK MANUAL EN BOTÓN:");
        btn.click();
      } else {
        console.log("\n❌ BOTÓN NO DISPONIBLE PARA CLICK");
      }
    }, 500);
  }

  // Exponer función globalmente para usar en consola
  window.testAutoAdd = testAutoAdd;

  console.log("✅ Test cargado. Ejecuta testAutoAdd() en la consola del navegador");
});
