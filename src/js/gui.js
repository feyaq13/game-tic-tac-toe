export class GUI {
  constructor() {
    this._onResetCb = null;
    this._btnNewGame = document.getElementsByClassName('btn-new-game')[0];
  }

  displayPlayedGames(number) {
    document.getElementsByClassName('statics__number-of-games-played')[0].textContent = number;
  }

  markCell(cellInd, player) {
    document.getElementsByClassName('cell')[cellInd].textContent = player.symbol;
  }

  showNewGameButton() {
    this._btnNewGame.hidden = false;
    this._btnNewGame.addEventListener('click', this._onResetCb);
  }

  hideNewGameButton() {
    this._btnNewGame.hidden = true;
    this._btnNewGame.removeEventListener('click', this._onResetCb);
  }

  onResetClicked(cb) {
    this._onResetCb = cb;
  }

  clearCells() {
    for (let i = 0; i < 9; i++) {
      document.getElementsByClassName('cell')[i].textContent = null;
    }
  }

}
