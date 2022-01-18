class ColorPicker extends HTMLElement {
    constructor() {
        super();
        // Create a shadow root
        this.attachShadow({ mode: 'open' }); // sets and returns 'this.shadowRoot'
    }
    connectedCallback() {
        var _a;
        console.log("connected");
        this.setAttribute("value", (_a = this.getAttribute("value")) !== null && _a !== void 0 ? _a : "#FFFFFF");
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
        this.shadowRoot.append(style);
        let wrapper = document.createElement('span');
        wrapper.className = "wrapper";
        wrapper.setAttribute('tabindex', '0');
        this.shadowRoot.append(wrapper);
        let colorInput = document.createElement('input');
        colorInput.setAttribute('type', 'color');
        colorInput.value = this.getAttribute("value");
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
            let e = new Event("input");
            this.dispatchEvent(e);
        });
    }
    //
    static register() {
        window.customElements.define('color-picker', ColorPicker);
    }
    get value() {
        return this.getAttribute("value") || "";
    }
    set value(v) {
        this.setAttribute("value", v);
    }
}
export default ColorPicker;
