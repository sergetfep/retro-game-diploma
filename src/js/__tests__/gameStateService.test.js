import GameStateService from '../GameStateService';

describe('GameStateService', () => {
  test('should load saved state successfully', () => {
    const savedState = {
      currentLevel: 2,
      playerTurn: true,
      positions: [],
      maxScore: 100,
    };

    const storage = {
      getItem: jest.fn().mockReturnValue(JSON.stringify(savedState)),
      setItem: jest.fn(),
    };

    const service = new GameStateService(storage);
    const loaded = service.load();

    expect(loaded).toEqual(savedState);
    expect(storage.getItem).toHaveBeenCalledWith('state');
  });

  test('should throw on invalid state', () => {
    const storage = {
      getItem: jest.fn().mockReturnValue('invalid json{{{'),
    };

    const service = new GameStateService(storage);

    expect(() => service.load()).toThrow('Invalid state');
  });

  test('should return null when no state saved', () => {
    const storage = {
      getItem: jest.fn().mockReturnValue(null),
    };

    const service = new GameStateService(storage);
    const loaded = service.load();

    expect(loaded).toBeNull();
  });

  test('should save state correctly', () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    const state = { currentLevel: 1, playerTurn: true };
    const service = new GameStateService(storage);
    service.save(state);

    expect(storage.setItem).toHaveBeenCalledWith('state', JSON.stringify(state));
  });
});
