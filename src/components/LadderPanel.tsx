import type { ReactNode } from "react";
import type { LadderResult, Tone } from "../types";
import { ToneSelector } from "./ToneSelector";
import { VersionLadder } from "./VersionLadder";
import styles from "./LadderPanel.module.css";

interface LadderPanelProps {
  original: string;
  ladder: LadderResult;
  selectedTone: Tone;
  toneLoading: boolean;
  toneLoadingMessage: string;
  toneError: string | null;
  revealKey: number;
  animateReveal?: boolean;
  onToneChange: (tone: Tone) => void;
}

export function LadderPanel({
  original,
  ladder,
  selectedTone,
  toneLoading,
  toneLoadingMessage,
  toneError,
  revealKey,
  animateReveal = true,
  onToneChange,
}: LadderPanelProps) {
  const showDriftNote =
    selectedTone !== "neutral" &&
    ladder.toneDriftNote &&
    ladder.toneDriftNote.length > 0;

  const headerExtra: ReactNode = (
    <ToneSelector
      selectedTone={selectedTone}
      disabled={toneLoading}
      onToneChange={onToneChange}
    />
  );

  return (
    <div className={styles.panel}>
      <div className={styles.ladderWrap}>
        {toneLoading && (
          <div className={styles.ladderLoading} aria-live="polite">
            <span className={styles.loadingSpinner} aria-hidden="true" />
            <p className={styles.loadingMessage}>{toneLoadingMessage}</p>
          </div>
        )}

        <VersionLadder
          original={original}
          simple={ladder.simple}
          intermediate={ladder.intermediate}
          intermediateTechnique={ladder.intermediateTechnique}
          advanced={ladder.advanced}
          advancedTechnique={ladder.advancedTechnique}
          revealKey={revealKey}
          animateReveal={animateReveal}
          dimmed={toneLoading}
          headerExtra={headerExtra}
        />
      </div>

      {toneError && (
        <p className={styles.toneError} role="alert">
          {toneError}
        </p>
      )}

      {showDriftNote && (
        <p className={styles.driftNote}>{ladder.toneDriftNote}</p>
      )}
    </div>
  );
}
