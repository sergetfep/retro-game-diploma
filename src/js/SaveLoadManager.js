import GameState from './GameState';
import GamePlay from './GamePlay';
import PositionedCharacter from './PositionedCharacter';
import { Bowman, Swordsman, Magician, Vampire, Undead, Daemon } from './characters';

const CHARACTER_CLASSES = {
  bowman: Bowman,
  swordsman: Swordsman,
  magician: Magician,
  vampire: Vampire,
  undead: Undead,
  daemon: Daemon,
};

export default class SaveLoadManager {
  constructor(stateService, positionManager, levelManager) {
    this.stateService = stateService;
    this.positionManager = positionManager;
    this.levelManager = levelManager;
  }

  save(gameState) {
    const stateData = {
      currentLevel: gameState.currentLevel,
      playerTurn: gameState.playerTurn,
      maxScore: gameState.maxScore,
      currentScore: gameState.currentScore,
      isGameOver: gameState.isGameOver,
      positions: this.positionManager.positions.map((p) => ({
        character: {
          type: p.character.type,
          level: p.character.level,
          attack: p.character.attack,
          defence: p.character.defence,
          health: p.character.health,
          moveRange: p.character.moveRange,
          attackRange: p.character.attackRange,
        },
        position: p.position,
      })),
    };
    this.stateService.save(stateData);
    GamePlay.showMessage('Игра сохранена!');
  }

  load() {
    try {
      const loaded = this.stateService.load();
      if (!loaded) {
        GamePlay.showError('Нет сохранённой игры!');
        return null;
      }

      const gameState = GameState.from(loaded);
      this.levelManager.applyTheme(gameState.currentLevel);

      this.positionManager.positions = loaded.positions.map((p) => {
        const char = SaveLoadManager.restoreCharacter(p.character);
        return new PositionedCharacter(char, p.position);
      });

      GamePlay.showMessage('Игра загружена!');
      return gameState;
    } catch {
      GamePlay.showError('Не удалось загрузить игру!');
      return null;
    }
  }

  static restoreCharacter(data) {
    const CharClass = CHARACTER_CLASSES[data.type];
    const char = new CharClass(1);
    char.level = data.level;
    char.attack = data.attack;
    char.defence = data.defence;
    char.health = data.health;
    char.moveRange = data.moveRange;
    char.attackRange = data.attackRange;
    return char;
  }
}
