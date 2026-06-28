export const EDITOR_PLACEHOLDERS = [
  "The city felt different after the rain.",
  "I've been meaning to tell you something.",
  "Most people get this wrong on the first try.",
  "She left the letter on the kitchen table.",
  "It wasn't the answer I expected, but it made sense.",
  "We should have left an hour ago.",
] as const;

export function pickRandomPlaceholder(): string {
  const index = Math.floor(Math.random() * EDITOR_PLACEHOLDERS.length);
  return EDITOR_PLACEHOLDERS[index];
}
