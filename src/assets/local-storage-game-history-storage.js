import { GameHistoryStorage } from './game-history-storage';

export class LocalStorageGameHistoryStorage extends GameHistoryStorage {
  constructor() {
    super(localStorage);
  }
}
