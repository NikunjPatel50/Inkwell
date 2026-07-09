"use client";

import { useCallback, useState } from "react";
import { ESSAY_PROMPT } from "../../../constants/coachLevels";
import { ApiError } from "../../../lib/apiClient";
import {
  evaluateCoachEssay,
  isCoachAvailable,
  recordLevelSession,
} from "../../../lib/coachClient";
import type { EssayCoachResult } from "../../../types/coach";
import shared from "../CoachShared.module.css";

interface EssayBuilderLevelProps {
  onProgressUpdate: () => void;
}

export function EssayBuilderLevel({ onProgressUpdate }: EssayBuilderLevelProps) {
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EssayCoachResult | null>(null);

  const handleEvaluate = useCallback(async () => {
    const trimmed = essay.trim();
    if (!trimmed) {
      setError("Write your essay before submitting.");
      return;
    }

    if (!isCoachAvailable()) {
      setError("AI coach is not configured. Connect InsForge or set GROQ API key.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const evaluation = await evaluateCoachEssay(trimmed, ESSAY_PROMPT);
      setResult(evaluation);
      const avgScore = evaluation.criteria.length
        ? Math.round(
            (evaluation.criteria.reduce((sum, c) => sum + c.score, 0) /
              evaluation.criteria.length /
              10) *
              100,
          )
        : 0;
      recordLevelSession("essay-builder", avgScore, {
        weakCollocations: evaluation.weakCollocations,
        vocabulary: evaluation.goodCollocations,
        grammarMistakes: evaluation.grammarMistakes,
      });
      onProgressUpdate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Evaluation failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [essay, onProgressUpdate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--enterprise-section-gap)" }}>
      <div className={shared.card}>
        <p className={shared.sectionHint}>Essay prompt</p>
        <p className={shared.sectionTitle}>{ESSAY_PROMPT}</p>
        <label className={shared.label} htmlFor="essay-input">
          Your essay
        </label>
        <textarea
          id="essay-input"
          className={shared.textarea}
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Write your complete essay here…"
          disabled={loading}
          rows={12}
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
            {loading ? "Coaching…" : "Get teaching feedback"}
          </button>
        </div>
        {loading && (
          <div className={shared.loadingRow} aria-live="polite">
            <span className={shared.spinner} aria-hidden="true" />
            AI coach is reviewing your essay…
          </div>
        )}
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p className={shared.statusBanner}>{result.overallSummary}</p>
          {result.criteria.map((criterion) => (
            <div key={criterion.label} className={shared.criterionCard}>
              <div className={shared.criterionHeader}>
                <p className={shared.sectionTitle}>{criterion.label}</p>
                <span className={shared.criterionScore}>
                  {criterion.score}/{criterion.maxScore}
                </span>
              </div>
              <p className={shared.criterionTeaching}>{criterion.teaching}</p>
              {criterion.goodExamples && criterion.goodExamples.length > 0 && (
                <div className={shared.tagList} style={{ marginTop: "0.45rem" }}>
                  {criterion.goodExamples.map((ex) => (
                    <span key={ex} className={shared.tag}>
                      ✓ {ex}
                    </span>
                  ))}
                </div>
              )}
              {criterion.improvements && criterion.improvements.length > 0 && (
                <div className={shared.tagList} style={{ marginTop: "0.35rem" }}>
                  {criterion.improvements.map((ex) => (
                    <span key={ex} className={shared.tag}>
                      → {ex}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
