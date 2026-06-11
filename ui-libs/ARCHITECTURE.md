# UI-LIB — Arkitektur & Designprincipper

> Et Web Components-baseret UI-bibliotek bygget på vanilje-JavaScript og CSS Custom Properties.
> Ingen build-trin påkrævet til udvikling. Zero runtime-dependencies.

---

## Del 1: Designprincipper

10 principper der styrer alle beslutninger i ui-lib.

---

### 1. 🧩 Komposition frem for konfiguration

Komponenter løser ét problem godt frem for at understøtte uendeligt mange varianter via props.
Kompleks adfærd opnås ved at kombinere simple komponenter (f.eks. `<ui-stack>` + `<ui-button>`)
frem for at tilføje `layout="horizontal|vertical"` til én komponent.

---

### 2. 🎨 Tokens hele vejen ned

Alle visuelle beslutninger — farver, afstande, skrifttyper, skygger — er CSS Custom Properties.
Ingen hardkodede værdier i komponent-CSS. Temaer implementeres ved at overskrive tokens,
aldrig ved at tilføje tema-specifikke CSS-klasser.

---

### 3. ♿ Tilgængelighed er ikke en feature

WCAG AA er minimumskrav, ikke en tilvalgsfeature. Hvert komponent leverer korrekte ARIA-attributter,
korrekt fokushåndtering og semantisk HTML som standard. Accessibility-tests er en del af
definitionen af "done" for hvert komponent.

---

### 4. 🔒 Shadow DOM med omtanke

Shadow DOM bruges til at indkapsle implementeringsdetaljer og CSS — ikke til at skabe
uigennemtrængelige blackboxes. Hvert komponent eksponerer CSS custom properties for theming,
`::part()`-hooks til styling og navngivne slots til indhold. `delegatesFocus: true` sikrer
korrekt fokusadfærd.

---

### 5. 📐 Container-first responsivitet

Komponenter tilpasser sig deres container frem for viewport via container queries.
En `<ui-button>` ved ikke om den er i en sidebar eller en full-width sektion — den
tilpasser sig sin forælders bredde. Viewport media queries bruges kun på layout-niveau.

---

### 6. 🟠 Orange som fokus — ikke støj

Orange (#f97316 i lys tilstand, #fb923c i mørk tilstand) bruges som accent-farve med
tilstrækkelig kontrast (minimum 4.5:1 mod hvid/mørk baggrund). Farven bruges til
primære handlingsknapper, fokusring og interaktive indikatorer. Den bruges ikke
dekorativt eller som baggrundsfyld på store flader.

---

### 7. 📦 Zero dependencies

Biblioteket afhænger ikke af React, Vue, Angular, Lit eller andre frameworks.
Det eneste "framework" er webplatformen selv. Dette sikrer langsigtet kompatibilitet
og nul konflikter med hostapplikationens dependency tree.

---

### 8. ⬆️ Progressive enhancement

Komponenter degraderer gracefully. Basis-HTML fungerer inden JavaScript-hydreringen.
Attributes på custom elements kan sættes i server-renderet HTML og vil afspejles
korrekt når komponenten defineres. `:defined`-selector bruges til at skjule
uprocceserede komponenter.

---

### 9. 🔮 Forudsigelig API

Alle komponenter følger den samme kontrakt: kebab-case attributter, camelCase properties,
`ui-`-præfiks på events, navngivne slots, `part="base"` som minimum CSS-hook.
En udvikler der kender `<ui-button>` kender konventionerne for `<ui-card>` fra dag ét.

---

### 10. 📖 Dokumentation er kode

`docs/index.html` er en levende demo der altid afspejler den faktiske komponentadfærd.
Dokumentation skrives som kørende eksempler, ikke som statisk tekst. En test der fejler
er bedre end dokumentation der lyver.

---

## Del 2: Filstruktur

```
ui-libs/
│
├── src/
│   ├── index.js                    # Entry point — registrerer alle komponenter
│   │
│   ├── tokens/
│   │   └── tokens.css              # Designtokens: farver, afstand, typografi, motion
│   │
│   ├── core/
│   │   └── BaseElement.js          # Basisklasse for alle Web Components
│   │
│   └── components/
│       ├── button/ui-button.js     # <ui-button>  — knap (varianter, loading, ikoner)
│       ├── card/ui-card.js         # <ui-card>    — kort med slots + container query
│       ├── stack/ui-stack.js       # <ui-stack>   — layout-primitiv (flex)
│       ├── badge/ui-badge.js       # <ui-badge>   — statusindikator
│       ├── icon/ui-icon.js         # <ui-icon>    — SVG-ikoner med indbygget sæt
│       ├── input/ui-input.js       # <ui-input>   — tekstfelt med form participation
│       └── dialog/ui-dialog.js     # <ui-dialog>  — modal på native <dialog>
│
├── docs/
│   └── index.html                  # Selvstændig demo/dokumentationsside (i18n: EN/DA/ES/ZH)
│
├── tests/
│   └── ui-button.test.js           # Test suite for ui-button
│
├── ARCHITECTURE.md                 # Dette dokument
├── COMPONENT_CONTRACT.md           # Komponentkontrakt og API-regler
├── ACCESSIBILITY.md                # Accessibility-standard
├── BUILD.md                        # Build og publicerings-strategi
├── PITFALLS.md                     # Kendte faldgruber og løsninger
└── README.md                       # Kom-godt-i-gang guide
```

### Filbeskrivelser

| Fil | Formål |
|-----|--------|
| `src/tokens/tokens.css` | Single source of truth for alle designbeslutninger. Primitive + semantiske tokens. Mørkt tema. Reduced motion. |
| `src/core/BaseElement.js` | Abstrakt basisklasse. Shadow DOM, CSSStyleSheet-caching, lifecycle-hooks, hjælpemetoder. Importeres af alle komponenter. |
| `src/components/button/ui-button.js` | Fuldt implementeret `<ui-button>`. Indeholder CSS, template, properties og event-logik i én fil. |
| `docs/index.html` | Selvstændig HTML-fil. Ingen server krævet — åbn direkte i browser. Viser alle varianter og tilstande live. |
| `tests/ui-button.test.js` | Vitest-kompatibel test suite. Dækker public API: attributter, properties, events, slots, ARIA. |

---

## Del 4: Layout og container queries

### 3 regler for responsiv adfærd

1. **Komponenter kender ikke viewport.** En komponent tilpasser sig kun sin direkte forælders størrelse via container queries. Viewport-bredde er layout-lagets ansvar.
2. **Layout-primitiver er ansvarlige for placering.** `<ui-stack>`, `<ui-grid>` og lignende layout-komponenter bruger viewport media queries til at ændre `flex-direction` eller `grid-template-columns`.
3. **Ingen magiske breakpoints i komponent-CSS.** Breakpoints defineres som tokens (`--ui-breakpoint-sm: 640px`) og bruges kun i layout-lag.

### Hvornår viewport vs. container queries

| Situation | Brug |
|-----------|------|
| Komponent skifter layout internt | Container query |
| Navigationsbar kollapserer til hamburgermenu | Viewport media query |
| Knapper i sidebar vs. main content | Container query |
| Font-størrelse på hele sider | Viewport media query |
| Kortgitter skifter fra 1 til 3 kolonner | Container query (på grid-forælderen) |

### Hvilke komponenter bruger container queries

- `<ui-card>` — skifter fra vertikal til horisontal layout i brede containere
- `<ui-stack>` — tilpasser gap og retning baseret på tilgængeligt rum
- `<ui-badge>` — forkorter tekst i trange containere

### `<ui-stack>` som fremtidig layout-primitiv

`<ui-stack>` er planlagt som en usynlig layout-primitiv der arranger sine children
i en vertikal eller horisontal stak med konsistent gap. Den eksponerer `direction`,
`gap` og `align` attributter og bruger CSS container queries til automatisk
at skifte retning. Intet visuelt output — ren layout-logik via flex.

---

## Komponentstatus

| Komponent | Beskrivelse | Status |
|-----------|-------------|--------|
| `<ui-button>` | Knap med 5 varianter, 3 størrelser, loading, ikoner og fuld bredde. | ✅ Implementeret |
| `<ui-card>` | Kortcontainer med media-, header-, body- og footer-slots. Hover-elevation, klikbar variant og container query-responsivitet. | ✅ Implementeret |
| `<ui-stack>` | Layout-primitiv til vertikal/horisontal stabling af elementer med token-baseret gap. | ✅ Implementeret |
| `<ui-badge>` | Lille statusindikator. Varianter: default, success, warning, danger, info, accent. Dot- og pill-mode. | ✅ Implementeret |
| `<ui-icon>` | SVG-ikon-komponent med indbygget ikonsæt, størrelses- og farvetokens. Bruges som slot-indhold i andre komponenter. | ✅ Implementeret |
| `<ui-input>` | Tekstinputfelt med label, fejlbesked, help-text og ikon-slots. Integrerer med form participation API (ElementInternals). | ✅ Implementeret |
| `<ui-dialog>` | Modal-dialog med focus trap, Escape-lukning og backdrop. Bruger native `<dialog>`-elementet. | ✅ Implementeret |

### Næste skridt

| Komponent | Beskrivelse | Prioritet |
|-----------|-------------|-----------|
| `<ui-select>` | Dropdown-felt bygget på samme form participation-mønster som `<ui-input>`. | Medium |
| `<ui-tabs>` | Fanebladskomponent med roving tabindex og `aria-selected`. | Medium |
| `<ui-toast>` | Ikke-blokerende notifikationer med auto-dismiss og `role="status"`. | Lav |
