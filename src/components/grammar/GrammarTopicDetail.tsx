"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getGrammarTopic, type GrammarTopic } from "../../constants/grammarTopics";
import {
  checkFillBlank,
  checkTransformIt,
  generateFillBlankExercise,
  generateIdentifyItExercise,
  generateTransformItExercise,
  isGrammarLearningAvailable,
} from "../../lib/grammarClient";
import { ApiError } from "../../lib/apiClient";
import { markGrammarTopicComplete } from "../../lib/learningProgress";
import type {
  FillBlankExercise,
  IdentifyItExercise,
  TransformItExercise,
} from "../../types";
import { HighlightedSentence } from "../learning/HighlightedSentence";
import { KeyRuleQuote } from "../learning/KeyRuleQuote";
import styles from "../learning/LearningTab.module.css";
import { FillBlankExerciseView } from "./FillBlankExercise";
import { IdentifyItExerciseView } from "./IdentifyItExercise";
import { TransformItExerciseView } from "./TransformItExercise";

interface GrammarTopicDetailProps {
  topicId: string;
}

type ExercisePhase = "identify" | "fill" | "transform" | "done";

export function GrammarTopicDetail({ topicId }: GrammarTopicDetailProps) {
  const topic = useMemo(() => getGrammarTopic(topicId), [topicId]);
  const [phase, setPhase] = useState<ExercisePhase>("identify");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [identify, setIdentify] = useState<IdentifyItExercise | null>(null);
  const [fillBlank, setFillBlank] = useState<FillBlankExercise | null>(null);
  const [transform, setTransform] = useState<TransformItExercise | null>(null);
  const [scores, setScores] = useState<number[]>([]);

  const seed = useMemo(() => `${topicId}-${Date.now()}`, [topicId]);

  const loadExercises = useCallback(async (currentTopic: GrammarTopic) => {
    setLoading(true);
    setError(null);
    setPhase("identify");
    setScores([]);

    try {
      const [idEx, fillEx, transEx] = await Promise.all([
        generateIdentifyItExercise(currentTopic, seed),
        generateFillBlankExercise(currentTopic, seed),
        generateTransformItExercise(currentTopic, seed),
      ]);
      setIdentify(idEx);
      setFillBlank(fillEx);
      setTransform(transEx);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load exercises.");
    } finally {
      setLoading(false);
    }
  }, [seed]);

  useEffect(() => {
    if (topic) void loadExercises(topic);
  }, [topic, loadExercises]);

  const handleExerciseComplete = (score: number) => {
    setScores((prev) => {
      const next = [...prev, score];
      if (next.length === 1) setPhase("fill");
      else if (next.length === 2) setPhase("transform");
      else if (next.length === 3) {
        setPhase("done");
        markGrammarTopicComplete(topicId);
      }
      return next;
    });
  };

  if (!topic) {
    return <p className={styles.subtitle}>Topic not found.</p>;
  }

  return (
    <article className={styles.detail}>
      <header>
        <h2 className={styles.title}>{topic.name}</h2>
        <p className={styles.subtitle}>{topic.teaser}</p>
      </header>

      <section className={styles.section} aria-labelledby="grammar-explanation">
        <p id="grammar-explanation" className={styles.sectionTitle}>
          Section 1
        </p>
        <h3 className={styles.sectionHeading}>The explanation</h3>
        <div className={styles.explanation}>
          {topic.explanation.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <KeyRuleQuote>{topic.keyRule}</KeyRuleQuote>
      </section>

      <div className={styles.divider} role="separator" />

      <section className={styles.section} aria-labelledby="grammar-examples">
        <p id="grammar-examples" className={styles.sectionTitle}>
          Section 2
        </p>
        <h3 className={styles.sectionHeading}>See it in action</h3>
        <div className={styles.exampleList}>
          {topic.examples.map((example, i) => (
            <HighlightedSentence key={i} example={example} />
          ))}
        </div>
      </section>

      <div className={styles.divider} role="separator" />

      <section className={styles.section} aria-labelledby="grammar-exercises">
        <p id="grammar-exercises" className={styles.sectionTitle}>
          Section 3
        </p>
        <h3 className={styles.sectionHeading}>Interactive exercises</h3>

        {loading && <p className={styles.loading}>Generating fresh exercises…</p>}

        {!isGrammarLearningAvailable() && !loading && (
          <p className={styles.subtitle}>
            Exercise generation is not configured. Connect InsForge or add a GROQ API key.
          </p>
        )}

        {error && (
          <div className={styles.exerciseBlock}>
            <p className={styles.error} role="alert">
              {error}
            </p>
            <button
              type="button"
              className={styles.optionButton}
              onClick={() => void loadExercises(topic)}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && identify && (
          <div className={styles.exerciseBlock}>
            <p className={styles.exerciseLabel}>Exercise 1 — Identify it</p>
            <IdentifyItExerciseView
              exercise={identify}
              onComplete={phase === "identify" ? handleExerciseComplete : () => {}}
            />
          </div>
        )}

        {!loading && !error && fillBlank && scores.length >= 1 && (
          <div className={styles.exerciseBlock}>
            <p className={styles.exerciseLabel}>Exercise 2 — Fill in the blank</p>
            <FillBlankExerciseView
              exercise={fillBlank}
              topic={topic}
              onComplete={phase === "fill" ? handleExerciseComplete : () => {}}
            />
          </div>
        )}

        {!loading && !error && transform && scores.length >= 2 && (
          <div className={styles.exerciseBlock}>
            <p className={styles.exerciseLabel}>Exercise 3 — Transform it</p>
            <TransformItExerciseView
              exercise={transform}
              topic={topic}
              onComplete={phase === "transform" ? handleExerciseComplete : () => {}}
            />
          </div>
        )}

        {phase === "done" && (
          <p className={styles.subtitle}>
            All three exercises complete — well done. This topic is marked finished for this session.
          </p>
        )}
      </section>
    </article>
  );
}
