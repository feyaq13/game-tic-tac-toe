export class AbstractPlayer {
  constructor(name) {
    this._name = name;
  }

  makeTurn(cb) {
    throw new Error('Abstract');
  }

  toString() {
    return this._name;
  }
}
