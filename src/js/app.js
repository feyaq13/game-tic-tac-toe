import { gui } from './gui';
import { Game } from './game';
import { SessionStorageGameHistoryStorage } from './history-storage/session-storage-game-history-storage';

const storage = new SessionStorageGameHistoryStorage();

const ticTacToe = new Game({ isAgainstComputer: true, gui, storage });
ticTacToe.processNextTurn();
