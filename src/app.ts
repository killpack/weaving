import ColorPicker from './color-picker.js';
ColorPicker.register();

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

  constructor(color = "#000000") {
    this.color = color;
  }
}

class WeftThread {
  color: string;

  constructor(color = "#FFFFFF") {
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

class Renderer {
  renderLoom(loom: Loom): void {
    this.renderHeddle(loom.heddle);
    this.renderWovenRows(loom, loom.weave());
  }

  // Rendering
  private renderHeddle(heddle: Heddle): void {
    let root = document.getElementById('heddle')!;
    root.replaceChildren();

    let rowEl = document.createElement("div");
    rowEl.className = "row";

    let spaceEls: HTMLElement[] = [];
    heddle.spaces.forEach((space) => {
      let spaceEl = document.createElement("span");
      spaceEl.innerText = (space == Space.Hole) ? "○" : "▯";
      spaceEl.className = "space";
      spaceEls.unshift(spaceEl); // Start from the right, work to the left
    });
    rowEl.replaceChildren(...spaceEls);

    root.appendChild(rowEl);
  }

  private renderWovenRows(loom: Loom, wovenRows: Array<WovenRow>): void {
    let root = document.getElementById('visualization')!;
    root.replaceChildren();
    wovenRows.forEach(([heddlePosition, crosses], i) => {
      let rowEl = document.createElement("div");
      rowEl.className = "row";

      let crossEls: HTMLElement[]  = [];
      crosses.forEach(([overThread, underThread]) => {
        let crossEl = document.createElement("span");
        crossEl.className = "cross";
        let overEl = this.overUnderEl(overThread, "over");
        crossEl.appendChild(overEl);
        let underEl = this.overUnderEl(underThread, "under");
        crossEl.appendChild(underEl);

        crossEls.unshift(crossEl); // Start from the right, work to the left
      })
      rowEl.replaceChildren(...crossEls);

      let heddlePositionEl = document.createElement("span");
      heddlePositionEl.className = "heddle-position-history";
      if (heddlePosition == HeddlePosition.Up) {
        heddlePositionEl.innerText = "↑";
      } else {
        heddlePositionEl.innerText = "↓";
      }
      rowEl.appendChild(heddlePositionEl);

      let weftThread = loom.weftPicks[i][0]; // YUCK HORRIBLE
      let weftColorEl = document.createElement('color-picker');
      weftColorEl.setAttribute("value", weftThread.color);
      weftColorEl.addEventListener("input", (e) => {
        let weftColor = (<HTMLInputElement>e.target!).value;
        weftThread.color = weftColor;

        this.renderLoom(loom);
      });
      rowEl.appendChild(weftColorEl);


      root.appendChild(rowEl);
    })
  }

  private overUnderEl(thread: Thread, overUnder: string): HTMLElement {
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

document.getElementById("pick")!.addEventListener("click", () => {
  let weftColor = (<HTMLInputElement>document.getElementById("weft-color")!).value;
  let weft = new WeftThread(weftColor || "black");

  let heddlePositionEl = <HTMLSelectElement>document.getElementById("heddle-position")!;
  let heddlePosition = heddlePositionEl.value;

  loom.pick(weft, (heddlePosition == "up") ? HeddlePosition.Up  : HeddlePosition.Down);

  renderer.renderLoom(loom);

  heddlePositionEl.selectedIndex = (heddlePositionEl.selectedIndex + 1) % heddlePositionEl.length;
});

document.getElementById('warp-count')!.addEventListener("change", (e) => {
  let warpCount: number = parseInt((<HTMLInputElement>e.target).value) || 10;

  loom.rewarp(warpCount);

  renderer.renderLoom(loom);
});
