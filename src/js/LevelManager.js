import themes from './themes';
import { generateTeam } from './generators';
import GamePlay from './GamePlay';

const themeLevels = [themes.prairie, themes.desert, themes.arctic, themes.mountain];

export default class LevelManager {
  constructor(gamePlay, positionManager, playerTypes, enemyTypes, boardSize = 8) {
    this.gamePlay = gamePlay;
    this.positionManager = positionManager;
    this.playerTypes = playerTypes;
    this.enemyTypes = enemyTypes;
    this.boardSize = boardSize;
  }

  applyTheme(level) {
    const themeIndex = (level - 1) % themeLevels.length;
    this.gamePlay.drawUi(themeLevels[themeIndex]);
  }

  checkGameEnd(gameState) {
    const players = this.positionManager.getPlayerChars();
    const enemies = this.positionManager.getEnemyChars();

    if (players.length === 0) {
      gameState.maxScore = Math.max(gameState.maxScore, gameState.currentScore);
      gameState.isGameOver = true;
      GamePlay.showMessage('Вы проиграли! Game Over.');
      return true;
    }

    if (enemies.length === 0) {
      gameState.currentScore += players.reduce((sum, p) => sum + p.character.health, 0);

      if (gameState.currentLevel >= 4) {
        gameState.maxScore = Math.max(gameState.maxScore, gameState.currentScore);
        gameState.isGameOver = true;
        GamePlay.showMessage(
          `Поздравляем! Вы прошли игру! Набрано очков: ${gameState.currentScore}`,
        );
        return true;
      }

      this.advanceLevel(gameState);
      return true;
    }

    return false;
  }

  advanceLevel(gameState) {
    gameState.currentLevel += 1;
    gameState.playerTurn = true;

    const survivors = this.positionManager.getPlayerChars();
    survivors.forEach((p) => p.character.levelUp());

    this.applyTheme(gameState.currentLevel);

    const { currentLevel: level } = gameState;
    const count = level + 1;

    const survivorPositions = survivors.map((p) => p.position);
    const enemyPositions = this.positionManager.getRandomPositions(
      [6, 7], count, survivorPositions,
    );

    const allOccupied = [...survivorPositions, ...enemyPositions];
    const newPlayersCount = Math.max(0, count - survivors.length);
    const newPlayerPositions = newPlayersCount > 0
      ? this.positionManager.getRandomPositions([0, 1], newPlayersCount, allOccupied)
      : [];

    const enemyTeam = generateTeam(this.enemyTypes, level, count);
    const playerTeam = generateTeam(this.playerTypes, level, newPlayersCount);

    this.positionManager.positions = [...survivors];
    this.positionManager.addChars(enemyTeam, enemyPositions);
    this.positionManager.addChars(playerTeam, newPlayerPositions);

    this.gamePlay.redrawPositions(this.positionManager.positions);
  }
}
