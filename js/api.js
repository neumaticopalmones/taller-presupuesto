const API_URL = "/presupuestos";
const SUG_URL = "/sugerencias";
const PRE_URL = "/precios";

async function handleResponse(response) {
  if (!response.ok) {
    let errorText = response.statusText;
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (_e) {
      // Si no es JSON, intenta texto plano
      try {
        errorText = await response.text();
      } catch {}
    }
    const msg =
      (errorData && (errorData.description || errorData.error || errorData.message)) ||
      errorText ||
      "Error del servidor";
    throw new Error(msg);
  }
  if (response.status === 204) return null; // No Content
  return await response.json();
}

export async function fetchHistorial(page = 1, filtros = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (filtros.nombre) params.set("nombre", filtros.nombre);
  if (filtros.telefono) params.set("telefono", filtros.telefono);
  if (filtros.numero) params.set("numero", filtros.numero);
  const response = await fetch(`${API_URL}?${params.toString()}`);
  return handleResponse(response);
}

export async function fetchPresupuestoById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  return handleResponse(response);
}

export async function savePresupuesto(id, presupuestoData) {
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(presupuestoData),
  });
  return handleResponse(response);
}

export async function deletePresupuestoById(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return handleResponse(response);
}

// Endpoints de inventario y convertir a pedido eliminados (no implementados en backend)

export async function fetchSugerencias(limit) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  const res = await fetch(`${SUG_URL}?${params.toString()}`);
  return handleResponse(res);
}

export async function getPreciosPorMedida(medida) {
  const params = new URLSearchParams({ medida });
  const res = await fetch(`${PRE_URL}?${params.toString()}`);
  return handleResponse(res);
}

export async function upsertPrecio({ medida, marca, neto }) {
  const res = await fetch(PRE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medida, marca, neto }),
  });
  return handleResponse(res);
}
