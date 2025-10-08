const API_URL = "/presupuestos";
const SUG_URL = "/sugerencias";
const PRE_URL = "/precios";
const PED_URL = "/api/pedidos";

async function handleResponse(response) {
  if (!response) throw new Error("Sin respuesta del servidor");
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    let bodySnippet = "";
    if (contentType.includes("application/json")) {
      try {
        const data = await response.json();
        bodySnippet =
          data.description || data.error || data.message || JSON.stringify(data).slice(0, 300);
      } catch (_) {}
    } else {
      try {
        bodySnippet = (await response.text()).slice(0, 300);
      } catch (_) {}
    }
    throw new Error(`HTTP ${response.status} ${response.statusText} ${bodySnippet}`.trim());
  }
  if (response.status === 204) return null;
  if (!contentType.includes("application/json")) {
    // Diagnóstico CORB: devolver objeto especial para detectar en capa superior
    const raw = await response.text();
    throw new Error(`Respuesta no JSON (Content-Type=${contentType}) -> ${raw.slice(0, 200)}`);
  }
  return response.json();
}

async function safeFetchJson(url, options) {
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (e) {
    console.error("FETCH ERROR", url, e);
    throw e;
  }
}

export async function fetchHistorial(page = 1, filtros = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (filtros.nombre) params.set("nombre", filtros.nombre);
  if (filtros.telefono) params.set("telefono", filtros.telefono);
  if (filtros.numero) params.set("numero", filtros.numero);
  if (filtros.medida) params.set("medida", filtros.medida);
  return safeFetchJson(`${API_URL}?${params.toString()}`);
}

export async function fetchPresupuestoById(id) {
  return safeFetchJson(`${API_URL}/${id}`);
}

export async function savePresupuesto(id, presupuestoData) {
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  return safeFetchJson(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(presupuestoData),
  });
}

export async function deletePresupuestoById(id) {
  return safeFetchJson(`${API_URL}/${id}`, { method: "DELETE" });
}

// Endpoints de inventario y convertir a pedido eliminados (no implementados en backend)

export async function fetchSugerencias(limit) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  return safeFetchJson(`${SUG_URL}?${params.toString()}`);
}

export async function getPreciosPorMedida(medida) {
  const params = new URLSearchParams({ medida });
  return safeFetchJson(`${PRE_URL}?${params.toString()}`);
}

export async function upsertPrecio({ medida, marca, neto }) {
  return safeFetchJson(PRE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medida, marca, neto }),
  });
}

// --- Pedidos ---
export async function fetchPedidos(params = {}) {
  const usp = new URLSearchParams();
  if (params.page) usp.set("page", params.page);
  if (params.per_page) usp.set("per_page", params.per_page);
  if (params.q) usp.set("q", params.q);
  if (params.proveedor) usp.set("proveedor", params.proveedor);
  if (params.estado) usp.set("estado", params.estado);
  if (params.desde) usp.set("desde", params.desde);
  if (params.hasta) usp.set("hasta", params.hasta);
  return safeFetchJson(`${PED_URL}?${usp.toString()}`);
}

export async function crearPedido(payload) {
  return safeFetchJson(PED_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchPedidoById(id) {
  return safeFetchJson(`${PED_URL}/${id}`);
}

// Crear pedido directamente desde un presupuesto (helper)
export async function crearPedidoDesdePresupuesto(presupuestoId, linea) {
  // linea: objeto con campos medida, marca, descripcion, unidades
  const payload = {
    presupuesto_id: presupuestoId,
    linea_ref: linea?.id || null,
    medida: linea?.medida || "",
    marca: linea?.nombre || linea?.marca || null,
    descripcion: linea?.descripcion || null,
    unidades: linea?.cantidad || linea?.unidades || 1,
    proveedor: linea?.proveedor || null,
    notas: null,
  };
  return crearPedido(payload);
}

export async function editarPedido(id, payload) {
  return safeFetchJson(`${PED_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function toggleConfirmado(id) {
  return safeFetchJson(`${PED_URL}/${id}/toggle_confirmado`, { method: "POST" });
}

export async function toggleRecibido(id) {
  return safeFetchJson(`${PED_URL}/${id}/toggle_recibido`, { method: "POST" });
}

export async function borrarPedido(id) {
  return safeFetchJson(`${PED_URL}/${id}`, { method: "DELETE" });
}
