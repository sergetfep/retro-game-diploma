import { calcMoveRange, calcAttackRange } from '../utils';

describe('calcMoveRange', () => {
  const boardSize = 8;

  test('Swordsman/Undead move range 4 from center', () => {
    const range = calcMoveRange(27, 4, boardSize);
    // Вверх: 19, 11, 3 (до границы), но 27-8=19, 19-8=11, 11-8=3
    expect(range).toContain(19);
    expect(range).toContain(11);
    expect(range).toContain(3);
    // Вниз: 35, 43, 51, 59
    expect(range).toContain(35);
    expect(range).toContain(43);
    expect(range).toContain(51);
    expect(range).toContain(59);
    // Не должен содержать саму позицию
    expect(range).not.toContain(27);
  });

  test('Bowman/Vampire move range 2', () => {
    const range = calcMoveRange(27, 2, boardSize);
    expect(range).toContain(19); // up 1
    expect(range).toContain(11); // up 2
    expect(range).toContain(35); // down 1
    expect(range).toContain(43); // down 2
    expect(range).toContain(26); // left 1
    expect(range).toContain(25); // left 2
    expect(range).not.toContain(24); // left 3 - out of range
  });

  test('Magician/Daemon move range 1', () => {
    const range = calcMoveRange(27, 1, boardSize);
    expect(range).toContain(19); // up
    expect(range).toContain(35); // down
    expect(range).toContain(26); // left
    expect(range).toContain(28); // right
    expect(range).toContain(18); // diag up-left
    expect(range).toContain(20); // diag up-right
    expect(range).toContain(34); // diag down-left
    expect(range).toContain(36); // diag down-right
    expect(range).toHaveLength(8);
  });

  test('corner position should not go out of bounds', () => {
    const range = calcMoveRange(0, 4, boardSize);
    range.forEach((pos) => {
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThan(boardSize * boardSize);
    });
  });
});

describe('calcAttackRange', () => {
  const boardSize = 8;

  test('Swordsman attack range 1', () => {
    const range = calcAttackRange(27, 1, boardSize);
    expect(range).toContain(18);
    expect(range).toContain(19);
    expect(range).toContain(20);
    expect(range).toContain(26);
    expect(range).toContain(28);
    expect(range).toContain(34);
    expect(range).toContain(35);
    expect(range).toContain(36);
    expect(range).toHaveLength(8);
    expect(range).not.toContain(27);
  });

  test('Bowman attack range 2', () => {
    const range = calcAttackRange(27, 2, boardSize);
    // Включает все клетки в радиусе 2
    expect(range).toContain(18);
    expect(range).toContain(19);
    expect(range).toContain(20);
    expect(range).toContain(11); // 2 строки вверх, та же колонка
    expect(range.length).toBeGreaterThan(8);
  });

  test('corner position should not go out of bounds', () => {
    const range = calcAttackRange(0, 4, boardSize);
    range.forEach((pos) => {
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThan(boardSize * boardSize);
    });
    expect(range).not.toContain(0);
  });
});
