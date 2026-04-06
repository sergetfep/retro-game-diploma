export default class CombatManager {
  static calcDamage(attacker, target) {
    return Math.round(
      Math.max(attacker.attack - target.defence, attacker.attack * 0.1),
    );
  }

  static async performAttack(gamePlay, positionManager, attacker, target) {
    const damage = CombatManager.calcDamage(attacker.character, target.character);
    target.character.health -= damage;

    await gamePlay.showDamage(target.position, damage);

    if (target.character.health <= 0) {
      positionManager.removeCharAt(target);
    }

    gamePlay.redrawPositions(positionManager.positions);
  }
}
