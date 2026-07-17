"use client";

import { useCallback, useState } from "react";
import { pickRandomVerb } from "../../../constants/coachLevels";
import { ApiError } from "../../../lib/apiClient";
import {
  evaluateCollocationBuilder,
  generateCollocationTopicExamples,
  recordLevelSession,
} from "../../../lib/coachClient";
import type { CollocationEvaluateResult, CollocationTopicExamples } from "../../../types/coach";
import { CoachCollocationResults } from "../CoachCollocationResults";
import { CoachCollocationTopicExamples } from "../CoachCollocationTopicExamples";
import shared from "../CoachShared.module.css";

interface CollocationBuilderLevelProps {
  onProgressUpdate: () => void;
}

function parseCollocations(input: string): string[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function CollocationBuilderLevel({ onProgressUpdate }: CollocationBuilderLevelProps) {
  const [verb, setVerb] = useState(pickRandomVerb);
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
        const examples = await generateCollocationTopicExamples(verb, "verb", collocations);
        setTopicExamples(examples);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load essay examples.");
      } finally {
        setExamplesLoading(false);
      }
    },
    [verb],
  );

  const handleEvaluate = useCallback(async () => {
    if (answers.length === 0) {
      setError("Enter at least one collocation — one per line.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const evaluation = await evaluateCollocationBuilder(verb, answers);
      setResult(evaluation);
      setTopicExamples(evaluation.topicExamples ?? null);
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
  }, [answers, onProgressUpdate, verb]);

  const handleShowExamples = useCallback(async () => {
    if (answers.length === 0) {
      setError("Enter at least one collocation — one per line.");
      return;
    }

    await loadTopicExamples(answers);
  }, [answers, loadTopicExamples]);

  const handleNewVerb = useCallback(() => {
    setVerb(pickRandomVerb());
    setInput("");
    setResult(null);
    setTopicExamples(null);
    setError(null);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--enterprise-section-gap)" }}>
      <div className={shared.card}>
        <p className={shared.sectionHint}>
          Enter noun collocations for this verb — one per line. Then check them or view essay-topic
          example sentences.
        </p>
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
            {loading ? "Evaluating…" : "Check collocations"}
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
            onClick={handleNewVerb}
            disabled={loading || examplesLoading}
          >
            New verb
          </button>
        </div>
        {(loading || examplesLoading) && (
          <div className={shared.loadingRow} aria-live="polite">
            <span className={shared.spinner} aria-hidden="true" />
            {loading ? "AI is checking your collocations…" : "AI is building essay-topic sentences…"}
          </div>
        )}
      </div>

      {topicExamples && <CoachCollocationTopicExamples topicExamples={topicExamples} />}
      {result && <CoachCollocationResults result={result} />}
    </div>
  );
}
