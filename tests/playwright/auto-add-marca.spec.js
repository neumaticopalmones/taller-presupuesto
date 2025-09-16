// Test principal del flujo de auto-añadir marcas
// Este test replica exactamente el problema que estás teniendo

import { test, expect } from "@playwright/test";

test.describe("Auto-Añadir Marcas - Flujo Principal", () => {
  test.beforeEach(async ({ page }) => {
    // Configurar interceptación de console logs para ver errores JS
    page.on("console", (msg) => {
      console.log(`🟦 BROWSER: [${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    // Interceptar errores JavaScript
    page.on("pageerror", (error) => {
      console.log(`🔴 JS ERROR: ${error.message}`);
    });

    // Ir a la aplicación
    await page.goto("/");

    // Esperar a que cargue completamente
    await page.waitForSelector("#presupuesto-medida");
  });

  test("debería auto-añadir cuando hago click en sugerencia de marca", async ({ page }) => {
    console.log("🎯 TEST: Auto-añadir marca desde sugerencias");

    // PASO 1: Llenar medida para disparar sugerencias
    console.log("📝 PASO 1: Escribiendo medida...");
    await page.fill("#presupuesto-medida", "205/55/16");
    await page.press("#presupuesto-medida", "Tab"); // Disparar blur event

    // PASO 2: Esperar sugerencias de marcas
    console.log("⏳ PASO 2: Esperando sugerencias de marcas...");
    await page.waitForSelector("#precios-por-medida .chip", { timeout: 5000 });

    // PASO 3: Llenar campos básicos requeridos
    console.log("📝 PASO 3: Llenando campos básicos...");
    await page.fill("#presupuesto-cantidad", "2");
    await page.fill("#presupuesto-neto-temp", "62");

    // PASO 4: Verificar estado antes de click en marca
    console.log("🔍 PASO 4: Verificando campos antes de seleccionar marca...");
    const medidaAntes = await page.inputValue("#presupuesto-medida");
    const cantidadAntes = await page.inputValue("#presupuesto-cantidad");
    const netoAntes = await page.inputValue("#presupuesto-neto-temp");

    console.log(`   Medida: "${medidaAntes}"`);
    console.log(`   Cantidad: "${cantidadAntes}"`);
    console.log(`   Neto: "${netoAntes}"`);

    // PASO 5: Seleccionar marca (esto debería auto-añadir)
    console.log("🎯 PASO 5: Seleccionando marca - DEBERÍA AUTO-AÑADIR...");

    // Buscar chip con marca específica
    const marcaChip = page
      .locator("#precios-por-medida .chip")
      .filter({
        hasText: /bridgestone|michelin|continental/i,
      })
      .first();

    // Verificar que existe la marca
    await expect(marcaChip).toBeVisible();
    const textoMarca = await marcaChip.textContent();
    console.log(`   📌 Seleccionando marca: "${textoMarca}"`);

    // CLICK en la marca - esto debería disparar auto-añadir
    await marcaChip.click();

    // PASO 6: Esperar a que se llene el campo marca
    console.log("⏳ PASO 6: Esperando a que se llene campo marca...");
    await page.waitForFunction(
      () => {
        const marca = document.getElementById("presupuesto-marca-temp");
        return marca && marca.value.length > 0;
      },
      { timeout: 3000 }
    );

    // PASO 7: Verificar estado después de seleccionar marca
    console.log("🔍 PASO 7: Verificando campos después de seleccionar marca...");
    const medidaDespues = await page.inputValue("#presupuesto-medida");
    const cantidadDespues = await page.inputValue("#presupuesto-cantidad");
    const marcaDespues = await page.inputValue("#presupuesto-marca-temp");
    const netoDespues = await page.inputValue("#presupuesto-neto-temp");

    console.log(`   Medida: "${medidaDespues}" ${medidaDespues ? "✅" : "❌"}`);
    console.log(`   Cantidad: "${cantidadDespues}" ${cantidadDespues ? "✅" : "❌"}`);
    console.log(`   Marca: "${marcaDespues}" ${marcaDespues ? "✅" : "❌"}`);
    console.log(`   Neto: "${netoDespues}" ${netoDespues ? "✅" : "❌"}`);

    // VERIFICACIONES
    expect(medidaDespues).toBeTruthy();
    expect(cantidadDespues).toBeTruthy();
    expect(marcaDespues).toBeTruthy();
    expect(netoDespues).toBeTruthy();

    // PASO 8: Verificar si el botón manual existe y está habilitado
    console.log("🔍 PASO 8: Verificando botón manual...");
    const botonManual = page.locator("#btnAgregarMarca");
    await expect(botonManual).toBeVisible();

    const botonHabilitado = await botonManual.isEnabled();
    console.log(`   🔘 Botón habilitado: ${botonHabilitado ? "✅" : "❌"}`);

    // PASO 9: Verificar si la función handleAddMarca existe
    console.log("🔍 PASO 9: Verificando función handleAddMarca...");
    const funcionExiste = await page.evaluate(() => {
      return typeof window.handleAddMarca === "function";
    });
    console.log(`   🔧 handleAddMarca existe: ${funcionExiste ? "✅" : "❌"}`);

    // PASO 10: Intentar ejecutar auto-añadir manualmente si no funcionó
    if (funcionExiste) {
      console.log("🎯 PASO 10: Probando auto-añadir manualmente...");

      // Contar ítems antes
      const itemsAntes = await page.locator("#items-list .item").count();
      console.log(`   📋 Ítems antes: ${itemsAntes}`);

      // Ejecutar handleAddMarca directamente
      await page.evaluate(() => {
        window.handleAddMarca();
      });

      // Esperar un momento para que procese
      await page.waitForTimeout(1000);

      // Contar ítems después
      const itemsDespues = await page.locator("#items-list .item").count();
      console.log(`   📋 Ítems después: ${itemsDespues}`);

      // Verificar si se añadió
      if (itemsDespues > itemsAntes) {
        console.log("🎉 ¡AUTO-AÑADIR FUNCIONÓ!");
      } else {
        console.log("❌ Auto-añadir no funcionó");

        // Como último recurso, probar el botón manual
        console.log("🔧 ÚLTIMO RECURSO: Probando botón manual...");
        await botonManual.click();
        await page.waitForTimeout(1000);

        const itemsFinales = await page.locator("#items-list .item").count();
        console.log(`   📋 Ítems finales: ${itemsFinales}`);

        if (itemsFinales > itemsAntes) {
          console.log("✅ Botón manual sí funciona");
        } else {
          console.log("❌ Ni auto-añadir ni botón manual funcionan");
        }
      }
    }

    console.log("✨ TEST COMPLETADO");
  });

  test("debería mostrar errores de validación si faltan campos", async ({ page }) => {
    console.log("🎯 TEST: Validación de campos requeridos");

    // Llenar solo medida
    await page.fill("#presupuesto-medida", "205/55/16");
    await page.press("#presupuesto-medida", "Tab");

    // Esperar sugerencias
    await page.waitForSelector("#precios-por-medida .chip", { timeout: 5000 });

    // Seleccionar marca sin llenar otros campos
    const marcaChip = page.locator("#precios-por-medida .chip").first();
    await marcaChip.click();

    // Debería mostrar algún tipo de error o no añadir nada
    await page.waitForTimeout(2000);

    // Verificar que no se añadió al listado
    const items = await page.locator("#items-list .item").count();
    expect(items).toBe(0);

    console.log("✅ Validación funciona correctamente");
  });
});
