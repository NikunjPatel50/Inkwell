function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getPromptOfDay(
  prompts: readonly string[],
  date: Date = new Date(),
): string {
  if (prompts.length === 0) {
    return "";
  }
  const index = getDayOfYear(date) % prompts.length;
  return prompts[index];
}
