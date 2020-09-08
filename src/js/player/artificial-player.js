import { AbstractPlayer } from './abstract-player';

export class ArtificialPlayer extends AbstractPlayer {
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
