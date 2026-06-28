export type DiffSegment = {
  type: "equal" | "changed";
  text: string;
};

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/^[^\w']+|[^\w']+$/g, "");
}

function tokenizeWords(text: string): string[] {
  return text.match(/\S+/g) ?? [];
}

function buildLcsTable(a: string[], b: string[]): number[][] {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/** Mark each rewrite word index as changed when it is not part of the LCS with the original. */
function markChangedRewriteWords(original: string, rewritten: string): boolean[] {
  const originalWords = tokenizeWords(original).map(normalizeWord);
  const rewriteWords = tokenizeWords(rewritten).map(normalizeWord);
  const dp = buildLcsTable(originalWords, rewriteWords);
  const changed = Array<boolean>(rewriteWords.length).fill(false);

  let i = originalWords.length;
  let j = rewriteWords.length;

  while (i > 0 && j > 0) {
    if (originalWords[i - 1] === rewriteWords[j - 1]) {
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      changed[j - 1] = true;
      j--;
    }
  }

  while (j > 0) {
    changed[j - 1] = true;
    j--;
  }

  return changed;
}

function appendSegment(segments: DiffSegment[], type: DiffSegment["type"], text: string) {
  if (!text) return;
  const last = segments[segments.length - 1];
  if (last && last.type === type) {
    last.text += text;
  } else {
    segments.push({ type, text });
  }
}

/** Word-level diff of rewritten text against the original for tracked-changes rendering. */
export function wordDiff(original: string, rewritten: string): DiffSegment[] {
  if (!rewritten) return [];

  const changedFlags = markChangedRewriteWords(original, rewritten);
  const parts = rewritten.match(/\S+|\s+/g) ?? [];
  const segments: DiffSegment[] = [];
  let wordIndex = 0;

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      appendSegment(segments, "equal", part);
      continue;
    }

    appendSegment(segments, changedFlags[wordIndex] ? "changed" : "equal", part);
    wordIndex++;
  }

  return segments;
}
