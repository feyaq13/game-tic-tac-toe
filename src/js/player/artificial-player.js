import { AbstractPlayer } from './abstract-player';

export class ArtificialPlayer extends AbstractPlayer {
  constructor(name = 'PC') {
    super(name);
    this.symbol = '❄️';
  }

  _getAvailableCellIndexes(field) {
    return field.reduce((availableCells, cell, i) => {
      if (!cell) {
        availableCells.push(i);
      }

      return availableCells;
    }, []);
  }

  makeTurn(cb, field) {
    const availableCells = this._getAvailableCellIndexes(field);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      cb(availableCells[randomIndex]);
    }, 1000);
  }
}
