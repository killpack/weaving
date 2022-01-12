enum Space {
  Hole,
  Slot,
}

enum HeddlePosition {
  Up,
  Down, // maybe add neutral later
}


type Threading = [Space, WarpThread]

class Heddle {
  threadings: Array<Threading> = []; // maybe it should be a map instead?
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
  color: string = "black"; // good enough for now!
}

class WeftThread {
  color: string = "white";

  pick(heddle: Heddle, heddlePosition: HeddlePosition): WovenRow  {
      // when the heddle is up, weft goes over slot threads and under hole threads
      // when the heddle is down, weft goes under slot threads and over hole threads
    let weftOverSpaceType = (heddlePosition == HeddlePosition.Up) ? Space.Slot : Space.Hole; // this will change if neutral is introduced

    let row = new Array<Cross>(); // :(

    heddle.threadings.forEach(([space, warp]) => {
      if (warp === null || space == weftOverSpaceType) {
        row.push([this, warp]);
      } else {
        row.push([warp, this]);
      }
    })
    return row;
  }
}


type Thread = WarpThread|WeftThread;
type Cross = [Thread,Thread]; // clean this up later but for now [over, under];
type WovenRow = Array<Cross>;

let warpThreads = [];
for (let i = 0; i < 10; i++) {
  warpThreads.push(new WarpThread());
}
let heddle = new Heddle(10);
heddle.sley(warpThreads);

console.log(heddle);

let rows = new Array<WovenRow>();
let weft = new WeftThread();
rows.push(weft.pick(heddle, HeddlePosition.Up));
rows.push(weft.pick(heddle, HeddlePosition.Down));
rows.push(weft.pick(heddle, HeddlePosition.Up));
rows.push(weft.pick(heddle, HeddlePosition.Down));
rows.push(weft.pick(heddle, HeddlePosition.Down));
rows.push(weft.pick(heddle, HeddlePosition.Down));
rows.push(weft.pick(heddle, HeddlePosition.Down));
rows.push(weft.pick(heddle, HeddlePosition.Up));

console.log(rows);

let root = document.getElementById('root');
rows.forEach((wovenRow) => {
  let rowEl = document.createElement("div");
  rowEl.className = "row";
  wovenRow.forEach(([overThread, underThread]) => {
    let crossEl = document.createElement("span");
    crossEl.className = "cross";
    let overEl = overUnderEl(overThread, "over");
    crossEl.appendChild(overEl);
    let underEl = overUnderEl(underThread, "under");
    crossEl.appendChild(underEl);

    rowEl.appendChild(crossEl);
  })
  root!.appendChild(rowEl);
})

function overUnderEl(thread: Thread, overUnder: string): HTMLElement {
    let el = document.createElement("span");
    el.classList.add(overUnder);
    el.style.backgroundColor = thread.color;

    el.classList.add(thread instanceof WarpThread ? "warp" : "weft");
    return el;
}

// things to remember: weaving drafts typically start from the right side
// just render them as divs for now
// warp pick + heddle
