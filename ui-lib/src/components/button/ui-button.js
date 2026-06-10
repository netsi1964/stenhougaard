/**
 * <ui-button> — Accessible, themeable button component
 *
 * Attributes:
 *   variant   — 'primary' | 'secondary' | 'ghost' | 'danger' | 'neutral'
 *   size      — 'sm' | 'md' | 'lg'
 *   disabled  — boolean
 *   loading   — boolean
 *   full-width — boolean
 *   type      — 'button' | 'submit' | 'reset'
 *
 * Events:
 *   ui-click  — fired on click (unless disabled or loading), detail: { originalEvent }
 *
 * Slots:
 *   (default)     — button label
 *   icon-start    — icon before the label
 *   icon-end      — icon after the label
 *
 * CSS Parts:
 *   base          — the inner <button> element
 *
 * CSS Custom Properties (all fall back to --ui-* tokens):
 *   --button-accent, --button-accent-hover, --button-accent-active,
 *   --button-accent-text, --button-radius, --button-font-weight,
 *   --button-transition, --button-focus-ring, --button-focus-offset,
 *   --button-disabled-bg, --button-disabled-text, --button-disabled-border
 */

import { BaseElement } from '../../core/BaseElement.js';

export class UiButton extends BaseElement {
  // -------------------------------------------------------------------------
  // Web Component definition
  // -------------------------------------------------------------------------

  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading', 'full-width', 'type'];
  }

  // -------------------------------------------------------------------------
  // Styles
  // -------------------------------------------------------------------------

  static css() {
    return /* css */`
      /* ---- Host ---- */
      :host {
        display: inline-flex;
        vertical-align: middle;

        /* Customisation hooks — fall back to global tokens */
        --button-accent:          var(--ui-accent, #f97316);
        --button-accent-hover:    var(--ui-accent-hover, #ea580c);
        --button-accent-active:   var(--ui-accent-active, #c2410c);
        --button-accent-text:     var(--ui-accent-text, #ffffff);
        --button-radius:          var(--ui-radius-md, 0.5rem);
        --button-font-weight:     var(--ui-font-weight-semibold, 600);
        --button-transition:      background-color var(--ui-duration-normal, 200ms) var(--ui-easing-default, cubic-bezier(0.4,0,0.2,1)),
                                  border-color     var(--ui-duration-normal, 200ms) var(--ui-easing-default, cubic-bezier(0.4,0,0.2,1)),
                                  color            var(--ui-duration-normal, 200ms) var(--ui-easing-default, cubic-bezier(0.4,0,0.2,1)),
                                  box-shadow       var(--ui-duration-normal, 200ms) var(--ui-easing-default, cubic-bezier(0.4,0,0.2,1)),
                                  opacity          var(--ui-duration-normal, 200ms) var(--ui-easing-default, cubic-bezier(0.4,0,0.2,1)),
                                  transform        var(--ui-duration-fast, 100ms)   var(--ui-easing-default, cubic-bezier(0.4,0,0.2,1));
        --button-focus-ring:      var(--ui-focus-ring, 2px solid #f97316);
        --button-focus-offset:    var(--ui-focus-ring-offset, 2px);
        --button-disabled-bg:     var(--ui-state-disabled-bg, #f5f5f5);
        --button-disabled-text:   var(--ui-state-disabled-text, #a3a3a3);
        --button-disabled-border: var(--ui-state-disabled-border, #e5e5e5);
      }

      :host([full-width]) {
        display: flex;
        width: 100%;
      }

      /* ---- Base button ---- */
      button {
        display:         inline-flex;
        align-items:     center;
        justify-content: center;
        gap:             0.5em;
        width:           100%;
        border:          1.5px solid transparent;
        border-radius:   var(--button-radius);
        font-family:     var(--ui-font-family-sans, system-ui, sans-serif);
        font-weight:     var(--button-font-weight);
        line-height:     var(--ui-line-height-tight, 1.25);
        cursor:          pointer;
        white-space:     nowrap;
        user-select:     none;
        text-decoration: none;
        position:        relative;
        overflow:        hidden;
        transition:      var(--button-transition);
        -webkit-appearance: none;
        appearance:         none;
      }

      button:focus {
        outline: none;
      }

      button:focus-visible {
        outline:        var(--button-focus-ring);
        outline-offset: var(--button-focus-offset);
      }

      button:active:not([disabled]) {
        transform: scale(0.98);
      }

      /* ---- Sizes ---- */
      :host([size="sm"]) button,
      button[data-size="sm"] {
        padding:     0.375rem 0.75rem;
        font-size:   var(--ui-font-size-sm, 0.875rem);
        min-height:  2rem;
      }

      button,
      :host(:not([size])) button,
      :host([size="md"]) button {
        padding:     0.5rem 1rem;
        font-size:   var(--ui-font-size-sm, 0.875rem);
        min-height:  2.5rem;
      }

      :host([size="lg"]) button {
        padding:     0.75rem 1.5rem;
        font-size:   var(--ui-font-size-md, 1rem);
        min-height:  3rem;
      }

      /* ---- Variant: primary ---- */
      :host(:not([variant])) button,
      :host([variant="primary"]) button {
        background-color: var(--button-accent);
        border-color:     var(--button-accent);
        color:            var(--button-accent-text);
      }

      :host(:not([variant])) button:hover:not([disabled]),
      :host([variant="primary"]) button:hover:not([disabled]) {
        background-color: var(--button-accent-hover);
        border-color:     var(--button-accent-hover);
      }

      :host(:not([variant])) button:active:not([disabled]),
      :host([variant="primary"]) button:active:not([disabled]) {
        background-color: var(--button-accent-active);
        border-color:     var(--button-accent-active);
      }

      /* ---- Variant: secondary ---- */
      :host([variant="secondary"]) button {
        background-color: var(--ui-surface-default, #ffffff);
        border-color:     var(--ui-border-default, #d4d4d4);
        color:            var(--ui-text-primary, #171717);
      }

      :host([variant="secondary"]) button:hover:not([disabled]) {
        background-color: var(--ui-surface-sunken, #f5f5f5);
        border-color:     var(--ui-border-strong, #737373);
      }

      :host([variant="secondary"]) button:active:not([disabled]) {
        background-color: var(--ui-state-active, rgba(0,0,0,0.08));
        border-color:     var(--ui-border-strong, #737373);
      }

      /* ---- Variant: ghost ---- */
      :host([variant="ghost"]) button {
        background-color: transparent;
        border-color:     transparent;
        color:            var(--ui-text-primary, #171717);
      }

      :host([variant="ghost"]) button:hover:not([disabled]) {
        background-color: var(--ui-state-hover, rgba(0,0,0,0.04));
        border-color:     transparent;
      }

      :host([variant="ghost"]) button:active:not([disabled]) {
        background-color: var(--ui-state-active, rgba(0,0,0,0.08));
        border-color:     transparent;
      }

      /* ---- Variant: danger ---- */
      :host([variant="danger"]) button {
        background-color: var(--ui-danger, #dc2626);
        border-color:     var(--ui-danger, #dc2626);
        color:            #ffffff;
      }

      :host([variant="danger"]) button:hover:not([disabled]) {
        background-color: var(--ui-danger-hover, #b91c1c);
        border-color:     var(--ui-danger-hover, #b91c1c);
      }

      :host([variant="danger"]) button:active:not([disabled]) {
        background-color: var(--primitive-red-700, #b91c1c);
        border-color:     var(--primitive-red-700, #b91c1c);
        filter:           brightness(0.9);
      }

      /* ---- Variant: neutral ---- */
      :host([variant="neutral"]) button {
        background-color: var(--ui-surface-raised, #404040);
        border-color:     var(--ui-surface-raised, #404040);
        color:            #ffffff;
      }

      :host([variant="neutral"]) button:hover:not([disabled]) {
        background-color: #525252;
        border-color:     #525252;
      }

      :host([variant="neutral"]) button:active:not([disabled]) {
        background-color: #262626;
        border-color:     #262626;
      }

      /* ---- Disabled state ---- */
      button[disabled],
      button[aria-disabled="true"] {
        cursor:           not-allowed;
        pointer-events:   none;
        background-color: var(--button-disabled-bg)     !important;
        border-color:     var(--button-disabled-border) !important;
        color:            var(--button-disabled-text)   !important;
        transform:        none !important;
        opacity:          1;
      }

      /* ---- Loading spinner ---- */
      .spinner {
        display:          inline-block;
        width:            1em;
        height:           1em;
        border:           2px solid currentColor;
        border-top-color: transparent;
        border-radius:    50%;
        flex-shrink:      0;
        animation:        ui-spin var(--ui-duration-slow, 300ms) linear infinite;
        opacity:          0;
        position:         absolute;
        left:             50%;
        transform:        translateX(-50%);
        pointer-events:   none;
      }

      /* Show spinner, dim slot content when loading */
      :host([loading]) .spinner {
        opacity:  1;
        position: static;
        transform: none;
        animation: ui-spin 600ms linear infinite;
      }

      :host([loading]) .slot-default {
        opacity: 0.7;
      }

      .slot-default {
        display:    contents;
        transition: opacity var(--ui-duration-normal, 200ms) var(--ui-easing-default, cubic-bezier(0.4,0,0.2,1));
      }

      /* ---- Keyframes ---- */
      @keyframes ui-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }

      /* ---- Reduced motion ---- */
      @media (prefers-reduced-motion: reduce) {
        .spinner {
          animation: none;
          border-top-color: currentColor;
          opacity: 0.6;
        }
      }

      /* ---- Slot styling ---- */
      ::slotted(*) {
        pointer-events: none;
      }

      slot[name="icon-start"]::slotted(*),
      slot[name="icon-end"]::slotted(*) {
        display:     inline-flex;
        flex-shrink: 0;
        width:       1em;
        height:      1em;
      }

      /* part="base" — style the inner button element from outside via ::part(base) */
    `;
  }

  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  get variant() {
    return this.getStr('variant', 'primary');
  }
  set variant(value) {
    this.setAttribute('variant', value);
  }

  get size() {
    return this.getStr('size', 'md');
  }
  set size(value) {
    this.setAttribute('size', value);
  }

  get disabled() {
    return this.getBool('disabled');
  }
  set disabled(value) {
    this.setBool('disabled', value);
  }

  get loading() {
    return this.getBool('loading');
  }
  set loading(value) {
    this.setBool('loading', value);
  }

  get fullWidth() {
    return this.getBool('full-width');
  }
  set fullWidth(value) {
    this.setBool('full-width', value);
  }

  get type() {
    return this.getStr('type', 'button');
  }
  set type(value) {
    this.setAttribute('type', value);
  }

  // -------------------------------------------------------------------------
  // Template
  // -------------------------------------------------------------------------

  template() {
    const isDisabled = this.disabled;
    const isLoading  = this.loading;

    return /* html */`
      <button
        part="base"
        type="${this.type}"
        ${isDisabled ? 'disabled' : ''}
        aria-disabled="${isDisabled}"
        aria-busy="${isLoading}"
      >
        <span class="spinner" aria-hidden="true"></span>
        <slot name="icon-start"></slot>
        <span class="slot-default"><slot></slot></span>
        <slot name="icon-end"></slot>
      </button>
    `;
  }

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  _bindEvents() {
    const btn = this.query('button');
    if (!btn) return;

    const handleClick = (e) => {
      if (this.disabled || this.loading) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.emit('ui-click', { originalEvent: e });
    };

    btn.addEventListener('click', handleClick);
    this.onCleanup(() => btn.removeEventListener('click', handleClick));
  }

  // -------------------------------------------------------------------------
  // Updates
  // -------------------------------------------------------------------------

  _update() {
    const btn = this.query('button');
    if (!btn) return;

    const isDisabled = this.disabled;
    const isLoading  = this.loading;

    if (isDisabled) {
      btn.setAttribute('disabled', '');
    } else {
      btn.removeAttribute('disabled');
    }

    btn.setAttribute('aria-disabled', String(isDisabled));
    btn.setAttribute('aria-busy', String(isLoading));
    btn.setAttribute('type', this.type);

    super._update();
  }
}

customElements.define('ui-button', UiButton);
