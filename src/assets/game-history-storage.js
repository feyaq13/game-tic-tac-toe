export class GameHistoryStorage {
  constructor(source = {}) {
    this._storageSource = source;
  }

  /**
   *
   * @returns {string|null}
   */
  getLastWinnerName() {
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
