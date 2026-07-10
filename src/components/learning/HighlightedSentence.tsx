"use client";

import { useState } from "react";
import type { GrammarExample } from "../../constants/grammarTopics";
import styles from "./HighlightedSentence.module.css";

interface HighlightedSentenceProps {
  example: GrammarExample;
}

function buildSegments(sentence: string, highlights: GrammarExample["highlights"]) {
  const sorted = [...highlights].sort((a, b) => sentence.indexOf(a.text) - sentence.indexOf(b.text));
  const segments: Array<{ text: string; highlight?: (typeof highlights)[0] }> = [];
  let cursor = 0;

  for (const hl of sorted) {
    const idx = sentence.indexOf(hl.text, cursor);
    if (idx === -1) continue;
    if (idx > cursor) {
      segments.push({ text: sentence.slice(cursor, idx) });
    }
    segments.push({ text: hl.text, highlight: hl });
    cursor = idx + hl.text.length;
  }

  if (cursor < sentence.length) {
    segments.push({ text: sentence.slice(cursor) });
  }

  return segments.length ? segments : [{ text: sentence }];
}

export function HighlightedSentence({ example }: HighlightedSentenceProps) {
  const segments = buildSegments(example.sentence, example.highlights);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <p className={styles.sentence}>
      {segments.map((seg, i) => {
        if (!seg.highlight) {
          return <span key={i}>{seg.text}</span>;
        }

        const id = `${seg.text}-${i}`;
        const isOpen = activeTooltip === id;

        return (
          <span key={i} className={styles.highlightWrap}>
            <button
              type="button"
              className={styles.highlight}
              onMouseEnter={() => setActiveTooltip(id)}
              onMouseLeave={() => setActiveTooltip(null)}
              onFocus={() => setActiveTooltip(id)}
              onBlur={() => setActiveTooltip(null)}
              aria-describedby={isOpen ? `tip-${id}` : undefined}
            >
              {seg.text}
            </button>
            {isOpen && (
              <span id={`tip-${id}`} role="tooltip" className={styles.tooltip}>
                {seg.highlight.tooltip}
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}
