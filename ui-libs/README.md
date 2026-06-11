# ui-libs — Web Components UI Library

Et letvægts UI-komponentbibliotek bygget med vanilje Web Components, CSS Custom Properties og zero runtime dependencies. Orange accent, tilgængeligt og nemt at tematisere.

---

## Hurtig start

### Via CDN (ingen installation)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@stenhougaard/ui-libs/src/tokens/tokens.css">
</head>
<body>
  <ui-button variant="primary">Hej verden</ui-button>

  <script type="module">
    import 'https://unpkg.com/@stenhougaard/ui-libs/src/components/button/ui-button.js';
  </script>
</body>
</html>
```

### Via npm

```bash
npm install @stenhougaard/ui-libs
```

```html
<link rel="stylesheet" href="node_modules/@stenhougaard/ui-libs/src/tokens/tokens.css">
```

```js
import '@stenhougaard/ui-libs/ui-button';
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

Importér alle på én gang via entry point:

```html
<script type="module" src="src/index.js"></script>
```

| Komponent | Tag | Status |
|-----------|-----|--------|
| Button | `<ui-button>` | ✅ Stabil — 5 varianter, loading, ikon-slots |
| Card | `<ui-card>` | ✅ Stabil — media/header/body/footer slots, container query |
| Stack | `<ui-stack>` | ✅ Stabil — layout-primitiv til flex-stabling |
| Badge | `<ui-badge>` | ✅ Stabil — 6 varianter, dot- og pill-mode |
| Icon | `<ui-icon>` | ✅ Stabil — indbygget ikonsæt, størrelses-tokens |
| Input | `<ui-input>` | ✅ Stabil — label, validering, form participation |
| Dialog | `<ui-dialog>` | ✅ Stabil — native `<dialog>`, focus trap, persistent-mode |

## Planlagte komponenter

| Komponent | Tag | Beskrivelse |
|-----------|-----|-------------|
| Select | `<ui-select>` | Dropdown med form participation |
| Tabs | `<ui-tabs>` | Faneblade med roving tabindex |
| Toast | `<ui-toast>` | Ikke-blokerende notifikationer |

---

## Bidrag

```bash
git clone https://github.com/netsi1964/stenhougaard.git
cd stenhougaard/ui-libs

# Ingen install nødvendig — åbn docs/index.html direkte
open docs/index.html

# Kør tests
npm install
npm test
```

---

## Licens

MIT — frit at bruge, modificere og distribuere.
