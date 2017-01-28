// our first extension of HTMLElement
// makes rendering w/yoyo easier by providing a shadow dom
// before: yo.update(this, yo`<element-name><div>...</div></element-name>)
// after: yo.update(this.baseEl, yo`<div>...</div>`)
window.FirstBase = class extends HTMLElement {
  constructor() {
    super()

    // create the shadow and give it a default innerHTML
    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.appendChild(yo`<div></div>`)
  }

  get baseEl() {
    // use this for yo.update()s - yo.update(this.baseEl, yo`...`)
    return this.shadow.firstChild
  }
}

// our second extension of HTMLElement
// provides automatic rendering after modifications to the this.state proxy
// plus automatic reflection of this.state to the element attributes
// before: you had to render() manually and create attr getters and setters
// after: use this.state directly and have automatic rendering
window.SecondBase = class extends FirstBase {
  constructor() {
    super()

    // state is a proxy to the Element attribute methods
    this.state = new Proxy({}, {
      has: (target, name) => this.hasAttribute(name),
      get: (target, name) => this.getAttribute(name),
      set: (target, name, value) => {
        this.setAttribute(name, value)
        return true
      }
    })
  }
  attributeChangedCallback(name, oldValue, newValue) {
    // when a watched attribute changes, render
    this.updateDOM()
  }
  connectedCallback() {
    // in case the subclass doesnt override, default to rendering
    this.updateDOM()
  }
  render() {
    // should be overridden
    return yo`<div></div>`
  }
  updateDOM() {
    yo.update(this.baseEl, this.render())
  }
}

// our third extension of HTMLElement
// a variation of SecondBase
// adds JSON serialization of the this.state values
// enables object-values in the state
window.ThirdBase = class extends FirstBase {
  constructor() {
    super()

    // state is a proxy to the Element attribute methods
    // ...with JSON serialization for object types
    this.state = new Proxy({}, {
      has: (target, name) => this.hasAttribute(name),
      get: (target, name) => {
        try {
          return JSON.parse(this.getAttribute(name))
        } catch (e) {
          return undefined
        }
      },
      set: (target, name, value) => {
        this.setAttribute(name, JSON.stringify(value))
        return true
      }
    })
  }
  attributeChangedCallback(name, oldValue, newValue) {
    // when a watched attribute changes, render
    this.updateDOM()
  }
  connectedCallback() {
    // in case the subclass doesnt override, default to rendering
    this.updateDOM()
  }
  render() {
    // should be overridden
    return yo`<div></div>`
  }
  updateDOM() {
    yo.update(this.baseEl, this.render())
  }
}