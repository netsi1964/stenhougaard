# Build og Publicering

> ui-lib er designet til at fungere uden build-trin til udvikling.
> Til distribution bruges en simpel ESM-build uden transpilation.

---

## ESM Distribution

ui-lib distribueres som native ES modules (ESM). Ingen CommonJS, ingen bundling påkrævet.

### Principper

- Kildefiler IS distributionsfiler — ingen transformationer (udover CSS-bundle til prod)
- Moderne browsere (Baseline 2023) håndterer ESM nativt
- Tree-shaking sker i forbrugerens bundler, ikke i ui-lib selv
- Ingen `__dirname`, `require()` eller Node.js-specifikke API'er

```js
// Forbruger importerer direkte — ingen bundling nødvendigt
import { UiButton } from 'ui-lib/src/components/button/ui-button.js';

// Eller via barrel-fil:
import 'ui-lib/ui-button.js';
```

---

## Package.json Struktur

```json
{
  "name": "@stenhougaard/ui-lib",
  "version": "0.1.0",
  "type": "module",
  "description": "Web Components UI library with orange accent and CSS tokens",
  "keywords": ["web-components", "ui", "design-system", "vanilla-js"],
  "license": "MIT",
  "author": "Nis Stenhougaard",

  "main": "./src/components/index.js",
  "module": "./src/components/index.js",
  "types": "./types/index.d.ts",

  "exports": {
    ".": {
      "import": "./src/components/index.js",
      "types":  "./types/index.d.ts"
    },
    "./tokens": {
      "import": "./src/tokens/tokens.css",
      "default": "./src/tokens/tokens.css"
    },
    "./ui-button": {
      "import": "./src/components/button/ui-button.js",
      "types":  "./types/components/button/ui-button.d.ts"
    },
    "./base": {
      "import": "./src/core/BaseElement.js",
      "types":  "./types/core/BaseElement.d.ts"
    }
  },

  "files": [
    "src/",
    "types/",
    "ARCHITECTURE.md",
    "COMPONENT_CONTRACT.md",
    "README.md"
  ],

  "sideEffects": [
    "*.css",
    "src/components/**/*.js"
  ],

  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/browser": "^1.0.0",
    "vite": "^5.0.0"
  }
}
```

### `sideEffects`-forklaring

CSS-filer er altid side-effectful (de registrerer globale tokens).
Komponentfiler kalder `customElements.define()` som en side-effect.
Bundlere som webpack/Rollup bruger `sideEffects: false` til tree-shaking —
vi angiver præcis hvilke filer der har side-effects.

---

## Tree-shaking

Fordi ui-lib bruger ESM med named exports kan bundlere tree-shake ubrugte komponenter.

```js
// Importer kun det du bruger — bundleren fjerner resten
import { UiButton } from '@stenhougaard/ui-lib';

// Ikke dette (importer hele biblioteket):
import '@stenhougaard/ui-lib'; // registrerer ALT
```

```js
// src/components/index.js — barrel-fil
export { UiButton } from './button/ui-button.js';
export { UiCard   } from './card/ui-card.js';
export { UiStack  } from './stack/ui-stack.js';
// osv.
```

---

## CSS Distribution

### Mulighed A: Separate tokens (anbefalet)

```html
<!-- Hostside inkluderer tokens manuelt -->
<link rel="stylesheet" href="node_modules/@stenhougaard/ui-lib/src/tokens/tokens.css">
```

Fordel: Tokens er tilgængelige globalt, kan overrides af hostside.

### Mulighed B: CSS i JS (Shadow DOM)

Komponenter bruger `adoptedStyleSheets` til at injicere komponent-CSS.
Tokens CSS refereres som custom properties — virker fordi CSS custom properties
er inherited og krydser shadow DOM-grænser.

### Mulighed C: CSS Bundle til CDN

```bash
# Build bundled CSS
npx postcss src/tokens/tokens.css -o dist/tokens.min.css --use cssnano
```

```html
<link rel="stylesheet" href="https://cdn.example.com/ui-lib@0.1.0/tokens.min.css">
```

---

## CDN Usage

Ingen build-server påkrævet. Brug direkte fra CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Tokens -->
  <link rel="stylesheet" href="https://unpkg.com/@stenhougaard/ui-lib@0.1.0/src/tokens/tokens.css">
</head>
<body>
  <ui-button variant="primary">Hej verden</ui-button>

  <script type="module">
    import 'https://unpkg.com/@stenhougaard/ui-lib@0.1.0/src/components/button/ui-button.js';
  </script>
</body>
</html>
```

### importmap (moderne tilgang)

```html
<script type="importmap">
{
  "imports": {
    "ui-lib/":          "https://unpkg.com/@stenhougaard/ui-lib@0.1.0/src/components/",
    "ui-lib/base":      "https://unpkg.com/@stenhougaard/ui-lib@0.1.0/src/core/BaseElement.js"
  }
}
</script>

<script type="module">
  import 'ui-lib/button/ui-button.js';
</script>
```

---

## NPM Publicering

### Trin

```bash
# 1. Tjek at du er logget ind
npm whoami

# 2. Kør tests
npm test

# 3. Bump version (patch/minor/major)
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0

# 4. Publicer (public scope)
npm publish --access public

# 5. Tag på GitHub
git push --follow-tags
```

### Pre-publicerings-tjekliste

- [ ] Alle tests består
- [ ] `docs/index.html` åbner i browser uden fejl
- [ ] CHANGELOG opdateret
- [ ] `version` i `package.json` bumped
- [ ] Ingen `.env` eller credentials i `files`-feltet

---

## Semantic Versioning

ui-lib følger [Semantic Versioning 2.0.0](https://semver.org/).

| Type | Version bump | Eksempler |
|------|-------------|---------|
| Patch | `0.1.x` | Bugfix, præstationsforbedring, dokumentation |
| Minor | `0.x.0` | Ny komponent, ny variant, nyt token (baglænskompatibelt) |
| Major | `x.0.0` | Fjernelse af komponent/attribut/event, token omdøbt, API-ændring |

### Breaking changes kræver

1. Advarsel i minor-release (deprecation notice)
2. Migration guide i CHANGELOG
3. Major version bump

**Aldrig breaking changes i patch-releases.**

---

## Documentation Site

### Mulighed A: Vite (simpel)

```bash
npm install --save-dev vite

# vite.config.js
export default {
  root: 'docs',
  server: { port: 3000 }
};
```

```bash
npx vite          # dev server
npx vite build    # statisk build til gh-pages
```

### Mulighed B: 11ty (statisk site generator)

```bash
npm install --save-dev @11ty/eleventy

# .eleventy.js
module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy('src');
  return { dir: { input: 'docs', output: '_site' } };
};
```

```bash
npx eleventy --serve    # dev server med hot reload
npx eleventy            # byg til _site/
```

### Deploy til GitHub Pages

```yaml
# .github/workflows/docs.yml
name: Deploy Docs
on:
  push:
    branches: [main]
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build:docs
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```
