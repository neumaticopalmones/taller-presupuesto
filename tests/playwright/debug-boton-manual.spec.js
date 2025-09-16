// Test de debugging para investigar el problema del botón manual
// Este test se enfoca específicamente en el problema que encontramos

import { test, expect } from "@playwright/test";

test.describe("Debugging - Botón Manual y Event Listeners", () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar TODOS los logs del navegador
    page.on("console", (msg) => {
      const type = msg.type().toUpperCase();
      const text = msg.text();

      if (type === "ERROR") {
        console.log(`🔴 BROWSER ERROR: ${text}`);
      } else if (type === "WARNING") {
        console.log(`🟡 BROWSER WARN: ${text}`);
      } else if (type === "LOG") {
        console.log(`🟦 BROWSER LOG: ${text}`);
      } else {
        console.log(`📋 BROWSER ${type}: ${text}`);
      }
    });

    // Interceptar errores de JavaScript
    page.on("pageerror", (error) => {
      console.log(`🚨 JAVASCRIPT ERROR: ${error.message}`);
      console.log(`📍 Stack: ${error.stack}`);
    });

    // Interceptar errores de red
    page.on("requestfailed", (request) => {
      console.log(`🌐 NETWORK ERROR: ${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.goto("/");
    await page.waitForSelector("#presupuesto-medida");
  });

  test("debug completo: carga de scripts y event listeners", async ({ page }) => {
    console.log("🔍 INICIANDO DEBUG COMPLETO...");

    // PASO 1: Verificar que todos los scripts se cargaron
    console.log("\n📜 PASO 1: Verificando carga de scripts...");

    const scriptsInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      return scripts.map((script) => ({
        src: script.src,
        loaded: script.readyState || "unknown",
      }));
    });

    console.log("   Scripts encontrados:");
    scriptsInfo.forEach((script, i) => {
      console.log(`   ${i + 1}. ${script.src} (${script.loaded})`);
    });

    // PASO 2: Verificar funciones globales disponibles
    console.log("\n🔧 PASO 2: Verificando funciones globales...");

    const funcionesGlobales = await page.evaluate(() => {
      const funciones = [];

      // Verificar funciones específicas que necesitamos
      const funcionesEsperadas = [
        "handleAddMarca",
        "handleSelectPrecio",
        "clearForm",
        "isNotEmpty",
        "isValidNumber",
      ];

      funcionesEsperadas.forEach((nombreFuncion) => {
        funciones.push({
          nombre: nombreFuncion,
          existe: typeof window[nombreFuncion] === "function",
          tipo: typeof window[nombreFuncion],
        });
      });

      return funciones;
    });

    console.log("   Funciones verificadas:");
    funcionesGlobales.forEach((func) => {
      const estado = func.existe ? "✅" : "❌";
      console.log(`   ${estado} ${func.nombre}: ${func.tipo}`);
    });

    // PASO 3: Verificar event listeners en el botón
    console.log("\n🔘 PASO 3: Verificando event listeners del botón...");

    const botonInfo = await page.evaluate(() => {
      const boton = document.getElementById("btnAgregarMarca");
      if (!boton) return { existe: false };

      // Obtener información del botón
      return {
        existe: true,
        habilitado: !boton.disabled,
        visible: boton.offsetWidth > 0 && boton.offsetHeight > 0,
        clases: boton.className,
        texto: boton.textContent?.trim(),
        // Intentar detectar event listeners (limitado en navegador)
        onclick: typeof boton.onclick === "function",
        addEventListener: !!boton.addEventListener,
      };
    });

    console.log("   Información del botón:");
    console.log(`   ${botonInfo.existe ? "✅" : "❌"} Existe: ${botonInfo.existe}`);
    if (botonInfo.existe) {
      console.log(`   ${botonInfo.habilitado ? "✅" : "❌"} Habilitado: ${botonInfo.habilitado}`);
      console.log(`   ${botonInfo.visible ? "✅" : "❌"} Visible: ${botonInfo.visible}`);
      console.log(`   📝 Texto: "${botonInfo.texto}"`);
      console.log(`   🎨 Clases: "${botonInfo.clases}"`);
      console.log(`   🔗 onclick: ${botonInfo.onclick}`);
    }

    // PASO 4: Llenar formulario como el usuario
    console.log("\n📝 PASO 4: Llenando formulario como usuario real...");

    await page.fill("#presupuesto-medida", "205/55/16");
    await page.fill("#presupuesto-cantidad", "2");
    await page.fill("#presupuesto-neto-temp", "62");
    await page.fill("#presupuesto-marca-temp", "bridgestone");

    // Opcionales (como lo hace el usuario según los logs)
    await page.fill("#presupuesto-ganancia", "25");
    await page.fill("#presupuesto-ecotasa", "2");
    await page.fill("#presupuesto-iva", "21");

    console.log("   ✅ Todos los campos llenados");

    // PASO 5: Intentar ejecutar handleAddMarca de diferentes formas
    console.log("\n🎯 PASO 5: Probando handleAddMarca de diferentes formas...");

    // Método 1: Ejecutar función directamente
    console.log("   🔧 Método 1: Ejecutar función directamente...");
    try {
      const resultado1 = await page.evaluate(() => {
        if (typeof window.handleAddMarca === "function") {
          console.log("🎯 Ejecutando handleAddMarca directamente...");
          window.handleAddMarca();
          return { exito: true, error: null };
        } else {
          return { exito: false, error: "Función no existe" };
        }
      });

      console.log(
        `      ${resultado1.exito ? "✅" : "❌"} Resultado: ${resultado1.exito ? "Ejecutado" : resultado1.error}`
      );
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }

    // Método 2: Click en el botón
    console.log("   🔘 Método 2: Click en botón...");
    try {
      await page.click("#btnAgregarMarca");
      console.log("      ✅ Click ejecutado");
    } catch (error) {
      console.log(`      ❌ Error en click: ${error.message}`);
    }

    // Método 3: Disparar evento manualmente
    console.log("   ⚡ Método 3: Disparar evento click manualmente...");
    try {
      await page.evaluate(() => {
        const boton = document.getElementById("btnAgregarMarca");
        if (boton) {
          const evento = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          boton.dispatchEvent(evento);
        }
      });
      console.log("      ✅ Evento disparado");
    } catch (error) {
      console.log(`      ❌ Error en evento: ${error.message}`);
    }

    // PASO 6: Verificar resultado final
    console.log("\n📊 PASO 6: Verificando resultado final...");

    await page.waitForTimeout(2000); // Dar tiempo para que procese

    const itemsFinales = await page.locator("#items-list .item").count();
    console.log(`   📋 Ítems en la lista: ${itemsFinales}`);

    if (itemsFinales > 0) {
      console.log("   🎉 ¡ALGO FUNCIONÓ! Se añadió al menos un ítem");

      // Mostrar qué se añadió
      const ultimoItem = await page.locator("#items-list .item").last().textContent();
      console.log(`   📝 Último ítem: "${ultimoItem}"`);
    } else {
      console.log("   ❌ No se añadió ningún ítem");
    }

    console.log("\n✨ DEBUG COMPLETADO");
  });

  test("debug específico: comparar con logs del usuario", async ({ page }) => {
    console.log("🔍 COMPARANDO CON LOGS REALES DEL USUARIO...");

    // Replicar exactamente lo que hizo el usuario según sus logs
    await page.fill("#presupuesto-medida", "205/55/16 91v");
    await page.fill("#presupuesto-cantidad", "2");
    await page.fill("#presupuesto-marca-temp", "bridgestone");
    await page.fill("#presupuesto-neto-temp", "62");
    await page.fill("#presupuesto-ganancia", "25");
    await page.fill("#presupuesto-ecotasa", "2");
    await page.fill("#presupuesto-iva", "21");

    console.log("✅ Formulario llenado igual que el usuario");

    // Verificar los valores exactos
    const valores = await page.evaluate(() => {
      return {
        medida: document.getElementById("presupuesto-medida")?.value || "",
        cantidad: document.getElementById("presupuesto-cantidad")?.value || "",
        marca: document.getElementById("presupuesto-marca-temp")?.value || "",
        neto: document.getElementById("presupuesto-neto-temp")?.value || "",
        ganancia: document.getElementById("presupuesto-ganancia")?.value || "",
        ecotasa: document.getElementById("presupuesto-ecotasa")?.value || "",
        iva: document.getElementById("presupuesto-iva")?.value || "",
      };
    });

    console.log("📋 Valores en formulario:");
    console.log(`   medida: "${valores.medida}"`);
    console.log(`   cantidad: "${valores.cantidad}"`);
    console.log(`   marca: "${valores.marca}"`);
    console.log(`   neto: "${valores.neto}"`);
    console.log(`   ganancia: "${valores.ganancia}"`);
    console.log(`   ecotasa: "${valores.ecotasa}"`);
    console.log(`   iva: "${valores.iva}"`);

    // Intentar ejecutar exactamente como el usuario
    const resultado = await page.evaluate(() => {
      if (typeof window.handleAddMarca === "function") {
        try {
          console.log("🎯 Ejecutando handleAddMarca...");
          window.handleAddMarca();
          return { exito: true, error: null };
        } catch (error) {
          return { exito: false, error: error.message };
        }
      } else {
        return { exito: false, error: "handleAddMarca no existe" };
      }
    });

    console.log(`🎯 Resultado de ejecución: ${resultado.exito ? "ÉXITO" : "FALLO"}`);
    if (!resultado.exito) {
      console.log(`❌ Error: ${resultado.error}`);
    }

    await page.waitForTimeout(1000);

    const items = await page.locator("#items-list .item").count();
    console.log(`📊 Ítems resultantes: ${items}`);

    // Esperamos que esto coincida con la experiencia del usuario
    if (items > 0) {
      console.log("🎉 ¡COINCIDE CON EL USUARIO! Función ejecutada correctamente");
    } else {
      console.log("❌ NO COINCIDE - El usuario dice que funciona pero aquí no");
    }
  });
});
