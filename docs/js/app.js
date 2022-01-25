import ColorPicker from './color-picker.js';
ColorPicker.register();
class Heddle {
    constructor(ends) {
        this.threadings = [];
        this.spaces = [];
        for (let i = 0; i < ends; i++) {
            let space = (i % 2 == 0) ? "Slot" : "Hole";
            this.spaces.push(space);
        }
    }
    // don't love this API but one thing at a time
    sley(warpThreads) {
        this.threadings = [];
        for (let i = 0; i < this.spaces.length; i++) {
            let space = this.spaces[i];
            let warpThread = warpThreads[i]; // TODO handle different lengths
            this.threadings.push([space, warpThread]);
        }
    }
}
class WarpThread {
    constructor(color = "#000000") {
        this.color = color;
    }
}
class WeftThread {
    constructor(color = "#FFFFFF") {
        this.color = color;
    }
}
class Loom {
    constructor(warpConfig) {
        var _a;
        let warpEnds;
        let warpColors;
        if (typeof warpConfig === "number") {
            warpEnds = warpConfig;
        }
        else {
            warpColors = warpConfig;
            warpEnds = warpColors.length;
        }
        this.heddle = new Heddle(warpEnds);
        this.warpThreads = [];
        for (let i = 0; i < warpEnds; i++) {
            let color = (_a = warpColors === null || warpColors === void 0 ? void 0 : warpColors[i]) !== null && _a !== void 0 ? _a : "#000000";
            this.warpThreads.push(new WarpThread(color));
        }
        this.weftPicks = [];
        this.heddle.sley(this.warpThreads);
    }
    rewarp(warpEnds) {
        this.heddle = new Heddle(warpEnds);
        // Make an attempt to preserve existing warp threads
        let oldWarpCount = this.warpThreads.length;
        let lastColor = this.warpThreads[this.warpThreads.length - 1].color;
        this.warpThreads.length = warpEnds;
        for (let i = oldWarpCount; i < warpEnds; i++) {
            // Add any missing warp threads
            this.warpThreads[i] = new WarpThread(lastColor);
        }
        this.heddle.sley(this.warpThreads);
    }
    pick(weftThread, heddlePosition) {
        this.weftPicks.push([weftThread, heddlePosition]);
    }
    weave() {
        let wovenRows = [];
        this.weftPicks.forEach((weftPick) => {
            wovenRows.push(this.weavePick(weftPick));
        });
        return wovenRows;
    }
    weavePick([weft, heddlePosition]) {
        // when the heddle is up, weft goes over slot threads and under hole threads
        // when the heddle is down, weft goes under slot threads and over hole threads
        let weftOverSpaceType = (heddlePosition == "Up") ? "Slot" : "Hole";
        let row = [];
        this.heddle.threadings.forEach(([space, warp]) => {
            if (warp === null || space == weftOverSpaceType) {
                row.push([weft, warp]);
            }
            else {
                row.push([warp, weft]);
            }
        });
        return [heddlePosition, row];
    }
}
class Renderer {
    renderLoom(loom) {
        this.renderWarpColors(loom);
        this.renderHeddle(loom.heddle);
        this.renderWovenRows(loom, loom.weave());
    }
    // row-reverse flex-direction: look into it
    renderWarpColors(loom) {
        let root = document.getElementById('warp-colors');
        let pickers = [];
        loom.heddle.threadings.forEach(([_, warpThread]) => {
            let picker = document.createElement('color-picker');
            picker.setAttribute("value", warpThread.color);
            picker.addEventListener("input", (e) => {
                let warpColor = e.target.value;
                warpThread.color = warpColor;
                this.renderLoom(loom);
            });
            pickers.unshift(picker);
        });
        root.replaceChildren(...pickers);
    }
    // Rendering
    renderHeddle(heddle) {
        let root = document.getElementById('heddle');
        root.replaceChildren();
        let rowEl = document.createElement("div");
        rowEl.className = "row";
        let spaceEls = [];
        heddle.spaces.forEach((space) => {
            let spaceEl = document.createElement("span");
            spaceEl.innerText = (space == "Hole") ? "○" : "▯";
            spaceEl.className = "space";
            spaceEls.unshift(spaceEl); // Start from the right, work to the left
        });
        rowEl.replaceChildren(...spaceEls);
        root.appendChild(rowEl);
    }
    renderWovenRows(loom, wovenRows) {
        let root = document.getElementById('visualization');
        root.replaceChildren();
        wovenRows.forEach(([heddlePosition, crosses], i) => {
            let rowEl = document.createElement("div");
            rowEl.className = "row";
            let crossEls = [];
            crosses.forEach(([overThread, underThread]) => {
                let crossEl = document.createElement("span");
                crossEl.className = "cross";
                let overEl = this.overUnderEl(overThread, "over");
                crossEl.appendChild(overEl);
                let underEl = this.overUnderEl(underThread, "under");
                crossEl.appendChild(underEl);
                crossEls.unshift(crossEl); // Start from the right, work to the left
            });
            rowEl.replaceChildren(...crossEls);
            let heddlePositionEl = document.createElement("span");
            heddlePositionEl.className = "heddle-position-history";
            heddlePositionEl.innerText = (heddlePosition == "Up") ? "↑" : "↓";
            rowEl.appendChild(heddlePositionEl);
            let weftThread = loom.weftPicks[i][0]; // YUCK HORRIBLE
            let weftColorEl = document.createElement('color-picker');
            weftColorEl.setAttribute("value", weftThread.color);
            weftColorEl.addEventListener("input", (e) => {
                let weftColor = e.target.value;
                weftThread.color = weftColor;
                this.renderLoom(loom);
            });
            rowEl.appendChild(weftColorEl);
            root.appendChild(rowEl);
        });
    }
    overUnderEl(thread, overUnder) {
        let el = document.createElement("span");
        el.classList.add(overUnder);
        el.style.backgroundColor = thread.color;
        el.classList.add(thread instanceof WarpThread ? "warp" : "weft");
        return el;
    }
}
// run it
const dark = "#0000ff";
const light = "#60aeff";
const loom = new Loom([
    dark, light, light, dark, dark, light, dark, light, dark, dark, light, light, dark
]);
loom.pick(new WeftThread(light), "Up");
loom.pick(new WeftThread(light), "Down");
loom.pick(new WeftThread(light), "Up");
loom.pick(new WeftThread(light), "Down");
loom.pick(new WeftThread(dark), "Down");
loom.pick(new WeftThread(dark), "Up");
loom.pick(new WeftThread(dark), "Down");
loom.pick(new WeftThread(dark), "Up");
loom.pick(new WeftThread(light), "Down");
let renderer = new Renderer();
renderer.renderLoom(loom);
document.getElementById("pick").addEventListener("click", () => {
    let weftColor = document.getElementById("weft-color").value;
    let weft = new WeftThread(weftColor || "black");
    let heddlePositionEl = document.getElementById("heddle-position");
    let heddlePosition = heddlePositionEl.value;
    loom.pick(weft, (heddlePosition == "up") ? "Up" : "Down");
    renderer.renderLoom(loom);
    heddlePositionEl.selectedIndex = (heddlePositionEl.selectedIndex + 1) % heddlePositionEl.length;
});
document.getElementById('warp-count').addEventListener("change", (e) => {
    let warpCount = parseInt(e.target.value) || 10;
    loom.rewarp(warpCount);
    renderer.renderLoom(loom);
});
