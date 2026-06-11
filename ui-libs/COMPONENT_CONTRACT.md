# Komponentkontrakt

> Dette dokument definerer de bindende regler for alle Web Components i ui-lib.
> Enhver komponent der ikke overholder disse regler er ikke klar til udgivelse.

---

## Generelle regler

### Tag-navngivning

- Præfiks: altid `ui-` (f.eks. `ui-button`, `ui-card`, `ui-input`)
- Format: kebab-case, altid mindst ét bindestreg (Web Component-krav)
- Nomen, ikke verbum: `ui-dialog`, ikke `ui-show-dialog`
- Aldrig bare HTML-elementnavnet: `ui-button`, ikke `button`

### Attributregler

| Regel | Eksempel |
|-------|---------|
| kebab-case format | `full-width`, `icon-start`, `aria-label` |
| Boolean attributter følger HTML-spec: `present = true` | `<ui-button disabled>` |
| Attributter reflekteres som properties | `el.disabled` ↔ `[disabled]` |
| Standardværdi defineres i property getter, ikke i HTML | `get variant() { return this.getStr('variant', 'primary'); }` |
| Ændringsreaktioner sker i `_update()`, ikke i setter | Setter kalder kun `setAttribute()` |

### Propertyregler

- camelCase spejl af attribut: `full-width` → `fullWidth`
- Ingen privat `_`-præfiks i public API (bruges kun internt i BaseElement)
- Boolean properties: returnerer altid `boolean`, accepterer alle truthy/falsy værdier
- String properties: returnerer altid `string` med defineret default
- Properties synkroniseres til attributter (reflect to attribute)

### Eventregler

| Regel | Detalje |
|-------|---------|
| Præfiks `ui-` | `ui-click`, `ui-change`, `ui-close` |
| Altid `CustomEvent` | Aldrig native events videresendt direkte |
| `bubbles: true` | Muliggør event delegation på forælderelementer |
| `composed: true` | Krydser shadow DOM-grænser |
| `cancelable: true` | Giver forbrugere mulighed for at annullere |
| `detail`-objekt | Aldrig tomt — minimum `{}`, helst med kontekst |
| Kun udsendt ved faktisk brugerinteraktion | Ikke ved programmatiske property-ændringer |

### Slotregler

- Default slot: indeholder primært tekstindhold / label
- Navngivne slots: `icon-start`, `icon-end`, `header`, `footer`, `actions`
- Slot-indhold arver aldrig komponentens interne CSS (shadow DOM-isolation)
- `::slotted(*)` bruges til minimal slot-styling (pointer-events, display)
- Slotted SVG-ikoner: `pointer-events: none`, eksplicit `width`/`height`

### CSS Custom Properties

- Mønster: `--[component]-[property]` (f.eks. `--button-accent`, `--card-radius`)
- Altid fallback til `--ui-*` token (f.eks. `var(--button-radius, var(--ui-radius-md, 0.5rem))`)
- Dobbelt fallback: token → råværdi sikrer at komponenten virker uden tokens.css
- Dokumenteres i JSDoc-kommentar øverst i komponentfilen

### CSS Parts

- Minimum: `part="base"` på det primære interaktive/visuelle element
- Komplekse komponenter: `part="header"`, `part="body"`, `part="footer"`, `part="icon"`
- Parts eksponeres for styling fra hostsiden via `::part(base) { ... }`
- Parts ændres aldrig uden major version bump (breaking change)

### Tilstandsattributter

Reflecter intern tilstand til host-elementets attributter:

| Tilstand | Attribut | Selector |
|----------|---------|---------|
| Deaktiveret | `disabled` | `:host([disabled])` |
| Indlæser | `loading` | `:host([loading])` |
| Valgt | `selected` | `:host([selected])` |
| Udvidet | `expanded` | `:host([expanded])` |
| Fejl | `invalid` | `:host([invalid])` |

### ARIA-regler

- Komponenter er ansvarlige for egne ARIA-attributter på shadow DOM-elementer
- Host-elementet tilføjer `role` kun hvis nødvendigt (undgå ARIA på custom elements der wrapper semantiske elementer)
- `aria-disabled` sættes ud over native `disabled` for AT-kompatibilitet
- `aria-busy` sættes under loading
- Dekorative elementer (spinner, ikoner): `aria-hidden="true"`

---

## Kontrakt: `<ui-button>`

### Attributter

| Tag | Attribut | Type | Default | Beskrivelse |
|-----|---------|------|---------|-------------|
| `ui-button` | `variant` | `string` | `'primary'` | Visuel stil: `primary`, `secondary`, `ghost`, `danger`, `neutral` |
| `ui-button` | `size` | `string` | `'md'` | Størrelse: `sm` (2rem), `md` (2.5rem), `lg` (3rem) |
| `ui-button` | `disabled` | `boolean` | `false` | Deaktiverer knappen. Blokerer klik og UI-click event. |
| `ui-button` | `loading` | `boolean` | `false` | Viser spinner. Blokerer klik og ui-click event. |
| `ui-button` | `full-width` | `boolean` | `false` | Host-elementet strækkes til 100% bredde. |
| `ui-button` | `type` | `string` | `'button'` | HTML button type. Reflekteres til inner `<button type="...">`. |

### Events

| Event | Detail | Hvornår |
|-------|--------|---------|
| `ui-click` | `{ originalEvent: MouseEvent }` | Klik på knap, medmindre `disabled` eller `loading` er aktive |

### Slots

| Slot | Formål |
|------|--------|
| `(default)` | Knapens label-tekst |
| `icon-start` | Ikon placeret til venstre for label |
| `icon-end` | Ikon placeret til højre for label |

### CSS Custom Properties

| CSS Custom Property | Beskrivelse | Default |
|--------------------|-------------|---------|
| `--button-accent` | Accent-farve (primary variant bg/border) | `var(--ui-accent, #f97316)` |
| `--button-accent-hover` | Accent-farve ved hover | `var(--ui-accent-hover, #ea580c)` |
| `--button-accent-active` | Accent-farve ved klik | `var(--ui-accent-active, #c2410c)` |
| `--button-accent-text` | Tekstfarve på accent-baggrund | `var(--ui-accent-text, #ffffff)` |
| `--button-radius` | Hjørneradius | `var(--ui-radius-md, 0.5rem)` |
| `--button-font-weight` | Skriftvægt | `var(--ui-font-weight-semibold, 600)` |
| `--button-transition` | CSS transition shorthand | Alle relevante properties |
| `--button-focus-ring` | Focus ring outline | `var(--ui-focus-ring)` |
| `--button-focus-offset` | Focus ring offset | `var(--ui-focus-ring-offset, 2px)` |
| `--button-disabled-bg` | Baggrund når disabled | `var(--ui-state-disabled-bg, #f5f5f5)` |
| `--button-disabled-text` | Tekstfarve når disabled | `var(--ui-state-disabled-text, #a3a3a3)` |
| `--button-disabled-border` | Kantfarve når disabled | `var(--ui-state-disabled-border, #e5e5e5)` |

**Eksempel på override:**
```css
ui-button.rounded {
  --button-radius: var(--ui-radius-full);
  --button-accent: #6366f1; /* indigo */
}
```

### CSS Parts

| Part | Element |
|------|---------|
| `base` | Den indre `<button>` — primær interaktionsflade og visuelt element |

**Eksempel på eksternt part-styling:**
```css
ui-button::part(base) {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
```

### Accessibility-tjekliste

- [x] Indre `<button>` med `type="button"` (undgår utilsigtet form submit)
- [x] `disabled` attribut på indre `<button>` (keyboard + AT blokering)
- [x] `aria-disabled="true/false"` på indre `<button>` (ekstra AT-signal)
- [x] `aria-busy="true/false"` under loading
- [x] Spinner har `aria-hidden="true"` (dekorativ)
- [x] Focus ring synlig ved `focus-visible` (ikke `focus` — undgår ring ved museklik)
- [x] Minimum kontrastratio 4.5:1 for tekst på baggrund (WCAG AA)
- [x] Tastaturaktivering via Enter og Space (native `<button>` håndterer dette)
- [x] `delegatesFocus: true` på shadow root sikrer korrekt Tab-navigation
- [x] Ingen `tabindex` manipulation — lad browseren styre tab order
