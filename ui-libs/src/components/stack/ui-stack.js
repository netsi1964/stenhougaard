/**
 * <ui-stack> — Invisible layout primitive
 *
 * Arranges its children in a vertical or horizontal stack with a
 * token-based gap. Pure layout logic via flexbox — no visual output.
 *
 * Attributes:
 *   direction — 'vertical' | 'horizontal'                    (default: 'vertical')
 *   gap       — '1'..'16' token step or any CSS length        (default: '4')
 *   align     — 'start' | 'center' | 'end' | 'stretch'        (default: 'stretch')
 *   justify   — 'start' | 'center' | 'end' | 'between'        (default: 'start')
 *   wrap      — boolean, allow children to wrap
 *
 * Slots:
 *   (default) — stacked children
 *
 * CSS Parts:
 *   base — the flex container
 */

import { BaseElement } from '../../core/BaseElement.js';

/** Token steps allowed as gap shorthand, mapped to --ui-space-* */
const GAP_STEPS = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '10', '12', '14', '16']);

export class UiStack extends BaseElement {
  static get observedAttributes() {
    return ['direction', 'gap', 'align', 'justify', 'wrap'];
  }

  static css() {
    return /* css */`
      :host {
        display: block;
      }

      .base {
        display:        flex;
        flex-direction: column;
        align-items:    stretch;
        justify-content: flex-start;
        gap:            var(--stack-gap, var(--ui-space-4, 1rem));
      }

      :host([direction="horizontal"]) .base {
        flex-direction: row;
      }

      :host([wrap]) .base {
        flex-wrap: wrap;
      }

      :host([align="start"])   .base { align-items: flex-start; }
      :host([align="center"])  .base { align-items: center; }
      :host([align="end"])     .base { align-items: flex-end; }
      :host([align="stretch"]) .base { align-items: stretch; }

      :host([justify="start"])   .base { justify-content: flex-start; }
      :host([justify="center"])  .base { justify-content: center; }
      :host([justify="end"])     .base { justify-content: flex-end; }
      :host([justify="between"]) .base { justify-content: space-between; }
    `;
  }

  /** @returns {'vertical'|'horizontal'} */
  get direction() {
    return this.getStr('direction', 'vertical');
  }
  set direction(value) {
    this.setAttribute('direction', value);
  }

  /** @returns {string} Token step ('1'..'16') or CSS length */
  get gap() {
    return this.getStr('gap', '4');
  }
  set gap(value) {
    this.setAttribute('gap', String(value));
  }

  template() {
    return /* html */`<div class="base" part="base"><slot></slot></div>`;
  }

  rendered() {
    this._applyGap();
  }

  _update() {
    this._applyGap();
    super._update();
  }

  /** Resolve the gap attribute to either a spacing token or a raw CSS length. */
  _applyGap() {
    const gap = this.gap;
    const value = GAP_STEPS.has(gap) ? `var(--ui-space-${gap}, 1rem)` : gap;
    this.style.setProperty('--stack-gap', value);
  }
}

customElements.define('ui-stack', UiStack);
