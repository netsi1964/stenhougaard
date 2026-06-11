/**
 * Component test suite — ui-card, ui-stack, ui-badge, ui-icon, ui-input, ui-dialog
 * =============================================================================
 * Same strategy as ui-button.test.js: test the PUBLIC API only — attributes,
 * properties, events and slots. Never internal shadow DOM details.
 *
 * Running:
 *   npx vitest run tests/components.test.js
 * =============================================================================
 */

import { describe, it, expect, vi } from 'vitest';

async function mount(html) {
  await import('../src/index.js');

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  await Promise.resolve();

  return {
    container,
    el: container.firstElementChild,
    cleanup: () => document.body.removeChild(container),
  };
}

// ===========================================================================
// <ui-card>
// ===========================================================================
describe('<ui-card>', () => {
  it('registers as a custom element', async () => {
    await import('../src/index.js');
    expect(customElements.get('ui-card')).toBeDefined();
  });

  it('reflects clickable attribute to property', async () => {
    const { el, cleanup } = await mount('<ui-card clickable>Body</ui-card>');
    expect(el.clickable).toBe(true);
    el.clickable = false;
    expect(el.hasAttribute('clickable')).toBe(false);
    cleanup();
  });

  it('emits ui-card-click on click when clickable', async () => {
    const { el, cleanup } = await mount('<ui-card clickable>Body</ui-card>');
    const handler = vi.fn();
    el.addEventListener('ui-card-click', handler);
    el.shadowRoot.querySelector('[part="base"]').click();
    expect(handler).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('does NOT emit ui-card-click when not clickable', async () => {
    const { el, cleanup } = await mount('<ui-card>Body</ui-card>');
    const handler = vi.fn();
    el.addEventListener('ui-card-click', handler);
    el.shadowRoot.querySelector('[part="base"]').click();
    expect(handler).not.toHaveBeenCalled();
    cleanup();
  });

  it('exposes role=button and tabindex when clickable', async () => {
    const { el, cleanup } = await mount('<ui-card clickable>Body</ui-card>');
    const base = el.shadowRoot.querySelector('[part="base"]');
    expect(base.getAttribute('role')).toBe('button');
    expect(base.getAttribute('tabindex')).toBe('0');
    cleanup();
  });

  it('renders header and footer slot content', async () => {
    const { el, cleanup } = await mount(`
      <ui-card>
        <span slot="header">H</span>
        Body
        <span slot="footer">F</span>
      </ui-card>
    `);
    const headerSlot = el.shadowRoot.querySelector('slot[name="header"]');
    const footerSlot = el.shadowRoot.querySelector('slot[name="footer"]');
    expect(headerSlot.assignedNodes().length).toBe(1);
    expect(footerSlot.assignedNodes().length).toBe(1);
    cleanup();
  });
});

// ===========================================================================
// <ui-stack>
// ===========================================================================
describe('<ui-stack>', () => {
  it('defaults to vertical direction and gap 4', async () => {
    const { el, cleanup } = await mount('<ui-stack><span>a</span></ui-stack>');
    expect(el.direction).toBe('vertical');
    expect(el.gap).toBe('4');
    cleanup();
  });

  it('maps token gap steps to --stack-gap custom property', async () => {
    const { el, cleanup } = await mount('<ui-stack gap="8"><span>a</span></ui-stack>');
    expect(el.style.getPropertyValue('--stack-gap')).toContain('--ui-space-8');
    cleanup();
  });

  it('passes raw CSS lengths through as-is', async () => {
    const { el, cleanup } = await mount('<ui-stack gap="13px"><span>a</span></ui-stack>');
    expect(el.style.getPropertyValue('--stack-gap')).toBe('13px');
    cleanup();
  });

  it('reflects direction property to attribute', async () => {
    const { el, cleanup } = await mount('<ui-stack><span>a</span></ui-stack>');
    el.direction = 'horizontal';
    expect(el.getAttribute('direction')).toBe('horizontal');
    cleanup();
  });
});

// ===========================================================================
// <ui-badge>
// ===========================================================================
describe('<ui-badge>', () => {
  it('defaults to the default variant', async () => {
    const { el, cleanup } = await mount('<ui-badge>New</ui-badge>');
    expect(el.variant).toBe('default');
    cleanup();
  });

  it('reflects variant and dot', async () => {
    const { el, cleanup } = await mount('<ui-badge variant="success" dot>OK</ui-badge>');
    expect(el.variant).toBe('success');
    expect(el.dot).toBe(true);
    el.dot = false;
    expect(el.hasAttribute('dot')).toBe(false);
    cleanup();
  });

  it('renders slotted label text', async () => {
    const { el, cleanup } = await mount('<ui-badge>Hello</ui-badge>');
    const slot = el.shadowRoot.querySelector('slot');
    expect(slot.assignedNodes()[0].textContent).toBe('Hello');
    cleanup();
  });
});

// ===========================================================================
// <ui-icon>
// ===========================================================================
describe('<ui-icon>', () => {
  it('renders an svg for a known icon name', async () => {
    const { el, cleanup } = await mount('<ui-icon name="check"></ui-icon>');
    const svg = el.shadowRoot.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.querySelector('path').getAttribute('d')).not.toBe('');
    cleanup();
  });

  it('is aria-hidden without a label (decorative)', async () => {
    const { el, cleanup } = await mount('<ui-icon name="check"></ui-icon>');
    expect(el.shadowRoot.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
    cleanup();
  });

  it('exposes role=img and aria-label with a label (semantic)', async () => {
    const { el, cleanup } = await mount('<ui-icon name="warning" label="Warning"></ui-icon>');
    const svg = el.shadowRoot.querySelector('svg');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Warning');
    cleanup();
  });

  it('updates the path when name changes', async () => {
    const { el, cleanup } = await mount('<ui-icon name="check"></ui-icon>');
    const before = el.shadowRoot.querySelector('path').getAttribute('d');
    el.name = 'plus';
    const after = el.shadowRoot.querySelector('path').getAttribute('d');
    expect(after).not.toBe(before);
    cleanup();
  });

  it('publishes the icon name list statically', async () => {
    const { UiIcon } = await import('../src/components/icon/ui-icon.js');
    expect(UiIcon.iconNames).toContain('check');
    expect(UiIcon.iconNames.length).toBeGreaterThan(10);
  });
});

// ===========================================================================
// <ui-input>
// ===========================================================================
describe('<ui-input>', () => {
  it('is form-associated', async () => {
    const { UiInput } = await import('../src/components/input/ui-input.js');
    expect(UiInput.formAssociated).toBe(true);
  });

  it('renders label, help text and error message', async () => {
    const { el, cleanup } = await mount(
      '<ui-input label="Name" help-text="Hint" error="Bad"></ui-input>'
    );
    const root = el.shadowRoot;
    expect(root.querySelector('.label').textContent).toContain('Name');
    expect(root.querySelector('.help').textContent).toBe('Hint');
    expect(root.querySelector('.error').textContent).toBe('Bad');
    cleanup();
  });

  it('sets aria-invalid when error is present', async () => {
    const { el, cleanup } = await mount('<ui-input label="A" error="Bad"></ui-input>');
    expect(el.shadowRoot.querySelector('input').getAttribute('aria-invalid')).toBe('true');
    el.error = '';
    expect(el.shadowRoot.querySelector('input').getAttribute('aria-invalid')).toBe('false');
    cleanup();
  });

  it('value property reads/writes the inner input', async () => {
    const { el, cleanup } = await mount('<ui-input label="A" value="x"></ui-input>');
    expect(el.value).toBe('x');
    el.value = 'y';
    expect(el.shadowRoot.querySelector('input').value).toBe('y');
    cleanup();
  });

  it('emits ui-input with the current value', async () => {
    const { el, cleanup } = await mount('<ui-input label="A"></ui-input>');
    const handler = vi.fn();
    el.addEventListener('ui-input', handler);

    const input = el.shadowRoot.querySelector('input');
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe('abc');
    cleanup();
  });

  it('disables the inner input via the disabled attribute', async () => {
    const { el, cleanup } = await mount('<ui-input label="A" disabled></ui-input>');
    expect(el.shadowRoot.querySelector('input').disabled).toBe(true);
    el.disabled = false;
    expect(el.shadowRoot.querySelector('input').disabled).toBe(false);
    cleanup();
  });
});

// ===========================================================================
// <ui-dialog>
// ===========================================================================
describe('<ui-dialog>', () => {
  it('renders the heading attribute', async () => {
    const { el, cleanup } = await mount('<ui-dialog heading="Title">Body</ui-dialog>');
    expect(el.shadowRoot.querySelector('.heading').textContent).toBe('Title');
    el.heading = 'Other';
    expect(el.shadowRoot.querySelector('.heading').textContent).toBe('Other');
    cleanup();
  });

  it('show() opens the dialog, sets open and emits ui-open', async () => {
    const { el, cleanup } = await mount('<ui-dialog heading="T">Body</ui-dialog>');
    const handler = vi.fn();
    el.addEventListener('ui-open', handler);

    el.show();

    expect(el.open).toBe(true);
    expect(el.shadowRoot.querySelector('dialog').open).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('close() closes the dialog, clears open and emits ui-close', async () => {
    const { el, cleanup } = await mount('<ui-dialog heading="T">Body</ui-dialog>');
    const handler = vi.fn();
    el.addEventListener('ui-close', handler);

    el.show();
    el.close();

    expect(el.open).toBe(false);
    expect(el.shadowRoot.querySelector('dialog').open).toBe(false);
    expect(handler).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('close button inside the dialog closes it', async () => {
    const { el, cleanup } = await mount('<ui-dialog heading="T">Body</ui-dialog>');
    el.show();
    el.shadowRoot.querySelector('.close-btn').click();
    expect(el.open).toBe(false);
    cleanup();
  });

  it('persistent dialog blocks the cancel (Escape) event', async () => {
    const { el, cleanup } = await mount('<ui-dialog heading="T" persistent>Body</ui-dialog>');
    el.show();

    const dialog = el.shadowRoot.querySelector('dialog');
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(el.open).toBe(true);
    cleanup();
  });
});
