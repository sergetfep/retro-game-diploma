export default class Team {
  constructor(characters = []) {
    this.characters = characters;
  }

  [Symbol.iterator]() {
    return this.characters[Symbol.iterator]();
  }
}
