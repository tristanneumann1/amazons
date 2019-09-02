// MODEL


class Cell {
  piece = null;
  selected = false;
  constructor(x, y, controller) {
    this.x = x;
    this.y = y;
    this.controller = controller;
  }
  draw() {
    this.controller.drawCell(this.piece && this.piece.img, this.x, this.y, this.selected);
  }
  place(piece) {
    this.piece = piece;
    return this;
  }
  select() {
    this.selected = !this.selected;
    return this;
  }
}


class Game {
  turn = [];
  selected = null;
  moved = false;
  constructor(width, height, startingPositions, order, controller) {
    this.width = width;
    this.height = height;
    this.startingPositions = startingPositions;
    this.turn = order;
    this.controller = controller;
  }
  start() {
    this.controller.start(this);
  }
  nextTurn() {
    this.turn.push(this.turn.shift());
  }
  click(piece, x, y) {
    if (!this.selected && piece && piece.constructor === Queen && piece.color === this.turn[0]) {
      // select
      this.selected = {piece, x, y}
      this.cells[x + '_' + y].select(true).draw();
    } else if (this.selected && this.moved === false && x === this.selected.x && y === this.selected.y) {
      // deselect
      this.selected = null;
      this.cells[x + '_' + y].select(false).draw();
    } else if (this.selected && this.moved === false && piece === null && this.canMove(x, y)) {
      // move
      this.cells[this.selected.x + '_' + this.selected.y].select(false).place(null).draw();
      this.cells[x + '_' + y].select(true).place(this.selected.piece).draw();
      this.moved = true;
      this.selected.x = x;
      this.selected.y = y;
    } else if (this.moved && piece === null && this.selected && this.canMove(x, y)) {
      // shoot
      this.cells[this.selected.x + '_' + this.selected.y].select(false).draw();
      this.cells[x + '_' + y].place(new Fire()).draw();
      this.selected = null;
      this.moved = false;
      this.nextTurn();
    }
  }
  canMove(x, y) {
    let lowerX = Math.min(x, this.selected.x);
    let lowerY = Math.min(y, this.selected.y);
    let higherX = Math.max(x, this.selected.x);
    let higherY = Math.max(y, this.selected.y);
    const angle = {
      x: this.selected.x - x > 0 ? 1 : -1,
      y: this.selected.y - y > 0 ? 1 : -1
    }
    let can = true;

    if (lowerX === higherX && lowerY === higherY) {
      can = false;
    } else if (lowerX === higherX) {
      lowerY++;
      for (; lowerY < higherY; lowerY++) {
        can = can && !this.cells[lowerX + '_' + lowerY].piece;
      }
    } else if (lowerY === higherY) {
      lowerX++;
      for (; lowerX < higherX; lowerX++) {
        can = can && !this.cells[lowerX + '_' + lowerY].piece;
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
  }
  nextTurn() {
    this.turn.push(this.turn.shift());
  }
}


// CONTROLLER

class Controller {
  canvases = [];
  ctxs = [];
  constructor(views, width, height, cellHeight, cellWidth) {
    this.cellHeight = cellHeight;
    this.cellWidth = cellWidth;
    this.canvases.push(...views);
    this.ctxs.push(...views.map(view => {
      const ctx = view.getContext('2d');
      view.width = width * cellWidth;
      view.height = height * cellHeight;
      ctx.fillStyle = '#a2a2a2';
      ctx.strokeRect(0, 0, width * cellWidth, height * cellHeight);
      return ctx;
    }))
  }
  createBoard(height, width, startingPositions) {
    // Default Board Factory
    const cells = {};
    let x = 0;
    let y = 0;
    for(let i = 0; i < height * width; i++) {
      const cell = new Cell(x, y, this);
      cells[`${x}_${y}`] = cell;
      if(x >= width - 1) {
        x = 0;
        y ++;
      } else {
        x ++;
      }
    }

    startingPositions.forEach(position => {
      this.placeQueens(cells, position.queens, position.color)
    })
    return cells;
  }
  placeQueens(cells, queens, color) {
    queens.forEach(queen => {
      cells[queen.x + '_' + queen.y].place(new Queen(color));
    })
  }
  registerClicks(game, cells) {
    const clickHandler = (event) => {
      const x = Math.floor(event.layerX / this.cellWidth);
      const y = Math.floor(event.layerY / this.cellHeight);
      game.click(cells[`${x}_${y}`].piece, x, y);
    }
    this.canvases.forEach(canvas => {
      canvas.onclick = clickHandler;
    })
  }
  start(game) {
    const cells = this.createBoard(game.height, game.width, game.startingPositions);
    this.registerClicks(game, cells);
    game.cells = cells;
    for (let position in cells) {
      cells[position].draw();
    }
  }
  drawCell(pieceImg, x, y, selected) {
    const ch = this.cellHeight;
    const cw = this.cellWidth;
    this.ctxs.forEach(ctx => {
      ctx.fillStyle = selected ? '#828282' : '#a2a2a2';
      ctx.clearRect(x * cw, y * ch, cw, ch);
      ctx.fillRect(x * cw, y * ch, cw, ch);
      ctx.fillStyle = '#a2a2a2';
      ctx.strokeRect(x * cw, y * ch, cw, ch);
      if(pieceImg) {
        ctx.drawImage(pieceImg, 0.05 * cw + x * cw, 0.05 * ch + y * ch, 0.9 * cw, 0.9 * ch);
      }
    })
  }
}



// VIEW

const canvas1 = document.getElementById('player1');
const ctx1 = canvas1.getContext('2d');
ctx1.fillStyle = '#a2a2a2';
ctx1.strokeRect(0, 0, 300, 300);

const canvas2 = document.getElementById('player2');
const ctx2 = canvas2.getContext('2d');
ctx2.fillStyle = '#a2a2a2';
ctx2.strokeRect(0, 0, 300, 300);

const fire = new Image();
const queenW = new Image();
const queenB = new Image();
const queens = {'W': queenW, 'B': queenB};
const assets = {queenW: false, queenB: false, fire: false}

queenW.src = './Chess_qlt45.svg';
queenB.src = './Chess_qdt45.svg';
fire.src = './fire-solid.svg';
queenW.onload = () => { assets['queenW'] = true; start(assets) }
queenB.onload = () => { assets['queenB'] = true; start(assets) }
fire.onload = () => { assets['fire'] = true; start(assets) }

class Queen {
  constructor(color) {
    this.color = color;
    this.img = queens[color];
  }
}

class Fire {
  img = fire;
}








const width = 6;
const cellWidth = 50;
const height = 6;
const cellHeight = 50;
const order = ['W', 'B'];
const startingPositions = [
  {
    color: 'W',
    queens: [
      {
        x: 0,
        y: 0,
      },
      {
        x: 5,
        y: 5
      }
    ]
  },
  {
    color: 'B',
    queens: [
      {
        x: 5,
        y: 0,
      },
      {
        x: 0,
        y: 5
      }
    ]
  },
]

const controller = new Controller([canvas1], width, height, cellWidth, cellHeight);
const game = new Game(width, height, startingPositions, order, controller);

function start(assets) {
  let loaded = true;
  for (let asset in assets) {
    loaded = loaded && assets[asset];
  }
  if (loaded) {
    game.start();
  }
}

