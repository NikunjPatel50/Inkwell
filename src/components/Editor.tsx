import { useEffect, useState } from "react";
import {
  EDITOR_PLACEHOLDERS,
  pickRandomPlaceholder,
} from "../constants/placeholders";
import type { WritingMode } from "../types/writingMode";
import { pteWordCountState } from "../lib/pteEssayScoring";
import { WritingModeSelector } from "./WritingModeSelector";
import styles from "./Editor.module.css";

interface EditorProps {
  text: string;
  wordCount: number;
  isLoading: boolean;
  canAnalyse: boolean;
  analyseHint?: string;
  writingMode: WritingMode;
  onWritingModeChange: (mode: WritingMode) => void;
  onTextChange: (text: string) => void;
  onAnalyse: () => void;
}

const PTE_PLACEHOLDER =
  "Paste your essay here. PTE essays should be 200–300 words.";

export function Editor({
  text,
  wordCount,
  isLoading,
  canAnalyse,
  analyseHint,
  writingMode,
  onWritingModeChange,
  onTextChange,
  onAnalyse,
}: EditorProps) {
  const [placeholder, setPlaceholder] = useState<string>(EDITOR_PLACEHOLDERS[0]);
  const isPteMode = writingMode === "pte-essay";
  const wordCountClass =
    isPteMode && wordCount > 0
      ? pteWordCountState(wordCount) === "in-range"
        ? styles.wordCountGood
        : styles.wordCountBad
      : "";

  useEffect(() => {
    if (writingMode === "general") {
      setPlaceholder(pickRandomPlaceholder());
    }
  }, [writingMode]);

  const analyseLabel = isPteMode ? "Score Essay" : "Analyse";
  const loadingLabel = isPteMode ? "Scoring…" : "Analysing…";
  const hint = isPteMode
    ? "Aim for 200–300 words. Essays under 120 or over 380 score 0 on Form."
    : "A single sentence or short paragraph works best.";

  return (
    <section className={styles.editor} aria-labelledby="editor-heading">
      <WritingModeSelector
        selectedMode={writingMode}
        disabled={isLoading}
        onModeChange={onWritingModeChange}
      />

      <div className={styles.header}>
        <h2 id="editor-heading" className={styles.title}>
          Your writing
        </h2>
        <span
          className={`${styles.wordCount} ${wordCountClass}`}
          aria-live="polite"
        >
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>

      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={isPteMode ? PTE_PLACEHOLDER : placeholder}
        disabled={isLoading}
        aria-describedby="editor-hint"
      />

      <p id="editor-hint" className={styles.hint}>
        {hint}
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.analyseButton}
          onClick={onAnalyse}
          disabled={!canAnalyse || isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              {loadingLabel}
            </>
          ) : (
            analyseLabel
          )}
        </button>
        {analyseHint && !isLoading && (
          <p className={styles.analyseHint}>{analyseHint}</p>
        )}
      </div>
    </section>
  );
}
