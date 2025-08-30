export function two(n) {
  return String(n).padStart(2, "0");
}
export function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}
export function eur(n) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

/**
 * Separa los grupos que tienen múltiples neumáticos en grupos individuales por marca.
 * @param {Array} grupos - El array de grupos del presupuesto.
 * @returns {Array} Un nuevo array de grupos expandido.
 */
export function gruposPorMarca(grupos = []) {
  const salida = [];
  (grupos || []).forEach((g) => {
    const trabajos = g.otrosTrabajos || [];
    if (g.neumaticos && g.neumaticos.length > 1) {
      g.neumaticos.forEach((n) => {
        salida.push({
          id: g.id,
          neumaticos: [n],
          otrosTrabajos: trabajos,
          // Copy other group properties if they exist
          medida: g.medida,
          cantidad: n.cantidad, // Use the individual quantity
          totalGrupo: n.total + trabajos.reduce((acc, t) => acc + t.total, 0),
        });
      });
    } else {
      salida.push(g);
    }
  });
  return salida;
}

// --- Validation Functions ---

/**
 * Valida si un valor es un número válido y opcionalmente dentro de un rango.
 * @param {*} value - El valor a validar.
 * @param {object} options - Opciones de validación (min, max, allowNegative).
 * @returns {boolean} True si es un número válido, false en caso contrario.
 */
export function isValidNumber(
  value,
  { min = -Infinity, max = Infinity, allowNegative = true } = {}
) {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return false;
  }
  if (!allowNegative && num < 0) {
    return false;
  }
  return num >= min && num <= max;
}

/**
 * Valida si una cadena de texto no está vacía o solo contiene espacios en blanco.
 * @param {string} value - La cadena a validar.
 * @returns {boolean} True si no está vacía, false en caso contrario.
 */
export function isNotEmpty(value) {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Valida un NIF/CIF español básico (formato). No valida la letra de control.
 * @param {string} nif - El NIF/CIF a validar.
 * @returns {boolean} True si tiene un formato básico válido, false en caso contrario.
 */
export function isValidNIF(nif) {
  if (!nif) return false;
  nif = nif.toUpperCase().trim();
  // Basic regex for DNI, NIE, CIF (doesn't validate checksum)
  const regex =
    /^[0-9XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/;
  return regex.test(nif);
}

/**
 * Valida un número de teléfono básico (solo dígitos, longitud mínima).
 * @param {string} phone - El número de teléfono a validar.
 * @returns {boolean} True si es un número de teléfono válido, false en caso contrario.
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const cleanedPhone = phone.replace(/\s/g, ""); // Remove spaces
  const regex = /^[0-9]{9,}$/; // At least 9 digits
  return regex.test(cleanedPhone);
}
