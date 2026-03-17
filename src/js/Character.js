/**
 * Базовый класс, от которого наследуются классы персонажей
 */
export default class Character {
  constructor(level, type = 'generic') {
    if (new.target === Character) {
      throw new Error('Cannot create instance of Character directly, use subclasses');
    }

    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
  }

  levelUp() {
    if (this.health <= 0) {
      throw new Error('Cannot level up dead character');
    }
    this.level += 1;
    this.attack = Math.max(this.attack, Math.round(this.attack * (80 + this.health) / 100));
    this.defence = Math.max(this.defence, Math.round(this.defence * (80 + this.health) / 100));
    this.health = Math.min(100, this.level + 80);
  }
}
