export function calcTileType(index, boardSize) {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  const lastRow = boardSize - 1;
  const lastCol = boardSize - 1;

  if (row === 0 && col === 0) return 'top-left';
  if (row === 0 && col === lastCol) return 'top-right';
  if (row === 0) return 'top';
  if (row === lastRow && col === 0) return 'bottom-left';
  if (row === lastRow && col === lastCol) return 'bottom-right';
  if (row === lastRow) return 'bottom';
  if (col === 0) return 'left';
  if (col === lastCol) return 'right';
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }
  if (health < 50) {
    return 'normal';
  }
  return 'high';
}

/**
 * Форматирует информацию о персонаже для tooltip
 */
export function formatCharInfo(character) {
  return `\u{1F396}${character.level} \u{2694}${character.attack} \u{1F6E1}${character.defence} \u{2764}${character.health}`;
}

/**
 * Вычисляет допустимые позиции для перемещения
 */
export function calcMoveRange(position, range, boardSize) {
  const positions = [];
  const row = Math.floor(position / boardSize);
  const col = position % boardSize;

  for (let i = 1; i <= range; i += 1) {
    // вверх
    if (row - i >= 0) positions.push((row - i) * boardSize + col);
    // вниз
    if (row + i < boardSize) positions.push((row + i) * boardSize + col);
    // влево
    if (col - i >= 0) positions.push(row * boardSize + (col - i));
    // вправо
    if (col + i < boardSize) positions.push(row * boardSize + (col + i));
    // диагональ вверх-влево
    if (row - i >= 0 && col - i >= 0) positions.push((row - i) * boardSize + (col - i));
    // диагональ вверх-вправо
    if (row - i >= 0 && col + i < boardSize) positions.push((row - i) * boardSize + (col + i));
    // диагональ вниз-влево
    if (row + i < boardSize && col - i >= 0) positions.push((row + i) * boardSize + (col - i));
    // диагональ вниз-вправо
    if (row + i < boardSize && col + i < boardSize) positions.push((row + i) * boardSize + (col + i));
  }

  return positions;
}

/**
 * Вычисляет допустимые позиции для атаки
 */
export function calcAttackRange(position, range, boardSize) {
  const positions = [];
  const row = Math.floor(position / boardSize);
  const col = position % boardSize;

  for (let dr = -range; dr <= range; dr += 1) {
    for (let dc = -range; dc <= range; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
        positions.push(newRow * boardSize + newCol);
      }
    }
  }

  return positions;
}
