import { describe, expect, it } from "vitest";

import { computeGridLayout } from "./gridLayout";

const GAP = 8;

describe("computeGridLayout", () => {
  it("gives one participant the largest 16:9 tile that fits", () => {
    const layout = computeGridLayout(1, 1600, 900, GAP);
    expect(layout).toEqual({ columns: 1, tileWidth: 1600, tileHeight: 900 });
  });

  it("puts two participants side by side on a wide screen", () => {
    expect(computeGridLayout(2, 1600, 900, GAP).columns).toBe(2);
  });

  it("stacks two participants on a tall phone screen", () => {
    expect(computeGridLayout(2, 390, 700, GAP).columns).toBe(1);
  });

  it("uses a 2x2 grid for four and 3x3 for nine on a wide screen", () => {
    expect(computeGridLayout(4, 1600, 900, GAP).columns).toBe(2);
    expect(computeGridLayout(9, 1600, 900, GAP).columns).toBe(3);
  });

  it("never lets the tiles overflow the available space", () => {
    for (let count = 1; count <= 12; count += 1) {
      const { columns, tileWidth, tileHeight } = computeGridLayout(count, 1280, 720, GAP);
      const rows = Math.ceil(count / columns);
      expect(columns * tileWidth + (columns - 1) * GAP).toBeLessThanOrEqual(1280);
      expect(rows * tileHeight + (rows - 1) * GAP).toBeLessThanOrEqual(720);
    }
  });

  it("returns empty tiles before the container has been measured", () => {
    expect(computeGridLayout(3, 0, 0, GAP).tileWidth).toBe(0);
  });
});
