import { formatCharInfo } from '../utils';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';

describe('formatCharInfo', () => {
  test('should format Bowman level 1 info correctly', () => {
    const b = new Bowman(1);
    const info = formatCharInfo(b);
    expect(info).toBe('\u{1F396}1 \u{2694}25 \u{1F6E1}25 \u{2764}50');
  });

  test('should format Swordsman level 1 info correctly', () => {
    const s = new Swordsman(1);
    const info = formatCharInfo(s);
    expect(info).toBe('\u{1F396}1 \u{2694}40 \u{1F6E1}10 \u{2764}50');
  });

  test('should contain all required emoji and values', () => {
    const b = new Bowman(1);
    const info = formatCharInfo(b);
    expect(info).toContain('🎖');
    expect(info).toContain('⚔');
    expect(info).toContain('🛡');
    expect(info).toContain('❤');
  });
});
