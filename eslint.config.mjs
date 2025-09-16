import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["js/**/*.js"],
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "__pycache__/**",
      "venv/**",
      "migrations/**",
    ],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
        M: "readonly",
        html2canvas: "readonly",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-useless-catch": "warn",
      "no-console": "off",
      // Afinado extra
      eqeqeq: ["error", "always"],
      radix: ["error", "always"],
      "prefer-const": "warn",
    },
  },
];
