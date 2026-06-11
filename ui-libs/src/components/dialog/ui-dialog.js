/**
 * <ui-dialog> — Modal dialog built on the native <dialog> element
 *
 * Native <dialog> provides focus trapping, Escape-to-close and ::backdrop
 * for free. This component adds tokens, slots, events and a consistent API.
 *
 * Attributes:
 *   heading    — dialog title shown in the header
 *   open       — boolean, reflects the open state (can be set declaratively)
 *   persistent — boolean, disables backdrop-click and Escape closing
 *
 * Methods:
 *   show()  — open as a modal
 *   close() — close the dialog
 *
 * Events:
 *   ui-open  — fired after the dialog opens
 *   ui-close — fired after the dialog closes
 *
 * Slots:
 *   (default) — dialog body content
 *   footer    — action buttons row
 *
 * CSS Parts:
 *   base   — the native <dialog>
 *   header — header row
 *   body   — content area
 *   footer — footer area
 *
 * CSS Custom Properties:
 *   --dialog-width    Max width (default: 28rem)
 *   --dialog-radius   Border radius
 */

import { BaseElement } from '../../core/BaseElement.js';

export class UiDialog extends BaseElement {
  static get observedAttributes() {
    return ['heading', 'open', 'persistent'];
  }

  static css() {
    return /* css */`
      :host {
        --dialog-width:  28rem;
        --dialog-radius: var(--ui-radius-xl, 1rem);
      }

      dialog {
        width:         min(var(--dialog-width), calc(100vw - 2rem));
        background:    var(--ui-surface-overlay, #ffffff);
        color:         var(--ui-text-primary, #171717);
        border:        1px solid var(--ui-border-subtle, #e5e5e5);
        border-radius: var(--dialog-radius);
        box-shadow:    var(--ui-shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1));
        padding:       0;
        font-family:   var(--ui-font-family-sans, system-ui, sans-serif);
      }

      dialog::backdrop {
        background: rgba(0, 0, 0, 0.45);
      }

      dialog[open] {
        animation: dialog-in var(--ui-duration-slow, 300ms) var(--ui-easing-out, ease-out);
      }

      @keyframes dialog-in {
        from { opacity: 0; transform: translateY(8px) scale(0.97); }
        to   { opacity: 1; transform: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        dialog[open] { animation: none; }
      }

      .header {
        display:         flex;
        align-items:     center;
        justify-content: space-between;
        gap:             var(--ui-space-4, 1rem);
        padding:         var(--ui-space-5, 1.25rem) var(--ui-space-6, 1.5rem) 0;
      }

      .heading {
        margin:      0;
        font-size:   var(--ui-font-size-lg, 1.125rem);
        font-weight: var(--ui-font-weight-semibold, 600);
        line-height: var(--ui-line-height-tight, 1.25);
      }

      .close-btn {
        display:       inline-flex;
        align-items:   center;
        justify-content: center;
        width:         2rem;
        height:        2rem;
        border:        none;
        background:    transparent;
        border-radius: var(--ui-radius-md, 0.5rem);
        color:         var(--ui-text-secondary, #525252);
        cursor:        pointer;
        font-size:     1.1rem;
        line-height:   1;
        flex-shrink:   0;
        transition:    background-color var(--ui-duration-fast, 100ms) ease;
      }

      .close-btn:hover {
        background: var(--ui-state-hover, rgba(0,0,0,0.04));
        color:      var(--ui-text-primary, #171717);
      }

      .close-btn:focus-visible {
        outline:        var(--ui-focus-ring, 2px solid #f97316);
        outline-offset: 1px;
      }

      .body {
        padding:     var(--ui-space-4, 1rem) var(--ui-space-6, 1.5rem) var(--ui-space-6, 1.5rem);
        font-size:   var(--ui-font-size-sm, 0.875rem);
        line-height: var(--ui-line-height-relaxed, 1.625);
        color:       var(--ui-text-secondary, #525252);
      }

      .footer {
        display:         none;
        justify-content: flex-end;
        gap:             var(--ui-space-3, 0.75rem);
        padding:         var(--ui-space-4, 1rem) var(--ui-space-6, 1.5rem);
        border-top:      1px solid var(--ui-border-subtle, #e5e5e5);
        background:      var(--ui-surface-sunken, #fafafa);
      }

      .footer.has-content {
        display: flex;
      }
    `;
  }

  /** @returns {string} */
  get heading() {
    return this.getStr('heading');
  }
  set heading(value) {
    this.setAttribute('heading', value);
  }

  /** @returns {boolean} */
  get open() {
    return this.getBool('open');
  }
  set open(value) {
    this.setBool('open', Boolean(value));
  }

  /** @returns {boolean} */
  get persistent() {
    return this.getBool('persistent');
  }
  set persistent(value) {
    this.setBool('persistent', Boolean(value));
  }

  template() {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return /* html */`
      <dialog part="base" aria-labelledby="heading">
        <div class="header" part="header">
          <h2 class="heading" id="heading">${esc(this.heading)}</h2>
          <button class="close-btn" type="button" aria-label="Close">✕</button>
        </div>
        <div class="body" part="body"><slot></slot></div>
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </dialog>
    `;
  }

  rendered() {
    const slot = this.query('slot[name="footer"]');
    const footer = this.query('.footer');
    if (slot && footer) {
      const sync = () => {
        footer.classList.toggle('has-content', slot.assignedNodes().length > 0);
      };
      slot.addEventListener('slotchange', sync);
      this.onCleanup(() => slot.removeEventListener('slotchange', sync));
      sync();
    }

    // Declarative open: <ui-dialog open>
    if (this.open) {
      this.show();
    }
  }

  _bindEvents() {
    const dialog = this.query('dialog');
    const closeBtn = this.query('.close-btn');
    if (!dialog) return;

    const onCancel = (e) => {
      // Escape key — block when persistent
      if (this.persistent) e.preventDefault();
    };

    const onClick = (e) => {
      // Backdrop click: the <dialog> itself is the target only when
      // the click lands outside its content box
      if (this.persistent || e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      const inside =
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top  && e.clientY <= r.bottom;
      if (!inside) this.close();
    };

    const onClose = () => {
      this.setBool('open', false);
      this.emit('ui-close');
    };

    const onCloseBtn = () => this.close();

    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('close', onClose);
    closeBtn?.addEventListener('click', onCloseBtn);

    this.onCleanup(() => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('close', onClose);
      closeBtn?.removeEventListener('click', onCloseBtn);
    });
  }

  _update() {
    const headingEl = this.query('.heading');
    if (headingEl) headingEl.textContent = this.heading;

    const dialog = this.query('dialog');
    if (dialog) {
      if (this.open && !dialog.open) this.show();
      if (!this.open && dialog.open) this.close();
    }

    super._update();
  }

  /** Open the dialog as a modal */
  show() {
    const dialog = this.query('dialog');
    if (!dialog || dialog.open) return;
    dialog.showModal();
    this.setBool('open', true);
    this.emit('ui-open');
  }

  /** Close the dialog */
  close() {
    const dialog = this.query('dialog');
    if (!dialog || !dialog.open) return;
    dialog.close(); // 'close' event handler resets the open attribute + emits ui-close
  }
}

customElements.define('ui-dialog', UiDialog);
