/** Helpers for showing a person when they have no picture. */

const AVATAR_COLORS = [
  "#0b5cff",
  "#7b3ff2",
  "#d6336c",
  "#e8590c",
  "#0c8599",
  "#2f9e44",
  "#5f3dc4",
  "#c2255c",
];

/** "Alex Morgan" -> "AM", "priya" -> "P" */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Pick a colour from the name, so the same person always gets the same one. */
export function avatarColor(name: string): string {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) % 997;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
