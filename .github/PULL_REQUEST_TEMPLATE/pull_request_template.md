## Resumen

- Formateo y lint automáticos para JS (Prettier + ESLint) y Python (Black + Ruff)
- Configuración de Husky + lint-staged (pre-commit)
- Normalización EOL con .gitattributes

## Cambios

- Prettier + ESLint v9 flat config y scripts npm
- Husky + lint-staged para ejecutar en staged files
- Black + Ruff con pyproject.toml
- CI (GitHub Actions) para verificar en cada push/PR

## Checklist

- [ ] Lint JS pasa (npm run lint:check)
- [ ] Formato JS pasa (npm run format:check)
- [ ] Ruff pasa (ruff check)
- [ ] Black pasa (black --check .)
- [ ] Verificado que no hay cambios funcionales

## Notas

- Si falla el pre-commit, arregla con `npm run lint:fix` o corrige manualmente.
- Python usa línea máxima 100.


