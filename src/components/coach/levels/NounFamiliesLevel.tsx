"use client";

import { useCallback, useState } from "react";
import { pickRandomNoun } from "../../../constants/coachLevels";
import { ApiError } from "../../../lib/apiClient";
import {
  evaluateNounFamilies,
  generateCollocationTopicExamples,
  recordLevelSession,
} from "../../../lib/coachClient";
import type { CollocationEvaluateResult, CollocationTopicExamples } from "../../../types/coach";
import { CoachCollocationResults } from "../CoachCollocationResults";
import { CoachCollocationTopicExamples } from "../CoachCollocationTopicExamples";
import shared from "../CoachShared.module.css";

interface NounFamiliesLevelProps {
  onProgressUpdate: () => void;
}

function parseCollocations(input: string): string[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function NounFamiliesLevel({ onProgressUpdate }: NounFamiliesLevelProps) {
  const [noun, setNoun] = useState(pickRandomNoun);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [examplesLoading, setExamplesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CollocationEvaluateResult | null>(null);
  const [topicExamples, setTopicExamples] = useState<CollocationTopicExamples[] | null>(null);

  const answers = parseCollocations(input);

  const loadTopicExamples = useCallback(
    async (collocations: string[]) => {
      setExamplesLoading(true);
      setError(null);

      try {
        const examples = await generateCollocationTopicExamples(noun, "noun", collocations);
        setTopicExamples(examples);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load essay examples.");
      } finally {
        setExamplesLoading(false);
      }
    },
    [noun],
  );

  const handleEvaluate = useCallback(async () => {
    if (answers.length === 0) {
      setError("Enter at least one verb collocation — one per line.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const evaluation = await evaluateNounFamilies(noun, answers);
      setResult(evaluation);
      setTopicExamples(evaluation.topicExamples ?? null);
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
  }, [answers, noun, onProgressUpdate]);

  const handleShowExamples = useCallback(async () => {
    if (answers.length === 0) {
      setError("Enter at least one verb collocation — one per line.");
      return;
    }

    await loadTopicExamples(answers);
  }, [answers, loadTopicExamples]);

  const handleNewNoun = useCallback(() => {
    setNoun(pickRandomNoun());
    setInput("");
    setResult(null);
    setTopicExamples(null);
    setError(null);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--enterprise-section-gap)" }}>
      <div className={shared.card}>
        <p className={shared.sectionHint}>
          Write verb collocations for this noun — one per line. Then check them or view essay-topic
          example sentences.
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
          disabled={loading || examplesLoading}
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
            disabled={loading || examplesLoading}
          >
            {loading ? "Evaluating…" : "Check answers"}
          </button>
          <button
            type="button"
            className={shared.secondaryButton}
            onClick={() => void handleShowExamples()}
            disabled={loading || examplesLoading}
          >
            {examplesLoading ? "Loading examples…" : "Essay examples"}
          </button>
          <button
            type="button"
            className={shared.secondaryButton}
            onClick={handleNewNoun}
            disabled={loading || examplesLoading}
          >
            New noun
          </button>
        </div>
        {(loading || examplesLoading) && (
          <div className={shared.loadingRow} aria-live="polite">
            <span className={shared.spinner} aria-hidden="true" />
            {loading ? "AI is scoring your noun family…" : "AI is building essay-topic sentences…"}
          </div>
        )}
      </div>

      {topicExamples && <CoachCollocationTopicExamples topicExamples={topicExamples} />}
      {result && <CoachCollocationResults result={result} />}
    </div>
  );
}
