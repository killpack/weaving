import ColorPicker from './color-picker.js';
ColorPicker.register();
var Space;
(function (Space) {
    Space[Space["Hole"] = 0] = "Hole";
    Space[Space["Slot"] = 1] = "Slot";
})(Space || (Space = {}));
var HeddlePosition;
(function (HeddlePosition) {
    HeddlePosition[HeddlePosition["Up"] = 0] = "Up";
    HeddlePosition[HeddlePosition["Down"] = 1] = "Down";
})(HeddlePosition || (HeddlePosition = {}));
class Heddle {
    constructor(ends) {
        this.threadings = [];
        this.spaces = [];
        for (let i = 0; i < ends; i++) {
            let space = (i % 2 == 0) ? Space.Slot : Space.Hole;
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
    constructor(warpEnds) {
        this.heddle = new Heddle(warpEnds);
        this.warpThreads = [];
        for (let i = 0; i < warpEnds; i++) {
            this.warpThreads.push(new WarpThread());
        }
        this.weftPicks = [];
    }
    rewarp(warpEnds) {
        // compiler complains if we DRY up the constructor using this method??
        this.heddle = new Heddle(warpEnds);
        this.warpThreads = [];
        for (let i = 0; i < warpEnds; i++) {
            this.warpThreads.push(new WarpThread());
        }
    }
    pick(weftThread, heddlePosition) {
        this.weftPicks.push([weftThread, heddlePosition]);
    }
    weave() {
        this.heddle.sley(this.warpThreads);
        let wovenRows = [];
        this.weftPicks.forEach((weftPick) => {
            wovenRows.push(this.weavePick(weftPick));
        });
        return wovenRows;
    }
    weavePick([weft, heddlePosition]) {
        // when the heddle is up, weft goes over slot threads and under hole threads
        // when the heddle is down, weft goes under slot threads and over hole threads
        let weftOverSpaceType = (heddlePosition == HeddlePosition.Up) ? Space.Slot : Space.Hole; // this will change if neutral is introduced
        let row = new Array(); // :(
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
        this.renderHeddle(loom.heddle);
        this.renderWovenRows(loom, loom.weave());
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
            spaceEl.innerText = (space == Space.Hole) ? "○" : "▯";
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
            if (heddlePosition == HeddlePosition.Up) {
                heddlePositionEl.innerText = "↑";
            }
            else {
                heddlePositionEl.innerText = "↓";
            }
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
let loom = new Loom(10);
loom.pick(new WeftThread(), HeddlePosition.Up);
loom.pick(new WeftThread(), HeddlePosition.Down);
loom.pick(new WeftThread(), HeddlePosition.Up);
loom.pick(new WeftThread(), HeddlePosition.Down);
loom.pick(new WeftThread(), HeddlePosition.Up);
loom.pick(new WeftThread(), HeddlePosition.Down);
let renderer = new Renderer();
renderer.renderLoom(loom);
document.getElementById("pick").addEventListener("click", () => {
    let weftColor = document.getElementById("weft-color").value;
    let weft = new WeftThread(weftColor || "black");
    let heddlePositionEl = document.getElementById("heddle-position");
    let heddlePosition = heddlePositionEl.value;
    loom.pick(weft, (heddlePosition == "up") ? HeddlePosition.Up : HeddlePosition.Down);
    renderer.renderLoom(loom);
    heddlePositionEl.selectedIndex = (heddlePositionEl.selectedIndex + 1) % heddlePositionEl.length;
});
document.getElementById('warp-count').addEventListener("change", (e) => {
    let warpCount = parseInt(e.target.value) || 10;
    loom.rewarp(warpCount);
    renderer.renderLoom(loom);
});
