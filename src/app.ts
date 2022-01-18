enum Space {
  Hole,
  Slot,
}

enum HeddlePosition {
  Up,
  Down, // maybe add neutral later
}

type Thread = WarpThread|WeftThread;
type Cross = [Thread,Thread]; // clean this up later but for now [over, under];
type WovenRow = [HeddlePosition, Array<Cross>]; // what happens after a pick is completed
type WeftPick = [WeftThread, HeddlePosition];
type Threading = [Space, WarpThread]

class Heddle {
  threadings: Array<Threading> = [];
  spaces: Array<Space> = [];

  constructor(ends: number) {
    for (let i = 0; i < ends; i++) {
      let space = (i % 2 == 0) ? Space.Slot : Space.Hole
      this.spaces.push(space);
    }
  }

  // don't love this API but one thing at a time
  sley(warpThreads: Array<WarpThread>): void { // no empty spaces for now
    this.threadings = [];
    for (let i = 0; i < this.spaces.length; i++) {
      let space = this.spaces[i];
      let warpThread = warpThreads[i]; // TODO handle different lengths
      this.threadings.push([space, warpThread]);
    }
  }
}

class WarpThread {
  color: string;

  constructor(color = "black") {
    this.color = color;
  }
}

class WeftThread {
  color: string;

  constructor(color = "white") {
    this.color = color;
  }
}

class Loom {
  heddle: Heddle;
  warpThreads: WarpThread[];
  weftPicks: WeftPick[];

  constructor(warpEnds: number) {
    this.heddle = new Heddle(warpEnds);
    this.warpThreads = [];
    for (let i = 0; i < warpEnds; i++) {
      this.warpThreads.push(new WarpThread());
    }

    this.weftPicks = [];
  }

  rewarp(warpEnds: number) {
    // compiler complains if we DRY up the constructor using this method??
    this.heddle = new Heddle(warpEnds);
    this.warpThreads = [];
    for (let i = 0; i < warpEnds; i++) {
      this.warpThreads.push(new WarpThread());
    }
  }

  pick(weftThread: WeftThread, heddlePosition: HeddlePosition): void {
    this.weftPicks.push([weftThread, heddlePosition]);
  }

  weave(): WovenRow[] {
    this.heddle.sley(this.warpThreads);

    let wovenRows: WovenRow[] = [];

    this.weftPicks.forEach((weftPick) => {
      wovenRows.push(this.weavePick(weftPick));
    });
    return wovenRows;
  }

  private weavePick([weft, heddlePosition]: WeftPick): WovenRow {
      // when the heddle is up, weft goes over slot threads and under hole threads
      // when the heddle is down, weft goes under slot threads and over hole threads
    let weftOverSpaceType = (heddlePosition == HeddlePosition.Up) ? Space.Slot : Space.Hole; // this will change if neutral is introduced

    let row = new Array<Cross>(); // :(

    this.heddle.threadings.forEach(([space, warp]) => {
      if (warp === null || space == weftOverSpaceType) {
        row.push([weft, warp]);
      } else {
        row.push([warp, weft]);
      }
    })
    return [heddlePosition, row];
  }
}

// Rendering
function renderHeddle(heddle: Heddle): void {
  let root = document.getElementById('heddle')!;
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

function render(wovenRows: Array<WovenRow>): void {
  let root = document.getElementById('visualization')!;
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
    })
    let heddlePositionEl = document.createElement("span");
    heddlePositionEl.className = "heddle-position-history";
    if (heddlePosition == HeddlePosition.Up) {
      heddlePositionEl.innerText = "↑";
    } else {
      heddlePositionEl.innerText = "↓";
    }
    rowEl.appendChild(heddlePositionEl);
    root.appendChild(rowEl);
  })
}

function overUnderEl(thread: Thread, overUnder: string): HTMLElement {
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

document.getElementById("pick")!.addEventListener("click", () => {
  let weftColor = (<HTMLInputElement>document.getElementById("weft-color")!).value;
  let weft = new WeftThread(weftColor || "black");

  let heddlePositionEl = <HTMLSelectElement>document.getElementById("heddle-position")!;
  let heddlePosition = heddlePositionEl.value;

  loom.pick(weft, (heddlePosition == "up") ? HeddlePosition.Up  : HeddlePosition.Down);

  render(loom.weave());

  heddlePositionEl.selectedIndex = (heddlePositionEl.selectedIndex + 1) % heddlePositionEl.length;
});

document.getElementById('warp-count')!.addEventListener("change", (e) => {
  let warpCount: number = parseInt((<HTMLInputElement>e.target).value) || 10;

  loom.rewarp(warpCount);
  renderHeddle(loom.heddle);
  render(loom.weave());
});

// things to remember: weaving drafts typically start from the right side
// just render them as divs for now
// warp pick + heddle
