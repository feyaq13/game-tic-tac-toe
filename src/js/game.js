import { HumanPlayer } from './player/human-player';
import { SmartArtificialPlayer } from './player/smart-artificial-player';

export class Game {
  constructor(config) {
    const { isAgainstComputer, storage, gui } = config;
    this._storage = storage;
    this._gui = gui;
    this._gui.onResetClicked(this._reset.bind(this));

    /**
     *
     * @type {Array<null|AbstractPlayer>}
     * @private
     */
    this._field = new Array(9).fill(null);

    /**
     *
     * @type {HumanPlayer}
     * @private
     */
    this._player1 = new HumanPlayer(this.askPlayerName());

    /**
     *
     * @type {AbstractPlayer}
     * @private
     */
    this._player2 = isAgainstComputer ? new SmartArtificialPlayer() : new HumanPlayer(this.askPlayerName());

    this._lastWinnerName = this._storage.getLastWinnerName();

    /**
     *
     * @type {AbstractPlayer}
     * @private
     */
    this._activePlayer = this._lastWinnerName === 'PC' ? this._player2 : this._player1;

    this._gui.displayPlayedGames(this._storage.getPlayedGames());
  }

  askPlayerName() {
    return localStorage.userName || this._validateUserName();
  }

  _validateUserName() {
    let userName = prompt('Имя:', 'Игрок1');

    return userName ? userName : this._validateUserName();
  }

  /**
   *
   * @param {number} cellIndex
   */
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

  /**
   *
   * @param {AbstractPlayer} player
   * @returns {number[]}
   * @private
   */
  _getBinaryMatrixCells(player) {
    return this._field.map((cell) => Number(cell === player));
  }

  /**
   * Определяет, выиграна ли игра.
   * @returns {boolean}
   * @private
   */
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
