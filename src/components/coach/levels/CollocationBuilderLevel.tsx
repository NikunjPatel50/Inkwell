"use client";

import { useCallback, useState } from "react";
import { pickRandomVerb } from "../../../constants/coachLevels";
import { ApiError } from "../../../lib/apiClient";
import {
  evaluateCollocationBuilder,
  isCoachAvailable,
  recordLevelSession,
} from "../../../lib/coachClient";
import type { CollocationEvaluateResult } from "../../../types/coach";
import { CoachCollocationResults } from "../CoachCollocationResults";
import shared from "../CoachShared.module.css";

interface CollocationBuilderLevelProps {
  onProgressUpdate: () => void;
}

export function CollocationBuilderLevel({ onProgressUpdate }: CollocationBuilderLevelProps) {
  const [verb, setVerb] = useState(pickRandomVerb);
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
      setError("Enter at least one collocation — one per line.");
      return;
    }

    if (!isCoachAvailable()) {
      setError("AI coach is not configured. Connect InsForge or set GROQ API key.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const evaluation = await evaluateCollocationBuilder(verb, answers);
      setResult(evaluation);
      const accuracy = evaluation.totalCount
        ? Math.round((evaluation.correctCount / evaluation.totalCount) * 100)
        : 0;
      recordLevelSession("collocation-builder", accuracy, {
        weakCollocations: evaluation.results.filter((r) => !r.correct).map((r) => r.phrase),
        vocabulary: evaluation.missingCollocations,
      });
      onProgressUpdate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Evaluation failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [input, onProgressUpdate, verb]);

  const handleNewVerb = useCallback(() => {
    setVerb(pickRandomVerb());
    setInput("");
    setResult(null);
    setError(null);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--enterprise-section-gap)" }}>
      <div className={shared.card}>
        <p className={shared.sectionHint}>Enter as many noun collocations as you can — one per line.</p>
        <p className={shared.anchorWord}>{verb}</p>
        <label className={shared.label} htmlFor="collocation-input">
          Your collocations
        </label>
        <textarea
          id="collocation-input"
          className={shared.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`${verb} productivity\n${verb} communication\n${verb} performance`}
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
            {loading ? "Evaluating…" : "Check collocations"}
          </button>
          <button type="button" className={shared.secondaryButton} onClick={handleNewVerb} disabled={loading}>
            New verb
          </button>
        </div>
        {loading && (
          <div className={shared.loadingRow} aria-live="polite">
            <span className={shared.spinner} aria-hidden="true" />
            AI is checking your collocations…
          </div>
        )}
      </div>

      {result && <CoachCollocationResults result={result} />}
    </div>
  );
}
