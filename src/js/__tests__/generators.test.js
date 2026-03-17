import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';

const playerTypes = [Bowman, Swordsman, Magician];

describe('characterGenerator', () => {
  test('should generate characters infinitely', () => {
    const gen = characterGenerator(playerTypes, 2);
    for (let i = 0; i < 100; i += 1) {
      const result = gen.next();
      expect(result.done).toBe(false);
      expect(result.value).toBeDefined();
      expect(['bowman', 'swordsman', 'magician']).toContain(result.value.type);
    }
  });

  test('should respect maxLevel', () => {
    const gen = characterGenerator(playerTypes, 3);
    for (let i = 0; i < 50; i += 1) {
      const char = gen.next().value;
      expect(char.level).toBeGreaterThanOrEqual(1);
      expect(char.level).toBeLessThanOrEqual(3);
    }
  });

  test('should only generate from allowedTypes', () => {
    const gen = characterGenerator([Bowman], 1);
    for (let i = 0; i < 20; i += 1) {
      const char = gen.next().value;
      expect(char.type).toBe('bowman');
    }
  });
});

describe('generateTeam', () => {
  test('should generate correct number of characters', () => {
    const team = generateTeam(playerTypes, 3, 4);
    expect(team.characters.length).toBe(4);
  });

  test('should respect maxLevel range', () => {
    const team = generateTeam(playerTypes, 2, 10);
    for (const char of team.characters) {
      expect(char.level).toBeGreaterThanOrEqual(1);
      expect(char.level).toBeLessThanOrEqual(2);
    }
  });

  test('should generate characters of allowed types', () => {
    const team = generateTeam(playerTypes, 1, 5);
    for (const char of team.characters) {
      expect(['bowman', 'swordsman', 'magician']).toContain(char.type);
    }
  });
});
