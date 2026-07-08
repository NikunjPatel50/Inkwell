import { useEffect, useState } from "react";
import {
  EDITOR_PLACEHOLDERS,
  pickRandomPlaceholder,
} from "../constants/placeholders";
import styles from "./Editor.module.css";

interface EditorProps {
  text: string;
  wordCount: number;
  isLoading: boolean;
  canAnalyse: boolean;
  analyseHint?: string;
  onTextChange: (text: string) => void;
  onAnalyse: () => void;
}

export function Editor({
  text,
  wordCount,
  isLoading,
  canAnalyse,
  analyseHint,
  onTextChange,
  onAnalyse,
}: EditorProps) {
  const [placeholder, setPlaceholder] = useState<string>(EDITOR_PLACEHOLDERS[0]);

  useEffect(() => {
    setPlaceholder(pickRandomPlaceholder());
  }, []);

  return (
    <section className={styles.editor} aria-labelledby="editor-heading">
      <div className={styles.header}>
        <h2 id="editor-heading" className={styles.title}>
          Your writing
        </h2>
        <span className={styles.wordCount} aria-live="polite">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>

      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        aria-describedby="editor-hint"
      />

      <p id="editor-hint" className={styles.hint}>
        A single sentence or short paragraph works best.
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
            "Analyse"
          )}
        </button>
        {analyseHint && !isLoading && (
          <p className={styles.analyseHint}>{analyseHint}</p>
        )}
      </div>
    </section>
  );
}
