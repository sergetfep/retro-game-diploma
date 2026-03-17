export default class GameState {
  constructor() {
    this.currentLevel = 1;
    this.playerTurn = true;
    this.positions = [];
    this.maxScore = 0;
    this.currentScore = 0;
    this.isGameOver = false;
  }

  static from(object) {
    if (!object) return null;
    const state = new GameState();
    state.currentLevel = object.currentLevel || 1;
    state.playerTurn = object.playerTurn !== undefined ? object.playerTurn : true;
    state.positions = object.positions || [];
    state.maxScore = object.maxScore || 0;
    state.currentScore = object.currentScore || 0;
    state.isGameOver = object.isGameOver || false;
    return state;
  }
}
