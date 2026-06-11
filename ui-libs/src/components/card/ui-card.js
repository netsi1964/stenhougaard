/**
 * <ui-card> — Card container with header, body and footer slots
 *
 * Attributes:
 *   hoverable  — boolean, elevate on hover
 *   clickable  — boolean, whole card acts as a button (emits ui-card-click)
 *   responsive — boolean, switches media+body to horizontal layout in wide
 *                containers (container query, ≥ 480px)
 *
 * Events:
 *   ui-card-click — fired on click/Enter/Space when clickable
 *                   detail: { originalEvent: Event }
 *
 * Slots:
 *   media     — image / illustration area (edge-to-edge, above the body)
 *   header    — card header (title row)
 *   (default) — card body content
 *   footer    — card footer (actions row)
 *
 * CSS Parts:
 *   base   — outer card container
 *   header — header area
 *   body   — body area
 *   footer — footer area
 *
 * CSS Custom Properties:
 *   --card-bg       Background color
 *   --card-border   Border color
 *   --card-radius   Border radius
 *   --card-padding  Padding for header/body/footer
 *   --card-shadow   Resting shadow
 */

import { BaseElement } from '../../core/BaseElement.js';

export class UiCard extends BaseElement {
  static get observedAttributes() {
    return ['hoverable', 'clickable', 'responsive'];
  }

  static css() {
    return /* css */`
      :host {
        display: block;
        container-type: inline-size;

        --card-bg:      var(--ui-surface-default, #ffffff);
        --card-border:  var(--ui-border-subtle, #e5e5e5);
        --card-radius:  var(--ui-radius-lg, 0.75rem);
        --card-padding: var(--ui-space-5, 1.25rem);
        --card-shadow:  var(--ui-shadow-xs, 0 1px 2px 0 rgba(0,0,0,0.05));
      }

      .base {
        display:        flex;
        flex-direction: column;
        background:     var(--card-bg);
        border:         1px solid var(--card-border);
        border-radius:  var(--card-radius);
        box-shadow:     var(--card-shadow);
        overflow:       hidden;
        height:         100%;
        transition:     box-shadow   var(--ui-duration-normal, 200ms) var(--ui-easing-default, ease),
                        transform    var(--ui-duration-normal, 200ms) var(--ui-easing-default, ease),
                        border-color var(--ui-duration-normal, 200ms) var(--ui-easing-default, ease);
      }

      :host([hoverable]) .base:hover {
        box-shadow: var(--ui-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
        transform:  translateY(-2px);
      }

      :host([clickable]) .base {
        cursor: pointer;
      }

      :host([clickable]) .base:hover {
        border-color: var(--ui-accent, #f97316);
      }

      :host([clickable]) .base:focus-visible {
        outline:        var(--ui-focus-ring, 2px solid #f97316);
        outline-offset: var(--ui-focus-ring-offset, 2px);
      }

      .media {
        display: block;
      }

      .media::slotted(*) {
        display:    block;
        width:      100%;
        object-fit: cover;
      }

      .header {
        display:       none;
        padding:       var(--card-padding);
        padding-bottom: 0;
        font-weight:   var(--ui-font-weight-semibold, 600);
        color:         var(--ui-text-primary, #171717);
      }

      .header.has-content {
        display: block;
      }

      .body {
        padding:   var(--card-padding);
        color:     var(--ui-text-primary, #171717);
        font-size: var(--ui-font-size-sm, 0.875rem);
        line-height: var(--ui-line-height-normal, 1.5);
        flex:      1;
      }

      .footer {
        display:       none;
        padding:       var(--card-padding);
        padding-top:   var(--ui-space-3, 0.75rem);
        border-top:    1px solid var(--card-border);
        background:    var(--ui-surface-sunken, #fafafa);
      }

      .footer.has-content {
        display: block;
      }

      /* Responsive: media + content side by side in wide containers */
      @container (min-width: 480px) {
        :host([responsive]) .base {
          flex-direction: row;
        }

        :host([responsive]) .media-wrap {
          flex:      0 0 40%;
          max-width: 40%;
        }

        :host([responsive]) .media-wrap ::slotted(*) {
          height: 100%;
        }

        :host([responsive]) .content {
          flex: 1;
          min-width: 0;
        }
      }

      .content {
        display:        flex;
        flex-direction: column;
        flex:           1;
      }
    `;
  }

  /** @returns {boolean} */
  get clickable() {
    return this.getBool('clickable');
  }
  set clickable(value) {
    this.setBool('clickable', Boolean(value));
  }

  /** @returns {boolean} */
  get hoverable() {
    return this.getBool('hoverable');
  }
  set hoverable(value) {
    this.setBool('hoverable', Boolean(value));
  }

  template() {
    const clickable = this.clickable;
    return /* html */`
      <div
        class="base"
        part="base"
        ${clickable ? 'role="button" tabindex="0"' : ''}
      >
        <div class="media-wrap"><slot name="media" class="media"></slot></div>
        <div class="content">
          <div class="header" part="header"><slot name="header"></slot></div>
          <div class="body" part="body"><slot></slot></div>
          <div class="footer" part="footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `;
  }

  rendered() {
    // Hide header/footer wrappers when their slots are empty
    for (const name of ['header', 'footer']) {
      const slot = this.query(`slot[name="${name}"]`);
      const wrap = this.query(`.${name}`);
      if (!slot || !wrap) continue;

      const sync = () => {
        wrap.classList.toggle('has-content', slot.assignedNodes().length > 0);
      };
      slot.addEventListener('slotchange', sync);
      this.onCleanup(() => slot.removeEventListener('slotchange', sync));
      sync();
    }
  }

  _bindEvents() {
    const base = this.query('.base');
    if (!base) return;

    const activate = (e) => {
      if (!this.clickable) return;
      this.emit('ui-card-click', { originalEvent: e });
    };

    const onClick = (e) => activate(e);
    const onKeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(e);
      }
    };

    base.addEventListener('click', onClick);
    base.addEventListener('keydown', onKeydown);
    this.onCleanup(() => {
      base.removeEventListener('click', onClick);
      base.removeEventListener('keydown', onKeydown);
    });
  }

  _update() {
    const base = this.query('.base');
    if (!base) return;

    if (this.clickable) {
      base.setAttribute('role', 'button');
      base.setAttribute('tabindex', '0');
    } else {
      base.removeAttribute('role');
      base.removeAttribute('tabindex');
    }

    super._update();
  }
}

customElements.define('ui-card', UiCard);
