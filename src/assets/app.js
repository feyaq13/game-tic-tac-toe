class AbstractPlayer {
  constructor(name) {
    this._name = name;
  }

  makeTurn(cb) {
    setTimeout(() => {
      cb((Math.random() * 9) >> 0);
    }, 1000);
  }

  toString() {
    return this._name;
  }
}

class HumanPlayer extends AbstractPlayer {}

class ArtificialPlayer extends AbstractPlayer {
  constructor() {
    super("PC");
  }
}

class Game {
  constructor(isAgainstComputer = true) {
    this._player1 = new HumanPlayer(this.askPlayerName());
    this._player2 = isAgainstComputer
      ? new ArtificialPlayer()
      : new HumanPlayer(this.askPlayerName());

    this._activePlayer = this._player1;
    this._field = new Array(9).fill(null);
  }

  askPlayerName() {
    return prompt("Имя:", "");
  }
  //
  _markedCells(activePlayer, cell) {
    const markPlayer1 = "o";
    const markPlayer2 = "x";

    if (activePlayer === this._player1) {
      document.getElementsByClassName("cell")[cell].textContent = markPlayer1;
    } else {
      document.getElementsByClassName("cell")[cell].textContent = markPlayer2;
    }
  }

  fillFieldCell(cellIndex) {
    console.log(
      `Игрок ${this._activePlayer} заполнил клетку с индеком ${cellIndex}`
    );

    this._field[cellIndex] = this._activePlayer;
    this._markedCells(this._activePlayer, cellIndex);
  }

  processNextTurn() {
    this._activePlayer.makeTurn((cellIndex) => {
      if (this._field[cellIndex] === null) {
        this.fillFieldCell(cellIndex);
      }

      this._activePlayer =
        this._activePlayer === this._player1 ? this._player2 : this._player1;
      this.processNextTurn();
    });
  }
}

const ticTacToe = new Game();
ticTacToe.processNextTurn();
