# Faldgruber og skjulte opgaver

> Web Components løser mange problemer — men introducerer også nye.
> Dette dokument dokumenterer de ikke-oplagte udfordringer og de anbefalede løsninger.

---

## Form Participation

**Problemet:** Custom elements deltager ikke i native HTML-formularer som standard.
En `<ui-input>` inde i en `<form>` indsender ikke sin værdi, og validering via
`:valid`/`:invalid` virker ikke uden ekstra arbejde.

**Løsningen:** Brug `ElementInternals` API'et med `formAssociated = true`:

```js
class UiInput extends BaseElement {
  static formAssociated = true;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  // Sæt formværdien når input ændrer sig
  _setValue(value) {
    this._internals.setFormValue(value);
  }

  // Native form validation
  _setValidity(message = '') {
    if (message) {
      this._internals.setValidity({ customError: true }, message);
    } else {
      this._internals.setValidity({});
    }
  }
}
```

`formAssociated = true` aktiverer `form`, `name`, `validity`, `willValidate`
egenskaberne på elementet. Browserunderstøttelse: Chrome 77+, Firefox 93+, Safari 16+.

---

## SSR og Hydration

**Problemet:** Custom elements renderes tom i server-side rendering (SSR) fordi
JavaScript ikke kører på serveren. Shadow DOM opbygges i browseren via JavaScript,
hvilket giver Flash of Unstyled Content (FOUC) eller layout shift.

**Løsningen:** Declarative Shadow DOM (DSD) — shadow DOM i HTML uden JavaScript:

```html
<!-- Server sender dette: -->
<ui-button>
  <template shadowrootmode="open">
    <style>/* inline komponent-CSS */</style>
    <button part="base" type="button">
      <slot></slot>
    </button>
  </template>
  Klik her
</ui-button>
```

Brug `:defined` pseudo-class til at skjule komponenter der endnu ikke er hydrateret:

```css
ui-button:not(:defined) {
  visibility: hidden;
}
```

DSD understøttes i Chrome 90+, Firefox 123+, Safari 16.4+.

---

## Shadow DOM Styling Begrænsninger

**Problemet:** CSS kan ikke gennemtrænge shadow DOM-grænsen. Globale stilarter
fra hostapplikationen påvirker ikke komponenternes interne elementer. Dette er
intentionelt, men skaber udfordringer for theming.

**Løsningen:** Tre mekanismer giver stylingadgang:

1. **CSS Custom Properties** (arves på tværs af shadow boundary):
   ```css
   /* Host-side */
   :root { --button-radius: 0; }
   /* Komponent bruger custom property */
   button { border-radius: var(--button-radius); }
   ```

2. **`::part()` pseudo-element** (direkte styling af eksponerede parts):
   ```css
   /* Host-side kan style */
   ui-button::part(base) { text-transform: uppercase; }
   ```

3. **`::slotted()` pseudo-element** (styling af slotted content fra komponentens CSS):
   ```css
   /* Komponent-CSS kan style slotted children */
   ::slotted(img) { border-radius: 50%; }
   ```

---

## Focus Delegation

**Problemet:** Tab-tryk på et custom element fokuserer normalt host-elementet,
ikke det interne interaktive element. Dette kan give forvirring for tastaturbrugere.

**Løsningen:** `delegatesFocus: true` på `attachShadow()`:

```js
this._root = this.attachShadow({ mode: 'open', delegatesFocus: true });
```

Med `delegatesFocus: true` videresender browseren automatisk fokus til det
første fokuserbare element inde i shadow DOM. Det fjerner også behovet for
at sætte `tabindex` på host-elementet manuelt.

Pas på: `delegatesFocus` påvirker `:focus` styling. Brug altid `:focus-visible`
i komponent-CSS for at undgå fokusring ved museklik.

---

## Event Retargeting

**Problemet:** Events der stammer inde i shadow DOM og krydser shadow boundary
retargets — `event.target` peger på host-elementet, ikke det interne element
der faktisk afsendte eventet. Dette kan forvirre event handlers der forventer
at `event.target` er den interne knap.

**Løsningen:** Brug `event.composedPath()` for at se den fulde event-kæde:

```js
document.addEventListener('click', (e) => {
  // e.target = <ui-button> (retargeted)
  const path = e.composedPath();
  // path[0] = <button> inde i shadow DOM (det faktiske target)
  const internalTarget = path[0];
});
```

Og i ui-lib's egne events: pak det originale event ind i `detail`:

```js
this.emit('ui-click', { originalEvent: e }); // e er det originale interne event
```

---

## Theming på tværs af Shadow Boundaries

**Problemet:** CSS custom properties er de eneste CSS-mekanismer der arves
på tværs af shadow DOM-grænser. Klasser, ID'er og attribut-selektorer gør det ikke.

**Løsningen:** Design tokens er altid CSS custom properties. Komponenter bruger
`var(--ui-accent)` ikke `#f97316`. Alle tokens defineres på `:root` i `tokens.css`
og er dermed tilgængelige overalt — inklusive inde i shadow DOM.

```css
/* tokens.css på :root — automatisk tilgængeligt i alle shadow roots */
:root { --ui-accent: #f97316; }

/* Komponent-CSS bruger tokenet */
button { background: var(--ui-accent); }

/* Mørkt tema overskriver kun på [data-theme="dark"] */
[data-theme="dark"] { --ui-accent: #fb923c; }
```

Overskrivning af enkeltkomponenter via host-side `--button-accent` fungerer
fordi custom properties nedarves ind i shadow roots fra host-elementet.

---

## Ikon-strategi

**Problemet:** Ikoner kan leveres på mange måder: inline SVG, `<img>`, icon-font,
`<use>`-reference, icon-komponent. Valget påvirker tilgængelighed, theming og
bundle-størrelse.

**Løsningen:** ui-lib bruger **slots til inline SVG** som primær strategi:

- Fordel: Ikoner farves med `currentColor` (arver tekstfarve fra forælderen)
- Fordel: Ingen ekstra HTTP-request
- Fordel: Fuldstændig fri for at vælge ikonpakke (Heroicons, Lucide, osv.)
- Ulempe: Verbost HTML

```html
<ui-button>
  <svg slot="icon-start" aria-hidden="true" width="16" height="16" viewBox="0 0 20 20">
    <path d="M10 3..."/>
  </svg>
  Gem
</ui-button>
```

Fremtidig `<ui-icon name="save">` komponent overvejes til version 2.0 med sprite-system.

---

## Lokalisering

**Problemet:** Tekst hardkodet i komponentens template er svær at oversætte.
Shadow DOM skjuler intern tekst for l10n-biblioteker der scanner DOM-træet.

**Løsningen:** Al brugervendt tekst eksponeres som slots — aldrig som intern tekst:

```html
<!-- Korrekt: tekst leveres via slot -->
<ui-button>
  <span slot="loading-text">Indlæser...</span>
  Gem
</ui-button>

<!-- Forkert: komponent genererer sin egen tekst -->
<!-- Komponent renderer <span>Loading...</span> internt — ikke oversætteligt -->
```

Alternativt: attributter til tekst-overrides:

```html
<ui-button loading-label="Sender data...">Send</ui-button>
```

Interne ARIA-strings (som `aria-label` på spinner) eksponeres som attributter
der kan oversættes i hostapplikationen.

---

## Browserunderstøttelse

**Problemet:** Web Components-API'erne er relativt nye. Custom Elements, Shadow DOM
og CSS `adoptedStyleSheets` har ikke universelt full support i alle browsere.

**Løsningen:** Target Baseline 2023 (understøttet i alle moderne browsere):

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| Custom Elements v1 | 67+ | 63+ | 10.1+ | 79+ |
| Shadow DOM v1 | 53+ | 63+ | 10+ | 79+ |
| `adoptedStyleSheets` | 73+ | 101+ | 16.4+ | 79+ |
| CSS Custom Properties | 49+ | 31+ | 9.1+ | 16+ |
| Declarative Shadow DOM | 90+ | 123+ | 16.4+ | 90+ |

**Polyfills til legacy support:**

```bash
npm install @webcomponents/webcomponentsjs
```

```html
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
```

`adoptedStyleSheets`-fallback: Detect support og indsæt `<style>`-tag som fallback:

```js
_getStyleSheet() {
  if (typeof CSSStyleSheet === 'undefined' || !('replace' in CSSStyleSheet.prototype)) {
    // Fallback: inject <style> element
    const style = document.createElement('style');
    style.textContent = this.constructor.css();
    this._root.appendChild(style);
    return null;
  }
  // ...normal adoptedStyleSheets path
}
```

---

## Performance

**Problemet:** Mange instanser af samme komponent der hver opretter sin egen
CSSStyleSheet koster unødvendigt hukommelse og parse-tid.

**Løsningen:** BaseElement cacher den parsede stylesheet på constructor-funktionen:

```js
_getStyleSheet() {
  const ctor = this.constructor;
  if (!ctor._sharedSheet) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(ctor.css());
    ctor._sharedSheet = sheet; // Delt mellem ALLE instanser
  }
  return ctor._sharedSheet;
}
```

1000 `<ui-button>` instanser deler én CSSStyleSheet-instans — parsning sker kun én gang.
`adoptedStyleSheets` er et live array — alle shadow roots deler pointer til samme sheet.

---

## Navnekollisioner

**Problemet:** `customElements.define()` kaster en fejl hvis et tag-navn allerede
er registreret. Biblioteker der anvender samme tag-navne kolliderer destruktivt.

**Løsningen:**

1. **Præfiks-strategi (nuværende):** `ui-button`, `ui-card` — reducerer (men eliminerer ikke) risiko.

2. **Defensive registrering:**
   ```js
   if (!customElements.get('ui-button')) {
     customElements.define('ui-button', UiButton);
   }
   ```

3. **Scoped Custom Element Registries (fremtidig standard):**
   ```js
   const registry = new CustomElementRegistry();
   registry.define('ui-button', UiButton);
   // Shadow root bruger sin egen registry:
   this.attachShadow({ mode: 'open', registry });
   ```
   Understøttelse er under standardisering (Chrome 124+ bag flag).

4. **Tilpasset præfiks til white-label:**
   Eksporter klassen separat fra `define()`-kaldet så forbrugere kan
   registrere med eget præfiks:
   ```js
   export { UiButton }; // Forbruger kalder selv define('acme-button', UiButton)
   ```
