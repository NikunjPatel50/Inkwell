import { RemixChallengeSection } from "./RemixChallenge";
import { TodaysPrompt } from "./TodaysPrompt";
import { VocabularyCatch } from "./VocabularyCatch";
import type { GroqModel, VocabularyItem } from "../types";
import styles from "./PracticeTab.module.css";

interface PracticeTabProps {
  apiKey: string;
  model: GroqModel;
  hasApiKey: boolean;
  vocabularyItems: VocabularyItem[];
  onUsePrompt: (prompt: string) => void;
  onGoToWrite: () => void;
}

export function PracticeTab({
  apiKey,
  model,
  hasApiKey,
  vocabularyItems,
  onUsePrompt,
  onGoToWrite,
}: PracticeTabProps) {
  return (
    <section
      id="panel-practice"
      role="tabpanel"
      aria-labelledby="tab-practice"
      className={styles.practiceTab}
    >
      <div className={styles.content}>
        <TodaysPrompt onUsePrompt={onUsePrompt} />

        <div className={styles.sectionDivider} aria-hidden="true" />

        <RemixChallengeSection apiKey={apiKey} model={model} hasApiKey={hasApiKey} />

        <div className={styles.sectionDivider} aria-hidden="true" />

        <VocabularyCatch items={vocabularyItems} onGoToWrite={onGoToWrite} />
      </div>
    </section>
  );
}
