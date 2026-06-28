import type { WritingError } from "../types";

export type TextSegment =
  | { kind: "plain"; text: string }
  | { kind: "error"; text: string; errorIndex: number };

interface MatchCandidate {
  start: number;
  end: number;
  errorIndex: number;
}

/** Locate a verbatim slice in the original text, preserving original casing. */
function findVerbatim(haystack: string, needle: string): { start: number; text: string } | null {
  if (!needle.trim()) return null;

  const idx = haystack.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return null;

  return {
    start: idx,
    text: haystack.slice(idx, idx + needle.length),
  };
}

/** Pull a quoted phrase from an issue label when the model wraps the substring. */
function extractQuotedPhrase(issue: string): string | null {
  const match = issue.match(/["“]([^"”]+)["”]|['']([^'']+)['']/);
  if (!match) return null;
  const phrase = (match[1] ?? match[2] ?? "").trim();
  return phrase.length >= 2 ? phrase : null;
}

/** Derive a searchable phrase from the issue field, trying several fallbacks. */
function resolvePhrase(issue: string, originalText: string): string | null {
  const quoted = extractQuotedPhrase(issue);
  if (quoted) {
    const found = findVerbatim(originalText, quoted);
    if (found) return found.text;
  }

  const verbatim = findVerbatim(originalText, issue);
  if (verbatim) return verbatim.text;

  const afterColon = issue.split(":").slice(1).join(":").trim();
  if (afterColon) {
    const found = findVerbatim(originalText, afterColon);
    if (found) return found.text;
  }

  const words = issue.match(/\b[\w']{4,}\b/g);
  if (words) {
    for (let len = Math.min(words.length, 6); len >= 1; len--) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(" ");
        const found = findVerbatim(originalText, phrase);
        if (found) return found.text;
      }
    }
  }

  return null;
}

function collectMatches(originalText: string, errors: WritingError[]): MatchCandidate[] {
  const matches: MatchCandidate[] = [];
  const usedRanges: Array<{ start: number; end: number }> = [];

  errors.forEach((error, errorIndex) => {
    const phrase = resolvePhrase(error.issue, originalText);
    if (!phrase) return;

    const found = findVerbatim(originalText, phrase);
    if (!found) return;

    const start = found.start;
    const end = start + found.text.length;
    const overlaps = usedRanges.some(
      (range) => start < range.end && end > range.start,
    );
    if (overlaps) return;

    usedRanges.push({ start, end });
    matches.push({ start, end, errorIndex });
  });

  return matches.sort((a, b) => a.start - b.start);
}

/** Split original text into plain and error segments for inline highlighting. */
export function highlightErrors(originalText: string, errors: WritingError[]): TextSegment[] {
  if (!originalText || errors.length === 0) {
    return [{ kind: "plain", text: originalText }];
  }

  const matches = collectMatches(originalText, errors);
  if (matches.length === 0) {
    return [{ kind: "plain", text: originalText }];
  }

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      segments.push({ kind: "plain", text: originalText.slice(cursor, match.start) });
    }

    segments.push({
      kind: "error",
      text: originalText.slice(match.start, match.end),
      errorIndex: match.errorIndex,
    });
    cursor = match.end;
  }

  if (cursor < originalText.length) {
    segments.push({ kind: "plain", text: originalText.slice(cursor) });
  }

  return segments;
}
