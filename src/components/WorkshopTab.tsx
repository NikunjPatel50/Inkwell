import type { AnalysisStatus, AppTab, LadderResult, Tone, WritingError } from "../types";
import type { PTEEssayScoreResult, WritingMode } from "../types/writingMode";
import type { AuthUser } from "../hooks/useAuth";
import { Editor } from "./Editor";
import { FeedbackCard } from "./FeedbackCard";
import { LadderPanel } from "./LadderPanel";
import { PTEEssayResults } from "./PTEEssayResults";
import { RegisterMeter } from "./RegisterMeter";
import { TabBackBar } from "./TabBackBar";
import styles from "./WorkshopTab.module.css";

interface WorkshopTabProps {
  onTabChange: (tab: AppTab) => void;
  text: string;
  wordCount: number;
  status: AnalysisStatus;
  isLoading: boolean;
  loadingMessage: string;
  canAnalyse: boolean;
  analyseHint?: string;
  writingMode: WritingMode;
  errorMessage: string | null;
  hasGeneralResults: boolean;
  hasPteResults: boolean;
  registerScore: number;
  registerMeterKey: number;
  errors: WritingError[];
  activeErrorIndex: number | null;
  analysedText: string | null;
  displayLadder: LadderResult | null;
  pteResult: PTEEssayScoreResult | null;
  isAuthenticated: boolean;
  user: AuthUser | null;
  selectedTone: Tone;
  toneLoading: boolean;
  toneLoadingMessage: string;
  toneError: string | null;
  revealKey: number;
  animateReveal: boolean;
  onTextChange: (text: string) => void;
  onWritingModeChange: (mode: WritingMode) => void;
  onAnalyse: () => void;
  onErrorHover: (errorIndex: number | null) => void;
  onToneChange: (tone: Tone) => void;
}

export function WorkshopTab({
  onTabChange,
  text,
  wordCount,
  status,
  isLoading,
  loadingMessage,
  canAnalyse,
  analyseHint,
  writingMode,
  errorMessage,
  hasGeneralResults,
  hasPteResults,
  registerScore,
  registerMeterKey,
  errors,
  activeErrorIndex,
  analysedText,
  displayLadder,
  pteResult,
  isAuthenticated,
  user,
  selectedTone,
  toneLoading,
  toneLoadingMessage,
  toneError,
  revealKey,
  animateReveal,
  onTextChange,
  onWritingModeChange,
  onAnalyse,
  onErrorHover,
  onToneChange,
}: WorkshopTabProps) {
  const isPteMode = writingMode === "pte-essay";
  const idleMessage = isPteMode ? (
    <>
      Your PTE trait scores will appear here after you click <strong>Score Essay</strong>.
    </>
  ) : (
    <>
      Your feedback and rewrites will appear here after you click <strong>Analyse</strong>.
    </>
  );

  return (
    <section className={styles.workshop}>
      <TabBackBar label="Dashboard" onBack={() => onTabChange("dashboard")} />
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
                writingMode={writingMode}
                onWritingModeChange={onWritingModeChange}
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
            <h2 className={styles.panelTitle}>
              {isPteMode ? "PTE scoring" : "Analysis & rewrites"}
            </h2>
            <span className={styles.panelBadge}>Output</span>
          </div>
          <div className={styles.panelBody}>
            {status === "idle" && (
              <section className={styles.emptyState}>
                <p className={styles.emptyText}>{idleMessage}</p>
              </section>
            )}

            {status === "loading" && (
              <section className={styles.loadingState} aria-live="polite">
                <span className={styles.loadingSpinner} aria-hidden="true" />
                <p className={styles.loadingMessage}>{loadingMessage}</p>
              </section>
            )}

            {status === "error" && errorMessage && (
              <section className={styles.errorState} role="alert">
                <h3 className={styles.errorTitle}>Something went wrong</h3>
                <p className={styles.errorMessage}>{errorMessage}</p>
              </section>
            )}

            {!isPteMode && hasGeneralResults && analysedText && displayLadder && (
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

            {isPteMode && hasPteResults && pteResult && analysedText && (
              <div className={styles.results}>
                <PTEEssayResults
                  originalEssay={analysedText}
                  scoreResult={pteResult}
                  authenticated={isAuthenticated}
                  user={user}
                  onApplyToInput={onTextChange}
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
