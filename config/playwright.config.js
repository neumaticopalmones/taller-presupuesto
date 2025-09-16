// Configuración de Playwright para testing de la aplicación
// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: "./tests/playwright",

  /* Ejecutar tests en paralelo */
  fullyParallel: true,

  /* No permitir que falle toda la suite si uno falla */
  forbidOnly: !!process.env.CI,

  /* Reintentar tests que fallan en CI */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["list"], ["json", { outputFile: "test-results.json" }]],

  /* Configuración global para todos los tests */
  use: {
    /* URL base para usar en tests */
    baseURL: "http://localhost:5000",

    /* Capturar screenshot cuando falla el test */
    screenshot: "only-on-failure",

    /* Grabar video cuando falla el test */
    video: "retain-on-failure",

    /* Capturar trace para debugging */
    trace: "on-first-retry",

    /* Configuración del navegador */
    viewport: { width: 1280, height: 720 },

    /* Ignorar errores HTTPS */
    ignoreHTTPSErrors: true,

    /* Timeout por acción (click, fill, etc) */
    actionTimeout: 10000,
  },

  /* Configurar proyectos para diferentes navegadores */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test contra móvil viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    /* Microsoft Edge y Google Chrome channels. */
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
    {
      name: "Google Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],

  /* Configuración del servidor de desarrollo local */
  webServer: {
    command: "python run.py",
    url: "http://localhost:5000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
