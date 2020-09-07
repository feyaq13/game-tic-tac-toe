class AbstractPlayer {
  constructor(name) {
    this._name = name;
  }

  makeTurn(cb) {
    throw new Error('Abstract');
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
    document.getElementById('game').addEventListener('click', this.onMakeTurn.bind(this));
  }

  _removeEventListeners() {
    document.getElementById('game').removeEventListener('click', this.onMakeTurn.bind(this));
  }

  onMakeTurn(e) {
    if (e.target.classList[0] === 'cell' && !e.target.textContent) {
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
    super('PC');
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
    this._player2 = isAgainstComputer ? new ArtificialPlayer() : new HumanPlayer(this.askPlayerName());

    this._lastWinPlayer = localStorage.lastWinPlayer || null;
    this._activePlayer = this._lastWinPlayer === 'PC' ? this._player2 : this._player1;
    this._field = new Array(9).fill(null);
    this._numberOfGamesPlayed = localStorage.numberOfGamesPlayed || 0;
    this._showNumberOfGamesPlayed(document.getElementsByClassName('statics__number-of-games-played')[0]);
    this._btnNewGame = document.getElementsByClassName('btn-new-game')[0];
  }

  _showNumberOfGamesPlayed(elemHTML) {
    elemHTML.textContent = this._numberOfGamesPlayed || 0;
  }

  _saveGameHistory(winner) {
    let winners = {
      USER: 0,
      PC: 0,
    };

    localStorage.userName = this._player1;

    if (localStorage.winnersStat) {
      winners = JSON.parse(localStorage.winnersStat);
    }

    String(winner) === 'PC' ? ++winners['PC'] : ++winners['USER'];
    localStorage.winnersStat = JSON.stringify(winners);
    localStorage.lastWinPlayer = this._lastWinPlayer = String(this._activePlayer);
  }

  _saveNumberOfGamesPlayed() {
    if (localStorage.numberOfGamesPlayed) {
      this._numberOfGamesPlayed = localStorage.numberOfGamesPlayed;
    }

    this._numberOfGamesPlayed = ++this._numberOfGamesPlayed;

    localStorage.numberOfGamesPlayed = this._numberOfGamesPlayed;
    this._showNumberOfGamesPlayed(document.getElementsByClassName('statics__number-of-games-played')[0]);
  }

  askPlayerName() {
    return localStorage.userName || this._validateUserName();
  }

  _validateUserName() {
    let userName = prompt('Имя:', 'Игрок1');

    return userName ? userName : this._validateUserName();
  }

  fillFieldCell(cellIndex) {
    console.log(`Игрок ${this._activePlayer} заполнил клетку с индеком ${cellIndex}`);

    this._field[cellIndex] = this._activePlayer;
    this._markCell(cellIndex);

    if (this._gameIsWon()) {
      this._saveGameHistory(this._activePlayer);
      this._saveNumberOfGamesPlayed();
      console.log(`game is won by ${this._activePlayer}`);
      this._showNewGameButton();

      return;
    } else if (this._getEmptyCells().length < 1) {
      this._saveNumberOfGamesPlayed();
      console.log('game over');
      this._showNewGameButton();

      return;
    }

    this._activePlayer = this._activePlayer === this._player1 ? this._player2 : this._player1;

    this.processNextTurn();
  }

  _markCell(cell) {
    const markPlayer1 = 'o';
    const markPlayer2 = 'x';

    if (this._activePlayer === this._player1) {
      document.getElementsByClassName('cell')[cell].textContent = markPlayer1;
    } else {
      document.getElementsByClassName('cell')[cell].textContent = markPlayer2;
    }
  }

  _getEmptyCells() {
    return this._field.reduce((availableCells, cell, i) => {
      if (!cell) {
        availableCells.push(i);
      }

      return availableCells;
    }, []);
  }

  _getBinaryMatrixCells(player) {
    return this._field.map((cell) => Number(cell === player));
  }

  _gameIsWon() {
    const player1Cells = this._getBinaryMatrixCells(this._player1);
    const player2Cells = this._getBinaryMatrixCells(this._player2);

    return this.playerHasWon(player1Cells) || this.playerHasWon(player2Cells);
  }

  playerHasWon(playerCells) {
    const [c0, c1, c2, c3, c4, c5, c6, c7, c8] = playerCells;

    return (
      c0 * c1 * c2 +
        c3 * c4 * c5 +
        c6 * c7 * c8 +
        c0 * c3 * c6 +
        c1 * c4 * c7 +
        c2 * c5 * c8 +
        c0 * c4 * c8 +
        c2 * c4 * c6 >
      0
    );
  }

  processNextTurn() {
    const availableCells = this._getEmptyCells();
    console.log(`Ходит ${this._activePlayer}`);

    if (availableCells.length < 1) {
      return;
    }

    this._activePlayer.makeTurn(this.fillFieldCell.bind(this), availableCells);
  }

  _resetGame() {
    this._field = this._field.map((cell, i) => {
      document.getElementsByClassName('cell')[i].textContent = null;

      return null;
    });

    this._btnNewGame.removeEventListener('click', this._resetGame);
    this._player1._removeEventListeners();
    this._hideNewGameButton();
    this.processNextTurn();
  }

  _showNewGameButton() {
    this._btnNewGame.hidden = false;
    this._btnNewGame.addEventListener('click', this._resetGame.bind(this));
  }

  _hideNewGameButton() {
    this._btnNewGame.hidden = true;
    this._btnNewGame.removeEventListener('click', this._resetGame.bind(this));
  }
}

const ticTacToe = new Game();
ticTacToe.processNextTurn();
