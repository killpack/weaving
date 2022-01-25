class ColorPicker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        var _a;
        this.setAttribute("value", (_a = this.getAttribute("value")) !== null && _a !== void 0 ? _a : "#FFFFFF");
        let stylesheetLink = document.createElement('link');
        stylesheetLink.setAttribute('href', ColorPicker.STYLESHEET_URL);
        stylesheetLink.setAttribute('rel', 'stylesheet');
        stylesheetLink.setAttribute('type', 'text/css');
        this.shadowRoot.append(stylesheetLink);
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
ColorPicker.STYLESHEET_URL = "./color-picker.css";
export default ColorPicker;
