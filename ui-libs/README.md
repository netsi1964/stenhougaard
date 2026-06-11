# ui-lib — Web Components UI Library

Et letvægts UI-komponentbibliotek bygget med vanilje Web Components, CSS Custom Properties og zero runtime dependencies. Orange accent, tilgængeligt og nemt at tematisere.

---

## Hurtig start

### Via CDN (ingen installation)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@stenhougaard/ui-lib/src/tokens/tokens.css">
</head>
<body>
  <ui-button variant="primary">Hej verden</ui-button>

  <script type="module">
    import 'https://unpkg.com/@stenhougaard/ui-lib/src/components/button/ui-button.js';
  </script>
</body>
</html>
```

### Via npm

```bash
npm install @stenhougaard/ui-lib
```

```html
<link rel="stylesheet" href="node_modules/@stenhougaard/ui-lib/src/tokens/tokens.css">
```

```js
import '@stenhougaard/ui-lib/ui-button';
```

---

## Brug

```html
<!-- Primær knap -->
<ui-button variant="primary">Gem ændringer</ui-button>

<!-- Med ikon -->
<ui-button variant="primary">
  <svg slot="icon-start" aria-hidden="true" width="16" height="16" viewBox="0 0 20 20">
    <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z"/>
  </svg>
  Ny post
</ui-button>

<!-- Loading-tilstand -->
<ui-button variant="primary" loading>Gemmer...</ui-button>

<!-- Deaktiveret -->
<ui-button variant="secondary" disabled>Ikke tilgængelig</ui-button>

<!-- Fuld bredde -->
<ui-button variant="primary" full-width size="lg">Log ind</ui-button>

<!-- Lyt på events -->
<script>
  document.querySelector('ui-button').addEventListener('ui-click', (e) => {
    console.log('Klikket!', e.detail.originalEvent);
  });
</script>
```

### Mørkt tema

```js
document.documentElement.setAttribute('data-theme', 'dark');
```

### Tilpas med CSS Custom Properties

```css
ui-button.brand {
  --button-accent:       #6366f1;
  --button-accent-hover: #4f46e5;
  --button-radius:       var(--ui-radius-full);
}
```

---

## Demo

Åbn `docs/index.html` direkte i en browser for en interaktiv demo med dark mode toggle.

---

## Dokumentation

| Dokument | Indhold |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Designprincipper, filstruktur, responsivitetsstrategi |
| [COMPONENT_CONTRACT.md](./COMPONENT_CONTRACT.md) | API-regler, attributkonventioner, event-kontrakt |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | WCAG-krav, tastaturnavigation, screen reader support |
| [BUILD.md](./BUILD.md) | ESM distribution, npm publicering, CDN |
| [PITFALLS.md](./PITFALLS.md) | Kendte faldgruber og anbefalede løsninger |

---

## Tilgængelige komponenter

| Komponent | Tag | Status |
|-----------|-----|--------|
| Button | `<ui-button>` | ✅ Stabil |

## Planlagte komponenter

| Komponent | Tag | Beskrivelse |
|-----------|-----|-------------|
| Card | `<ui-card>` | Kortcontainer med header/body/footer slots |
| Stack | `<ui-stack>` | Layout-primitiv til flex-stabling |
| Badge | `<ui-badge>` | Statusindikator med farve-varianter |
| Icon | `<ui-icon>` | SVG-ikon med størrelses-tokens |
| Input | `<ui-input>` | Tekstfelt med label og validering |
| Dialog | `<ui-dialog>` | Modal med focus trap |

---

## Bidrag

```bash
git clone https://github.com/stenhougaard/ui-lib.git
cd ui-lib

# Ingen install nødvendig — åbn docs/index.html direkte
open docs/index.html

# Kør tests
npm install
npm test
```

---

## Licens

MIT — frit at bruge, modificere og distribuere.
