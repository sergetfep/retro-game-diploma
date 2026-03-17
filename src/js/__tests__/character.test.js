import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';

describe('Character', () => {
  test('should throw error when creating Character directly', () => {
    expect(() => new Character(1)).toThrow('Cannot create instance of Character directly');
  });

  test('should not throw when creating subclass', () => {
    expect(() => new Bowman(1)).not.toThrow();
    expect(() => new Swordsman(1)).not.toThrow();
    expect(() => new Magician(1)).not.toThrow();
    expect(() => new Vampire(1)).not.toThrow();
    expect(() => new Undead(1)).not.toThrow();
    expect(() => new Daemon(1)).not.toThrow();
  });
});

describe('Character classes level 1 stats', () => {
  test('Bowman level 1', () => {
    const b = new Bowman(1);
    expect(b.attack).toBe(25);
    expect(b.defence).toBe(25);
    expect(b.type).toBe('bowman');
    expect(b.level).toBe(1);
    expect(b.health).toBe(50);
  });

  test('Swordsman level 1', () => {
    const s = new Swordsman(1);
    expect(s.attack).toBe(40);
    expect(s.defence).toBe(10);
    expect(s.type).toBe('swordsman');
    expect(s.level).toBe(1);
  });

  test('Magician level 1', () => {
    const m = new Magician(1);
    expect(m.attack).toBe(10);
    expect(m.defence).toBe(40);
    expect(m.type).toBe('magician');
    expect(m.level).toBe(1);
  });

  test('Vampire level 1', () => {
    const v = new Vampire(1);
    expect(v.attack).toBe(25);
    expect(v.defence).toBe(25);
    expect(v.type).toBe('vampire');
    expect(v.level).toBe(1);
  });

  test('Undead level 1', () => {
    const u = new Undead(1);
    expect(u.attack).toBe(40);
    expect(u.defence).toBe(10);
    expect(u.type).toBe('undead');
    expect(u.level).toBe(1);
  });

  test('Daemon level 1', () => {
    const d = new Daemon(1);
    expect(d.attack).toBe(10);
    expect(d.defence).toBe(10);
    expect(d.type).toBe('daemon');
    expect(d.level).toBe(1);
  });
});

describe('Character level up', () => {
  test('Swordsman level 3 should have increased stats', () => {
    const s = new Swordsman(3);
    expect(s.level).toBe(3);
    expect(s.attack).toBeGreaterThan(40);
    expect(s.defence).toBeGreaterThan(10);
  });
});
