import type { WritingError } from "../types";
import { HighlightedText } from "./HighlightedText";
import styles from "./Editor.module.css";

interface EditorProps {
  text: string;
  wordCount: number;
  isLoading: boolean;
  canAnalyse: boolean;
  analyseHint?: string;
  showHighlights: boolean;
  analysedText: string | null;
  errors: WritingError[];
  isEditing: boolean;
  activeErrorIndex: number | null;
  onTextChange: (text: string) => void;
  onAnalyse: () => void;
  onEdit: () => void;
  onErrorFocus: (errorIndex: number) => void;
  onErrorBlur: () => void;
}

export function Editor({
  text,
  wordCount,
  isLoading,
  canAnalyse,
  analyseHint,
  showHighlights,
  analysedText,
  errors,
  isEditing,
  activeErrorIndex,
  onTextChange,
  onAnalyse,
  onEdit,
  onErrorFocus,
  onErrorBlur,
}: EditorProps) {
  const displayHighlights =
    showHighlights && !isEditing && analysedText !== null && errors.length > 0;

  return (
    <section className={styles.editor} aria-labelledby="editor-heading">
      <div className={styles.header}>
        <h2 id="editor-heading" className={styles.title}>
          Your writing
        </h2>
        <div className={styles.headerMeta}>
          <span className={styles.wordCount} aria-live="polite">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          {showHighlights && !isEditing && (
            <button type="button" className={styles.editButton} onClick={onEdit}>
              Edit text
            </button>
          )}
        </div>
      </div>

      {displayHighlights ? (
        <HighlightedText
          text={analysedText}
          errors={errors}
          activeErrorIndex={activeErrorIndex}
          onErrorFocus={onErrorFocus}
          onErrorBlur={onErrorBlur}
        />
      ) : (
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste or type a sentence or paragraph here…"
          disabled={isLoading}
          aria-describedby="editor-hint"
        />
      )}

      <p id="editor-hint" className={styles.hint}>
        {displayHighlights
          ? "Hover or click a highlighted phrase to jump to its feedback."
          : "A single sentence or short paragraph works best."}
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
              Analysing…
            </>
          ) : (
            "Analyse my writing"
          )}
        </button>
        {analyseHint && !isLoading && (
          <p className={styles.analyseHint}>{analyseHint}</p>
        )}
      </div>
    </section>
  );
}
