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
    this.symbol = '🔥';
    this._onMadeTurn = null;
  }

  makeTurn(cb) {
    this._onMadeTurn = cb;
  }

  _setupEventListeners() {
    document.getElementById('game').addEventListener('click', this.onMakeTurn.bind(this));
  }

  removeEventListeners() {
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
  constructor(name = 'PC') {
    super(name);
    this.symbol = '❄️';
  }

  makeTurn(cb, field) {
    const availableCells = field.reduce((availableCells, cell, i) => {
      if (!cell) {
        availableCells.push(i);
      }

      return availableCells;
    }, []);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      cb(availableCells[randomIndex]);
    }, 1000);
  }
}

class SmartArtificialPlayer extends ArtificialPlayer {
  constructor() {
    super();
    this._winningCellsCombinations = [
      [0, 1, 2],
      [0, 3, 6],
      [0, 4, 8],
      [1, 4, 7],
      [2, 5, 8],
      [2, 4, 6],
      [3, 4, 5],
      [6, 7, 8],
    ];
  }
  makeTurn(cb, field) {
    const nonOpponentCellIndexes = field.reduce((nonOpponentCellIndexes, cell, i) => {
      if (cell === this || !cell) {
        nonOpponentCellIndexes.push(i);
      }

      return nonOpponentCellIndexes;
    }, []);
    console.log(nonOpponentCellIndexes);

    setTimeout(() => {
      const availableCombinations = this._winningCellsCombinations.filter((combination) => {
        return combination.every((num) => {
          if (nonOpponentCellIndexes.includes(num)) {
            return combination;
          }
        });
      });

      const [combination] = availableCombinations;

      const availableCells = field
        .reduce((availableCells, cell, i) => {
          if (!cell) {
            availableCells.push(i);
          }

          return availableCells;
        }, [])
        .filter((cellInd) => combination.includes(cellInd));
      console.log({ combination, availableCells });

      const randomIndex = Math.floor(Math.random() * availableCells.length);
      cb(availableCells[randomIndex]);
    }, 1000);
  }
}

class Game {
  constructor(config) {
    const { isAgainstComputer, storage, gui } = config;
    this._storage = storage;
    this._gui = gui;
    this._gui.onResetClicked(this._reset.bind(this));

    this._field = new Array(9).fill(null);

    this._player1 = new HumanPlayer(this.askPlayerName());
    this._player2 = isAgainstComputer ? new SmartArtificialPlayer() : new HumanPlayer(this.askPlayerName());
    this._lastWinner = this._storage.getLastWinner();
    this._activePlayer = this._lastWinner === 'PC' ? this._player2 : this._player1;

    this._gui.displayPlayedGames(this._storage.getPlayedGames());
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
    this._gui.markCell(cellIndex, this._activePlayer);

    if (this.shouldContinue()) {
      this._activePlayer = this._activePlayer === this._player1 ? this._player2 : this._player1;
      this.processNextTurn();
    } else {
      console.log('game over');
    }
  }

  shouldContinue() {
    const gameIsWon = this._gameIsWon();
    const noCellsLeft = this._getEmptyCells().length < 1;

    if (gameIsWon) {
      this._storage.saveGameHistory(this._activePlayer);
      console.log(`${this._activePlayer} has won`);
    } else if (noCellsLeft) {
      this._storage.saveGameHistory();
      console.log('Draw');
    }

    if (gameIsWon || noCellsLeft) {
      this._gui.displayPlayedGames(this._storage.getPlayedGames());
      this._gui.showNewGameButton();

      return false;
    }

    return true;
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

    this._activePlayer.makeTurn(this.fillFieldCell.bind(this), this._field);
  }

  _reset() {
    this._gui.clearCells();
    this._gui.hideNewGameButton();
    this._field = this._field.map(() => null);
    this.processNextTurn();
  }
}

const gui = {
  _onResetCb: null,
  _btnNewGame: document.getElementsByClassName('btn-new-game')[0],
  displayPlayedGames(number) {
    document.getElementsByClassName('statics__number-of-games-played')[0].textContent = number;
  },
  markCell(cellInd, player) {
    document.getElementsByClassName('cell')[cellInd].textContent = player.symbol;
  },
  showNewGameButton() {
    this._btnNewGame.hidden = false;
    this._btnNewGame.addEventListener('click', this._onResetCb);
  },
  hideNewGameButton() {
    this._btnNewGame.hidden = true;
    this._btnNewGame.removeEventListener('click', this._onResetCb);
  },
  onResetClicked(cb) {
    this._onResetCb = cb;
  },
  clearCells() {
    for (let i = 0; i < 9; i++) {
      document.getElementsByClassName('cell')[i].textContent = null;
    }
  },
};

class GameHistoryStorage {
  constructor(source = {}) {
    this._storageSource = source;
  }

  getLastWinner() {
    return this._storageSource.lastWinPlayer || null;
  }
  getPlayedGames() {
    return this._storageSource.numberOfGamesPlayed || 0;
  }
  saveGameHistory(winner) {
    const winners = this._storageSource.winnersStat
      ? JSON.parse(this._storageSource.winnersStat)
      : {
          USER: 0,
          PC: 0,
        };

    if (String(winner) === 'PC') {
      winners.PC++;
    } else if (winner) {
      winners.USER++;
    }

    this._storageSource.winnersStat = JSON.stringify(winners);
    this._storageSource.lastWinPlayer = String(winner);

    if (this._storageSource.numberOfGamesPlayed) {
      this._storageSource.numberOfGamesPlayed++;
    } else {
      this._storageSource.numberOfGamesPlayed = 1;
    }
  }
}

class LocalStorageGameHistoryStorage extends GameHistoryStorage {
  constructor() {
    super(localStorage);
  }
}

class SessionStorageGameHistoryStorage extends GameHistoryStorage {
  constructor() {
    super(sessionStorage);
  }
}

const storage = new SessionStorageGameHistoryStorage();

const ticTacToe = new Game({ isAgainstComputer: true, gui, storage });
ticTacToe.processNextTurn();
