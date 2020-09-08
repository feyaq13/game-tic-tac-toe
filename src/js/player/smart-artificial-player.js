import { ArtificialPlayer } from './artificial-player';

export class SmartArtificialPlayer extends ArtificialPlayer {
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
    }, 100);
  }
}
