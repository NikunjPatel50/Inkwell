"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ESSAY_PROMPT } from "../constants/coachLevels";
import { scorePTEEssay } from "../lib/analyzePTEEssay";
import { ApiError } from "../lib/apiClient";
import { improvePTEEssay } from "../lib/improvePTEEssay";
import { comparePTEScores } from "../lib/pteEssayScoring";
import type {
  PTEEssayImproveResult,
  PTEEssayScoreResult,
  PTEScoreComparison,
} from "../types/writingMode";
import type { AuthUser } from "../hooks/useAuth";
import { DiffText } from "./DiffText";
import { PTEEssayScorePanel } from "./PTEEssayScorePanel";
import styles from "./PTEEssayResults.module.css";

const IMPROVE_COOLDOWN_MS = 3000;

interface PTEEssayResultsProps {
  originalEssay: string;
  scoreResult: PTEEssayScoreResult;
  essayPrompt?: string;
  authenticated?: boolean;
  user?: AuthUser | null;
  onApplyToInput: (text: string) => void;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function PTEEssayResults({
  originalEssay,
  scoreResult,
  essayPrompt = ESSAY_PROMPT,
  authenticated = false,
  user = null,
  onApplyToInput,
}: PTEEssayResultsProps) {
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);
  const [improveResult, setImproveResult] = useState<PTEEssayImproveResult | null>(null);
  const [rescoredResult, setRescoredResult] = useState<PTEEssayScoreResult | null>(null);
  const [rescoreLoading, setRescoreLoading] = useState(false);
  const [rescoreError, setRescoreError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const onCooldown = now < cooldownUntil;
  const improveDisabled = improveLoading || rescoreLoading || onCooldown;

  useEffect(() => {
    setImproveResult(null);
    setRescoredResult(null);
    setImproveError(null);
    setRescoreError(null);
    setCopied(false);
  }, [originalEssay, scoreResult]);

  useEffect(() => {
    if (!onCooldown) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [onCooldown, cooldownUntil]);

  const scoreComparison: PTEScoreComparison | null = useMemo(() => {
    if (!rescoredResult) return null;
    return comparePTEScores(scoreResult, rescoredResult);
  }, [rescoredResult, scoreResult]);

  const runImprove = useCallback(async () => {
    setImproveLoading(true);
    setImproveError(null);
    setRescoredResult(null);
    setRescoreError(null);

    try {
      const result = await improvePTEEssay(originalEssay, essayPrompt, scoreResult, { user });
      setImproveResult(result);
      setCooldownUntil(Date.now() + IMPROVE_COOLDOWN_MS);
    } catch (err) {
      setImproveError(
        err instanceof ApiError ? err.message : "Could not improve the essay. Try again.",
      );
    } finally {
      setImproveLoading(false);
    }
  }, [essayPrompt, originalEssay, scoreResult, user]);

  const runRescore = useCallback(async () => {
    if (!improveResult) return;

    setRescoreLoading(true);
    setRescoreError(null);

    try {
      const nextScore = await scorePTEEssay(improveResult.improvedEssay, {
        prompt: essayPrompt,
        authenticated,
      });
      setRescoredResult(nextScore);
      setCooldownUntil(Date.now() + IMPROVE_COOLDOWN_MS);
    } catch (err) {
      setRescoreError(
        err instanceof ApiError ? err.message : "Could not re-score the improved essay.",
      );
    } finally {
      setRescoreLoading(false);
    }
  }, [authenticated, essayPrompt, improveResult]);

  const handleCopy = useCallback(async () => {
    if (!improveResult) return;
    const success = await copyToClipboard(improveResult.improvedEssay);
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [improveResult]);

  const improveFooter = (
    <div className={styles.improveActions}>
      <button
        type="button"
        className={styles.primaryButton}
        disabled={improveDisabled}
        onClick={() => void runImprove()}
      >
        {improveLoading ? "Rewriting based on your weakest traits…" : "Improve my essay"}
      </button>
      {improveError && (
        <div className={styles.errorBanner} role="alert">
          <p>{improveError}</p>
          <button type="button" className={styles.textButton} onClick={() => void runImprove()}>
            Retry
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.stack}>
      <PTEEssayScorePanel result={scoreResult} footer={improveFooter} />

      {improveResult && (
        <section className={styles.improvedSection} aria-labelledby="pte-improved-heading">
          <h3 id="pte-improved-heading" className={styles.improvedTitle}>
            Improved version
          </h3>

          <div className={styles.improvedEssay}>
            <DiffText
              original={originalEssay}
              rewritten={improveResult.improvedEssay}
              tier="intermediate"
            />
          </div>

          {improveResult.changes.length > 0 && (
            <ul className={styles.changeList}>
              {improveResult.changes.map((change) => (
                <li key={`${change.trait}-${change.whatChanged}`} className={styles.changeItem}>
                  <strong>{change.trait}:</strong> {change.whatChanged}
                  {change.whySuccinct ? ` — ${change.whySuccinct}` : ""}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.actionRow}>
            <button type="button" className={styles.secondaryButton} onClick={() => void handleCopy()}>
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={rescoreLoading || onCooldown}
              onClick={() => void runRescore()}
            >
              {rescoreLoading ? "Re-scoring…" : "Re-score this version"}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => onApplyToInput(improveResult.improvedEssay)}
            >
              Apply to input
            </button>
          </div>

          {rescoreError && (
            <div className={styles.errorBanner} role="alert">
              <p>{rescoreError}</p>
              <button type="button" className={styles.textButton} onClick={() => void runRescore()}>
                Retry
              </button>
            </div>
          )}

          {scoreComparison && (
            <div className={styles.comparisonBox}>
              <p className={styles.comparisonTitle}>Score comparison</p>
              {scoreComparison.traits.length > 0 ? (
                <ul className={styles.comparisonList}>
                  {scoreComparison.traits.map((entry) => (
                    <li key={entry.label} className={styles.comparisonItem}>
                      {entry.label}: {entry.before}/{entry.maxScore} → {entry.after}/{entry.maxScore}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.comparisonEmpty}>Trait scores unchanged on this pass.</p>
              )}
              <p className={styles.comparisonTotal}>
                Total: {scoreComparison.totalBefore}/{scoreComparison.maxTotalScore} →{" "}
                {scoreComparison.totalAfter}/{scoreComparison.maxTotalScore}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
