import type { AnalysisStatus, CorrectionResult, LadderResult, SelfCorrectionPhase, Tone, WritingError } from "../types";
import { Editor } from "./Editor";
import { FeedbackCard } from "./FeedbackCard";
import { LadderPanel } from "./LadderPanel";
import { RegisterMeter } from "./RegisterMeter";
import { SelfCorrectionChallenge } from "./SelfCorrectionChallenge";
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
  selfCorrectionPhase: SelfCorrectionPhase;
  correctionAttempt: string;
  correctionResult: CorrectionResult | null;
  correctionChecking: boolean;
  correctionCheckError: string | null;
  correctionCollapsed: boolean;
  feedbackRevealed: boolean;
  onTextChange: (text: string) => void;
  onAnalyse: () => void;
  onErrorHover: (errorIndex: number | null) => void;
  onToneChange: (tone: Tone) => void;
  onCorrectionAttemptChange: (attempt: string) => void;
  onCheckCorrection: () => void;
  onSkipCorrection: () => void;
  onToggleCorrectionCollapse: () => void;
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
  selfCorrectionPhase,
  correctionAttempt,
  correctionResult,
  correctionChecking,
  correctionCheckError,
  correctionCollapsed,
  feedbackRevealed,
  onTextChange,
  onAnalyse,
  onErrorHover,
  onToneChange,
  onCorrectionAttemptChange,
  onCheckCorrection,
  onSkipCorrection,
  onToggleCorrectionCollapse,
}: WorkshopTabProps) {
  const showSelfCorrection =
    selfCorrectionPhase === "active" || selfCorrectionPhase === "completed";
  return (
    <section className={styles.workshop}>
      <div className={styles.workspace}>
        <div className={styles.editorColumn}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Composition</h2>
            <span className={styles.panelBadge}>Input</span>
          </div>
          <div className={styles.panelBody}>
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
                <h3 className={styles.errorTitle}>Something went wrong</h3>
                <p className={styles.errorMessage}>{errorMessage}</p>
              </section>
            )}
          </div>
        </div>

        <aside className={styles.resultsColumn} aria-label="Analysis results">
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Analysis &amp; rewrites</h2>
            <span className={styles.panelBadge}>Output</span>
          </div>
          <div className={styles.panelBody}>
            {status === "idle" && (
              <section className={styles.emptyState}>
                <p className={styles.emptyText}>
                  Your feedback and rewrites will appear here after you click{" "}
                  <strong>Analyse</strong>.
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
                {showSelfCorrection && analysedText && (
                  <SelfCorrectionChallenge
                    knownErrors={errors}
                    attempt={correctionAttempt}
                    isChecking={correctionChecking}
                    checkError={correctionCheckError}
                    result={correctionResult}
                    collapsed={correctionCollapsed}
                    onAttemptChange={onCorrectionAttemptChange}
                    onCheck={onCheckCorrection}
                    onSkip={onSkipCorrection}
                    onToggleCollapse={onToggleCorrectionCollapse}
                  />
                )}
                {feedbackRevealed && (
                  <FeedbackCard
                    errors={errors}
                    activeErrorIndex={activeErrorIndex}
                    onErrorHover={onErrorHover}
                  />
                )}
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
          </div>
        </aside>
      </div>
    </section>
  );
}
