import Team from './Team';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const TypeClass = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const level = Math.floor(Math.random() * maxLevel) + 1;
    yield new TypeClass(level);
  }
}

/**
 * Формирует команду на основе characterGenerator
 */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const gen = characterGenerator(allowedTypes, maxLevel);
  const characters = [];
  for (let i = 0; i < characterCount; i += 1) {
    characters.push(gen.next().value);
  }
  return new Team(characters);
}
