import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';

const playerTypeNames = ['bowman', 'swordsman', 'magician'];

export default class PositionManager {
  constructor(boardSize = 8) {
    this.boardSize = boardSize;
    this.positions = [];
  }

  isPlayerChar(character) {
    return playerTypeNames.includes(character.type);
  }

  getPositionedCharAt(index) {
    return this.positions.find((p) => p.position === index) || null;
  }

  getPlayerChars() {
    return this.positions.filter((p) => this.isPlayerChar(p.character));
  }

  getEnemyChars() {
    return this.positions.filter((p) => !this.isPlayerChar(p.character));
  }

  generatePositions(playerTypes, enemyTypes, maxLevel, count) {
    const playerTeam = generateTeam(playerTypes, maxLevel, count);
    const enemyTeam = generateTeam(enemyTypes, maxLevel, count);

    this.positions = [];

    const playerPositions = this.getRandomPositions([0, 1], count);
    const enemyPositions = this.getRandomPositions([6, 7], count, playerPositions);

    playerTeam.characters.forEach((char, i) => {
      this.positions.push(new PositionedCharacter(char, playerPositions[i]));
    });
    enemyTeam.characters.forEach((char, i) => {
      this.positions.push(new PositionedCharacter(char, enemyPositions[i]));
    });
  }

  getRandomPositions(allowedColumns, count, alreadyOccupied = []) {
    const allCells = [];
    for (let row = 0; row < this.boardSize; row += 1) {
      for (const col of allowedColumns) {
        allCells.push(row * this.boardSize + col);
      }
    }

    const occupied = [
      ...this.positions.map((p) => p.position),
      ...alreadyOccupied,
    ];
    const result = [];

    while (result.length < count) {
      const idx = Math.floor(Math.random() * allCells.length);
      const cell = allCells[idx];
      if (!result.includes(cell) && !occupied.includes(cell)) {
        result.push(cell);
      }
    }
    return result;
  }

  removeCharAt(posChar) {
    this.positions = this.positions.filter((p) => p !== posChar);
  }

  addChars(team, positions) {
    team.characters.forEach((char, i) => {
      this.positions.push(new PositionedCharacter(char, positions[i]));
    });
  }
}
