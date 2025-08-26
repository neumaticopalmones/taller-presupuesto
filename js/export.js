import { getCurrentPresupuesto } from './state.js';
import { gruposPorMarca } from './utils.js';

export function imprimirPresupuesto() { window.print(); }

export function generarTextoPresupuesto() {
    const numeroInput = document.getElementById('presupuesto-numeroPresupuesto');
    const fechaInput = document.getElementById('presupuesto-fechaPresupuesto');
    const nombreClienteInput = document.getElementById('presupuesto-nombreCliente');
    const telefonoClienteInput = document.getElementById('presupuesto-telefonoCliente');
    const nifClienteInput = document.getElementById('presupuesto-nifCliente');

    const eur0 = (n) => `${Math.round(Number(n || 0)).toLocaleString('es-ES')} €`;

    let msg = '';
    msg += '───────────────────────────────\n';
    msg += '        NEUMÁTICOS PALMONES\n';
    msg += '  Dirección | Teléfono | Email\n';
    msg += '───────────────────────────────\n\n';
    msg += `Presupuesto Nº ${numeroInput?.value || ''}\n`;
    const fechaES = fechaInput?.value ? new Date(fechaInput.value).toLocaleDateString('es-ES') : '';
    if (fechaES) msg += `Fecha: ${fechaES}\n`;
    if (nombreClienteInput?.value || telefonoClienteInput?.value || nifClienteInput?.value) {
        msg += `Cliente: ${nombreClienteInput?.value || '-'}\n`;
        if (telefonoClienteInput?.value) msg += `Teléfono: ${telefonoClienteInput.value}\n`;
        if (nifClienteInput?.value) msg += `NIF/CIF: ${nifClienteInput.value}\n`;
        msg += '\n';
    }
    msg += 'PRESUPUESTO\n\n';
    msg += 'Medida        Marca / Concepto     Ud.   P.Unit     Total\n';
    msg += '----------------------------------------------------------\n';

    const presupuesto = getCurrentPresupuesto();
    const grupos = gruposPorMarca(presupuesto.grupos || []);

    grupos.forEach((grupo, idx) => {
        let totalGrupo = 0;
        const n0 = (grupo.neumaticos && grupo.neumaticos[0]) ? grupo.neumaticos[0] : null;
        const medida = (n0?.medida || '').padEnd(13);
        const marcaTxt = (n0?.nombre || `Opción ${idx + 1}`).padEnd(20);

        if (n0) {
            totalGrupo += Number(n0.total || 0);
            const lineaN = `${medida}${marcaTxt}${String(n0.cantidad).padEnd(5)}${(eur0(n0.precioUnidad)).padEnd(10)}${(eur0(n0.total))}\n`;
            msg += lineaN;
        }

        (grupo.otrosTrabajos || []).forEach(t => {
            totalGrupo += Number(t.total || 0);
            const concepto = (t.concepto || '').padEnd(20);
            const lineaT = `${ ' '.repeat(13)}${concepto}${String(t.cantidad).padEnd(5)}${(eur0(t.precioUnidad)).padEnd(10)}${(eur0(t.total))}\n`;
            msg += lineaT;
        });

        msg += '----------------------------------------------------------\n';
        const etiqueta = n0 ? `Total ${n0.nombre || `Opción ${idx + 1}`}` : 'Subtotal trabajos';
        msg += `${etiqueta}: `.padEnd(44) + `${eur0(totalGrupo)}\n\n`;
    });

    return msg.trimEnd();
}

async function construirNodoA4() {
    const tabla = document.querySelector('.presupuesto-section .budget-table-container');
    if (!tabla) {
        const toastId = 'toast-error-' + Date.now();
        const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
        const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
        M.toast({
            html: `<span id='${toastId}' style='white-space:pre-line;'>No hay presupuesto para exportar.</span>${copyBtn}${closeBtn}`,
            classes: 'red',
            displayLength: Infinity
        });
        return null;
    }

    const a4 = document.createElement('div');
    a4.className = 'a4-capture';
    if (document.body.classList.contains('compacto')) a4.classList.add('compacto');

    const headerClone = document.querySelector('.header').cloneNode(true);

    const meta = document.createElement('div');
    meta.className = 'meta-line';
    const fechaES = document.getElementById('presupuesto-fechaPresupuesto').value ? new Date(document.getElementById('presupuesto-fechaPresupuesto').value).toLocaleDateString('es-ES') : '';
    meta.textContent = `Presupuesto Nº ${document.getElementById('presupuesto-numeroPresupuesto').value}${fechaES ? ' — Fecha: ' + fechaES : ''}`;

    const title = document.createElement('h2');
    title.className = 'a4-title';
    title.textContent = 'Presupuesto';

    const tablaClone = tabla.cloneNode(true);
    // Eliminar únicamente la columna de Acciones (celdas con .no-imprimir) del clon antes de capturar,
    // sin tocar filas con celdas combinadas (como el total de grupo)
    try {
        // Quitar cabecera 'Acciones'
        const ths = tablaClone.querySelectorAll('thead th');
        let removedHeader = false;
        ths.forEach((th) => {
            if (!removedHeader && (th.classList.contains('no-imprimir') || /Acciones/i.test(th.textContent))) {
                th.remove();
                removedHeader = true;
            }
        });
        // Quitar la celda de acciones SOLO si existe una 'td.no-imprimir' en la fila
        const rows = tablaClone.querySelectorAll('tbody tr');
        rows.forEach(tr => {
            const tdAccion = tr.querySelector('td.no-imprimir');
            if (tdAccion) tdAccion.remove();
        });
    } catch (_) {}

    a4.appendChild(headerClone);
    a4.appendChild(meta);
    a4.appendChild(title);
    a4.appendChild(tablaClone);

    // Ocultar total general en el clon (para clientes)
    const totalGeneralEl = document.querySelector('.presupuesto-section h4');
    if (totalGeneralEl) {
        const hidden = totalGeneralEl.cloneNode(true);
        hidden.style.display = 'none';
        a4.appendChild(hidden);
    }

    a4.style.position = 'fixed';
    a4.style.left = '-99999px';
    a4.style.top = '0';
    document.body.appendChild(a4);
    return a4;
}

async function capturarNodoComoCanvas(nodo) {
    return await html2canvas(nodo, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
}

function canvasToBlob(canvas) {
    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob));
    });
}

export async function exportarPresupuestoPDF(nombre = 'presupuesto.pdf') {
    const { jsPDF } = window.jspdf;
    const a4 = await construirNodoA4(); if (!a4) return;

    const canvas = await capturarNodoComoCanvas(a4);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = Math.min(pageW / imgProps.width, pageH / imgProps.height);
    const pdfW = imgProps.width * ratio;
    const pdfH = imgProps.height * ratio;
    const offsetX = (pageW - pdfW) / 2;

    pdf.addImage(imgData, 'PNG', offsetX, 0, pdfW, pdfH);
    pdf.save(nombre);

    a4.remove();
}

export async function capturaYWhatsApp() {
    // 1) Validar teléfono y preparar URL de WhatsApp
    const telInput = document.getElementById('presupuesto-telefonoCliente');
    let tel = (telInput?.value || '').replace(/\D/g, '');
    if (!tel) {
        const toastId = 'toast-error-' + Date.now();
        const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
        const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
        M.toast({
            html: `<span id='${toastId}' style='white-space:pre-line;'>Introduce el teléfono del cliente</span>${copyBtn}${closeBtn}`,
            classes: 'red',
            displayLength: Infinity
        });
        return;
    }
    if (tel.length === 9) tel = '34' + tel;
    const saludo = `Buenas, del taller de Neumáticos Palmones te mandamos el presupuesto solicitado (Nº ${document.getElementById('presupuesto-numeroPresupuesto')?.value || ''}).`;
    const url = `https://wa.me/${tel}?text=${encodeURIComponent(saludo)}`;

    // 2) Abrir la ventana/pestaña de WhatsApp de forma SINCRONA para evitar bloqueos de pop-up
    let waWin = null;
    try { waWin = window.open('about:blank', '_blank'); } catch (_) { waWin = null; }

    // 3) Construir A4 y capturar imagen
    const a4 = await construirNodoA4();
    if (!a4) {
        // En caso de no haber nada que capturar, igualmente abrir WhatsApp si no se abrió
        if (!waWin) window.open(url, '_blank'); else waWin.location.href = url;
        return;
    }

    try {
        const canvas = await capturarNodoComoCanvas(a4);
        const blob = await canvasToBlob(canvas);

        // Intentar copiar la imagen al portapapeles si está soportado
        try {
            if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                const toastId = 'toast-info-' + Date.now();
                const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
                M.toast({
                    html: `<span id='${toastId}'>Imagen del presupuesto copiada al portapapeles.</span>${closeBtn}`,
                    classes: 'green',
                    displayLength: 5000
                });
            } else {
                const toastId = 'toast-warn-' + Date.now();
                const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
                M.toast({
                    html: `<span id='${toastId}'>Tu navegador no permite copiar imágenes al portapapeles. Abro WhatsApp igualmente; podrás pegar manualmente la imagen (Ctrl+V).</span>${closeBtn}`,
                    classes: 'orange',
                    displayLength: 8000
                });
            }
        } catch (err) {
            const toastId = 'toast-error-' + Date.now();
            const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
            const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
            M.toast({
                html: `<span id='${toastId}' style='white-space:pre-line;'>No se pudo copiar la imagen al portapapeles: ${err.message || err}. Abro WhatsApp para que puedas pegarla manualmente.</span>${copyBtn}${closeBtn}`,
                classes: 'orange',
                displayLength: 8000
            });
        }
    } catch (error) {
        const toastId = 'toast-error-' + Date.now();
        const copyBtn = `<button class='btn-flat toast-action' onclick='navigator.clipboard.writeText(document.getElementById("${toastId}").innerText);'>Copiar</button>`;
        const closeBtn = `<button class='btn-flat toast-action' onclick='this.closest(".toast").remove()'>Cerrar</button>`;
        M.toast({
            html: `<span id='${toastId}' style='white-space:pre-line;'>Error al generar la captura del presupuesto: ${error.message || error}</span>${copyBtn}${closeBtn}`,
            classes: 'red',
            displayLength: Infinity
        });
    } finally {
        a4.remove();
    }

    // 4) Redirigir la ventana de WhatsApp (o abrirla si no se pudo antes)
    if (waWin && !waWin.closed) {
        try { waWin.location.href = url; }
        catch (_) { window.open(url, '_blank'); }
    } else {
        window.open(url, '_blank');
    }
}
