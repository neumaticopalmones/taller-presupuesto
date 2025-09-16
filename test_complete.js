// Test completo de funcionalidad
// Ejecutar este script en la consola del navegador en http://localhost:5000

console.log("🧪 Iniciando test completo de funcionalidad...");

// Test 1: Verificar que los elementos principales existen
function testMainElements() {
  console.log("\n📋 Test 1: Elementos principales del DOM");

  const elements = [
    "btnVerPedidos",
    "btnVerHistorial",
    "btnVolverPresupuestos",
    "presupuestos-view",
    "historial-view",
    "pedidos-view",
    "dashboard-grid",
  ];

  const results = {};
  elements.forEach((id) => {
    const element = document.getElementById(id);
    results[id] = !!element;
    console.log(`${element ? "✅" : "❌"} ${id}: ${element ? "Encontrado" : "No encontrado"}`);
  });

  return results;
}

// Test 2: Verificar funciones de navegación
function testNavigationFunctions() {
  console.log("\n🧭 Test 2: Funciones de navegación");

  const functions = ["handleShowView", "State.setCurrentView", "UI.showView"];

  functions.forEach((funcName) => {
    try {
      const func = eval(funcName);
      console.log(`✅ ${funcName}: Disponible`);
    } catch (error) {
      console.log(`❌ ${funcName}: No disponible - ${error.message}`);
    }
  });
}

// Test 3: Simular clicks de navegación
function testNavigationClicks() {
  console.log("\n🖱️ Test 3: Simulación de clicks de navegación");

  // Test botón Pedidos
  const btnPedidos = document.getElementById("btnVerPedidos");
  if (btnPedidos) {
    console.log("✅ Simulando click en botón Pedidos...");
    btnPedidos.click();

    setTimeout(() => {
      const pedidosView = document.getElementById("pedidos-view");
      const isVisible = pedidosView && pedidosView.style.display !== "none";
      console.log(
        `${isVisible ? "✅" : "❌"} Vista Pedidos ${isVisible ? "visible" : "no visible"}`
      );
    }, 100);
  }

  // Test botón Historial
  setTimeout(() => {
    const btnHistorial = document.getElementById("btnVerHistorial");
    if (btnHistorial) {
      console.log("✅ Simulando click en botón Historial...");
      btnHistorial.click();

      setTimeout(() => {
        const historialView = document.getElementById("historial-view");
        const isVisible = historialView && historialView.style.display !== "none";
        console.log(
          `${isVisible ? "✅" : "❌"} Vista Historial ${isVisible ? "visible" : "no visible"}`
        );
      }, 100);
    }
  }, 1000);

  // Test botón Volver
  setTimeout(() => {
    const btnVolver = document.getElementById("btnVolverPresupuestos");
    if (btnVolver) {
      console.log("✅ Simulando click en botón Volver...");
      btnVolver.click();

      setTimeout(() => {
        const presupuestosView = document.getElementById("presupuestos-view");
        const dashboardGrid = document.querySelector(".dashboard-grid");
        const isPresupuestosVisible = presupuestosView && presupuestosView.style.display !== "none";
        const isDashboardVisible = dashboardGrid && dashboardGrid.style.display !== "none";

        console.log(
          `${isPresupuestosVisible ? "✅" : "❌"} Vista Presupuestos ${isPresupuestosVisible ? "visible" : "no visible"}`
        );
        console.log(
          `${isDashboardVisible ? "✅" : "❌"} Dashboard Grid ${isDashboardVisible ? "visible" : "no visible"}`
        );
      }, 100);
    }
  }, 2000);
}

// Test 4: Verificar APIs
async function testAPIs() {
  console.log("\n🌐 Test 4: Conectividad con APIs");

  try {
    // Test API Presupuestos
    const presResponse = await fetch("/presupuestos");
    console.log(`${presResponse.ok ? "✅" : "❌"} API Presupuestos: ${presResponse.status}`);

    if (presResponse.ok) {
      const presData = await presResponse.json();
      console.log(`📊 Presupuestos encontrados: ${presData.presupuestos?.length || 0}`);
    }

    // Test API Pedidos
    const pedResponse = await fetch("/api/pedidos");
    console.log(`${pedResponse.ok ? "✅" : "❌"} API Pedidos: ${pedResponse.status}`);

    if (pedResponse.ok) {
      const pedData = await pedResponse.json();
      console.log(`📊 Pedidos encontrados: ${pedData.pedidos?.length || 0}`);
    }
  } catch (error) {
    console.log(`❌ Error en APIs: ${error.message}`);
  }
}

// Test 5: Verificar estilos CSS modernos
function testModernStyles() {
  console.log("\n🎨 Test 5: Estilos CSS modernos");

  const elementsToCheck = [
    { id: "btnVerPedidos", expectedClass: "btn-modern" },
    { id: "btnVerHistorial", expectedClass: "btn-modern" },
    { className: "dashboard-grid", expectedDisplay: "grid" },
    { className: "input-field-modern", expectedPadding: "44px" },
  ];

  elementsToCheck.forEach((check) => {
    if (check.id) {
      const element = document.getElementById(check.id);
      if (element) {
        const hasClass = element.classList.contains(check.expectedClass);
        console.log(
          `${hasClass ? "✅" : "❌"} ${check.id} tiene clase ${check.expectedClass}: ${hasClass}`
        );
      }
    } else if (check.className) {
      const element = document.querySelector(`.${check.className}`);
      if (element) {
        const computedStyle = window.getComputedStyle(element);
        if (check.expectedDisplay) {
          const display = computedStyle.display;
          console.log(`✅ .${check.className} display: ${display}`);
        }
        if (check.expectedPadding) {
          const padding = computedStyle.paddingLeft;
          console.log(`✅ .${check.className} padding-left: ${padding}`);
        }
      }
    }
  });
}

// Ejecutar todos los tests
async function runCompleteTest() {
  console.log("🚀 INICIANDO BATERÍA COMPLETA DE TESTS\n");

  testMainElements();
  testNavigationFunctions();
  await testAPIs();
  testModernStyles();
  testNavigationClicks();

  console.log("\n🏁 Tests completados. Revisa los resultados arriba.");
}

// Auto-ejecutar si se ejecuta como script
if (typeof window !== "undefined") {
  runCompleteTest();
}

// Exportar funciones para uso manual
window.testSuite = {
  runCompleteTest,
  testMainElements,
  testNavigationFunctions,
  testNavigationClicks,
  testAPIs,
  testModernStyles,
};

console.log("\n💡 Puedes ejecutar tests individuales usando:");
console.log("   testSuite.testMainElements()");
console.log("   testSuite.testNavigationFunctions()");
console.log("   testSuite.testNavigationClicks()");
console.log("   testSuite.testAPIs()");
console.log("   testSuite.testModernStyles()");
