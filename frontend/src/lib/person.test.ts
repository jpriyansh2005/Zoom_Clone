import { describe, expect, it } from "vitest";

import { avatarColor, initials } from "./person";

describe("initials", () => {
  it.each([
    ["Alex Morgan", "AM"],
    ["priya", "P"],
    ["  Mary Jane   Watson ", "MW"],
    ["", "?"],
  ])("turns %j into %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe("avatarColor", () => {
  it("always gives the same person the same colour", () => {
    expect(avatarColor("Alex Morgan")).toBe(avatarColor("Alex Morgan"));
  });

  it("returns a hex colour", () => {
    expect(avatarColor("Priya Sharma")).toMatch(/^#[0-9a-f]{6}$/);
  });
});
