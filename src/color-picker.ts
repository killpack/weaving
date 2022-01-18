class ColorPicker extends HTMLInputElement {
  constructor() {
    super();

    this.setAttribute("value", this.getAttribute("value") ?? "#FFFFFF");

    // Create a shadow root
    this.attachShadow({mode: 'open'}); // sets and returns 'this.shadowRoot'

    let wrapper = document.createElement('span');
    wrapper.className = "wrapper";
    wrapper.setAttribute('tabindex', '0');

    let colorInput = document.createElement('input');
    colorInput.setAttribute('type', 'color');
    colorInput.value = this.getAttribute("value")!;
    wrapper.appendChild(colorInput);

    wrapper.style.backgroundColor = colorInput.value;

    this.addEventListener("click", () => {
      colorInput.click();
    });

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
    });

    // TODO put this in an external file
    let style = document.createElement('style');
    style.textContent = `
.wrapper {
  display: inline-block;
  width: 1em;
  height: 1em;
  cursor: pointer;
  border: 1px solid black;
}
input[type=color] {
  display: none;
}
    `;

    this.shadowRoot!.append(style,wrapper);
  }

  static register(): void {
    window.customElements.define('color-picker', ColorPicker, {extends: 'input'});
  }
}

export default ColorPicker;
