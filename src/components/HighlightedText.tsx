import { useMemo } from "react";
import type { WritingError } from "../types";
import { highlightErrors } from "../lib/highlightErrors";
import styles from "./HighlightedText.module.css";

interface HighlightedTextProps {
  text: string;
  errors: WritingError[];
  activeErrorIndex: number | null;
  onErrorFocus: (errorIndex: number) => void;
  onErrorBlur: () => void;
}

export function HighlightedText({
  text,
  errors,
  activeErrorIndex,
  onErrorFocus,
  onErrorBlur,
}: HighlightedTextProps) {
  const segments = useMemo(() => highlightErrors(text, errors), [text, errors]);

  return (
    <div className={styles.highlightedText} aria-label="Analysed text with issues marked">
      {segments.map((segment, index) => {
        if (segment.kind === "plain") {
          return <span key={`plain-${index}`}>{segment.text}</span>;
        }

        const isActive = activeErrorIndex === segment.errorIndex;

        return (
          <mark
            key={`error-${segment.errorIndex}-${index}`}
            className={`${styles.errorMark} ${isActive ? styles.errorMarkActive : ""}`}
            data-error-index={segment.errorIndex}
            onMouseEnter={() => onErrorFocus(segment.errorIndex)}
            onMouseLeave={onErrorBlur}
            onClick={() => onErrorFocus(segment.errorIndex)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onErrorFocus(segment.errorIndex);
              }
            }}
          >
            <span className={styles.errorBadge} aria-hidden="true">
              {segment.errorIndex + 1}
            </span>
            {segment.text}
          </mark>
        );
      })}
    </div>
  );
}
