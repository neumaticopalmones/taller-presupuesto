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
