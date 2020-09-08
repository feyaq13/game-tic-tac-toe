import { GameHistoryStorage } from './game-history-storage';

export class SessionStorageGameHistoryStorage extends GameHistoryStorage {
  constructor() {
    super(sessionStorage);
  }
}
