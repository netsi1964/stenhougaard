/**
 * BaseElement — Foundation class for all ui-lib Web Components
 *
 * Features:
 * - Open shadow DOM with focus delegation (delegatesFocus: true)
 * - Lifecycle hooks: connected(), disconnected(), rendered(), updated()
 * - Shared CSSStyleSheet per component class via adoptedStyleSheets
 * - Attribute helpers: getBool, setBool, getStr
 * - Event helper: emit() — bubbles + composed CustomEvent
 * - Cleanup registry: onCleanup()
 * - Scoped DOM queries: query(), queryAll()
 *
 * Usage:
 *   import { BaseElement } from '../../core/BaseElement.js';
 *
 *   class MyComponent extends BaseElement {
 *     static get observedAttributes() { return ['value']; }
 *     static css() { return ':host { display: block; }'; }
 *     template() { return '<span><slot></slot></span>'; }
 *   }
 *   customElements.define('my-component', MyComponent);
 */

export class BaseElement extends HTMLElement {
  constructor() {
    super();

    /** @type {ShadowRoot} The component's shadow root */
    this._root = this.attachShadow({ mode: 'open', delegatesFocus: true });

    /** @type {boolean} Whether the element is currently connected to the DOM */
    this._connected = false;

    /** @type {Array<() => void>} Cleanup functions registered via onCleanup() */
    this._cleanup = [];

    /** @type {boolean} Whether the initial render has been performed */
    this._initialized = false;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle callbacks
  // ---------------------------------------------------------------------------

  connectedCallback() {
    this._connected = true;

    if (!this._initialized) {
      this._initialized = true;
      this._render();
    }

    // Optional lifecycle hook — override in subclass
    this.connected?.();
  }

  disconnectedCallback() {
    this._connected = false;

    // Run all registered cleanup functions
    for (const fn of this._cleanup) {
      try {
        fn();
      } catch (_err) {
        // Swallow cleanup errors to avoid blocking other teardown logic
      }
    }
    this._cleanup = [];

    // Optional lifecycle hook — override in subclass
    this.disconnected?.();
  }

  /**
   * Called by the browser when an observed attribute changes.
   * Deduplicates no-op changes, then delegates to _onAttributeChange
   * and, once initialized, triggers _update().
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    this._onAttributeChange(name, oldValue, newValue);

    if (this._initialized) {
      this._update();
    }
  }

  // ---------------------------------------------------------------------------
  // Internal hooks — override in subclasses
  // ---------------------------------------------------------------------------

  /**
   * Called on every attribute change (after dedup check), before _update().
   * Override to react to individual attribute changes.
   *
   * @param {string}      name
   * @param {string|null} oldValue
   * @param {string|null} newValue
   */
  _onAttributeChange(name, oldValue, newValue) {
    // Override in subclass
  }

  /**
   * Performs the initial full render into the shadow root.
   * Called exactly once, the first time connectedCallback fires.
   */
  _render() {
    const sheet = this._getStyleSheet();
    if (sheet) {
      this._root.adoptedStyleSheets = [sheet];
    }

    this._root.innerHTML = this.template();
    this._bindEvents();

    // Optional lifecycle hook — override in subclass
    this.rendered?.();
  }

  /**
   * Called after attributeChangedCallback when the element is already
   * initialized. Perform incremental DOM mutations here instead of a
   * full re-render.
   */
  _update() {
    // Optional lifecycle hook — override in subclass
    this.updated?.();
  }

  /**
   * Called once after the initial _render(). Attach event listeners inside
   * the shadow root here.
   */
  _bindEvents() {
    // Override in subclass
  }

  // ---------------------------------------------------------------------------
  // Template & styles — override in subclasses
  // ---------------------------------------------------------------------------

  /**
   * Return the shadow DOM HTML string.
   * Called once during the initial render.
   *
   * @returns {string}
   */
  template() {
    return '';
  }

  /**
   * Return the component's complete CSS string.
   * Declare as a static method on the subclass.
   * The result is compiled once into a shared CSSStyleSheet.
   *
   * @returns {string}
   */
  static css() {
    return '';
  }

  // ---------------------------------------------------------------------------
  // Style sheet management
  // ---------------------------------------------------------------------------

  /**
   * Returns a shared CSSStyleSheet for this component class.
   * The sheet is created once and cached on the constructor as _sharedSheet,
   * ensuring all instances of the same component share a single parsed sheet.
   *
   * @returns {CSSStyleSheet|null}
   */
  _getStyleSheet() {
    const ctor = /** @type {typeof BaseElement} */ (this.constructor);
    const cssText = ctor.css();

    if (!cssText) return null;

    if (!ctor._sharedSheet) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      ctor._sharedSheet = sheet;
    }

    return ctor._sharedSheet;
  }

  // ---------------------------------------------------------------------------
  // Attribute helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns true if the named boolean attribute is present on the element.
   *
   * @param {string} name
   * @returns {boolean}
   */
  getBool(name) {
    return this.hasAttribute(name);
  }

  /**
   * Sets or removes a boolean attribute based on the provided value.
   *
   * @param {string}  name
   * @param {boolean} value
   */
  setBool(name, value) {
    if (value) {
      this.setAttribute(name, '');
    } else {
      this.removeAttribute(name);
    }
  }

  /**
   * Returns the string value of an attribute, or `fallback` when absent.
   *
   * @param {string} name
   * @param {string} [fallback='']
   * @returns {string}
   */
  getStr(name, fallback = '') {
    return this.getAttribute(name) ?? fallback;
  }

  // ---------------------------------------------------------------------------
  // Event helpers
  // ---------------------------------------------------------------------------

  /**
   * Dispatches a composed, bubbling, cancelable CustomEvent.
   * Events cross shadow DOM boundaries (composed: true).
   *
   * @param {string} name     Event name, e.g. 'ui-click'
   * @param {object} [detail={}]
   * @param {object} [options={}]  Additional CustomEventInit overrides
   * @returns {boolean}  false if preventDefault() was called, otherwise true
   */
  emit(name, detail = {}, options = {}) {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail,
      ...options,
    });
    return this.dispatchEvent(event);
  }

  // ---------------------------------------------------------------------------
  // Cleanup registry
  // ---------------------------------------------------------------------------

  /**
   * Register a function to be called when the element disconnects.
   * Use this to remove event listeners, cancel timers, etc.
   *
   * @param {() => void} fn
   */
  onCleanup(fn) {
    this._cleanup.push(fn);
  }

  // ---------------------------------------------------------------------------
  // DOM query helpers
  // ---------------------------------------------------------------------------

  /**
   * querySelector scoped to the shadow root.
   *
   * @param {string} selector
   * @returns {Element|null}
   */
  query(selector) {
    return this._root.querySelector(selector);
  }

  /**
   * querySelectorAll scoped to the shadow root.
   *
   * @param {string} selector
   * @returns {NodeList}
   */
  queryAll(selector) {
    return this._root.querySelectorAll(selector);
  }
}
