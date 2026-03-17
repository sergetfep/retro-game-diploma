import { calcTileType } from '../utils';

describe('calcTileType', () => {
  test('should return top-left for index 0', () => {
    expect(calcTileType(0, 8)).toBe('top-left');
  });

  test('should return top-right for index 7 on 8x8', () => {
    expect(calcTileType(7, 8)).toBe('top-right');
  });

  test('should return top for index 1 on 8x8', () => {
    expect(calcTileType(1, 8)).toBe('top');
  });

  test('should return top for index 4 on 8x8', () => {
    expect(calcTileType(4, 8)).toBe('top');
  });

  test('should return bottom-left for index 56 on 8x8', () => {
    expect(calcTileType(56, 8)).toBe('bottom-left');
  });

  test('should return bottom-right for index 63 on 8x8', () => {
    expect(calcTileType(63, 8)).toBe('bottom-right');
  });

  test('should return bottom for index 60 on 8x8', () => {
    expect(calcTileType(60, 8)).toBe('bottom');
  });

  test('should return left for index 8 on 8x8', () => {
    expect(calcTileType(8, 8)).toBe('left');
  });

  test('should return right for index 15 on 8x8', () => {
    expect(calcTileType(15, 8)).toBe('right');
  });

  test('should return center for index 9 on 8x8', () => {
    expect(calcTileType(9, 8)).toBe('center');
  });

  test('should return center for index 27 on 8x8', () => {
    expect(calcTileType(27, 8)).toBe('center');
  });

  // Тесты для другого размера поля
  test('should return top-left for index 0 on 4x4', () => {
    expect(calcTileType(0, 4)).toBe('top-left');
  });

  test('should return bottom-right for index 15 on 4x4', () => {
    expect(calcTileType(15, 4)).toBe('bottom-right');
  });

  test('should return left for index 4 on 4x4', () => {
    expect(calcTileType(4, 4)).toBe('left');
  });
});
