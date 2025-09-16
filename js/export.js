import { getCurrentPresupuesto, getCurrentEditPresupuestoId } from "./state.js";
import { gruposPorMarca } from "./utils.js";

export function imprimirPresupuesto() {
  window.print();
}

export function generarTextoPresupuesto() {
  const numeroInput = document.getElementById("presupuesto-numeroPresupuesto");
  const fechaInput = document.getElementById("presupuesto-fechaPresupuesto");
  const nombreClienteInput = document.getElementById("presupuesto-nombreCliente");
  const telefonoClienteInput = document.getElementById("presupuesto-telefonoCliente");
  const nifClienteInput = document.getElementById("presupuesto-nifCliente");

  const eur0 = (n) => `${Math.round(Number(n || 0)).toLocaleString("es-ES")} €`;

  let msg = "";
  msg += "───────────────────────────────\n";
  msg += "        NEUMÁTICOS PALMONES\n";
  msg += "  Dirección | Teléfono | Email\n";
  msg += "───────────────────────────────\n\n";
  msg += `Presupuesto Nº ${numeroInput?.value || ""}\n`;
  const fechaES = fechaInput?.value ? new Date(fechaInput.value).toLocaleDateString("es-ES") : "";
  if (fechaES) msg += `Fecha: ${fechaES}\n`;
  if (nombreClienteInput?.value || telefonoClienteInput?.value || nifClienteInput?.value) {
    msg += `Cliente: ${nombreClienteInput?.value || "-"}\n`;
    if (telefonoClienteInput?.value) msg += `Teléfono: ${telefonoClienteInput.value}\n`;
    if (nifClienteInput?.value) msg += `NIF/CIF: ${nifClienteInput.value}\n`;
    msg += "\n";
  }
  msg += "PRESUPUESTO\n\n";
  msg += "Medida        Marca / Concepto     Ud.   P.Unit     Total\n";
  msg += "----------------------------------------------------------\n";

  const presupuesto = getCurrentPresupuesto();
  const grupos = gruposPorMarca(presupuesto.grupos || []);

  grupos.forEach((grupo, idx) => {
    let totalGrupo = 0;
    const n0 = grupo.neumaticos && grupo.neumaticos[0] ? grupo.neumaticos[0] : null;
    const medida = (n0?.medida || "").padEnd(13);
    const marcaTxt = (n0?.nombre || `Opción ${idx + 1}`).padEnd(20);

    if (n0) {
      totalGrupo += Number(n0.total || 0);
      const lineaN = `${medida}${marcaTxt}${String(n0.cantidad).padEnd(
        5
      )}${eur0(n0.precioUnidad).padEnd(10)}${eur0(n0.total)}\n`;
      msg += lineaN;
    }

    (grupo.otrosTrabajos || []).forEach((t) => {
      totalGrupo += Number(t.total || 0);
      const concepto = (t.concepto || "").padEnd(20);
      const lineaT = `${" ".repeat(13)}${concepto}${String(t.cantidad).padEnd(
        5
      )}${eur0(t.precioUnidad).padEnd(10)}${eur0(t.total)}\n`;
      msg += lineaT;
    });

    msg += "----------------------------------------------------------\n";
    const etiqueta = n0 ? `Total ${n0.nombre || `Opción ${idx + 1}`}` : "Subtotal trabajos";
    msg += `${etiqueta}: `.padEnd(44) + `${eur0(totalGrupo)}\n\n`;
  });

  return msg.trimEnd();
}

// Genera el texto detallado para Calendar (cita)
export function generarTextoDetalladoCalendar(opciones = {}) {
  const p = getCurrentPresupuesto();
  const eur0 = (n) => `${Math.round(Number(n || 0)).toLocaleString("es-ES")}€`;

  const numero = document.getElementById("presupuesto-numeroPresupuesto")?.value || "";
  const fechaP = document.getElementById("presupuesto-fechaPresupuesto")?.value || "";
  const _fechaES = fechaP ? new Date(fechaP).toLocaleDateString("es-ES") : "";
  const nombre = document.getElementById("presupuesto-nombreCliente")?.value || "";
  const telefono = document.getElementById("presupuesto-telefonoCliente")?.value || "";

  const grupos = gruposPorMarca(p.grupos || []);
  const g0 = grupos[0];
  const n0 = g0?.neumaticos?.[0];
  const medida = g0?.medida || n0?.medida || "";
  const cantidad = g0?.cantidad || n0?.cantidad || "";
  const marca = n0?.nombre || "";
  const _pu = n0 ? eur0(n0.precioUnidad) : "";
  const _totalGrupo = g0 ? eur0(g0.totalGrupo) : "";
  const totalGeneral = eur0(p.totalGeneral || 0);

  // Campos añadidos al presupuesto
  const proveedor = (
    document.getElementById("presupuesto-distribuidor")?.value ||
    opciones.proveedor ||
    document.getElementById("calendar-proveedor")?.value ||
    ""
  ).trim();
  const descripcion = (document.getElementById("presupuesto-descripcion")?.value || "").trim();
  const observaciones = (document.getElementById("presupuesto-observaciones")?.value || "").trim();
  // Opcionales extra
  const _porte = opciones.porte ?? document.getElementById("calendar-porte")?.value;

  // Detalle de trabajos
  const trabajos = (g0?.otrosTrabajos || []).map((t) => `${t.concepto} ${eur0(t.total)}`).join(" ");
  const puNum = n0 ? Math.round(Number(n0.precioUnidad || 0)) : 0;
  // Subtotal de neumáticos: precio/ud * cantidad del neumático elegido
  const subtotalNeumaticosNum = n0 ? Math.round(Number(n0.total || 0)) : 0;
  const tituloBase = `${cantidad ? cantidad + "–" : ""}${medida} ${
    marca ? marca + " " : ""
  }· PU ${puNum}-${subtotalNeumaticosNum}€${
    trabajos ? " " + trabajos : ""
  } total ${totalGeneral} Cliente: ${nombre}${
    telefono ? " · Tel: " + telefono : ""
  } Nº Presupuesto: ${numero}`
    .replace(/\s+/g, " ")
    .trim();
  const titulo = observaciones ? `***${tituloBase}` : tituloBase;

  // Descripción simplificada: solo lo que pides
  const detalle = [
    proveedor ? `Distribuidor: ${proveedor}` : null,
    observaciones ? `Observaciones: ${observaciones}` : null,
    descripcion ? `Descripción: ${descripcion}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return { titulo, lineCompact: titulo, detalle };
}

export function copiarParaCalendar() {
  const { lineCompact, detalle } = generarTextoDetalladoCalendar();
  const texto = `${lineCompact}\n\n${detalle}`;
  navigator.clipboard
    .writeText(texto)
    .then(() => {
      M.toast({ html: "Texto copiado para Calendar", classes: "green" });
    })
    .catch((err) => {
      const toastId = "toast-error-" + Date.now();
      const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
      const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
      M.toast({
        html: `<span id='${toastId}' style='white-space:pre-line;'>No se pudo copiar: ${
          err?.message || err
        }</span>${copyBtn}${closeBtn}`,
        classes: "red",
        displayLength: Infinity,
      });
    });
}

export function abrirEnCalendar() {
  const { titulo, detalle } = generarTextoDetalladoCalendar();
  // Fechas
  const fechaStr = document.getElementById("calendar-fecha")?.value || "";
  const horaStr = document.getElementById("calendar-hora")?.value || "";
  const durMin = parseInt(document.getElementById("calendar-duracion")?.value || "60", 10);

  let start = new Date();
  if (fechaStr) {
    const [y, m, d] = fechaStr.split("-").map(Number);
    if (horaStr) {
      const [hh, mm] = horaStr.split(":").map(Number);
      start = new Date(y, m - 1, d, hh, mm, 0);
    } else {
      start = new Date(y, m - 1, d, 10, 0, 0);
    }
  } else {
    // por defecto, en 1 hora desde ahora
    start.setMinutes(start.getMinutes() + 60);
  }
  const end = new Date(start.getTime() + (isNaN(durMin) ? 60 : durMin) * 60000);

  const fmt = (dt) => {
    const pad = (n) => String(n).padStart(2, "0");
    const y = dt.getFullYear();
    const m = pad(dt.getMonth() + 1);
    const d = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const mm = pad(dt.getMinutes());
    const ss = pad(dt.getSeconds());
    return `${y}${m}${d}T${hh}${mm}${ss}`;
  };

  const dates = `${fmt(start)}/${fmt(end)}`;
  const location = "";

  // Abrir ventana de forma sincrónica para evitar bloqueos
  let win = null;
  try {
    win = window.open("about:blank", "_blank");
  } catch (_) {
    win = null;
  }

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    titulo
  )}&details=${encodeURIComponent(detalle)}&dates=${encodeURIComponent(dates)}`;
  if (location) {
    url += `&location=${encodeURIComponent(location)}`;
  }
  if (win && !win.closed) {
    win.location.href = url;
  } else {
    window.open(url, "_blank");
  }
}

async function construirNodoA4(opts = {}) {
  const tabla = document.querySelector(".presupuesto-section .budget-table-container");
  if (!tabla) {
    const toastId = "toast-error-" + Date.now();
    const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
    const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
    M.toast({
      html: `<span id='${toastId}' style='white-space:pre-line;'>No hay presupuesto para exportar.</span>${copyBtn}${closeBtn}`,
      classes: "red",
      displayLength: Infinity,
    });
    return null;
  }

  const a4 = document.createElement("div");
  a4.className = "a4-capture";
  // Activar modo compacto si el body lo tiene o si se solicita explícitamente (p.ej. WhatsApp)
  if (document.body.classList.contains("compacto")) a4.classList.add("compacto");
  if (opts.compactWA) a4.classList.add("compacto", "compacto-wa");

  const headerElement = document.querySelector(".business-header-modern") || document.querySelector("header");
  const headerClone = headerElement ? headerElement.cloneNode(true) : null;

  const meta = document.createElement("div");
  meta.className = "meta-line";
  const fechaES = document.getElementById("presupuesto-fechaPresupuesto").value
    ? new Date(document.getElementById("presupuesto-fechaPresupuesto").value).toLocaleDateString(
        "es-ES"
      )
    : "";
  meta.textContent = `Presupuesto Nº ${
    document.getElementById("presupuesto-numeroPresupuesto").value
  }${fechaES ? " — Fecha: " + fechaES : ""}`;

  const title = document.createElement("h2");
  title.className = "a4-title";
  title.textContent = "Presupuesto";

  const tablaClone = tabla.cloneNode(true);
  // Eliminar únicamente la columna de Acciones (celdas con .no-imprimir) del clon antes de capturar,
  // sin tocar filas con celdas combinadas (como el total de grupo)
  try {
    // Quitar cabecera 'Acciones'
    const ths = tablaClone.querySelectorAll("thead th");
    let removedHeader = false;
    ths.forEach((th) => {
      if (
        !removedHeader &&
        (th.classList.contains("no-imprimir") || /Acciones/i.test(th.textContent))
      ) {
        th.remove();
        removedHeader = true;
      }
    });
    // Quitar la celda de acciones SOLO si existe una 'td.no-imprimir' en la fila
    const rows = tablaClone.querySelectorAll("tbody tr");
    rows.forEach((tr) => {
      const tdAccion = tr.querySelector("td.no-imprimir");
      if (tdAccion) tdAccion.remove();
    });
  } catch (_) {}

  if (headerClone) {
    a4.appendChild(headerClone);
  }
  a4.appendChild(meta);
  a4.appendChild(title);
  a4.appendChild(tablaClone);

  // Ocultar total general en el clon (para clientes)
  const totalGeneralEl = document.querySelector(".presupuesto-section h4");
  if (totalGeneralEl) {
    const hidden = totalGeneralEl.cloneNode(true);
    hidden.style.display = "none";
    a4.appendChild(hidden);
  }

  a4.style.position = "fixed";
  a4.style.left = "-99999px";
  a4.style.top = "0";
  document.body.appendChild(a4);
  return a4;
}

function calcularEscalaCaptura(max = 3) {
  try {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    // Escala base 2 para mejorar nitidez, multiplicada por DPR, con tope
    return Math.min(max, Math.max(2, dpr * 1.5));
  } catch (_) {
    return 2;
  }
}

async function capturarNodoComoCanvas(nodo, { scale } = {}) {
  const escala = scale || calcularEscalaCaptura();
  // Intenta con la escala indicada y, si falla por memoria/render, reintenta con escala 1
  try {
    return await html2canvas(nodo, {
      scale: escala,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
  } catch (err) {
    if (escala !== 1) {
      try {
        return await html2canvas(nodo, {
          scale: 1,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
      } catch (_) {
        throw err;
      }
    }
    throw err;
  }
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob));
  });
}

function descargarBlobComo(nombre, blob) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  } catch (_) {}
}

export async function exportarPresupuestoPDF(nombre = "presupuesto.pdf") {
  const { jsPDF } = window.jspdf;
  const a4 = await construirNodoA4();
  if (!a4) return;

  const canvas = await capturarNodoComoCanvas(a4, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(imgData);
  const ratio = Math.min(pageW / imgProps.width, pageH / imgProps.height);
  const pdfW = imgProps.width * ratio;
  const pdfH = imgProps.height * ratio;
  const offsetX = (pageW - pdfW) / 2;

  pdf.addImage(imgData, "PNG", offsetX, 0, pdfW, pdfH);
  pdf.save(nombre);

  a4.remove();
}

// Nuevo: intentar descargar PDF desde el servidor si hay un ID cargado
export async function descargarPDFServidor(nombre = "presupuesto.pdf") {
  const id = getCurrentEditPresupuestoId();
  if (!id) {
    // Si no hay ID, usar exportación cliente
    return exportarPresupuestoPDF(nombre);
  }
  try {
    const res = await fetch(`/presupuestos/${id}/pdf`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  } catch (_e) {
    // Fallback a cliente
    await exportarPresupuestoPDF(nombre);
  }
}

export async function capturaYWhatsApp() {
  // 1) Validar teléfono y preparar URL de WhatsApp
  const telInput = document.getElementById("presupuesto-telefonoCliente");
  let tel = (telInput?.value || "").replace(/\D/g, "");
  if (!tel) {
    const toastId = "toast-error-" + Date.now();
    const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
    const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
    M.toast({
      html: `<span id='${toastId}' style='white-space:pre-line;'>Introduce el teléfono del cliente</span>${copyBtn}${closeBtn}`,
      classes: "red",
      displayLength: Infinity,
    });
    return;
  }
  if (tel.length === 9) tel = "34" + tel;
  const saludo = `Buenas, del taller de Neumáticos Palmones te mandamos el presupuesto solicitado (Nº ${
    document.getElementById("presupuesto-numeroPresupuesto")?.value || ""
  }).`;
  const url = `https://wa.me/${tel}?text=${encodeURIComponent(saludo)}`;
  // 2) Decidir si usaremos Web Share API (móviles) o ventana WhatsApp (escritorio)
  const waWin = null;
  let mayUseWebShare = false;
  try {
    mayUseWebShare = !!(navigator && navigator.canShare && navigator.share);
  } catch (_) {
    mayUseWebShare = false;
  }
  // Si hay teléfono, preferimos abrir directamente el chat de WhatsApp del cliente
  if (tel && tel.length > 0) {
    mayUseWebShare = false;
  }
  // Nota: evitamos abrir ventanas antes de copiar para mantener el foco y mejorar la tasa de éxito del portapapeles

  // 3) Construir A4 y capturar imagen (con fallback a captura simple de la tabla)
  const a4 = await construirNodoA4({ compactWA: true });
  let canvas = null;
  if (!a4) {
    // Fallback: capturar directamente la tabla si existe
    const tabla = document.querySelector(".presupuesto-section .budget-table-container");
    if (tabla) {
      try {
        canvas = await capturarNodoComoCanvas(tabla, {
          scale: calcularEscalaCaptura(3),
        });
      } catch (_) {}
    }
    if (!canvas) {
      if (!waWin) window.open(url, "_blank");
      else waWin.location.href = url;
      return;
    }
  }

  try {
    if (!canvas) {
      canvas = await capturarNodoComoCanvas(a4, {
        scale: calcularEscalaCaptura(3),
      });
    }
    const blob = await canvasToBlob(canvas);
    // Nota: mantener PNG para nitidez; WhatsApp recomprime igualmente.
    const file = new File([blob], "presupuesto.png", { type: "image/png" });

    // 3.a) Intentar Web Share API con archivo (ideal en móviles)
    if (mayUseWebShare && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          text: saludo,
          title: "Presupuesto",
        });
        M.toast({
          html: "Compartido con WhatsApp (o app elegida).",
          classes: "green",
          displayLength: 4000,
        });
        // Cerrar ventana en blanco si la hubiéramos abierto (no debería en este camino)
        try {
          if (waWin && !waWin.closed) waWin.close();
        } catch (_) {}
        return;
      } catch (_shareErr) {
        // Continuar con flujo de escritorio si el share falla
      }
    }

    // Intentar copiar la imagen al portapapeles si está soportado (antes de abrir WhatsApp)
    // NOTA: La API de portapapeles para imágenes requiere contexto seguro (HTTPS o localhost)
    const isSecure =
      window.isSecureContext === true ||
      location.protocol === "https:" ||
      location.hostname === "localhost";
    if (!isSecure) {
      // En LAN por IP (http://192.168.x.x) no se permite copiar imágenes al portapapeles.
      // Ofrecer directamente la descarga del PNG y abrir WhatsApp.
      try {
        descargarBlobComo("presupuesto.png", blob);
      } catch (_) {}
      M.toast({
        html: `Por seguridad del navegador, no se puede copiar imagen al portapapeles en esta página (no es HTTPS). He descargado <b>presupuesto.png</b>; adjúntala en WhatsApp.`,
        classes: "orange",
        displayLength: 10000,
      });
    } else {
      try {
        if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
          // Primer intento
          try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          } catch (e1) {
            // Si falla por falta de foco, refocar y reintentar una vez
            const msg = (e1 && (e1.message || String(e1))) || "";
            if (/Document is not focused/i.test(msg)) {
              try {
                window.focus();
              } catch (_) {}
              try {
                document.body && document.body.focus && document.body.focus();
              } catch (_) {}
              await new Promise((r) => setTimeout(r, 100));
              await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            } else {
              throw e1;
            }
          }
          const toastId = "toast-info-" + Date.now();
          const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
          M.toast({
            html: `<span id='${toastId}'>Imagen del presupuesto copiada al portapapeles.</span>${closeBtn}`,
            classes: "green",
            displayLength: 5000,
          });
        } else {
          const toastId = "toast-warn-" + Date.now();
          const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
          // Descarga automática como ayuda para adjuntar
          descargarBlobComo("presupuesto.png", blob);
          M.toast({
            html: `<span id='${toastId}'>No se pudo copiar la imagen directamente. He descargado <b>presupuesto.png</b>; adjúntala en WhatsApp si no puedes pegar (Ctrl+V).</span>${closeBtn}`,
            classes: "orange",
            displayLength: 10000,
          });
        }
      } catch (err) {
        const toastId = "toast-error-" + Date.now();
        const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
        const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
        try {
          descargarBlobComo("presupuesto.png", blob);
        } catch (_) {}
        M.toast({
          html: `<span id='${toastId}' style='white-space:pre-line;'>No se pudo copiar la imagen al portapapeles: ${
            err.message || err
          }. He descargado <b>presupuesto.png</b>; adjúntala en WhatsApp si no puedes pegarla.</span>${copyBtn}${closeBtn}`,
          classes: "orange",
          displayLength: 10000,
        });
      }
    }
  } catch (error) {
    const toastId = "toast-error-" + Date.now();
    const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
    const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
    M.toast({
      html: `<span id='${toastId}' style='white-space:pre-line;'>Error al generar la captura del presupuesto: ${
        error.message || error
      }</span>${copyBtn}${closeBtn}`,
      classes: "red",
      displayLength: Infinity,
    });
  } finally {
    if (a4 && a4.remove) a4.remove();
  }

  // 4) Abrir WhatsApp (después de copiar, para no perder el foco)
  try {
    const opened = window.open(url, "_blank");
    if (!opened) throw new Error("popup-blocked");
  } catch (_) {
    const openBtn = `<a class='btn-flat toast-action' href='${url}' target='_blank' rel='noopener noreferrer'>Abrir WhatsApp</a>`;
    const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
    M.toast({
      html: `<span>No se pudo abrir automáticamente WhatsApp (bloqueo de ventanas). Pulsa “Abrir WhatsApp”.</span>${openBtn}${closeBtn}`,
      classes: "orange",
      displayLength: 10000,
    });
  }
}
