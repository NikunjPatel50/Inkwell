"use client";

import { useCallback, useState } from "react";
import { ApiError } from "../../lib/apiClient";
import {
  combineCoachParagraph,
  getStepFeedback,
  isCoachAvailable,
  recordLevelSession,
  saveLevelDraft,
} from "../../lib/coachClient";
import type { CoachLevelId, CombineParagraphResult, StepFeedbackResult } from "../../types/coach";
import { CoachProgressBar } from "./CoachProgressBar";
import shared from "./CoachShared.module.css";

export interface CoachStepDefinition {
  id: string;
  question: string;
  placeholder?: string;
  prompt?: string;
}

interface CoachStepFlowProps {
  levelId: CoachLevelId;
  title: string;
  steps: readonly CoachStepDefinition[];
  initialStep?: number;
  initialData?: Record<string, string>;
  onProgressUpdate: () => void;
}

export function CoachStepFlow({
  levelId,
  title,
  steps,
  initialStep = 0,
  initialData = {},
  onProgressUpdate,
}: CoachStepFlowProps) {
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [answers, setAnswers] = useState<Record<string, string>>(initialData);
  const [currentInput, setCurrentInput] = useState(initialData[steps[initialStep]?.id] ?? "");
  const [feedback, setFeedback] = useState<StepFeedbackResult | null>(null);
  const [paragraph, setParagraph] = useState<CombineParagraphResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [combining, setCombining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = steps[stepIndex];
  const isLastStep = stepIndex >= steps.length - 1;

  const persistDraft = useCallback(
    (nextStep: number, data: Record<string, string>) => {
      saveLevelDraft(levelId, nextStep, data);
      onProgressUpdate();
    },
    [levelId, onProgressUpdate],
  );

  const handleContinue = useCallback(async () => {
    const trimmed = currentInput.trim();
    if (!trimmed) {
      setError("Write your answer before continuing.");
      return;
    }

    if (!isCoachAvailable()) {
      setError("AI coach is not configured. Connect InsForge or set GROQ API key.");
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null);

    const nextAnswers = { ...answers, [step.id]: trimmed };

    try {
      const stepFeedback = await getStepFeedback(
        `Step ${stepIndex + 1}`,
        step.question,
        trimmed,
        title,
      );
      setFeedback(stepFeedback);
      setAnswers(nextAnswers);
      persistDraft(stepIndex, nextAnswers);

      if (!stepFeedback.passed) {
        return;
      }

      if (isLastStep) {
        setCombining(true);
        const combined = await combineCoachParagraph(
          steps.map((s) => ({ label: s.id, answer: nextAnswers[s.id] ?? "" })),
        );
        setParagraph(combined);
        recordLevelSession(levelId, 100);
        saveLevelDraft(levelId, null, {});
        onProgressUpdate();
      } else {
        const nextIndex = stepIndex + 1;
        setStepIndex(nextIndex);
        setCurrentInput(nextAnswers[steps[nextIndex].id] ?? "");
        persistDraft(nextIndex, nextAnswers);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not get feedback. Try again.");
    } finally {
      setLoading(false);
      setCombining(false);
    }
  }, [
    answers,
    currentInput,
    isLastStep,
    levelId,
    onProgressUpdate,
    persistDraft,
    step,
    stepIndex,
    steps,
    title,
  ]);

  const handleBack = useCallback(() => {
    if (stepIndex === 0) return;
    const prevIndex = stepIndex - 1;
    setStepIndex(prevIndex);
    setCurrentInput(answers[steps[prevIndex].id] ?? "");
    setFeedback(null);
    setParagraph(null);
    setError(null);
  }, [answers, stepIndex, steps]);

  if (paragraph) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--enterprise-section-gap)" }}>
        <div className={shared.cardAccent}>
          <p className={shared.sectionTitle}>Your polished paragraph</p>
          <p className={shared.paragraphResult}>{paragraph.paragraph}</p>
          {paragraph.techniques.length > 0 && (
            <ul className={shared.feedbackList}>
              {paragraph.techniques.map((tip) => (
                <li key={tip} className={`${shared.feedbackItem} ${shared.feedbackCorrect}`}>
                  <span className={shared.feedbackMark} aria-hidden="true">
                    ✓
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--enterprise-section-gap)" }}>
      <CoachProgressBar
        value={stepIndex + 1}
        max={steps.length}
        label={`Step ${stepIndex + 1} of ${steps.length}`}
      />

      <div className={shared.card}>
        {step.prompt && <p className={shared.sectionHint}>{step.prompt}</p>}
        <p className={shared.sectionTitle}>{step.question}</p>
        <textarea
          className={shared.textarea}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder={step.placeholder}
          disabled={loading || combining}
          rows={5}
        />

        {feedback && (
          <div className={feedback.passed ? shared.statusBanner : shared.errorBanner} role="status">
            {feedback.feedback}
            {feedback.suggestion && (
              <p style={{ marginTop: "0.45rem", fontSize: "0.78rem" }}>
                <strong>Suggestion:</strong> {feedback.suggestion}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className={shared.errorBanner} role="alert">
            {error}
          </div>
        )}

        <div className={shared.actions}>
          {stepIndex > 0 && (
            <button type="button" className={shared.secondaryButton} onClick={handleBack} disabled={loading}>
              Back
            </button>
          )}
          <button
            type="button"
            className={shared.primaryButton}
            onClick={() => void handleContinue()}
            disabled={loading || combining}
          >
            {loading || combining
              ? "Please wait…"
              : isLastStep
                ? "Finish & build paragraph"
                : feedback?.passed
                  ? "Next step"
                  : "Check & continue"}
          </button>
        </div>

        {(loading || combining) && (
          <div className={shared.loadingRow} aria-live="polite">
            <span className={shared.spinner} aria-hidden="true" />
            {combining ? "Building your paragraph…" : "Coach is reviewing your answer…"}
          </div>
        )}
      </div>
    </div>
  );
}
