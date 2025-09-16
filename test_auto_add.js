// Test de funcionalidad de auto-añadir sugerencias
// Ejecutar en la consola del navegador en http://localhost:5000

console.log("🧪 Iniciando test de auto-añadir sugerencias...");

function testAutoAddFunctionality() {
  console.log("\n📋 Test: Verificando elementos necesarios");

  // Verificar que existen los elementos necesarios
  const elements = {
    medida: document.getElementById("presupuesto-medida"),
    cantidad: document.getElementById("presupuesto-cantidad"),
    ganancia: document.getElementById("presupuesto-ganancia"),
    ecotasa: document.getElementById("presupuesto-ecotasa"),
    iva: document.getElementById("presupuesto-iva"),
    marcaTemp: document.getElementById("presupuesto-marca-temp"),
    netoTemp: document.getElementById("presupuesto-neto-temp"),
    btnAgregarMarca: document.getElementById("btnAgregarMarca"),
    sugMarcas: document.querySelector("#sugerencias-marcas"),
    sugMedidas: document.querySelector("#sugerencias-medidas"),
  };

  let missingElements = [];
  for (const [name, element] of Object.entries(elements)) {
    if (!element) {
      missingElements.push(name);
      console.log(`❌ ${name}: No encontrado`);
    } else {
      console.log(`✅ ${name}: Encontrado`);
    }
  }

  if (missingElements.length > 0) {
    console.log(`\n❌ Faltan elementos: ${missingElements.join(", ")}`);
    return false;
  }

  console.log("\n✅ Todos los elementos necesarios están presentes");
  return true;
}

function fillTestData() {
  console.log("\n📝 Rellenando campos de prueba...");

  // Rellenar todos los campos excepto marca
  const testData = {
    "presupuesto-medida": "205/55/16 91v",
    "presupuesto-cantidad": "2",
    "presupuesto-ganancia": "25",
    "presupuesto-ecotasa": "3",
    "presupuesto-iva": "21",
    "presupuesto-neto-temp": "30",
  };

  for (const [id, value] of Object.entries(testData)) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event("input"));
      console.log(`✅ ${id}: ${value}`);
    }
  }

  // Actualizar Materialize si está disponible
  if (window.M) {
    M.updateTextFields();
  }

  console.log("✅ Campos de prueba rellenados");
}

function testChipClick() {
  console.log("\n🖱️ Test: Simulando click en chip de marca...");

  // Buscar chips de marcas disponibles
  const marcaChips = document.querySelectorAll("#sugerencias-marcas .chip");

  if (marcaChips.length === 0) {
    console.log("❌ No se encontraron chips de marcas. Primero carga las sugerencias.");
    return false;
  }

  console.log(`✅ Encontrados ${marcaChips.length} chips de marcas`);

  // Simular click en el primer chip
  const firstChip = marcaChips[0];
  console.log(`🖱️ Haciendo click en: "${firstChip.textContent}"`);

  firstChip.click();

  // Verificar que se rellenó el campo marca
  setTimeout(() => {
    const marcaInput = document.getElementById("presupuesto-marca-temp");
    if (marcaInput && marcaInput.value) {
      console.log(`✅ Campo marca rellenado con: "${marcaInput.value}"`);

      // Verificar si se añadió automáticamente
      setTimeout(() => {
        // Aquí podrías verificar si se añadió a la lista de neumáticos
        console.log("🔍 Verificando si se añadió automáticamente...");
        // Esta verificación dependería de cómo muestres los neumáticos añadidos
      }, 200);
    } else {
      console.log("❌ El campo marca no se rellenó correctamente");
    }
  }, 200);

  return true;
}

function runCompleteTest() {
  console.log("🚀 EJECUTANDO TEST COMPLETO DE AUTO-AÑADIR\n");

  if (!testAutoAddFunctionality()) {
    console.log("❌ Test fallido: Elementos faltantes");
    return;
  }

  fillTestData();

  setTimeout(() => {
    testChipClick();
  }, 500);

  console.log('\n💡 Si no ves chips de marcas, haz click en "Cargar Sugerencias" primero');
}

// Función auxiliar para cargar sugerencias si no están cargadas
function loadSuggestions() {
  const btnCargarSugerencias =
    document.querySelector('[onclick*="cargarSugerencias"]') ||
    document.querySelector('button:contains("Cargar")') ||
    document.getElementById("btnCargarSugerencias");

  if (btnCargarSugerencias) {
    console.log("🔄 Cargando sugerencias...");
    btnCargarSugerencias.click();
    setTimeout(runCompleteTest, 2000);
  } else {
    console.log(
      "⚠️ No se encontró botón para cargar sugerencias. Ejecutando test sin sugerencias..."
    );
    runCompleteTest();
  }
}

// Exportar funciones para uso manual
window.autoAddTest = {
  runCompleteTest,
  testAutoAddFunctionality,
  fillTestData,
  testChipClick,
  loadSuggestions,
};

console.log("\n💡 Funciones disponibles:");
console.log("   autoAddTest.runCompleteTest() - Ejecutar test completo");
console.log("   autoAddTest.loadSuggestions() - Cargar sugerencias y test");
console.log("   autoAddTest.fillTestData() - Solo rellenar campos");
console.log("   autoAddTest.testChipClick() - Solo test de click");

// Auto-ejecutar si se detectan sugerencias cargadas
if (document.querySelectorAll("#sugerencias-marcas .chip").length > 0) {
  setTimeout(runCompleteTest, 1000);
} else {
  setTimeout(loadSuggestions, 1000);
}
