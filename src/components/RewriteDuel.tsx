import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../lib/apiClient";
import { generateDuelSentence, judgeDuel } from "../lib/creativeClient";
import { countWords } from "../lib/textMetrics";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import type { DuelResult, DuelSentence, DuelVerdict } from "../types";
import { CountdownTimer } from "./CountdownTimer";
import styles from "./RewriteDuel.module.css";

const DUEL_DURATION = 60;

type DuelPhase = "idle" | "generating" | "writing" | "judging" | "revealed";

interface SessionScore {
  user: number;
  ai: number;
  tie: number;
}

const VERDICT_LABELS: Record<DuelVerdict, string> = {
  user: "You win",
  ai: "AI wins",
  tie: "Too close to call",
};

export function RewriteDuel() {
  const reducedMotion = usePrefersReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const submitLockRef = useRef(false);

  const [phase, setPhase] = useState<DuelPhase>("idle");
  const [duelKey, setDuelKey] = useState(0);
  const [challenge, setChallenge] = useState<DuelSentence | null>(null);
  const [rewrite, setRewrite] = useState("");
  const [result, setResult] = useState<DuelResult | null>(null);
  const [userRewriteSubmitted, setUserRewriteSubmitted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const [sessionScore, setSessionScore] = useState<SessionScore>({ user: 0, ai: 0, tie: 0 });

  const wordCount = countWords(rewrite);

  useEffect(() => {
    if (phase === "writing") {
      textareaRef.current?.focus();
    }
  }, [phase, duelKey]);

  useEffect(() => {
    if (phase !== "revealed" || !result) {
      setShowVerdict(false);
      return;
    }

    if (reducedMotion) {
      setShowVerdict(true);
      return;
    }

    const timeout = window.setTimeout(() => setShowVerdict(true), 800);
    return () => window.clearTimeout(timeout);
  }, [phase, result, reducedMotion]);

  const submitRewrite = useCallback(
    async (attempt: string) => {
      if (!challenge || submitLockRef.current) return;
      submitLockRef.current = true;
      setPhase("judging");
      setUserRewriteSubmitted(attempt);

      try {
        const judgment = await judgeDuel(challenge.sentence, challenge.flaw, attempt);
        setResult(judgment);
        setSessionScore((score) => ({
          ...score,
          [judgment.verdict]: score[judgment.verdict] + 1,
        }));
        setPhase("revealed");
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not judge your rewrite.";
        setError(message);
        setPhase("writing");
        submitLockRef.current = false;
      }
    },
    [challenge],
  );

  const handleTimerComplete = useCallback(() => {
    void submitRewrite(rewrite.trim());
  }, [rewrite, submitRewrite]);

  const startNewDuel = useCallback(async () => {
    setError(null);
    setChallenge(null);
    setRewrite("");
    setResult(null);
    setUserRewriteSubmitted("");
    setShowVerdict(false);
    submitLockRef.current = false;
    setPhase("generating");
    setDuelKey((key) => key + 1);

    try {
      const sentence = await generateDuelSentence();
      setChallenge(sentence);
      setPhase("writing");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not start a new duel.";
      setError(message);
      setPhase("idle");
    }
  }, []);

  const handleManualSubmit = () => {
    void submitRewrite(rewrite.trim());
  };

  const sessionLabel = `Session: You ${sessionScore.user} — AI ${sessionScore.ai}${
    sessionScore.tie > 0 ? ` — Ties ${sessionScore.tie}` : ""
  }`;

  return (
    <section className={styles.duel} aria-labelledby="rewrite-duel-heading">
      <p className={styles.eyebrow}>The Rewrite Duel</p>
      <h2 id="rewrite-duel-heading" className={styles.title}>
        Beat the AI rewrite
      </h2>
      <p className={styles.description}>
        A weak sentence drops. You have 60 seconds to rewrite it — then the AI reveals its version
        and an honest editor picks a winner.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={startNewDuel}
          disabled={phase === "generating" || phase === "judging"}
        >
          {phase === "generating" ? "Drawing a challenger…" : "New Duel"}
        </button>
        {(sessionScore.user > 0 || sessionScore.ai > 0 || sessionScore.tie > 0) && (
          <span className={styles.sessionTally}>{sessionLabel}</span>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {challenge && phase !== "idle" && phase !== "generating" && (
        <>
          <article className={styles.challengeCard}>
            <p className={styles.challengeLabel}>Your challenger sentence</p>
            <blockquote className={styles.challengeText}>{challenge.sentence}</blockquote>
            <p className={styles.flawLabel}>
              Flaw: <span>{challenge.flaw}</span>
            </p>
          </article>

          {(phase === "writing" || phase === "judging") && (
            <>
              <CountdownTimer
                durationSeconds={DUEL_DURATION}
                running={phase === "writing"}
                resetKey={duelKey}
                reducedMotion={reducedMotion}
                onComplete={handleTimerComplete}
              />

              <label className={styles.rewriteLabel} htmlFor="duel-rewrite">
                Your rewrite — go.
              </label>
              <textarea
                id="duel-rewrite"
                ref={textareaRef}
                className={styles.rewriteInput}
                value={rewrite}
                onChange={(event) => setRewrite(event.target.value)}
                disabled={phase !== "writing"}
                rows={4}
                placeholder="Start typing your stronger version…"
              />
              <p className={styles.wordCount}>
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </p>

              <button
                type="button"
                className={styles.submitButton}
                onClick={handleManualSubmit}
                disabled={phase !== "writing"}
              >
                Submit my rewrite
              </button>
            </>
          )}

          {phase === "judging" && (
            <p className={styles.status} aria-live="polite">
              The editor is reading both versions…
            </p>
          )}

          {phase === "revealed" && result && (
            <div className={styles.reveal}>
              <div className={styles.comparison}>
                <article className={styles.manuscriptCard}>
                  <h3 className={styles.cardHeading}>Your rewrite</h3>
                  <p className={styles.cardBody}>
                    {userRewriteSubmitted || (
                      <em className={styles.blankNote}>No rewrite submitted — time ran out.</em>
                    )}
                  </p>
                </article>
                <article className={styles.manuscriptCard}>
                  <h3 className={styles.cardHeading}>AI&apos;s rewrite</h3>
                  <p className={styles.cardBody}>{result.aiRewrite}</p>
                </article>
              </div>

              {showVerdict && (
                <div
                  className={`${styles.verdict} ${styles[`verdict_${result.verdict}`]} ${
                    reducedMotion ? styles.verdictVisible : styles.verdictReveal
                  }`}
                >
                  <h3 className={styles.verdictHeading}>The verdict</h3>
                  <p className={styles.verdictOutcome}>{VERDICT_LABELS[result.verdict]}</p>
                  <p className={styles.judgment}>{result.judgment}</p>
                  <p className={styles.takeaway}>
                    <span className={styles.takeawayLabel}>What to remember:</span> {result.takeaway}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
