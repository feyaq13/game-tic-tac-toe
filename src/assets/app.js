class AbstractPlayer {
  constructor(name) {
    this._name = name;
  }

  makeTurn(cb) {
    setTimeout(() => {
      cb((Math.random() * 10) >> 0);
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

  fillFieldCell(cellIndex) {
    console.log(
      `Игрок ${this._activePlayer} заполнил клетку с индеком ${cellIndex}`
    );

    //

    this._field[cellIndex] = this._activePlayer;
  }

  processNextTurn() {
    this._activePlayer.makeTurn((cellIndex) => {
      this.fillFieldCell(cellIndex);

      //

      this._activePlayer =
        this._activePlayer === this._player1 ? this._player2 : this._player1;
      this.processNextTurn();
    });
  }
}

const ticTacToe = new Game();
ticTacToe.processNextTurn();
