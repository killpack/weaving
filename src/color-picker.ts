class ColorPicker extends HTMLElement {
  private static STYLESHEET_URL = "./color-picker.css";

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback(): void {
    this.setAttribute("value", this.getAttribute("value") ?? "#FFFFFF");

    let stylesheetLink = document.createElement('link');
    stylesheetLink.setAttribute('href', ColorPicker.STYLESHEET_URL);
    stylesheetLink.setAttribute('rel', 'stylesheet');
    stylesheetLink.setAttribute('type', 'text/css');

    this.shadowRoot!.append(stylesheetLink);

    let wrapper = document.createElement('label');
    wrapper.className = "wrapper";
    wrapper.setAttribute('tabindex', '0');
    this.shadowRoot!.append(wrapper);

    let colorInput = document.createElement('input');
    colorInput.setAttribute('type', 'color');
    colorInput.setAttribute('tabindex', '-1');
    colorInput.value = this.getAttribute("value")!;
    wrapper.appendChild(colorInput);

    wrapper.style.backgroundColor = colorInput.value;

    // is this the right way to make it keyboard-accessible??
    // not sure but good enough for now?
    this.addEventListener("keydown", (e) => {
      if (e.code == 'Enter') {
        colorInput.click();
      }
    });

    colorInput.addEventListener('input', () => {
      this.setAttribute('value', colorInput.value);
      wrapper.style.backgroundColor = colorInput.value;
      let e = new Event("input");
      this.dispatchEvent(e);
    });

  }
  //
  static register(): void {
    window.customElements.define('color-picker', ColorPicker);
  }

  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  // static get observedAttributes() {
  //   return ['value'];
  // }
}

export default ColorPicker;
