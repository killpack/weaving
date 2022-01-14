"use strict";
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
    constructor() {
        this.color = "black"; // good enough for now!
    }
}
class WeftThread {
    constructor() {
        this.color = "white";
    }
    pick(heddle, heddlePosition) {
        // when the heddle is up, weft goes over slot threads and under hole threads
        // when the heddle is down, weft goes under slot threads and over hole threads
        let weftOverSpaceType = (heddlePosition == HeddlePosition.Up) ? Space.Slot : Space.Hole; // this will change if neutral is introduced
        let row = new Array(); // :(
        heddle.threadings.forEach(([space, warp]) => {
            if (warp === null || space == weftOverSpaceType) {
                row.push([this, warp]);
            }
            else {
                row.push([warp, this]);
            }
        });
        return [heddlePosition, row];
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
        this.weftPicks.forEach(([weft, heddlePosition]) => {
            wovenRows.push(weft.pick(this.heddle, heddlePosition));
        });
        return wovenRows;
    }
}
// Rendering
function renderHeddle(heddle) {
    let root = document.getElementById('heddle');
    root.replaceChildren();
    let rowEl = document.createElement("div");
    rowEl.className = "row";
    heddle.spaces.forEach((space) => {
        let spaceEl = document.createElement("span");
        spaceEl.innerText = (space == Space.Hole) ? "○" : "▯";
        spaceEl.className = "space";
        rowEl.appendChild(spaceEl);
    });
    root.appendChild(rowEl);
}
function render(wovenRows) {
    let root = document.getElementById('visualization');
    root.replaceChildren();
    wovenRows.forEach(([heddlePosition, crosses]) => {
        let rowEl = document.createElement("div");
        rowEl.className = "row";
        crosses.forEach(([overThread, underThread]) => {
            let crossEl = document.createElement("span");
            crossEl.className = "cross";
            let overEl = overUnderEl(overThread, "over");
            crossEl.appendChild(overEl);
            let underEl = overUnderEl(underThread, "under");
            crossEl.appendChild(underEl);
            rowEl.appendChild(crossEl);
        });
        let heddlePositionEl = document.createElement("span");
        heddlePositionEl.className = "heddle-position-history";
        if (heddlePosition == HeddlePosition.Up) {
            heddlePositionEl.innerText = "↑";
        }
        else {
            heddlePositionEl.innerText = "↓";
        }
        rowEl.appendChild(heddlePositionEl);
        root.appendChild(rowEl);
    });
}
function overUnderEl(thread, overUnder) {
    let el = document.createElement("span");
    el.classList.add(overUnder);
    el.style.backgroundColor = thread.color;
    el.classList.add(thread instanceof WarpThread ? "warp" : "weft");
    return el;
}
// run it
let loom = new Loom(10);
let weft = new WeftThread();
loom.pick(weft, HeddlePosition.Up);
loom.pick(weft, HeddlePosition.Down);
loom.pick(weft, HeddlePosition.Up);
loom.pick(weft, HeddlePosition.Down);
loom.pick(weft, HeddlePosition.Up);
loom.pick(weft, HeddlePosition.Down);
renderHeddle(loom.heddle);
render(loom.weave());
document.getElementById("pick").addEventListener("click", () => {
    let weftColor = document.getElementById("weft-color").value;
    let weft = new WeftThread();
    weft.color = weftColor || "black";
    let heddlePositionEl = document.getElementById("heddle-position");
    let heddlePosition = heddlePositionEl.value;
    loom.pick(weft, (heddlePosition == "up") ? HeddlePosition.Up : HeddlePosition.Down);
    render(loom.weave());
    heddlePositionEl.selectedIndex = (heddlePositionEl.selectedIndex + 1) % heddlePositionEl.length;
});
document.getElementById('warp-count').addEventListener("change", (e) => {
    let warpCount = parseInt(e.target.value) || 10;
    loom.rewarp(warpCount);
    renderHeddle(loom.heddle);
    render(loom.weave());
});
// things to remember: weaving drafts typically start from the right side
// just render them as divs for now
// warp pick + heddle
