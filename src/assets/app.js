class AbstractPlayer {
  constructor(name) {
    this._name = name;
  }

  makeTurn(cb) {
    throw new Error("Abstract");
  }

  toString() {
    return this._name;
  }
}

class HumanPlayer extends AbstractPlayer {
  constructor(name) {
    super(name);
    this._setupEventListeners();
    this._onMadeTurn = null;
  }

  makeTurn(cb) {
    this._onMadeTurn = cb;
  }

  _setupEventListeners() {
    document
      .getElementById("game")
      .addEventListener("click", this.onMakeTurn.bind(this));
  }

  onMakeTurn(e) {
    if (e.target.classList[0] === "cell") {
      const ind = e.target.dataset.index;

      if (this._onMadeTurn) {
        this._onMadeTurn(ind);
        this._onMadeTurn = null;
      }
    }
  }
}

class ArtificialPlayer extends AbstractPlayer {
  constructor() {
    super("PC");
  }

  makeTurn(cb, availableCells) {
    console.log({ availableCells });

    setTimeout(() => {
      cb((Math.random() * 9) >> 0);
    }, 1000);
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
    return "USER";
    // return prompt("Имя:", "");
  }

  fillFieldCell(cellIndex) {
    console.log(
      `Игрок ${this._activePlayer} заполнил клетку с индеком ${cellIndex}`
    );

    this._field[cellIndex] = this._activePlayer;
    this._markedCells(this._activePlayer, cellIndex);
  }

  _markedCells(activePlayer, cell) {
    const markPlayer1 = "o";
    const markPlayer2 = "x";

    if (activePlayer === this._player1) {
      document.getElementsByClassName("cell")[cell].textContent = markPlayer1;
    } else {
      document.getElementsByClassName("cell")[cell].textContent = markPlayer2;
    }
  }

  _thereAreEmptyFields(fields) {
    return fields.filter((field) => field === null).length > 0;
  }

  _gameIsWon() {
    const player1Field = this._field
      .map((cell) => Number(cell === this._player1))
      .join("");

    const player2Field = this._field
      .map((cell) => Number(cell === this._player2))
      .join("");

    const winningPatterns = [
      0b111000000,
      0b000111000,
      0b000000111,
      0b100100100,
      0b010010010,
      0b001001001,
      0b100010001,
      0b001010100,
    ];

    const player1FieldNumber = parseInt(+player1Field, 2);
    const player2FieldNumber = parseInt(+player2Field, 2);

    const player1HasWon = winningPatterns.includes(player1FieldNumber);
    const player2HasWon = winningPatterns.includes(player2FieldNumber);

    return player1HasWon || player2HasWon;
  }

  processNextTurn() {
    this._activePlayer.makeTurn(
      (ind) => {
        if (this._thereAreEmptyFields(this._field)) {
          this.fillFieldCell(ind);

          if (!this._gameIsWon()) {
            this._activePlayer =
              this._activePlayer === this._player1
                ? this._player2
                : this._player1;

            this.processNextTurn();
          } else {
            console.log(`game is won by ${this._activePlayer}`);
          }
        } else {
          console.log("game over");
        }
      },
      this._field.reduce((availableCells, cell, i) => {
        if (!cell) {
          availableCells.push(i);
        }

        return availableCells;
      }, [])
    );
  }
}

const ticTacToe = new Game();
ticTacToe.processNextTurn();
