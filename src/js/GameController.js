import themes from './themes';
import cursors from './cursors';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import { formatCharInfo, calcMoveRange, calcAttackRange } from './utils';
import GamePlay from './GamePlay';

import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';

const playerTypes = [Bowman, Swordsman, Magician];
const enemyTypes = [Vampire, Undead, Daemon];
const playerTypeNames = ['bowman', 'swordsman', 'magician'];

const themeLevels = [themes.prairie, themes.desert, themes.arctic, themes.mountain];

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.positions = [];
    this.selectedCharIndex = null;
    this.boardSize = 8;
  }

  init() {
    // Регистрируем слушатели ОДИН раз — они сохраняются в массивах GamePlay
    // и работают даже после drawUi, т.к. новые DOM-элементы вызывают те же массивы
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
    this.positions = [];

    this.gamePlay.drawUi(themeLevels[0]);
    this.generatePositions(1, 2);
    this.gamePlay.redrawPositions(this.positions);
  }

  generatePositions(maxLevel, count) {
    const playerTeam = generateTeam(playerTypes, maxLevel, count);
    const enemyTeam = generateTeam(enemyTypes, maxLevel, count);

    const playerPositions = this.getRandomPositions(true, count);
    const enemyPositions = this.getRandomPositions(false, count);

    this.positions = [];
    playerTeam.characters.forEach((char, i) => {
      this.positions.push(new PositionedCharacter(char, playerPositions[i]));
    });
    enemyTeam.characters.forEach((char, i) => {
      this.positions.push(new PositionedCharacter(char, enemyPositions[i]));
    });
  }

  getRandomPositions(isPlayer, count) {
    const positions = [];
    const allowedColumns = isPlayer ? [0, 1] : [6, 7];
    const allCells = [];

    for (let row = 0; row < this.boardSize; row += 1) {
      for (const col of allowedColumns) {
        allCells.push(row * this.boardSize + col);
      }
    }

    const occupied = this.positions.map((p) => p.position);

    while (positions.length < count) {
      const idx = Math.floor(Math.random() * allCells.length);
      const cell = allCells[idx];
      if (!positions.includes(cell) && !occupied.includes(cell)) {
        positions.push(cell);
      }
    }

    return positions;
  }

  getPositionedCharAt(index) {
    return this.positions.find((p) => p.position === index) || null;
  }

  isPlayerChar(character) {
    return playerTypeNames.includes(character.type);
  }

  onCellClick(index) {
    if (this.gameState.isGameOver) return;
    if (!this.gameState.playerTurn) return;

    const posChar = this.getPositionedCharAt(index);

    // Если кликнули на персонажа игрока — выбираем его
    if (posChar && this.isPlayerChar(posChar.character)) {
      if (this.selectedCharIndex !== null) {
        this.gamePlay.deselectCell(this.selectedCharIndex);
      }
      this.selectedCharIndex = index;
      this.gamePlay.selectCell(index);
      this.gamePlay.setCursor(cursors.pointer);
      return;
    }

    // Если никто не выбран — нельзя совершать действия
    if (this.selectedCharIndex === null) {
      if (posChar) {
        GamePlay.showError('Это не ваш персонаж!');
      }
      return;
    }

    const selectedPosChar = this.getPositionedCharAt(this.selectedCharIndex);
    const { character } = selectedPosChar;

    // Проверяем перемещение
    const moveRange = calcMoveRange(this.selectedCharIndex, character.moveRange, this.boardSize);
    if (!posChar && moveRange.includes(index)) {
      this.gamePlay.deselectCell(this.selectedCharIndex);
      selectedPosChar.position = index;
      this.selectedCharIndex = null;
      this.gamePlay.redrawPositions(this.positions);
      this.gamePlay.setCursor(cursors.auto);
      this.switchTurn();
      return;
    }

    // Проверяем атаку
    const attackRange = calcAttackRange(this.selectedCharIndex, character.attackRange, this.boardSize);
    if (posChar && !this.isPlayerChar(posChar.character) && attackRange.includes(index)) {
      this.performAttack(selectedPosChar, posChar, index).then(() => {
        if (!this.gameState.isGameOver) {
          this.switchTurn();
        }
      });
      return;
    }

    GamePlay.showError('Недопустимое действие!');
  }

  async performAttack(attacker, target, targetIndex) {
    const damage = Math.max(
      attacker.character.attack - target.character.defence,
      attacker.character.attack * 0.1,
    );
    const roundedDamage = Math.round(damage);

    target.character.health -= roundedDamage;

    await this.gamePlay.showDamage(targetIndex, roundedDamage);

    if (target.character.health <= 0) {
      this.positions = this.positions.filter((p) => p !== target);
    }

    if (this.selectedCharIndex !== null) {
      this.gamePlay.deselectCell(this.selectedCharIndex);
    }
    this.selectedCharIndex = null;
    this.gamePlay.redrawPositions(this.positions);

    this.checkGameEnd();
  }

  switchTurn() {
    this.gameState.playerTurn = !this.gameState.playerTurn;

    if (!this.gameState.playerTurn) {
      this.computerTurn();
    }
  }

  computerTurn() {
    if (this.gameState.isGameOver) return;

    const enemies = this.positions.filter((p) => !this.isPlayerChar(p.character));
    const players = this.positions.filter((p) => this.isPlayerChar(p.character));

    if (enemies.length === 0 || players.length === 0) return;

    // Пытаемся атаковать
    for (const enemy of enemies) {
      const attackRange = calcAttackRange(enemy.position, enemy.character.attackRange, this.boardSize);
      const targetInRange = players.find((p) => attackRange.includes(p.position));
      if (targetInRange) {
        this.performAttack(enemy, targetInRange, targetInRange.position).then(() => {
          if (!this.gameState.isGameOver) {
            this.gameState.playerTurn = true;
          }
        });
        return;
      }
    }

    // Если атаковать некого — двигаемся к ближайшему игроку
    let bestMove = null;
    let bestDist = Infinity;

    for (const enemy of enemies) {
      const moveRange = calcMoveRange(enemy.position, enemy.character.moveRange, this.boardSize);
      const freeMoves = moveRange.filter((pos) => !this.getPositionedCharAt(pos));

      for (const move of freeMoves) {
        const moveRow = Math.floor(move / this.boardSize);
        const moveCol = move % this.boardSize;

        for (const player of players) {
          const pRow = Math.floor(player.position / this.boardSize);
          const pCol = player.position % this.boardSize;
          const dist = Math.abs(moveRow - pRow) + Math.abs(moveCol - pCol);

          if (dist < bestDist) {
            bestDist = dist;
            bestMove = { enemy, move };
          }
        }
      }
    }

    if (bestMove) {
      bestMove.enemy.position = bestMove.move;
      this.gamePlay.redrawPositions(this.positions);
    }

    this.gameState.playerTurn = true;
  }

  checkGameEnd() {
    const enemies = this.positions.filter((p) => !this.isPlayerChar(p.character));
    const players = this.positions.filter((p) => this.isPlayerChar(p.character));

    // Игрок проиграл
    if (players.length === 0) {
      this.gameState.isGameOver = true;
      this.gameState.maxScore = Math.max(this.gameState.maxScore, this.gameState.currentScore);
      GamePlay.showMessage('Вы проиграли! Game Over.');
      return;
    }

    // Противник уничтожен - следующий уровень
    if (enemies.length === 0) {
      this.gameState.currentScore += players.reduce((sum, p) => sum + p.character.health, 0);

      if (this.gameState.currentLevel >= 4) {
        this.gameState.isGameOver = true;
        this.gameState.maxScore = Math.max(this.gameState.maxScore, this.gameState.currentScore);
        GamePlay.showMessage(
          'Поздравляем! Вы прошли игру! Набрано очков: ' + this.gameState.currentScore,
        );
        return;
      }

      this.nextLevel();
    }
  }

  nextLevel() {
    this.gameState.currentLevel += 1;
    this.gameState.playerTurn = true;
    this.selectedCharIndex = null;

    // Повышаем уровень выживших
    const survivors = this.positions.filter((p) => this.isPlayerChar(p.character));
    survivors.forEach((p) => {
      p.character.levelUp();
    });

    // Рисуем новую тему (НЕ перерегистрируем слушатели — они уже в массивах GamePlay)
    const themeIndex = (this.gameState.currentLevel - 1) % themeLevels.length;
    this.gamePlay.drawUi(themeLevels[themeIndex]);

    // Генерируем новых противников
    const level = this.gameState.currentLevel;
    const count = level + 1;
    const enemyTeam = generateTeam(enemyTypes, level, count);
    const enemyPositions = [];
    const allowedColumns = [6, 7];

    const occupiedPositions = survivors.map((p) => p.position);

    while (enemyPositions.length < count) {
      const row = Math.floor(Math.random() * this.boardSize);
      const col = allowedColumns[Math.floor(Math.random() * allowedColumns.length)];
      const pos = row * this.boardSize + col;
      if (!enemyPositions.includes(pos) && !occupiedPositions.includes(pos)) {
        enemyPositions.push(pos);
      }
    }

    // Добавляем новых игроков до нужного количества
    const playerTeam = generateTeam(playerTypes, level, Math.max(0, count - survivors.length));
    const newPlayerPositions = [];
    const allowedPlayerColumns = [0, 1];
    const allOccupied = [...occupiedPositions, ...enemyPositions];

    while (newPlayerPositions.length < playerTeam.characters.length) {
      const row = Math.floor(Math.random() * this.boardSize);
      const col = allowedPlayerColumns[Math.floor(Math.random() * allowedPlayerColumns.length)];
      const pos = row * this.boardSize + col;
      if (!newPlayerPositions.includes(pos) && !allOccupied.includes(pos)) {
        newPlayerPositions.push(pos);
      }
    }

    this.positions = [...survivors];
    enemyTeam.characters.forEach((char, i) => {
      this.positions.push(new PositionedCharacter(char, enemyPositions[i]));
    });
    playerTeam.characters.forEach((char, i) => {
      this.positions.push(new PositionedCharacter(char, newPlayerPositions[i]));
    });

    this.gamePlay.redrawPositions(this.positions);
  }

  onCellEnter(index) {
    if (this.gameState.isGameOver) return;

    const posChar = this.getPositionedCharAt(index);

    // Показываем tooltip если есть персонаж
    if (posChar) {
      this.gamePlay.showCellTooltip(formatCharInfo(posChar.character), index);
    }

    if (this.selectedCharIndex === null) {
      if (posChar && this.isPlayerChar(posChar.character)) {
        this.gamePlay.setCursor(cursors.pointer);
      } else {
        this.gamePlay.setCursor(cursors.auto);
      }
      return;
    }

    const selectedPosChar = this.getPositionedCharAt(this.selectedCharIndex);
    if (!selectedPosChar) return;
    const { character } = selectedPosChar;

    // Свой персонаж — pointer
    if (posChar && this.isPlayerChar(posChar.character)) {
      this.gamePlay.setCursor(cursors.pointer);
      return;
    }

    // Допустимый ход — зелёная подсветка
    const moveRange = calcMoveRange(this.selectedCharIndex, character.moveRange, this.boardSize);
    if (!posChar && moveRange.includes(index)) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
      return;
    }

    // Допустимая атака — красная подсветка
    const attackRange = calcAttackRange(this.selectedCharIndex, character.attackRange, this.boardSize);
    if (posChar && !this.isPlayerChar(posChar.character) && attackRange.includes(index)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
      return;
    }

    // Недопустимое действие
    this.gamePlay.setCursor(cursors.notallowed);
  }

  onCellLeave(index) {
    if (this.gamePlay.cells && this.gamePlay.cells[index]) {
      this.gamePlay.hideCellTooltip(index);
      if (index !== this.selectedCharIndex) {
        this.gamePlay.deselectCell(index);
      }
    }
  }

  onNewGame() {
    const prevMaxScore = this.gameState.maxScore;
    this.startNewGame();
    this.gameState.maxScore = prevMaxScore;
  }

  onSaveGame() {
    const stateData = {
      currentLevel: this.gameState.currentLevel,
      playerTurn: this.gameState.playerTurn,
      maxScore: this.gameState.maxScore,
      currentScore: this.gameState.currentScore,
      isGameOver: this.gameState.isGameOver,
      positions: this.positions.map((p) => ({
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

  onLoadGame() {
    try {
      const loaded = this.stateService.load();
      if (!loaded) {
        GamePlay.showError('Нет сохранённой игры!');
        return;
      }

      this.gameState = GameState.from(loaded);

      const themeIndex = (this.gameState.currentLevel - 1) % themeLevels.length;
      this.gamePlay.drawUi(themeLevels[themeIndex]);

      this.positions = loaded.positions.map((p) => {
        const char = this.restoreCharacter(p.character);
        return new PositionedCharacter(char, p.position);
      });

      this.selectedCharIndex = null;
      this.gamePlay.redrawPositions(this.positions);
      GamePlay.showMessage('Игра загружена!');
    } catch (e) {
      GamePlay.showError('Не удалось загрузить игру!');
    }
  }

  restoreCharacter(data) {
    const classMap = {
      bowman: Bowman,
      swordsman: Swordsman,
      magician: Magician,
      vampire: Vampire,
      undead: Undead,
      daemon: Daemon,
    };

    const CharClass = classMap[data.type];
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
