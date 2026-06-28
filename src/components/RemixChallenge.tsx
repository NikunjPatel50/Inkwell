import { useCallback, useState } from "react";
import { checkRemixAttempt, GroqApiError } from "../lib/groqClient";
import { formatRemixChallenge, pickRandomRemixChallenge } from "../lib/remixChallenge";
import type { ComplexityLevel, GroqModel, RemixChallenge, RemixCheckResult } from "../types";
import { DiffText } from "./DiffText";
import styles from "./RemixChallenge.module.css";

interface RemixChallengeProps {
  apiKey: string;
  model: GroqModel;
  hasApiKey: boolean;
}

export function RemixChallengeSection({ apiKey, model, hasApiKey }: RemixChallengeProps) {
  const [challenge, setChallenge] = useState<RemixChallenge | null>(null);
  const [attempt, setAttempt] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RemixCheckResult | null>(null);

  const handleNewChallenge = useCallback(() => {
    setChallenge(pickRandomRemixChallenge());
    setAttempt("");
    setErrorMessage(null);
    setResult(null);
    setIsChecking(false);
  }, []);

  const handleCheck = useCallback(async () => {
    if (!challenge || !attempt.trim() || !apiKey) return;

    setIsChecking(true);
    setErrorMessage(null);

    try {
      const checkResult = await checkRemixAttempt(attempt.trim(), apiKey, model, {
        complexity: challenge.complexity,
        tone: challenge.tone,
      });
      setResult(checkResult);
    } catch (err) {
      const message =
        err instanceof GroqApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not check your attempt. Please try again.";
      setErrorMessage(message);
      setResult(null);
    } finally {
      setIsChecking(false);
    }
  }, [attempt, apiKey, challenge, model]);

  const canCheck = Boolean(challenge && attempt.trim().length > 0 && hasApiKey && !isChecking);

  return (
    <section className={styles.section} aria-labelledby="remix-challenge-heading">
      <header className={styles.header}>
        <h2 id="remix-challenge-heading" className={styles.title}>
          Style Remix Challenge
        </h2>
        <p className={styles.description}>
          Hit a random complexity and tone combo, then compare your attempt to a clean example.
        </p>
      </header>

      <div className={styles.controls}>
        {!challenge ? (
          <button type="button" className={styles.primaryButton} onClick={handleNewChallenge}>
            Give me a challenge
          </button>
        ) : (
          <>
            <div className={styles.callout} role="status">
              <span className={styles.calloutLabel}>Your challenge:</span>
              <span className={styles.calloutValue}>
                write something {formatRemixChallenge(challenge)}.
              </span>
            </div>
            <button type="button" className={styles.secondaryButton} onClick={handleNewChallenge}>
              New challenge
            </button>
          </>
        )}
      </div>

      {challenge && (
        <div className={styles.attemptArea}>
          <label htmlFor="remix-attempt" className={styles.label}>
            Your attempt
          </label>
          <textarea
            id="remix-attempt"
            className={styles.textarea}
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            placeholder="Write a sentence or short paragraph in the target style…"
            disabled={isChecking}
            rows={4}
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleCheck}
              disabled={!canCheck}
            >
              {isChecking ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Checking…
                </>
              ) : (
                "Check my attempt"
              )}
            </button>
            {!hasApiKey && (
              <p className={styles.hint}>Paste your GROQ API key in the toolbar to check attempts.</p>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorState} role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      {result && challenge && (
        <div className={styles.results}>
          <p className={styles.feedback}>{result.feedback}</p>

          <div className={styles.comparison}>
            <div className={styles.comparisonColumn}>
              <h3 className={styles.comparisonTitle}>Your attempt</h3>
              <p className={styles.comparisonText}>{attempt.trim()}</p>
            </div>
            <div className={styles.comparisonColumn}>
              <h3 className={styles.comparisonTitle}>Target example</h3>
              <p className={styles.comparisonText}>
                <DiffText
                  original={attempt.trim()}
                  rewritten={result.matchedVersion}
                  tier={challenge.complexity as ComplexityLevel}
                />
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
