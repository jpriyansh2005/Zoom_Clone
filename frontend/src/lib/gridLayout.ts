export type GridLayout = {
  columns: number;
  tileWidth: number;
  tileHeight: number;
};

const ASPECT_RATIO = 16 / 9;

/**
 * Work out the gallery layout: how many columns give the largest 16:9 tiles
 * that still fit `count` tiles inside a `width` x `height` area.
 *
 * It tries every column count and keeps the one with the widest tiles. For
 * each, a tile can be no wider than its column and no taller than its row.
 */
export function computeGridLayout(
  count: number,
  width: number,
  height: number,
  gap: number,
): GridLayout {
  let best: GridLayout = { columns: 1, tileWidth: 0, tileHeight: 0 };
  if (count <= 0 || width <= 0 || height <= 0) return best;

  for (let columns = 1; columns <= count; columns += 1) {
    const rows = Math.ceil(count / columns);
    const widthLimit = (width - gap * (columns - 1)) / columns;
    const heightLimit = (height - gap * (rows - 1)) / rows;
    const tileWidth = Math.floor(Math.min(widthLimit, heightLimit * ASPECT_RATIO));
    if (tileWidth > best.tileWidth) {
      best = { columns, tileWidth, tileHeight: Math.floor(tileWidth / ASPECT_RATIO) };
    }
  }
  return best;
}
