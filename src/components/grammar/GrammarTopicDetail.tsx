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
import { updatePracticedSkill } from "../../lib/adaptiveEngine";
import {
  getGrammarCurriculumSkillId,
  getRelatedGrammarTopics,
  recordGrammarExerciseMiss,
} from "../../lib/grammarAdaptive";
import { fetchPracticedSkills, savePracticedSkill } from "../../lib/learnClient";
import { markGrammarTopicComplete } from "../../lib/learningProgress";
import type {
  FillBlankExercise,
  GrammarExerciseResult,
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
  onSelectTopic?: (topicId: string) => void;
}

type ExercisePhase = "identify" | "fill" | "transform" | "done";

export function GrammarTopicDetail({ topicId, onSelectTopic }: GrammarTopicDetailProps) {
  const topic = useMemo(() => getGrammarTopic(topicId), [topicId]);
  const relatedTopics = useMemo(() => getRelatedGrammarTopics(topicId), [topicId]);
  const [phase, setPhase] = useState<ExercisePhase>("identify");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [identify, setIdentify] = useState<IdentifyItExercise | null>(null);
  const [fillBlank, setFillBlank] = useState<FillBlankExercise | null>(null);
  const [transform, setTransform] = useState<TransformItExercise | null>(null);
  const [results, setResults] = useState<GrammarExerciseResult[]>([]);
  const [exerciseKey, setExerciseKey] = useState(0);

  const seed = useMemo(
    () => `${topicId}-${Date.now()}-${exerciseKey}`,
    [topicId, exerciseKey],
  );

  const loadExercises = useCallback(async (currentTopic: GrammarTopic) => {
    setLoading(true);
    setError(null);
    setPhase("identify");
    setResults([]);

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

  const persistPractice = useCallback(
    async (currentTopic: GrammarTopic, exerciseResults: GrammarExerciseResult[]) => {
      const passedCount = exerciseResults.filter((result) => result.passed).length;
      const averageScore = Math.round((passedCount / exerciseResults.length) * 100);
      const skillId = getGrammarCurriculumSkillId(currentTopic);

      try {
        const practiced = await fetchPracticedSkills();
        const existing = practiced.find((entry) => entry.skillId === skillId);
        const updated = updatePracticedSkill(existing, averageScore);
        updated.skillId = skillId;
        await savePracticedSkill(updated);
      } catch {
        // Non-blocking
      }
    },
    [],
  );

  const handleExerciseComplete = (result: GrammarExerciseResult) => {
    if (!topic) return;

    if (!result.passed) {
      recordGrammarExerciseMiss(topic);
    }

    setResults((prev) => {
      const next = [...prev, result];
      if (next.length === 1) setPhase("fill");
      else if (next.length === 2) setPhase("transform");
      else if (next.length === 3) {
        setPhase("done");
        markGrammarTopicComplete(topicId);
        void persistPractice(topic, next);
      }
      return next;
    });
  };

  const handleRegenerate = () => {
    setExerciseKey((prev) => prev + 1);
  };

  const passedCount = results.filter((result) => result.passed).length;
  const missedResults = results.filter((result) => !result.passed);

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
              key={`identify-${exerciseKey}`}
              exercise={identify}
              onComplete={phase === "identify" ? handleExerciseComplete : () => {}}
            />
          </div>
        )}

        {!loading && !error && fillBlank && results.length >= 1 && (
          <div className={styles.exerciseBlock}>
            <p className={styles.exerciseLabel}>Exercise 2 — Fill in the blank</p>
            <FillBlankExerciseView
              key={`fill-${exerciseKey}`}
              exercise={fillBlank}
              topic={topic}
              onComplete={phase === "fill" ? handleExerciseComplete : () => {}}
            />
          </div>
        )}

        {!loading && !error && transform && results.length >= 2 && (
          <div className={styles.exerciseBlock}>
            <p className={styles.exerciseLabel}>Exercise 3 — Transform it</p>
            <TransformItExerciseView
              key={`transform-${exerciseKey}`}
              exercise={transform}
              topic={topic}
              onComplete={phase === "transform" ? handleExerciseComplete : () => {}}
            />
          </div>
        )}

        {phase === "done" && (
          <div className={styles.summaryPanel}>
            {passedCount === 3 ? (
              <p className={styles.summaryHeadline}>3/3 correct — well done.</p>
            ) : (
              <>
                <p className={styles.summaryHeadline}>
                  {passedCount}/3 — here&apos;s what to review
                </p>
                <ul className={styles.reviewList}>
                  {missedResults.map((result) => (
                    <li key={result.label}>
                      <strong>{result.label}:</strong> {result.reviewNote}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button
              type="button"
              className={styles.optionButton}
              onClick={handleRegenerate}
            >
              Generate new exercises
            </button>
          </div>
        )}
      </section>

      {relatedTopics.length > 0 && (
        <>
          <div className={styles.divider} role="separator" />
          <section className={styles.section} aria-labelledby="grammar-related">
            <p id="grammar-related" className={styles.sectionTitle}>
              Section 4
            </p>
            <h3 className={styles.sectionHeading}>Explore further</h3>
            <div className={styles.relatedList}>
              {relatedTopics.map((related) => (
                <button
                  key={related.id}
                  type="button"
                  className={styles.relatedLink}
                  onClick={() => onSelectTopic?.(related.id)}
                >
                  <span className={styles.relatedName}>{related.name}</span>
                  <span className={styles.relatedTeaser}>{related.teaser}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
