/**
 * BaseElement — Foundation class for all ui-lib Web Components
 *
 * Features:
 * - Open shadow DOM with focus delegation
 * - Lifecycle hooks (connected, disconnected, rendered, updated)
 * - Shared CSSStyleSheet via adoptedStyleSheets (one sheet per component class)
 * - Utility helpers: getBool, setBool, getStr, emit, onCleanup, query, queryAll
 */

export class BaseElement extends HTMLElement {
  constructor() {
    super();

    /** @type {ShadowRoot} */
    this._root = this.attachShadow({ mode: 'open', delegatesFocus: true });

    /** @type {boolean} Whether the element is currently connected to the DOM */
    this._connected = false;

    /** @type {Array<() => void>} Functions to run on disconnectedCallback */
    this._cleanup = [];

    /** @type {boolean} Whether the initial render has been performed */
    this._initialized = false;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  connectedCallback() {
    this._connected = true;

    if (!this._initialized) {
      this._initialized = true;
      this._render();
    }

    this.connected?.();
  }

  disconnectedCallback() {
    this._connected = false;

    for (const fn of this._cleanup) {
      try { fn(); } catch (e) { /* swallow cleanup errors */ }
    }
    this._cleanup = [];

    this.disconnected?.();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    this._onAttributeChange(name, oldValue, newValue);

    if (this._initialized) {
      this._update();
    }
  }

  // -------------------------------------------------------------------------
  // Internal hooks — override in subclasses
  // -------------------------------------------------------------------------

  /**
   * Called on every attribute change (after dedup check).
   * Override to react to specific attribute changes before _update().
   * @param {string} name
   * @param {string|null} oldValue
   * @param {string|null} newValue
   */
  _onAttributeChange(name, oldValue, newValue) {
    // Override in subclass
  }

  /**
   * Performs the initial full render into the shadow root.
   * Called exactly once, on first connectedCallback.
   */
  _render() {
    const sheet = this._getStyleSheet();
    if (sheet) {
      this._root.adoptedStyleSheets = [sheet];
    }

    this._root.innerHTML = this.template();
    this._bindEvents();
    this.rendered?.();
  }

  /**
   * Called after attributeChangedCallback (when already initialized).
   * Override to apply incremental DOM updates.
   */
  _update() {
    this.updated?.();
  }

  /**
   * Override to add event listeners inside the shadow root.
   * Called once after the initial _render().
   */
  _bindEvents() {
    // Override in subclass
  }

  // -------------------------------------------------------------------------
  // Template & styles — override in subclasses
  // -------------------------------------------------------------------------

  /**
   * Return the shadow DOM HTML string.
   * @returns {string}
   */
  template() {
    return '';
  }

  /**
   * Return the component's CSS string.
   * Override as a static method in the subclass.
   * @returns {string}
   */
  static css() {
    return '';
  }

  // -------------------------------------------------------------------------
  // Style sheet management
  // -------------------------------------------------------------------------

  /**
   * Returns a shared CSSStyleSheet for this component class.
   * Creates it once and caches it on the constructor function.
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

  // -------------------------------------------------------------------------
  // Attribute helpers
  // -------------------------------------------------------------------------

  /**
   * Returns true if the named boolean attribute is present.
   * @param {string} name
   * @returns {boolean}
   */
  getBool(name) {
    return this.hasAttribute(name);
  }

  /**
   * Sets or removes a boolean attribute based on value.
   * @param {string} name
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
   * Returns the string value of an attribute, or fallback if absent.
   * @param {string} name
   * @param {string} [fallback='']
   * @returns {string}
   */
  getStr(name, fallback = '') {
    return this.getAttribute(name) ?? fallback;
  }

  // -------------------------------------------------------------------------
  // Event helpers
  // -------------------------------------------------------------------------

  /**
   * Dispatches a composed, bubbling CustomEvent.
   * @param {string} name  Event name (e.g. 'ui-click')
   * @param {object} [detail={}]
   * @param {object} [options={}]  Merged into CustomEvent init
   * @returns {boolean}  false if preventDefault() was called
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

  // -------------------------------------------------------------------------
  // Cleanup helpers
  // -------------------------------------------------------------------------

  /**
   * Register a cleanup function to run on disconnectedCallback.
   * @param {() => void} fn
   */
  onCleanup(fn) {
    this._cleanup.push(fn);
  }

  // -------------------------------------------------------------------------
  // DOM query helpers
  // -------------------------------------------------------------------------

  /**
   * querySelector scoped to the shadow root.
   * @param {string} selector
   * @returns {Element|null}
   */
  query(selector) {
    return this._root.querySelector(selector);
  }

  /**
   * querySelectorAll scoped to the shadow root.
   * @param {string} selector
   * @returns {NodeList}
   */
  queryAll(selector) {
    return this._root.querySelectorAll(selector);
  }
}
