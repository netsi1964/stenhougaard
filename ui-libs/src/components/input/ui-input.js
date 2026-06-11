/**
 * <ui-input> — Text input with label, help text and error message
 *
 * Form-associated custom element: participates in native <form> submit,
 * reset and validation via ElementInternals.
 *
 * Attributes:
 *   label       — visible field label (required for accessibility)
 *   type        — 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'  (default: 'text')
 *   value       — initial value
 *   name        — form field name
 *   placeholder — placeholder text
 *   help-text   — supplementary help line under the field
 *   error       — error message; presence switches the field to invalid state
 *   disabled    — boolean
 *   required    — boolean
 *   readonly    — boolean
 *   size        — 'sm' | 'md' | 'lg'                                                    (default: 'md')
 *
 * Events:
 *   ui-input  — on every input               detail: { value }
 *   ui-change — on committed change (blur)   detail: { value }
 *
 * Slots:
 *   icon-start — icon inside the field, before the text
 *   icon-end   — icon inside the field, after the text
 *
 * CSS Parts:
 *   base  — the field wrapper (border box)
 *   input — the native <input>
 *   label — the label element
 *
 * CSS Custom Properties:
 *   --input-bg      Field background
 *   --input-border  Border color
 *   --input-radius  Border radius
 */

import { BaseElement } from '../../core/BaseElement.js';

export class UiInput extends BaseElement {
  static formAssociated = true;

  static get observedAttributes() {
    return [
      'label', 'type', 'value', 'name', 'placeholder',
      'help-text', 'error', 'disabled', 'required', 'readonly', 'size',
    ];
  }

  constructor() {
    super();
    /** @type {ElementInternals|null} */
    this._internals = this.attachInternals ? this.attachInternals() : null;
  }

  static css() {
    return /* css */`
      :host {
        display: block;
        font-family: var(--ui-font-family-sans, system-ui, sans-serif);

        --input-bg:     var(--ui-surface-default, #ffffff);
        --input-border: var(--ui-border-default, #d4d4d4);
        --input-radius: var(--ui-radius-md, 0.5rem);
      }

      .label {
        display:       block;
        margin-bottom: var(--ui-space-1, 0.25rem);
        font-size:     var(--ui-font-size-sm, 0.875rem);
        font-weight:   var(--ui-font-weight-medium, 500);
        color:         var(--ui-text-primary, #171717);
      }

      .required-mark {
        color: var(--ui-danger, #dc2626);
      }

      .field {
        display:       flex;
        align-items:   center;
        gap:           var(--ui-space-2, 0.5rem);
        background:    var(--input-bg);
        border:        1.5px solid var(--input-border);
        border-radius: var(--input-radius);
        padding:       0 var(--ui-space-3, 0.75rem);
        transition:    border-color var(--ui-duration-normal, 200ms) var(--ui-easing-default, ease),
                       box-shadow   var(--ui-duration-normal, 200ms) var(--ui-easing-default, ease);
      }

      .field:focus-within {
        border-color: var(--ui-accent, #f97316);
        box-shadow:   0 0 0 3px var(--ui-accent-subtle, rgba(249, 115, 22, 0.15));
      }

      :host([error]) .field {
        border-color: var(--ui-danger, #dc2626);
      }

      :host([error]) .field:focus-within {
        box-shadow: 0 0 0 3px var(--ui-danger-subtle, rgba(220, 38, 38, 0.12));
      }

      :host([disabled]) .field {
        background:     var(--ui-state-disabled-bg, #f5f5f5);
        border-color:   var(--ui-state-disabled-border, #e5e5e5);
        cursor:         not-allowed;
      }

      input {
        flex:        1;
        min-width:   0;
        border:      none;
        outline:     none;
        background:  transparent;
        font-family: inherit;
        color:       var(--ui-text-primary, #171717);
        padding:     0;
      }

      input::placeholder {
        color: var(--ui-text-tertiary, #a3a3a3);
      }

      input:disabled {
        color:  var(--ui-state-disabled-text, #a3a3a3);
        cursor: not-allowed;
      }

      /* Sizes */
      :host(:not([size])) input,
      :host([size="md"]) input {
        font-size:  var(--ui-font-size-sm, 0.875rem);
        min-height: 2.5rem;
      }

      :host([size="sm"]) input {
        font-size:  var(--ui-font-size-sm, 0.875rem);
        min-height: 2rem;
      }

      :host([size="lg"]) input {
        font-size:  var(--ui-font-size-md, 1rem);
        min-height: 3rem;
      }

      .help, .error {
        margin-top: var(--ui-space-1, 0.25rem);
        font-size:  var(--ui-font-size-xs, 0.75rem);
        line-height: var(--ui-line-height-normal, 1.5);
      }

      .help  { color: var(--ui-text-secondary, #525252); }
      .error { color: var(--ui-danger, #dc2626); }

      .help:empty, .error:empty, .label:empty {
        display: none;
      }

      slot[name="icon-start"]::slotted(*),
      slot[name="icon-end"]::slotted(*) {
        display:     inline-flex;
        flex-shrink: 0;
        width:       1.1em;
        height:      1.1em;
        color:       var(--ui-text-tertiary, #a3a3a3);
      }
    `;
  }

  // ---------------------------------------------------------------------------
  // Properties
  // ---------------------------------------------------------------------------

  /** @returns {string} Current value (live, from the inner input) */
  get value() {
    const input = this.query('input');
    return input ? input.value : this.getStr('value');
  }
  set value(value) {
    const input = this.query('input');
    if (input) input.value = value ?? '';
    this._syncFormValue();
  }

  /** @returns {string} */
  get name() {
    return this.getStr('name');
  }
  set name(value) {
    this.setAttribute('name', value);
  }

  /** @returns {boolean} */
  get disabled() {
    return this.getBool('disabled');
  }
  set disabled(value) {
    this.setBool('disabled', Boolean(value));
  }

  /** @returns {boolean} */
  get required() {
    return this.getBool('required');
  }
  set required(value) {
    this.setBool('required', Boolean(value));
  }

  /** @returns {string} */
  get error() {
    return this.getStr('error');
  }
  set error(value) {
    if (value) {
      this.setAttribute('error', value);
    } else {
      this.removeAttribute('error');
    }
  }

  // ---------------------------------------------------------------------------
  // Template
  // ---------------------------------------------------------------------------

  template() {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const label = esc(this.getStr('label'));
    const error = esc(this.error);
    const help  = esc(this.getStr('help-text'));

    return /* html */`
      <label class="label" part="label" for="input">
        ${label}${this.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}
      </label>
      <div class="field" part="base">
        <slot name="icon-start"></slot>
        <input
          id="input"
          part="input"
          type="${esc(this.getStr('type', 'text'))}"
          value="${esc(this.getStr('value'))}"
          placeholder="${esc(this.getStr('placeholder'))}"
          aria-describedby="help error"
          aria-invalid="${Boolean(error)}"
          ${this.disabled ? 'disabled' : ''}
          ${this.required ? 'required' : ''}
          ${this.getBool('readonly') ? 'readonly' : ''}
        />
        <slot name="icon-end"></slot>
      </div>
      <div class="error" id="error" role="alert">${error}</div>
      <div class="help" id="help">${help}</div>
    `;
  }

  rendered() {
    this._syncFormValue();
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  _bindEvents() {
    const input = this.query('input');
    if (!input) return;

    const onInput = () => {
      this._syncFormValue();
      this.emit('ui-input', { value: input.value });
    };
    const onChange = () => {
      this.emit('ui-change', { value: input.value });
    };

    input.addEventListener('input', onInput);
    input.addEventListener('change', onChange);
    this.onCleanup(() => {
      input.removeEventListener('input', onInput);
      input.removeEventListener('change', onChange);
    });
  }

  // ---------------------------------------------------------------------------
  // Updates
  // ---------------------------------------------------------------------------

  _update() {
    const input = this.query('input');
    if (!input) return;

    input.type        = this.getStr('type', 'text');
    input.placeholder = this.getStr('placeholder');
    input.disabled    = this.disabled;
    input.required    = this.required;
    input.readOnly    = this.getBool('readonly');
    input.setAttribute('aria-invalid', String(Boolean(this.error)));

    const labelEl = this.query('.label');
    if (labelEl) {
      labelEl.innerHTML = '';
      labelEl.append(this.getStr('label'));
      if (this.required) {
        const mark = document.createElement('span');
        mark.className = 'required-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = ' *';
        labelEl.append(mark);
      }
    }

    const errorEl = this.query('.error');
    if (errorEl) errorEl.textContent = this.error;

    const helpEl = this.query('.help');
    if (helpEl) helpEl.textContent = this.getStr('help-text');

    this._syncFormValue();
    super._update();
  }

  // ---------------------------------------------------------------------------
  // Form participation (ElementInternals)
  // ---------------------------------------------------------------------------

  _syncFormValue() {
    if (!this._internals) return;
    const input = this.query('input');
    const value = input ? input.value : this.getStr('value');
    this._internals.setFormValue(value);

    if (this.required && !value) {
      this._internals.setValidity({ valueMissing: true }, 'Field is required', input || undefined);
    } else {
      this._internals.setValidity({});
    }
  }

  /** Called by the browser on form reset */
  formResetCallback() {
    this.value = this.getStr('value');
  }

  /** Called by the browser when the fieldset/form disabled state changes */
  formDisabledCallback(disabled) {
    this.disabled = disabled;
  }
}

customElements.define('ui-input', UiInput);
