/**
 * <ui-badge> — Small status indicator
 *
 * Attributes:
 *   variant — 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent'  (default: 'default')
 *   dot     — boolean, show a leading status dot
 *   pill    — boolean, fully rounded corners (default shape is rounded rectangle)
 *
 * Slots:
 *   (default) — badge label text
 *
 * CSS Parts:
 *   base — the badge container
 *
 * CSS Custom Properties:
 *   --badge-bg     Background color override
 *   --badge-color  Text color override
 */

import { BaseElement } from '../../core/BaseElement.js';

export class UiBadge extends BaseElement {
  static get observedAttributes() {
    return ['variant', 'dot', 'pill'];
  }

  static css() {
    return /* css */`
      :host {
        display: inline-flex;
        vertical-align: middle;
      }

      .base {
        display:        inline-flex;
        align-items:    center;
        gap:            0.375em;
        padding:        0.125rem var(--ui-space-2, 0.5rem);
        border-radius:  var(--ui-radius-sm, 0.25rem);
        font-family:    var(--ui-font-family-sans, system-ui, sans-serif);
        font-size:      var(--ui-font-size-xs, 0.75rem);
        font-weight:    var(--ui-font-weight-semibold, 600);
        line-height:    var(--ui-line-height-normal, 1.5);
        letter-spacing: 0.02em;
        white-space:    nowrap;
        background:     var(--badge-bg,    var(--ui-surface-sunken, #f5f5f5));
        color:          var(--badge-color, var(--ui-text-secondary, #525252));
      }

      :host([pill]) .base {
        border-radius: var(--ui-radius-full, 9999px);
      }

      .dot {
        display:       none;
        width:         0.5em;
        height:        0.5em;
        border-radius: 50%;
        background:    currentColor;
        flex-shrink:   0;
      }

      :host([dot]) .dot {
        display: inline-block;
      }

      :host([variant="success"]) .base {
        background: var(--badge-bg,    var(--ui-success-subtle, #f0fdf4));
        color:      var(--badge-color, var(--ui-success, #16a34a));
      }

      :host([variant="warning"]) .base {
        background: var(--badge-bg,    var(--ui-warning-subtle, #fffbeb));
        color:      var(--badge-color, var(--ui-warning, #d97706));
      }

      :host([variant="danger"]) .base {
        background: var(--badge-bg,    var(--ui-danger-subtle, #fef2f2));
        color:      var(--badge-color, var(--ui-danger, #dc2626));
      }

      :host([variant="info"]) .base {
        background: var(--badge-bg,    var(--ui-info-subtle, #eff6ff));
        color:      var(--badge-color, var(--ui-info, #2563eb));
      }

      :host([variant="accent"]) .base {
        background: var(--badge-bg,    var(--ui-accent-subtle, #fff7ed));
        color:      var(--badge-color, var(--ui-accent, #f97316));
      }
    `;
  }

  /** @returns {'default'|'success'|'warning'|'danger'|'info'|'accent'} */
  get variant() {
    return this.getStr('variant', 'default');
  }
  set variant(value) {
    this.setAttribute('variant', value);
  }

  /** @returns {boolean} */
  get dot() {
    return this.getBool('dot');
  }
  set dot(value) {
    this.setBool('dot', Boolean(value));
  }

  template() {
    return /* html */`
      <span class="base" part="base">
        <span class="dot" aria-hidden="true"></span>
        <slot></slot>
      </span>
    `;
  }
}

customElements.define('ui-badge', UiBadge);
