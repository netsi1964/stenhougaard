# Accessibility Standard

> ui-lib følger WCAG 2.1 niveau AA som minimum. Disse regler er bindende
> for alle komponenter i biblioteket og er en del af definitionen af "done".

---

## Tastatur-navigation

Alle interaktive komponenter skal kunne betjenes udelukkende med tastatur.

### Regler

| Regel | Detalje |
|-------|---------|
| Tab | Fokus bevæges fremad til næste interaktive element |
| Shift+Tab | Fokus bevæges baglæns |
| Enter / Space | Aktiverer knapper og links |
| Escape | Lukker dialogs, dropdowns og overlays |
| Piletaster | Navigation i lister, radiogrupper og menuer |

### Eksempler

```html
<!-- Korrekt: native <button> håndterer Enter/Space automatisk -->
<ui-button>Gem</ui-button>

<!-- Forkert: div med click-handler kræver manuel tastaturhåndtering -->
<div role="button" onclick="...">Gem</div>
```

```js
// For tilpassede tastaturinteraktioner i komponenter:
_bindEvents() {
  const el = this.query('[role="listbox"]');
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { /* fokuser næste option */ }
    if (e.key === 'ArrowUp')   { /* fokuser forrige option */ }
    if (e.key === 'Escape')    { this.close(); }
  });
}
```

---

## Focus Management

Korrekt fokushåndtering er afgørende for brugere der navigerer med tastatur og AT.

### Regler

1. **Synlig fokusindikator altid.** Brug `button:focus-visible` ikke `button:focus` for at undgå fokusring ved museklik.
2. **delegatesFocus: true.** Alle komponenter opretter shadow root med `delegatesFocus: true` så Tab-tryk fokuserer det inderste interaktive element.
3. **Ingen `outline: none` uden alternativ.** Hvis den native outline fjernes, erstattes den med en synlig custom ring.
4. **Fokus fanges i dialogs.** `<ui-dialog>` implementerer focus trap så Tab aldrig forlader dialogen mens den er åben.
5. **Fokus returneres.** Når en dialog lukkes, returneres fokus til det element der åbnede den.
6. **Ingen positiv tabindex.** `tabindex="1"` eller højere bryder den naturlige tab-rækkefølge.

### Focus ring standard

```css
button:focus-visible {
  outline:        var(--ui-focus-ring);        /* 2px solid #f97316 */
  outline-offset: var(--ui-focus-ring-offset); /* 2px */
}
```

Fokusringen skal have minimum 3:1 kontrastratio mod den omgivende baggrund.

---

## ARIA Guidelines

ARIA bruges til at supplere semantisk HTML, ikke erstatte det.

### Brug ARIA-attributter korrekt

| Attribut | Brug | Eksempel |
|----------|------|---------|
| `aria-disabled` | Supplerer native `disabled` for AT | `aria-disabled="true"` |
| `aria-busy` | Indikerer asynkron operation | `aria-busy="true"` under loading |
| `aria-expanded` | Viser om et element er udvidet | `aria-expanded="false"` på lukket accordion |
| `aria-controls` | Peger på det element der kontrolleres | `aria-controls="panel-1"` |
| `aria-describedby` | Refererer til beskrivende tekst | `aria-describedby="hint-text"` |
| `aria-label` | Giver tilgængeligt navn uden synlig tekst | Ikoner-only knapper |
| `aria-hidden` | Skjuler dekorative elementer | Spinner, dekorative ikoner |
| `aria-live` | Annoncerer dynamiske indholdsopdateringer | Fejlbeskeder, toasts |

### Regel: Giv alle interactive elementer et tilgængeligt navn

```html
<!-- Korrekt: ikon-knap med aria-label -->
<ui-button aria-label="Luk dialog">
  <svg slot="icon-start" aria-hidden="true">...</svg>
</ui-button>

<!-- Forkert: ikon-knap uden tekst og uden aria-label -->
<ui-button>
  <svg slot="icon-start">...</svg>
</ui-button>
```

---

## Farvekontrast

Minimumskrav: **WCAG 2.1 niveau AA**.

| Element | Minimumskrav | ui-lib standard |
|---------|-------------|----------------|
| Normal tekst (< 18pt) | 4.5:1 | Opfyldt for alle varianter |
| Stor tekst (≥ 18pt / 14pt fed) | 3:1 | Opfyldt |
| UI-komponenter og grafiske elementer | 3:1 | Opfyldt for kanter og ikoner |
| Fokusindikator | 3:1 mod omgivende baggrund | Orange ring: ~4.5:1 |

### Kontrasttest for primære farver

| Kombination | Kontrast | Status |
|------------|---------|--------|
| Hvid tekst på `--orange-500` (#f97316) | 3.0:1 | ⚠️ Kun OK for stor tekst |
| Hvid tekst på `--orange-600` (#ea580c) | 3.7:1 | ✅ OK for tekst ≥ 14px fed |
| Hvid tekst på `--orange-700` (#c2410c) | 5.0:1 | ✅ WCAG AA |
| Hvid tekst på `--red-600` (#dc2626) | 4.6:1 | ✅ WCAG AA |
| Hvid tekst på `#404040` (neutral) | 10.0:1 | ✅ WCAG AAA |
| Mørk tekst (`#171717`) på `--orange-400` (#fb923c) | 5.8:1 | ✅ WCAG AA |

> **Bemærk:** Knaptekst på `--orange-500` (primary variant, lys tema) er marginalt.
> Sørg for at knapetiketter er ≥ 14px og semibold, eller overvej `--orange-600` som accent.

---

## Reduced Motion

Respektér brugernes præference for reduceret bevægelse.

```css
/* I tokens.css: */
@media (prefers-reduced-motion: reduce) {
  :root {
    --ui-duration-fast:   0ms;
    --ui-duration-normal: 0ms;
    --ui-duration-slow:   0ms;
    --ui-transition-default: none;
  }
}
```

```css
/* I komponent-CSS: reducer loading-spinner til statisk indikator */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation:        none;
    border-top-color: currentColor;
    opacity:          0.8;
  }
}
```

Regel: **Ingen bevægelse der er essentiel for at forstå indholdet må fjernes.**
Fadeout er OK at fjerne. Navigation-animationer er OK at fjerne.
En loading-spinner vises stadig, men den roterer ikke.

---

## Disabled States

Der er en vigtig forskel på `disabled` og `aria-disabled`:

| Attribut | Effekt | Hvornår |
|----------|--------|---------|
| `disabled` (native) | Fjerner element fra tab-rækkefølge, forhindrer klik, fjernes fra form submission | Altid på indre `<button>` når komponenten er disabled |
| `aria-disabled="true"` | Fortæller AT at elementet er deaktiveret, men fjerner det IKKE fra tab-rækkefølge | Sættes ud over native disabled på knapper |

### Regel: Brug begge

```html
<!-- Korrekt: begge attributter, AT-læser kan stadig nå til elementet -->
<button disabled aria-disabled="true">Gem</button>

<!-- Kun aria-disabled: elementet er stadig klikbart (bruges til "ikke tilgængeligt endnu"-scenarier) -->
<button aria-disabled="true">Gem</button>
```

Disabled elementer skal stadig opfylde minimumskravet for farvekontrast: minimum **3:1** mod baggrunden.

---

## Screen Reader Support

ui-lib testes mod følgende skærmlæsere:

| Skærmlæser | Browser | Platform |
|-----------|---------|---------|
| NVDA 2024 | Firefox, Chrome | Windows |
| JAWS 2024 | Chrome | Windows |
| VoiceOver | Safari | macOS / iOS |
| TalkBack | Chrome | Android |

### Regler for screen reader-kompatibilitet

1. **Semantisk HTML frem for ARIA.** `<button>` er altid bedre end `<div role="button">`.
2. **Live regions til dynamiske opdateringer.** Brug `aria-live="polite"` til ikke-kritiske beskeder, `aria-live="assertive"` til fejl.
3. **Ingen tekst kun i CSS.** Meningsfuldt indhold må aldrig generes via CSS `content:`.
4. **Ikoner er enten dekorative eller har alternativ tekst.** Dekorative: `aria-hidden="true"`. Meningsfulde: `aria-label` eller visuelt skjult `<span>`.
5. **Form labels er aldrig placeholder alene.** `placeholder` forsvinder ved input og bruges aldrig som eneste label.

---

## Slot Content Regler

Indhold leveret via slots er hostapplikationens ansvar, men komponenten har forpligtelser:

| Regel | Detalje |
|-------|---------|
| Slotted ikoner får `pointer-events: none` | Forhindrer at ikonen "stjæler" klik-target |
| `::slotted(svg)` får `width`/`height` | Sikrer konsistent ikonstore |
| Default slot annonceres korrekt | Det native slot-system sikrer at skærmlæseren læser indholdet som en del af knappens accessible name |
| Ikon-only brug kræver `aria-label` på `<ui-button>` | Komponenten kan ikke gætte intent; dokumentér dette tydeligt |

```html
<!-- Ikon-only knap: KRÆVER aria-label -->
<ui-button aria-label="Slet fil">
  <svg slot="icon-start" aria-hidden="true">...</svg>
</ui-button>
```
