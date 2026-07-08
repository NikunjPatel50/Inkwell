import { EmotionRewriter } from "./EmotionRewriter";
import { RewriteDuel } from "./RewriteDuel";
import { TabPageShell } from "./TabPageShell";
import styles from "./CreativeTab.module.css";

export function CreativeTab() {
  return (
    <TabPageShell
      id="panel-creative"
      labelledBy="tab-creative"
      eyebrow="Studio"
      title="Creative"
      description="Expressive writing games to stretch voice, rhythm, and word choice."
    >
      <div className={styles.gameGrid}>
        <section className={styles.gameCard} aria-labelledby="rewrite-duel-heading">
          <header className={styles.gameHeader}>
            <h3 id="rewrite-duel-heading" className={styles.gameTitle}>
              Rewrite duel
            </h3>
            <p className={styles.gameDescription}>Beat the clock with a stronger rewrite.</p>
          </header>
          <RewriteDuel />
        </section>
        <section className={styles.gameCard} aria-labelledby="emotion-rewriter-heading">
          <header className={styles.gameHeader}>
            <h3 id="emotion-rewriter-heading" className={styles.gameTitle}>
              Emotion rewriter
            </h3>
            <p className={styles.gameDescription}>Shift tone while keeping the core meaning.</p>
          </header>
          <EmotionRewriter />
        </section>
      </div>
    </TabPageShell>
  );
}
