import type { WordDetail, WordSense } from "../types";

export function formatSyllables(word: string): string {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return word;

  if (normalized.length <= 4) {
    return normalized;
  }

  const vowelClusters = normalized.match(/[aeiouy]+/gi);
  if (!vowelClusters || vowelClusters.length <= 1) {
    const mid = Math.ceil(normalized.length / 2);
    return `${normalized.slice(0, mid)}·${normalized.slice(mid)}`;
  }

  let syllableCount = 0;
  let splitIndex = -1;
  for (let index = 0; index < normalized.length; index += 1) {
    if (/[aeiouy]/i.test(normalized[index] ?? "")) {
      syllableCount += 1;
      if (syllableCount === Math.ceil(vowelClusters.length / 2)) {
        splitIndex = index + 1;
        break;
      }
    }
  }

  if (splitIndex <= 0 || splitIndex >= normalized.length) {
    const mid = Math.ceil(normalized.length / 2);
    return `${normalized.slice(0, mid)}·${normalized.slice(mid)}`;
  }

  return `${normalized.slice(0, splitIndex)}·${normalized.slice(splitIndex)}`;
}

export function getDisplaySenses(detail: WordDetail): WordSense[] {
  if (detail.senses?.length) {
    return detail.senses;
  }

  return [
    {
      number: 1,
      definition: detail.level1.definition,
      examples: detail.level1.examples,
    },
  ];
}

export function formatSenseLabel(sense: WordSense): string {
  return sense.subLabel ? `${sense.number}${sense.subLabel}` : String(sense.number);
}
