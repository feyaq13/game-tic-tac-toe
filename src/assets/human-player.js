import { AbstractPlayer } from './abstract-player';

export class HumanPlayer extends AbstractPlayer {
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
