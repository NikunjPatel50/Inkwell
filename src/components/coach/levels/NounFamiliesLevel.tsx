"use client";

import { useCallback, useState } from "react";
import { pickRandomNoun } from "../../../constants/coachLevels";
import { ApiError } from "../../../lib/apiClient";
import {
  evaluateNounFamilies,
  isCoachAvailable,
  recordLevelSession,
} from "../../../lib/coachClient";
import type { CollocationEvaluateResult } from "../../../types/coach";
import { CoachCollocationResults } from "../CoachCollocationResults";
import shared from "../CoachShared.module.css";

interface NounFamiliesLevelProps {
  onProgressUpdate: () => void;
}

export function NounFamiliesLevel({ onProgressUpdate }: NounFamiliesLevelProps) {
  const [noun, setNoun] = useState(pickRandomNoun);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CollocationEvaluateResult | null>(null);

  const handleEvaluate = useCallback(async () => {
    const answers = input
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (answers.length === 0) {
      setError("Enter at least one verb collocation — one per line.");
      return;
    }

    if (!isCoachAvailable()) {
      setError("AI coach is not configured. Connect InsForge or set GROQ API key.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const evaluation = await evaluateNounFamilies(noun, answers);
      setResult(evaluation);
      const accuracy = evaluation.totalCount
        ? Math.round((evaluation.correctCount / evaluation.totalCount) * 100)
        : 0;
      recordLevelSession("noun-families", accuracy, {
        weakCollocations: evaluation.results.filter((r) => !r.correct).map((r) => r.phrase),
        vocabulary: evaluation.missingCollocations,
      });
      onProgressUpdate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Evaluation failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [input, noun, onProgressUpdate]);

  const handleNewNoun = useCallback(() => {
    setNoun(pickRandomNoun());
    setInput("");
    setResult(null);
    setError(null);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--enterprise-section-gap)" }}>
      <div className={shared.card}>
        <p className={shared.sectionHint}>
          Write every verb collocation you know for this noun — one per line.
        </p>
        <p className={shared.anchorWord}>{noun}</p>
        <label className={shared.label} htmlFor="noun-family-input">
          Your verb collocations
        </label>
        <textarea
          id="noun-family-input"
          className={shared.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`improve ${noun.toLowerCase()}\nincrease ${noun.toLowerCase()}\nboost ${noun.toLowerCase()}`}
          disabled={loading}
          rows={6}
        />
        {error && (
          <div className={shared.errorBanner} role="alert">
            {error}
          </div>
        )}
        <div className={shared.actions}>
          <button
            type="button"
            className={shared.primaryButton}
            onClick={() => void handleEvaluate()}
            disabled={loading}
          >
            {loading ? "Evaluating…" : "Check answers"}
          </button>
          <button type="button" className={shared.secondaryButton} onClick={handleNewNoun} disabled={loading}>
            New noun
          </button>
        </div>
        {loading && (
          <div className={shared.loadingRow} aria-live="polite">
            <span className={shared.spinner} aria-hidden="true" />
            AI is scoring your noun family…
          </div>
        )}
      </div>

      {result && <CoachCollocationResults result={result} />}
    </div>
  );
}
