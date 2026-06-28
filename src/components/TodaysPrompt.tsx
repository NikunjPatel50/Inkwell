import { WRITING_PROMPTS } from "../constants/prompts";
import { getPromptOfDay } from "../lib/promptOfDay";
import styles from "./TodaysPrompt.module.css";

interface TodaysPromptProps {
  onUsePrompt: (prompt: string) => void;
}

export function TodaysPrompt({ onUsePrompt }: TodaysPromptProps) {
  const prompt = getPromptOfDay(WRITING_PROMPTS);

  return (
    <section className={styles.section} aria-labelledby="todays-prompt-heading">
      <header className={styles.header}>
        <h2 id="todays-prompt-heading" className={styles.title}>
          Today&apos;s Prompt
        </h2>
        <p className={styles.description}>
          A fresh writing starter each day — use it as a jumping-off point in the editor.
        </p>
      </header>

      <blockquote className={styles.promptCard}>
        <p className={styles.promptText}>{prompt}</p>
      </blockquote>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => onUsePrompt(prompt)}
        >
          Use this prompt
        </button>
        <p className={styles.hint}>
          Opens the Write tab with this prompt — edit or replace it freely before analysing.
        </p>
      </div>
    </section>
  );
}
