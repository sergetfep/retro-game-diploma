import { calcAttackRange, calcMoveRange } from './utils';
import CombatManager from './CombatManager';

export default class AIController {
  constructor(gamePlay, positionManager, boardSize = 8) {
    this.gamePlay = gamePlay;
    this.positionManager = positionManager;
    this.boardSize = boardSize;
  }

  async takeTurn(gameState) {
    if (gameState.isGameOver) return;

    const enemies = this.positionManager.getEnemyChars();
    const players = this.positionManager.getPlayerChars();
    if (enemies.length === 0 || players.length === 0) return;

    const attackResult = await this.tryAttack(enemies, players);
    if (!attackResult) {
      this.tryMove(enemies, players);
    }

    gameState.playerTurn = true;
  }

  async tryAttack(enemies, players) {
    for (const enemy of enemies) {
      const attackRange = calcAttackRange(
        enemy.position, enemy.character.attackRange, this.boardSize,
      );
      const target = players.find((p) => attackRange.includes(p.position));
      if (target) {
        await CombatManager.performAttack(
          this.gamePlay, this.positionManager, enemy, target,
        );
        return true;
      }
    }
    return false;
  }

  tryMove(enemies, players) {
    let bestMove = null;
    let bestDist = Infinity;

    for (const enemy of enemies) {
      const moveRange = calcMoveRange(
        enemy.position, enemy.character.moveRange, this.boardSize,
      );
      const freeMoves = moveRange.filter(
        (pos) => !this.positionManager.getPositionedCharAt(pos),
      );

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
      this.gamePlay.redrawPositions(this.positionManager.positions);
    }
  }
}
