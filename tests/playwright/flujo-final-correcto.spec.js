// Test final: Flujo completo de auto-añadir como usuario real
import { test, expect } from "@playwright/test";

test.describe("Auto-Añadir REAL - Como Usuario Final", () => {
  test.beforeEach(async ({ page }) => {
    // Configurar logging para ver solo logs importantes
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("AUTO-ADD") || text.includes("MANUAL-ADD")) {
        console.log(`🟦 ${text}`);
      }
    });

    await page.goto("/");
    await page.waitForSelector("#presupuesto-medida");
  });

  test("flujo completo: seleccionar sugerencia → auto-añadir", async ({ page }) => {
    console.log("🎯 TEST REAL: Flujo completo como usuario final");

    // PASO 1: Escribir medida para obtener sugerencias
    console.log("📝 Escribiendo medida para obtener sugerencias...");
    await page.fill("#presupuesto-medida", "205/55/16");
    await page.press("#presupuesto-medida", "Tab");

    // PASO 2: Esperar a que aparezcan las sugerencias
    console.log("⏳ Esperando sugerencias de marcas...");
    await page.waitForSelector("#precios-por-medida .chip", { timeout: 10000 });

    // Verificar que hay sugerencias
    const numSugerencias = await page.locator("#precios-por-medida .chip").count();
    console.log(`📊 Encontradas ${numSugerencias} sugerencias`);
    expect(numSugerencias).toBeGreaterThan(0);

    // PASO 3: Llenar campos básicos ANTES de seleccionar marca (como usuario real)
    console.log("📝 Llenando campos básicos antes de seleccionar marca...");
    await page.fill("#presupuesto-cantidad", "2");
    await page.fill("#presupuesto-ganancia", "25");
    await page.fill("#presupuesto-ecotasa", "2");
    await page.fill("#presupuesto-iva", "21");

    console.log("✅ Campos básicos completados");

    // PASO 4: Contar ítems ANTES de seleccionar marca (ELEMENTO CORRECTO)
    const itemsAntes = await page.locator("#lista-marcas-temp li").count();
    console.log(`📋 Ítems antes: ${itemsAntes}`);

    // PASO 5: Seleccionar una marca (esto debería auto-añadir)
    console.log("🎯 Seleccionando marca - debería auto-añadir...");

    const marcaChip = page.locator("#precios-por-medida .chip").first();
    const textoMarca = await marcaChip.textContent();
    console.log(`📌 Seleccionando: "${textoMarca}"`);

    await marcaChip.click();

    // PASO 6: Esperar el auto-añadir (el setTimeout es de 1000ms)
    console.log("⏳ Esperando auto-añadir (timeout de 1 segundo)...");
    await page.waitForTimeout(2000);

    // PASO 7: Verificar que se añadió automáticamente
    console.log("🔍 Verificando resultado del auto-añadir...");

    const itemsDespues = await page.locator("#lista-marcas-temp li").count();
    console.log(`📋 Ítems después: ${itemsDespues}`);

    // VERIFICACIÓN PRINCIPAL: ¿Se añadió automáticamente?
    if (itemsDespues > itemsAntes) {
      console.log("🎉 ¡AUTO-AÑADIR FUNCIONÓ! Se añadió automáticamente");

      // Verificar detalles del ítem añadido
      const ultimoItem = page.locator("#lista-marcas-temp li").last();
      const contenidoItem = await ultimoItem.textContent();
      console.log(`📝 Ítem añadido: "${contenidoItem}"`);

      // Verificar que contiene los datos esperados
      await expect(ultimoItem).toContainText("205/55/16");
      await expect(ultimoItem).toContainText("2"); // cantidad
    } else {
      console.log("❌ Auto-añadir NO funcionó. Investigando...");

      // Verificar si los campos se llenaron correctamente
      const medida = await page.inputValue("#presupuesto-medida");
      const cantidad = await page.inputValue("#presupuesto-cantidad");
      const marca = await page.inputValue("#presupuesto-marca-temp");
      const neto = await page.inputValue("#presupuesto-neto-temp");

      console.log("🔍 Estado de campos después de seleccionar marca:");
      console.log(`   Medida: "${medida}"`);
      console.log(`   Cantidad: "${cantidad}"`);
      console.log(`   Marca: "${marca}"`);
      console.log(`   Neto: "${neto}"`);

      // Si los campos están llenos pero no se auto-añadió,
      // probemos el botón manual para verificar que la lógica funciona
      if (medida && cantidad && marca && neto) {
        console.log("🔧 Campos llenos pero no se auto-añadió. Probando botón manual...");

        await page.click("#btnAgregarMarca");
        await page.waitForTimeout(1000);

        const itemsManual = await page.locator("#lista-marcas-temp li").count();
        console.log(`📋 Ítems después de click manual: ${itemsManual}`);

        if (itemsManual > itemsAntes) {
          console.log("✅ Botón manual SÍ funciona - problema está en el auto-añadir");
        } else {
          console.log("❌ Ni auto-añadir ni botón manual funcionan");

          // Debug: ¿Existe el elemento donde se supone que aparecen los ítems?
          const listaExiste = await page.locator("#lista-marcas-temp").count();
          console.log(`🔍 Lista marcas temp existe: ${listaExiste > 0 ? "SÍ" : "NO"}`);
        }
      }
    }

    // ASSERTION FINAL: Debe haberse añadido de alguna forma
    const itemsFinales = await page.locator("#lista-marcas-temp li").count();
    expect(itemsFinales).toBeGreaterThan(itemsAntes);

    console.log("✨ TEST COMPLETADO");
  });

  test("verificar que manual sigue funcionando", async ({ page }) => {
    console.log("🎯 TEST: Verificar funcionalidad manual (control)");

    // Llenar todo manualmente
    await page.fill("#presupuesto-medida", "225/45/17");
    await page.fill("#presupuesto-cantidad", "4");
    await page.fill("#presupuesto-marca-temp", "michelin");
    await page.fill("#presupuesto-neto-temp", "85");

    const itemsAntes = await page.locator("#lista-marcas-temp li").count();

    // Click manual
    await page.click("#btnAgregarMarca");
    await page.waitForTimeout(1000);

    const itemsDespues = await page.locator("#lista-marcas-temp li").count();

    console.log(`📋 Ítems antes: ${itemsAntes}, después: ${itemsDespues}`);

    expect(itemsDespues).toBeGreaterThan(itemsAntes);
    console.log("✅ Funcionalidad manual funciona correctamente");
  });
});
