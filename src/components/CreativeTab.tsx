import { EmotionRewriter } from "./EmotionRewriter";
import { RewriteDuel } from "./RewriteDuel";
import { TabPageShell } from "./TabPageShell";
import type { AppTab } from "../types";
import styles from "./CreativeTab.module.css";

interface CreativeTabProps {
  onTabChange: (tab: AppTab) => void;
}

export function CreativeTab({ onTabChange }: CreativeTabProps) {
  return (
    <TabPageShell
      id="panel-creative"
      labelledBy="tab-creative"
      backTo={{ label: "Dashboard", onBack: () => onTabChange("dashboard") }}
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
