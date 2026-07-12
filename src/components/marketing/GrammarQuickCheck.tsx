import styles from "./MarketingPage.module.css";

interface GrammarQuickCheckProps {
  prompt: string;
  answer: string;
}

export function GrammarQuickCheck({ prompt, answer }: GrammarQuickCheckProps) {
  return (
    <section className={styles.quickCheck} aria-labelledby="quick-check-heading">
      <h2 id="quick-check-heading" className={styles.h2}>
        Quick check
      </h2>
      <p className={styles.quickCheckPrompt}>{prompt}</p>
      <details className={styles.quickCheckReveal}>
        <summary>Show the fix</summary>
        <p className={styles.quickCheckAnswer}>{answer}</p>
      </details>
    </section>
  );
}
