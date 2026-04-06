import cursors from './cursors';
import { formatCharInfo, calcMoveRange, calcAttackRange } from './utils';

export default class CellHoverHandler {
  constructor(gamePlay, positionManager, boardSize = 8) {
    this.gamePlay = gamePlay;
    this.positionManager = positionManager;
    this.boardSize = boardSize;
  }

  onEnter(index, selectedCharIndex) {
    const posChar = this.positionManager.getPositionedCharAt(index);
    if (posChar) {
      this.gamePlay.showCellTooltip(formatCharInfo(posChar.character), index);
    }
    this.updateCursorAndHighlight(index, posChar, selectedCharIndex);
  }

  onLeave(index, selectedCharIndex) {
    if (this.gamePlay.cells && this.gamePlay.cells[index]) {
      this.gamePlay.hideCellTooltip(index);
      if (index !== selectedCharIndex) {
        this.gamePlay.deselectCell(index);
      }
    }
  }

  updateCursorAndHighlight(index, posChar, selectedCharIndex) {
    if (selectedCharIndex === null) {
      this.gamePlay.setCursor(
        posChar && this.positionManager.isPlayerChar(posChar.character)
          ? cursors.pointer : cursors.auto,
      );
      return;
    }

    if (posChar && this.positionManager.isPlayerChar(posChar.character)) {
      this.gamePlay.setCursor(cursors.pointer);
      return;
    }

    const { character } = this.positionManager.getPositionedCharAt(selectedCharIndex);
    const moveRange = calcMoveRange(selectedCharIndex, character.moveRange, this.boardSize);
    const attackRange = calcAttackRange(selectedCharIndex, character.attackRange, this.boardSize);

    if (!posChar && moveRange.includes(index)) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    } else if (posChar && !this.positionManager.isPlayerChar(posChar.character)
      && attackRange.includes(index)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
    }
  }
}
