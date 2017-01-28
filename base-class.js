// our extension of HTMLElement

// provides automatic rendering after modifications to the this.state proxy
// plus automatic reflection of this.state to the element attributes
// before: you had to render() manually and create attr getters and setters
// after: use this.state directly and have automatic rendering

// adds JSON serialization of the this.state values
// enables object-values in the state
window.HTMLYoYo = class extends HTMLElement {
  constructor() {
    super()

    // create the shadow and give it a default innerHTML
    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.appendChild(yo`<div></div>`)

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
  get baseEl() {
    // use this for yo.update()s - yo.update(this.baseEl, yo`...`)
    return this.shadow.firstChild
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