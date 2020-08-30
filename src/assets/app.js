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
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      cb(availableCells[randomIndex]);
    }, 1000);
  }
}

class Game {
  constructor(isAgainstComputer = true) {
    this._player1 = new HumanPlayer(this.askPlayerName());
    this._player2 = isAgainstComputer
      ? new ArtificialPlayer()
      : new HumanPlayer(this.askPlayerName());

    this._lastWinPlayer = localStorage.lastWinPlayer || null;
    this._activePlayer =
      this._lastWinPlayer === "USER" ? this._player1 : this._player2;
    console.log(`Первый ходит ${this._activePlayer}`);
    this._field = new Array(9).fill(null);
  }

  _saveWinningsHistory(winner) {
    let winners = {
      USER: 0,
      PC: 0,
    };

    if (localStorage.winnersStat) {
      winners = JSON.parse(localStorage.winnersStat);

      String(winner) === "USER" ? ++winners["USER"] : ++winners["PC"];
    }

    localStorage.winnersStat = JSON.stringify(winners);
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
    this._markCell(cellIndex);
  }

  _markCell(cell) {
    const markPlayer1 = "o";
    const markPlayer2 = "x";

    if (this._activePlayer === this._player1) {
      document.getElementsByClassName("cell")[cell].textContent = markPlayer1;
    } else {
      document.getElementsByClassName("cell")[cell].textContent = markPlayer2;
    }
  }

  _thereAreEmptyFields(fields) {
    return fields.filter((field) => field === null).length > 0;
  }

  _gameIsWon() {
    const player1Field = this._field.map((cell) =>
      Number(cell === this._player1)
    );

    const player2Field = this._field.map((cell) =>
      Number(cell === this._player2)
    );

    const player1HasWon =
      player1Field[0] * player1Field[1] * player1Field[2] +
        player1Field[3] * player1Field[4] * player1Field[5] +
        player1Field[6] * player1Field[7] * player1Field[8] +
        player1Field[0] * player1Field[3] * player1Field[6] +
        player1Field[1] * player1Field[4] * player1Field[7] +
        player1Field[2] * player1Field[5] * player1Field[8] +
        player1Field[0] * player1Field[4] * player1Field[8] +
        player1Field[2] * player1Field[4] * player1Field[6] >
      0;

    const player2HasWon =
      player2Field[0] * player2Field[1] * player2Field[2] +
        player2Field[3] * player2Field[4] * player2Field[5] +
        player2Field[6] * player2Field[7] * player2Field[8] +
        player2Field[0] * player2Field[3] * player2Field[6] +
        player2Field[1] * player2Field[4] * player2Field[7] +
        player2Field[2] * player2Field[5] * player2Field[8] +
        player2Field[0] * player2Field[4] * player2Field[8] +
        player2Field[2] * player2Field[4] * player2Field[6] >
      0;

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
            this._saveWinningsHistory(this._activePlayer);
            console.log(`game is won by ${this._activePlayer}`);
            localStorage.lastWinPlayer = this._lastWinPlayer = String(
              this._activePlayer
            );
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
