import cursors from './cursors';
import GameState from './GameState';
import { calcMoveRange, calcAttackRange } from './utils';
import GamePlay from './GamePlay';

import PositionManager from './PositionManager';
import CombatManager from './CombatManager';
import AIController from './AIController';
import LevelManager from './LevelManager';
import SaveLoadManager from './SaveLoadManager';
import CellHoverHandler from './CellHoverHandler';

import { Bowman, Swordsman, Magician, Vampire, Undead, Daemon } from './characters';

const playerTypes = [Bowman, Swordsman, Magician];
const enemyTypes = [Vampire, Undead, Daemon];

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.selectedCharIndex = null;
    this.boardSize = 8;

    this.positionManager = new PositionManager(this.boardSize);
    this.levelManager = new LevelManager(
      gamePlay, this.positionManager, playerTypes, enemyTypes, this.boardSize,
    );
    this.aiController = new AIController(gamePlay, this.positionManager, this.boardSize);
    this.saveLoadManager = new SaveLoadManager(
      stateService, this.positionManager, this.levelManager,
    );
    this.hoverHandler = new CellHoverHandler(gamePlay, this.positionManager, this.boardSize);
  }

  init() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
    this.startNewGame();
  }

  startNewGame() {
    this.gameState = new GameState();
    this.selectedCharIndex = null;
    this.levelManager.applyTheme(1);
    this.positionManager.generatePositions(playerTypes, enemyTypes, 1, 2);
    this.gamePlay.redrawPositions(this.positionManager.positions);
  }

  async onCellClick(index) {
    if (this.gameState.isGameOver || !this.gameState.playerTurn) return;

    const posChar = this.positionManager.getPositionedCharAt(index);

    if (posChar && this.positionManager.isPlayerChar(posChar.character)) {
      this.selectCharacter(index);
      return;
    }

    if (this.selectedCharIndex === null) {
      if (posChar) GamePlay.showError('Это не ваш персонаж!');
      return;
    }

    const selected = this.positionManager.getPositionedCharAt(this.selectedCharIndex);
    const { character } = selected;
    const moveRange = calcMoveRange(this.selectedCharIndex, character.moveRange, this.boardSize);
    const attackRange = calcAttackRange(
      this.selectedCharIndex, character.attackRange, this.boardSize,
    );

    if (!posChar && moveRange.includes(index)) {
      this.moveCharacter(selected, index);
    } else if (posChar && !this.positionManager.isPlayerChar(posChar.character)
      && attackRange.includes(index)) {
      await this.handlePlayerAttack(selected, posChar);
    } else {
      GamePlay.showError('Недопустимое действие!');
    }
  }

  selectCharacter(index) {
    if (this.selectedCharIndex !== null) this.gamePlay.deselectCell(this.selectedCharIndex);
    this.selectedCharIndex = index;
    this.gamePlay.selectCell(index);
    this.gamePlay.setCursor(cursors.pointer);
  }

  moveCharacter(posChar, index) {
    this.gamePlay.deselectCell(this.selectedCharIndex);
    posChar.position = index;
    this.selectedCharIndex = null;
    this.gamePlay.redrawPositions(this.positionManager.positions);
    this.gamePlay.setCursor(cursors.auto);
    this.switchTurn();
  }

  async handlePlayerAttack(attacker, target) {
    this.clearSelection();
    await CombatManager.performAttack(this.gamePlay, this.positionManager, attacker, target);
    if (!this.levelManager.checkGameEnd(this.gameState) && !this.gameState.isGameOver) {
      this.switchTurn();
    }
  }

  clearSelection() {
    if (this.selectedCharIndex !== null) this.gamePlay.deselectCell(this.selectedCharIndex);
    this.selectedCharIndex = null;
  }

  switchTurn() {
    this.gameState.playerTurn = !this.gameState.playerTurn;
    if (!this.gameState.playerTurn) {
      this.aiController.takeTurn(this.gameState).then(() => {
        this.levelManager.checkGameEnd(this.gameState);
      });
    }
  }

  onCellEnter(index) {
    if (this.gameState.isGameOver) return;
    this.hoverHandler.onEnter(index, this.selectedCharIndex);
  }

  onCellLeave(index) {
    this.hoverHandler.onLeave(index, this.selectedCharIndex);
  }

  onNewGame() {
    const { maxScore } = this.gameState;
    this.startNewGame();
    this.gameState.maxScore = maxScore;
  }

  onSaveGame() { this.saveLoadManager.save(this.gameState); }

  onLoadGame() {
    const loaded = this.saveLoadManager.load();
    if (loaded) {
      this.gameState = loaded;
      this.selectedCharIndex = null;
      this.gamePlay.redrawPositions(this.positionManager.positions);
    }
  }
}
