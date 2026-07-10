"use client";

import { useMemo, useState } from "react";
import { getWordCollection } from "../../constants/wordCollections";
import {
  generateCollectionQuiz,
  isVocabularyLearningAvailable,
} from "../../lib/vocabularyClient";
import { ApiError } from "../../lib/apiClient";
import type { CollectionQuizItem } from "../../types";
import styles from "../exercises/ExerciseShared.module.css";
import learningStyles from "../learning/LearningTab.module.css";

interface CollectionViewProps {
  collectionId: string;
  onSelectWord: (word: string) => void;
}

export function CollectionView({ collectionId, onSelectWord }: CollectionViewProps) {
  const collection = useMemo(() => getWordCollection(collectionId), [collectionId]);
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<CollectionQuizItem[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);

  if (!collection) {
    return <p className={learningStyles.subtitle}>Collection not found.</p>;
  }

  const currentQuestion = quiz?.[quizIndex];

  const startQuiz = async () => {
    setQuizLoading(true);
    setQuizError(null);
    setQuizIndex(0);
    setQuizAnswer("");
    setQuizSubmitted(false);

    try {
      const questions = await generateCollectionQuiz(collection.words.map((entry) => entry.word));
      setQuiz(questions);
    } catch (err) {
      setQuizError(err instanceof ApiError ? err.message : "Could not generate quiz.");
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuizAnswer = () => {
    if (!currentQuestion) return;
    const normalized = quizAnswer.trim().toLowerCase();
    const expected = currentQuestion.answer.trim().toLowerCase();
    setQuizCorrect(normalized === expected);
    setQuizSubmitted(true);
  };

  const nextQuestion = () => {
    if (!quiz) return;
    if (quizIndex < quiz.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setQuizAnswer("");
      setQuizSubmitted(false);
      setQuizCorrect(false);
    }
  };

  return (
    <div className={learningStyles.overview}>
      <header className={learningStyles.header}>
        <h2 className={learningStyles.title}>{collection.title}</h2>
        <p className={learningStyles.subtitle}>{collection.words.length} related words to explore</p>
      </header>

      {isVocabularyLearningAvailable() && (
        <div className={learningStyles.exerciseBlock}>
          <button
            type="button"
            className={learningStyles.optionButton}
            onClick={() => void startQuiz()}
            disabled={quizLoading}
          >
            {quizLoading ? "Generating quiz…" : "Practice this collection"}
          </button>
          {quizError && (
            <p className={learningStyles.error} role="alert">
              {quizError}
            </p>
          )}
        </div>
      )}

      {quiz && currentQuestion && (
        <div className={learningStyles.exerciseBlock}>
          <p className={learningStyles.exerciseLabel}>
            Quiz {quizIndex + 1} of {quiz.length} — {currentQuestion.type}
          </p>
          <p className={styles.stem}>{currentQuestion.question}</p>
          {currentQuestion.options && (
            <div className={learningStyles.optionGrid}>
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={learningStyles.optionButton}
                  onClick={() => setQuizAnswer(option)}
                  disabled={quizSubmitted}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          {!currentQuestion.options && (
            <input
              className={styles.completionInput}
              value={quizAnswer}
              onChange={(event) => setQuizAnswer(event.target.value)}
              disabled={quizSubmitted}
              placeholder="Your answer…"
            />
          )}
          {!quizSubmitted && (
            <button
              type="button"
              className={styles.checkButton}
              onClick={submitQuizAnswer}
              disabled={!quizAnswer.trim()}
            >
              Check
            </button>
          )}
          {quizSubmitted && (
            <div
              className={`${styles.feedback} ${quizCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
            >
              <p>{quizCorrect ? "Correct." : `Answer: ${currentQuestion.answer}`}</p>
              <p className={styles.principle}>{currentQuestion.explanation}</p>
              {quizIndex < quiz.length - 1 ? (
                <button type="button" className={styles.checkButton} onClick={nextQuestion}>
                  Next question
                </button>
              ) : (
                <p>Collection quiz complete.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className={learningStyles.wordList}>
        {collection.words.map((entry) => {
          const isExpanded = expandedWord === entry.word;
          return (
            <article key={entry.word} className={learningStyles.wordListItem}>
              <button
                type="button"
                className={learningStyles.wordListHeader}
                onClick={() => setExpandedWord(isExpanded ? null : entry.word)}
                aria-expanded={isExpanded}
              >
                <span>
                  <strong>{entry.word}</strong>
                  <span className={learningStyles.posBadge}> {entry.partOfSpeech}</span>
                  <p className={learningStyles.subtitle}>{entry.definition}</p>
                </span>
              </button>
              {isExpanded && (
                <div className={learningStyles.wordListExpanded}>
                  <p className={learningStyles.subtitle}>{entry.definition}</p>
                  <button
                    type="button"
                    className={learningStyles.goDeeperButton}
                    onClick={() => onSelectWord(entry.word)}
                  >
                    Deep dive
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
