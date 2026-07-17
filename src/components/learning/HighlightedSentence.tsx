"use client";

import type { GrammarExample } from "../../constants/grammarTopics";
import styles from "./HighlightedSentence.module.css";

interface HighlightedSentenceProps {
  example: GrammarExample;
}

interface Segment {
  text: string;
  highlight?: GrammarExample["highlights"][0];
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findHighlightMatch(
  sentence: string,
  text: string,
  fromIndex: number,
): { index: number; matched: string } | null {
  const pattern = new RegExp(escapeRegex(text), "gi");
  pattern.lastIndex = fromIndex;
  const match = pattern.exec(sentence);
  if (!match || match.index < fromIndex) return null;
  return { index: match.index, matched: match[0] };
}

export function buildHighlightedSegments(
  sentence: string,
  highlights: GrammarExample["highlights"],
): Segment[] {
  const sorted = [...highlights].sort(
    (a, b) =>
      (findHighlightMatch(sentence, a.text, 0)?.index ?? Number.MAX_SAFE_INTEGER) -
      (findHighlightMatch(sentence, b.text, 0)?.index ?? Number.MAX_SAFE_INTEGER),
  );

  const segments: Segment[] = [];
  let cursor = 0;

  for (const highlight of sorted) {
    const match = findHighlightMatch(sentence, highlight.text, cursor);
    if (!match) continue;

    if (match.index > cursor) {
      segments.push({ text: sentence.slice(cursor, match.index) });
    }

    segments.push({ text: match.matched, highlight });
    cursor = match.index + match.matched.length;
  }

  if (cursor < sentence.length) {
    segments.push({ text: sentence.slice(cursor) });
  }

  return segments.length ? segments : [{ text: sentence }];
}

export function exampleHasRenderableHighlights(example: GrammarExample): boolean {
  return buildHighlightedSegments(example.sentence, example.highlights).some(
    (segment) => segment.highlight,
  );
}

export function HighlightedSentence({ example }: HighlightedSentenceProps) {
  const segments = buildHighlightedSegments(example.sentence, example.highlights);
  const annotations = segments
    .filter((segment): segment is Segment & { highlight: NonNullable<Segment["highlight"]> } =>
      Boolean(segment.highlight),
    )
    .map((segment) => segment.highlight.tooltip)
    .filter((tooltip, index, list) => list.indexOf(tooltip) === index);

  return (
    <figure className={styles.card}>
      <blockquote className={styles.sentence}>
        {segments.map((segment, index) =>
          segment.highlight ? (
            <mark key={index} className={styles.mark}>
              {segment.text}
            </mark>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </blockquote>
      {annotations.length > 0 && (
        <figcaption className={styles.annotation}>
          <span className={styles.annotationLabel}>Why it matters</span>
          {annotations.map((note) => (
            <p key={note} className={styles.annotationText}>
              {note}
            </p>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
