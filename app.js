const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');
const queenW = new Image();
const queenB = new Image();
const queens = {'W': queenW, 'B': queenB};
const fire = new Image();
const cells = {};
const assets = {queenW: false, queenB: false, fire: false}


queenW.src = './Chess_qlt45.svg';
queenB.src = './Chess_qdt45.svg';
fire.src = './fire-solid.svg';
queenW.onload = () => { assets['queenW'] = true; start() }
queenB.onload = () => { assets['queenB'] = true; start() }
fire.onload = () => { assets['fire'] = true; start() }


const height = 6;
const width = 6;
const whiteStart = [{x: 1, y: 0}, {x: 4, y: 5}];
const blackStart = [{x: 0, y: 4}, {x: 5, y: 1}];
ctx.fillStyle = '#a2a2a2';
ctx.strokeRect(0, 0, 300, 300);


class Cell {
  piece = null;
  selected = false;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {
    if(!this.piece) {
      this.redrawCell();
    } else {
      this.redrawCell();
      ctx.drawImage(this.piece.img, 2.5 + this.x * 50, 2.5 + this.y * 50, 45, 45);
    }
  }
  place(piece) {
    this.piece = piece;
    return this;
  }
  onClick() {
    app.click(this.piece, this.x, this.y);
  }
  redrawCell() {
    ctx.fillStyle = this.selected ? '#828282' : '#a2a2a2';
    ctx.clearRect(this.x * 50, this.y * 50, 50, 50);
    ctx.fillRect(this.x * 50, this.y * 50, 50, 50);
    ctx.fillStyle = '#a2a2a2';
    ctx.strokeRect(this.x * 50, this.y * 50, 50, 50);
  }
}

class Queen {
  constructor(color) {
    this.color = color;
    this.img = queens[color];
  }
}

class Fire {
  img = fire;
}

// create cells
let x = 0;
let y = 0;
for(let i = 0; i < height * width; i++) {
  const cell = new Cell(x, y);
  cells[`${x}_${y}`] = cell;
  if(x >= width - 1) {
    x = 0;
    y ++;
  } else {
    x ++;
  }
}


// Place Queens
for (i in whiteStart) {
  cells[whiteStart[i].x + '_' + whiteStart[i].y].place(new Queen('W'));
}

for (i in blackStart) {
  cells[blackStart[i].x + '_' + blackStart[i].y].place(new Queen('B'));
}





// Maps clicks to cells
canvas.onclick = (event) => {
  const x = Math.floor(event.layerX / 50);
  const y = Math.floor(event.layerY / 50);
  cells[`${x}_${y}`].onClick();
}

// Start game
const start = () => {
  let loaded = true;
  for (let asset in assets) {
    loaded = loaded && assets[asset];
  }
  if (loaded) {
    for (let position in cells) {
      cells[position].draw();
    }
    app.turn = 'W';
  }
}

const app = {
  turn: '',
  moved: false,
  selected: null,
  selectedX: null,
  selectedY: null,
  click(piece, x, y) {
    if (!this.selected && piece && piece.constructor === Queen && piece.color === this.turn) {
      // select
      this.selected = piece;
      this.selectedX = x;
      this.selectedY = y;
      cells[x + '_' + y].selected = true;
      cells[x + '_' + y].draw();
    } else if (this.moved === false && x === this.selectedX && y === this.selectedY) {
      // deselect
      this.selected = null;
      this.selectedX = null;
      this.selectedY = null;
      cells[x + '_' + y].selected = false;
      cells[x + '_' + y].draw();
    } else if (this.selected && this.moved === false && piece === null && this.canMove(x, y)) {
      // move
      cells[`${this.selectedX}_${this.selectedY}`].selected = false;
      cells[`${this.selectedX}_${this.selectedY}`].place(null).draw();
      cells[x + '_' + y].selected = true;
      cells[x + '_' + y].place(this.selected).draw();
      this.moved = true;
      this.selectedX = x;
      this.selectedY = y;
    } else if (this.moved && piece === null && this.selected && this.canMove(x, y)) {
      // shoot
      cells[`${this.selectedX}_${this.selectedY}`].selected = false;
      cells[`${this.selectedX}_${this.selectedY}`].draw();
      cells[x + '_' + y].place(new Fire()).draw();
      this.selected = null;
      this.selectedX = null;
      this.selectedY = null;
      this.moved = false;
      this.nextTurn();
    }
  },
  canMove(x, y) {
    let lowerX = Math.min(x, this.selectedX);
    let lowerY = Math.min(y, this.selectedY);
    let higherX = Math.max(x, this.selectedX);
    let higherY = Math.max(y, this.selectedY);
    let can = true;
    const angle = {
      x: this.selected.x - x > 0 ? 1 : -1,
      y: this.selected.y - y > 0 ? 1 : -1
    }
    if (lowerX === higherX && lowerY === higherY) {
      can = false;
    } else if (lowerX === higherX) {
      lowerY++;
      for (; lowerY < higherY; lowerY++) {
        can = can && !cells[lowerX + '_' + lowerY].piece;
      }
    } else if (lowerY === higherY) {
      lowerX++;
      for (; lowerX < higherX; lowerX++) {
        can = can && !cells[lowerX + '_' + lowerY].piece;
      }
    } else if (higherX - lowerX === higherY - lowerY) {
      [x, y] = [x + angle.x, y + angle.y];
      for (; x !== this.selected.x; [x, y] = [x + angle.x, y + angle.y]) {
        can = can && !this.cells[x + '_' + y].piece;
      }
    } else {
      can = false;
    }
    return can;
  },
  nextTurn() {
    this.turn = this.turn === 'W'? 'B' : 'W';
  }
}
