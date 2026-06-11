/**
 * ui-button Test Suite
 * =============================================================================
 * Test strategy (Del 10):
 *
 * Tests are written in Vitest/Jest-compatible describe/it syntax using
 * @web/test-runner or Vitest + jsdom/happy-dom for Web Component support.
 *
 * Key principles:
 * 1. Test PUBLIC API only — attributes, properties, events, slots.
 *    Never test internal shadow DOM implementation details directly.
 * 2. Attribute reflection — attribute ↔ property parity is a hard contract.
 * 3. Boolean attributes follow HTML spec: present = true, absent = false.
 * 4. Events are composted CustomEvents; test via dispatchEvent interception.
 * 5. ARIA attributes are as important as visual state.
 * 6. Use real DOM (not stubs) where possible for Web Component tests.
 *
 * Running:
 *   npx vitest run tests/ui-button.test.js
 *   npx wtr tests/ui-button.test.js --node-resolve
 * =============================================================================
 */

// ---------------------------------------------------------------------------
// Vitest / Jest compatible imports
// ---------------------------------------------------------------------------
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Helper: create a connected ui-button element
// Assumes the component is registered (import side-effect in setup or here).
// ---------------------------------------------------------------------------
async function createElement(html = '<ui-button>Test</ui-button>') {
  // Dynamically import to trigger customElements.define side-effect
  await import('../src/components/button/ui-button.js');

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  // Wait one microtask tick for connectedCallback
  await Promise.resolve();

  return { element: container.querySelector('ui-button'), container };
}

function cleanup(container) {
  document.body.removeChild(container);
}

// ===========================================================================
// Test Suite
// ===========================================================================

describe('<ui-button>', () => {

  // -------------------------------------------------------------------------
  // Instantiation
  // -------------------------------------------------------------------------

  describe('Instantiation', () => {
    it('should be defined in the custom element registry', () => {
      // Verifies that customElements.define was called with the correct tag name
      expect(customElements.get('ui-button')).toBeDefined();
    });

    it('should instantiate via document.createElement', () => {
      // Verifies the element can be created programmatically
      const el = document.createElement('ui-button');
      expect(el).toBeInstanceOf(HTMLElement);
    });

    it('should have a shadow root after connection', async () => {
      // Verifies that attachShadow was called and shadow DOM is accessible
      const { element, container } = await createElement();
      expect(element.shadowRoot).not.toBeNull();
      cleanup(container);
    });

    it('should render an inner <button> element in the shadow root', async () => {
      // Verifies that the template() method produces the expected structure
      const { element, container } = await createElement();
      const btn = element.shadowRoot.querySelector('button');
      expect(btn).not.toBeNull();
      cleanup(container);
    });
  });

  // -------------------------------------------------------------------------
  // Attribute reflection
  // -------------------------------------------------------------------------

  describe('Attribute reflection', () => {
    it('should read variant attribute and reflect it as a property', async () => {
      // Attribute → property direction
      const { element, container } = await createElement('<ui-button variant="secondary">Test</ui-button>');
      expect(element.variant).toBe('secondary');
      cleanup(container);
    });

    it('should set variant attribute when property is assigned', async () => {
      // Property → attribute direction
      const { element, container } = await createElement();
      element.variant = 'danger';
      expect(element.getAttribute('variant')).toBe('danger');
      cleanup(container);
    });

    it('should default variant to "primary" when attribute is absent', async () => {
      // Default value for variant
      const { element, container } = await createElement();
      expect(element.variant).toBe('primary');
      cleanup(container);
    });

    it('should read size attribute and reflect it as a property', async () => {
      const { element, container } = await createElement('<ui-button size="lg">Test</ui-button>');
      expect(element.size).toBe('lg');
      cleanup(container);
    });

    it('should default size to "md" when attribute is absent', async () => {
      const { element, container } = await createElement();
      expect(element.size).toBe('md');
      cleanup(container);
    });

    it('should read type attribute and reflect it as a property', async () => {
      const { element, container } = await createElement('<ui-button type="submit">Send</ui-button>');
      expect(element.type).toBe('submit');
      cleanup(container);
    });

    it('should default type to "button" when attribute is absent', async () => {
      const { element, container } = await createElement();
      expect(element.type).toBe('button');
      cleanup(container);
    });
  });

  // -------------------------------------------------------------------------
  // Boolean attribute handling
  // -------------------------------------------------------------------------

  describe('Boolean attributes', () => {
    it('disabled property should be false by default', async () => {
      const { element, container } = await createElement();
      expect(element.disabled).toBe(false);
      cleanup(container);
    });

    it('disabled property should be true when attribute is present', async () => {
      // Boolean attribute presence = true
      const { element, container } = await createElement('<ui-button disabled>Test</ui-button>');
      expect(element.disabled).toBe(true);
      cleanup(container);
    });

    it('setting disabled=true should add the attribute', async () => {
      const { element, container } = await createElement();
      element.disabled = true;
      expect(element.hasAttribute('disabled')).toBe(true);
      cleanup(container);
    });

    it('setting disabled=false should remove the attribute', async () => {
      const { element, container } = await createElement('<ui-button disabled>Test</ui-button>');
      element.disabled = false;
      expect(element.hasAttribute('disabled')).toBe(false);
      cleanup(container);
    });

    it('loading property should be false by default', async () => {
      const { element, container } = await createElement();
      expect(element.loading).toBe(false);
      cleanup(container);
    });

    it('loading property should be true when attribute is present', async () => {
      const { element, container } = await createElement('<ui-button loading>Test</ui-button>');
      expect(element.loading).toBe(true);
      cleanup(container);
    });

    it('fullWidth property should be false by default', async () => {
      const { element, container } = await createElement();
      expect(element.fullWidth).toBe(false);
      cleanup(container);
    });

    it('fullWidth property should be true when full-width attribute is present', async () => {
      // Note: property name is camelCase, attribute name is kebab-case
      const { element, container } = await createElement('<ui-button full-width>Test</ui-button>');
      expect(element.fullWidth).toBe(true);
      cleanup(container);
    });
  });

  // -------------------------------------------------------------------------
  // Disabled state
  // -------------------------------------------------------------------------

  describe('Disabled state', () => {
    it('inner <button> should have disabled attribute when component is disabled', async () => {
      // The native disabled attribute on the inner button is required for
      // keyboard/AT accessibility
      const { element, container } = await createElement('<ui-button disabled>Test</ui-button>');
      await Promise.resolve(); // allow _update() to run
      const btn = element.shadowRoot.querySelector('button');
      expect(btn.hasAttribute('disabled')).toBe(true);
      cleanup(container);
    });

    it('inner <button> should have aria-disabled="true" when disabled', async () => {
      // aria-disabled is set in addition to the native disabled attribute
      const { element, container } = await createElement('<ui-button disabled>Test</ui-button>');
      await Promise.resolve();
      const btn = element.shadowRoot.querySelector('button');
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      cleanup(container);
    });

    it('inner <button> should not have disabled attribute when component is not disabled', async () => {
      const { element, container } = await createElement();
      const btn = element.shadowRoot.querySelector('button');
      expect(btn.hasAttribute('disabled')).toBe(false);
      cleanup(container);
    });

    it('setting disabled dynamically should update inner button', async () => {
      // Verifies _update() correctly mirrors state to inner DOM
      const { element, container } = await createElement();
      element.disabled = true;
      await Promise.resolve();
      const btn = element.shadowRoot.querySelector('button');
      expect(btn.hasAttribute('disabled')).toBe(true);
      cleanup(container);
    });
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  describe('Loading state', () => {
    it('inner <button> should have aria-busy="true" when loading', async () => {
      const { element, container } = await createElement('<ui-button loading>Sender</ui-button>');
      await Promise.resolve();
      const btn = element.shadowRoot.querySelector('button');
      expect(btn.getAttribute('aria-busy')).toBe('true');
      cleanup(container);
    });

    it('inner <button> should have aria-busy="false" when not loading', async () => {
      const { element, container } = await createElement();
      const btn = element.shadowRoot.querySelector('button');
      expect(btn.getAttribute('aria-busy')).toBe('false');
      cleanup(container);
    });

    it('spinner element should exist in shadow DOM', async () => {
      // The spinner is always rendered; visibility is controlled via CSS
      const { element, container } = await createElement();
      const spinner = element.shadowRoot.querySelector('.spinner');
      expect(spinner).not.toBeNull();
      cleanup(container);
    });
  });

  // -------------------------------------------------------------------------
  // Event emission
  // -------------------------------------------------------------------------

  describe('Event emission', () => {
    it('should emit "ui-click" CustomEvent when clicked', async () => {
      const { element, container } = await createElement();
      const handler = vi.fn();
      element.addEventListener('ui-click', handler);

      element.shadowRoot.querySelector('button').click();

      expect(handler).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('ui-click event detail should contain originalEvent', async () => {
      const { element, container } = await createElement();
      let receivedDetail = null;
      element.addEventListener('ui-click', (e) => { receivedDetail = e.detail; });

      element.shadowRoot.querySelector('button').click();

      expect(receivedDetail).not.toBeNull();
      expect(receivedDetail.originalEvent).toBeInstanceOf(MouseEvent);
      cleanup(container);
    });

    it('should NOT emit "ui-click" when disabled', async () => {
      // Disabled buttons must not fire ui-click regardless of native click
      const { element, container } = await createElement('<ui-button disabled>Test</ui-button>');
      const handler = vi.fn();
      element.addEventListener('ui-click', handler);

      element.shadowRoot.querySelector('button').click();

      expect(handler).not.toHaveBeenCalled();
      cleanup(container);
    });

    it('should NOT emit "ui-click" when loading', async () => {
      // Loading state should also suppress the event
      const { element, container } = await createElement('<ui-button loading>Test</ui-button>');
      const handler = vi.fn();
      element.addEventListener('ui-click', handler);

      element.shadowRoot.querySelector('button').click();

      expect(handler).not.toHaveBeenCalled();
      cleanup(container);
    });

    it('ui-click event should bubble and be composed', async () => {
      // composed: true allows the event to cross shadow DOM boundaries
      const { element, container } = await createElement();
      let capturedEvent = null;
      document.body.addEventListener('ui-click', (e) => { capturedEvent = e; });

      element.shadowRoot.querySelector('button').click();

      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent.bubbles).toBe(true);
      expect(capturedEvent.composed).toBe(true);

      document.body.removeEventListener('ui-click', () => {});
      cleanup(container);
    });
  });

  // -------------------------------------------------------------------------
  // Variant rendering
  // -------------------------------------------------------------------------

  describe('Variant rendering', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger', 'neutral'];

    variants.forEach((variant) => {
      it(`should accept variant="${variant}" without error`, async () => {
        // Verifies each variant name is valid and does not throw
        const { element, container } = await createElement(
          `<ui-button variant="${variant}">Test</ui-button>`
        );
        expect(element.variant).toBe(variant);
        expect(element.getAttribute('variant')).toBe(variant);
        cleanup(container);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Size rendering
  // -------------------------------------------------------------------------

  describe('Size rendering', () => {
    const sizes = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      it(`should accept size="${size}" without error`, async () => {
        const { element, container } = await createElement(
          `<ui-button size="${size}">Test</ui-button>`
        );
        expect(element.size).toBe(size);
        cleanup(container);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Slots
  // -------------------------------------------------------------------------

  describe('Slots', () => {
    it('default slot should render slotted text content', async () => {
      // Verify that slot content is placed in the shadow DOM
      const { element, container } = await createElement('<ui-button>Klik her</ui-button>');
      const slot = element.shadowRoot.querySelector('slot:not([name])');
      expect(slot).not.toBeNull();
      // Assigned nodes should include the text node
      const assigned = slot.assignedNodes({ flatten: true });
      const text = assigned.map((n) => n.textContent).join('').trim();
      expect(text).toBe('Klik her');
      cleanup(container);
    });

    it('icon-start slot should exist in shadow DOM', async () => {
      const { element, container } = await createElement();
      const slot = element.shadowRoot.querySelector('slot[name="icon-start"]');
      expect(slot).not.toBeNull();
      cleanup(container);
    });

    it('icon-end slot should exist in shadow DOM', async () => {
      const { element, container } = await createElement();
      const slot = element.shadowRoot.querySelector('slot[name="icon-end"]');
      expect(slot).not.toBeNull();
      cleanup(container);
    });

    it('icon-start slot should receive slotted element', async () => {
      const { element, container } = await createElement(`
        <ui-button>
          <svg slot="icon-start" aria-hidden="true"><circle cx="5" cy="5" r="4"/></svg>
          Label
        </ui-button>
      `);
      const slot = element.shadowRoot.querySelector('slot[name="icon-start"]');
      const assigned = slot.assignedElements();
      expect(assigned.length).toBe(1);
      expect(assigned[0].tagName.toLowerCase()).toBe('svg');
      cleanup(container);
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility attributes
  // -------------------------------------------------------------------------

  describe('Accessibility', () => {
    it('inner <button> should have part="base"', async () => {
      // CSS parts are required for external styling customisation
      const { element, container } = await createElement();
      const btn = element.shadowRoot.querySelector('button');
      expect(btn.getAttribute('part')).toBe('base');
      cleanup(container);
    });

    it('spinner element should have aria-hidden="true"', async () => {
      // Spinner is decorative and must be hidden from AT
      const { element, container } = await createElement();
      const spinner = element.shadowRoot.querySelector('.spinner');
      expect(spinner.getAttribute('aria-hidden')).toBe('true');
      cleanup(container);
    });

    it('button type should default to "button" to avoid accidental form submission', async () => {
      // <button> without type="button" defaults to type="submit" in forms
      const { element, container } = await createElement();
      const btn = element.shadowRoot.querySelector('button');
      expect(btn.getAttribute('type')).toBe('button');
      cleanup(container);
    });

    it('button type should be "submit" when type attribute is "submit"', async () => {
      const { element, container } = await createElement('<ui-button type="submit">Send</ui-button>');
      await Promise.resolve();
      const btn = element.shadowRoot.querySelector('button');
      expect(btn.getAttribute('type')).toBe('submit');
      cleanup(container);
    });
  });

  // -------------------------------------------------------------------------
  // Full-width
  // -------------------------------------------------------------------------

  describe('Full-width', () => {
    it('full-width attribute should be reflected on the element', async () => {
      const { element, container } = await createElement('<ui-button full-width>Test</ui-button>');
      expect(element.hasAttribute('full-width')).toBe(true);
      expect(element.fullWidth).toBe(true);
      cleanup(container);
    });

    it('setting fullWidth=true should add full-width attribute', async () => {
      const { element, container } = await createElement();
      element.fullWidth = true;
      expect(element.hasAttribute('full-width')).toBe(true);
      cleanup(container);
    });

    it('setting fullWidth=false should remove full-width attribute', async () => {
      const { element, container } = await createElement('<ui-button full-width>Test</ui-button>');
      element.fullWidth = false;
      expect(element.hasAttribute('full-width')).toBe(false);
      cleanup(container);
    });
  });

  // -------------------------------------------------------------------------
  // Lifecycle / cleanup
  // -------------------------------------------------------------------------

  describe('Lifecycle', () => {
    it('should not throw when disconnected and reconnected', async () => {
      // Verifies cleanup logic does not leave dangling references
      const { element, container } = await createElement();
      document.body.removeChild(container);
      document.body.appendChild(container);
      await Promise.resolve();
      expect(element.shadowRoot.querySelector('button')).not.toBeNull();
      cleanup(container);
    });

    it('_initialized should be true after first connection', async () => {
      const { element, container } = await createElement();
      expect(element._initialized).toBe(true);
      cleanup(container);
    });
  });

});
