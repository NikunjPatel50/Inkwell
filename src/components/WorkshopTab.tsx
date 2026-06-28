import type { AnalysisStatus, LadderResult, Tone, WritingError } from "../types";
import { Editor } from "./Editor";
import { FeedbackCard } from "./FeedbackCard";
import { LadderPanel } from "./LadderPanel";
import { RegisterMeter } from "./RegisterMeter";
import styles from "./WorkshopTab.module.css";

interface WorkshopTabProps {
  text: string;
  wordCount: number;
  status: AnalysisStatus;
  isLoading: boolean;
  loadingMessage: string;
  canAnalyse: boolean;
  analyseHint?: string;
  errorMessage: string | null;
  hasResults: boolean;
  registerScore: number;
  registerMeterKey: number;
  errors: WritingError[];
  activeErrorIndex: number | null;
  analysedText: string | null;
  displayLadder: LadderResult | null;
  selectedTone: Tone;
  toneLoading: boolean;
  toneLoadingMessage: string;
  toneError: string | null;
  revealKey: number;
  animateReveal: boolean;
  onTextChange: (text: string) => void;
  onAnalyse: () => void;
  onErrorHover: (errorIndex: number | null) => void;
  onToneChange: (tone: Tone) => void;
}

export function WorkshopTab({
  text,
  wordCount,
  status,
  isLoading,
  loadingMessage,
  canAnalyse,
  analyseHint,
  errorMessage,
  hasResults,
  registerScore,
  registerMeterKey,
  errors,
  activeErrorIndex,
  analysedText,
  displayLadder,
  selectedTone,
  toneLoading,
  toneLoadingMessage,
  toneError,
  revealKey,
  animateReveal,
  onTextChange,
  onAnalyse,
  onErrorHover,
  onToneChange,
}: WorkshopTabProps) {
  return (
    <section className={styles.workshop}>
      <div className={styles.workspace}>
        <div className={styles.editorColumn}>
          <div className={styles.editorWrap}>
            <Editor
              text={text}
              wordCount={wordCount}
              isLoading={isLoading}
              canAnalyse={canAnalyse}
              analyseHint={analyseHint}
              onTextChange={onTextChange}
              onAnalyse={onAnalyse}
            />

            {isLoading && (
              <div className={styles.loadingOverlay} aria-live="polite">
                <span className={styles.loadingSpinner} aria-hidden="true" />
                <p className={styles.loadingMessage}>{loadingMessage}</p>
              </div>
            )}
          </div>

          {errorMessage && (
            <section className={styles.errorState} role="alert">
              <h2 className={styles.errorTitle}>Something went wrong</h2>
              <p className={styles.errorMessage}>{errorMessage}</p>
            </section>
          )}
        </div>

        <div className={styles.panelDivider} aria-hidden="true" />

        <aside className={styles.resultsColumn} aria-label="Analysis results">
          {status === "idle" && (
            <section className={styles.emptyState}>
              <p className={styles.emptyText}>
                Your feedback and rewrites will appear here after you click{" "}
                <strong>Analyse my writing</strong>.
              </p>
            </section>
          )}

          {status === "loading" && (
            <section className={styles.loadingState} aria-live="polite">
              <span className={styles.loadingSpinner} aria-hidden="true" />
              <p className={styles.loadingMessage}>{loadingMessage}</p>
            </section>
          )}

          {hasResults && analysedText && displayLadder && (
            <div className={styles.results}>
              <RegisterMeter key={registerMeterKey} score={registerScore} />
              <FeedbackCard
                errors={errors}
                activeErrorIndex={activeErrorIndex}
                onErrorHover={onErrorHover}
              />
              <LadderPanel
                original={analysedText}
                ladder={displayLadder}
                selectedTone={selectedTone}
                toneLoading={toneLoading}
                toneLoadingMessage={toneLoadingMessage}
                toneError={toneError}
                revealKey={revealKey}
                animateReveal={animateReveal}
                onToneChange={onToneChange}
              />
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
