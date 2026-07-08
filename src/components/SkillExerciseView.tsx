import { useCallback, useEffect, useState } from "react";
import {
  EXERCISE_TYPE_LABELS,
  getSkillById,
  randomVarietySeed,
} from "../constants/curriculum";
import { getNextExerciseType, updatePracticedSkill } from "../lib/adaptiveEngine";
import { ApiError } from "../lib/apiClient";
import {
  generateBuildItExercise,
  generateCompleteItExercise,
  generateSpotTheErrorExercise,
  isLearnAvailable,
  savePracticedSkill,
} from "../lib/learnClient";
import type {
  BuildItExercise,
  CompleteItExercise,
  ExerciseType,
  PracticedSkill,
  SpotTheErrorExercise,
} from "../types";
import { BuildItExerciseView } from "./exercises/BuildItExercise";
import { CompleteItExerciseView } from "./exercises/CompleteItExercise";
import { SpotTheErrorExerciseView } from "./exercises/SpotTheErrorExercise";
import styles from "./SkillExerciseView.module.css";

interface SkillExerciseViewProps {
  skillId: string;
  practiced: PracticedSkill[];
  onPracticedUpdate: (record: PracticedSkill) => void;
  onBack: () => void;
}

type ExerciseData =
  | { type: "build-it"; data: BuildItExercise }
  | { type: "spot-error"; data: SpotTheErrorExercise }
  | { type: "complete-it"; data: CompleteItExercise };

export function SkillExerciseView({
  skillId,
  practiced,
  onPracticedUpdate,
  onBack,
}: SkillExerciseViewProps) {
  const skill = getSkillById(skillId);
  const existing = practiced.find((p) => p.skillId === skillId);

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [weakTypes, setWeakTypes] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [localPracticed, setLocalPracticed] = useState<PracticedSkill | undefined>(existing);

  const exerciseType = getNextExerciseType(exerciseIndex, weakTypes);

  const loadExercise = useCallback(async () => {
    if (!skill) return;

    setLoading(true);
    setLoadError(null);
    setExercise(null);
    setExerciseDone(false);

    const seed = randomVarietySeed();
    const type = getNextExerciseType(exerciseIndex, weakTypes);

    try {
      if (type === "build-it") {
        const data = await generateBuildItExercise(skill, seed);
        setExercise({ type, data });
      } else if (type === "spot-error") {
        const data = await generateSpotTheErrorExercise(skill, seed);
        setExercise({ type, data });
      } else {
        const data = await generateCompleteItExercise(skill, seed);
        setExercise({ type, data });
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Couldn't load this exercise — try again.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [skill, exerciseIndex, weakTypes]);

  useEffect(() => {
    void loadExercise();
  }, [loadExercise]);

  useEffect(() => {
    setLocalPracticed(existing);
  }, [existing]);

  const handleExerciseComplete = async (score: number) => {
    if (!skill) return;
    setExerciseDone(true);

    if (score < 70 && exercise) {
      setWeakTypes((prev) =>
        prev.includes(exercise.type) ? prev : [...prev, exercise.type],
      );
    }

    const updated = updatePracticedSkill(
      { ...(localPracticed ?? { skillId, exercisesCompleted: 0, averageScore: 0 }), skillId },
      score,
    );
    setLocalPracticed(updated);
    onPracticedUpdate(updated);
    await savePracticedSkill(updated);
  };

  const handleNextExercise = () => {
    setExerciseIndex((i) => i + 1);
  };

  if (!skill) {
    return (
      <p className={styles.error} role="alert">
        Skill not found.
      </p>
    );
  }

  const completedCount = localPracticed?.exercisesCompleted ?? 0;

  return (
    <div className={styles.view}>
      <button type="button" className={styles.backLink} onClick={onBack}>
        ← Back to curriculum
      </button>

      <header className={styles.header}>
        <h2 className={styles.skillTitle}>{skill.name}</h2>
        <span className={`${styles.tierBadge} ${styles[`tier${skill.tier}`]}`}>
          Tier {skill.tier}
        </span>
      </header>

      <p className={styles.introduction}>{skill.introduction}</p>

      {!isLearnAvailable() && (
        <p className={styles.error} role="alert">
          Connect InsForge or add NEXT_PUBLIC_GROQ_API_KEY to generate exercises.
        </p>
      )}

      <p className={styles.exerciseEyebrow}>{EXERCISE_TYPE_LABELS[exerciseType]}</p>

      {loading && <p className={styles.loading}>Loading exercise…</p>}

      {loadError && (
        <div className={styles.retryBox}>
          <p className={styles.error} role="alert">
            {loadError}
          </p>
          <button type="button" className={styles.retryButton} onClick={() => void loadExercise()}>
            Try again
          </button>
        </div>
      )}

      {exercise && !loading && !loadError && (
        <>
          {exercise.type === "build-it" && (
            <BuildItExerciseView
              key={`build-${exerciseIndex}`}
              exercise={exercise.data}
              onComplete={handleExerciseComplete}
            />
          )}
          {exercise.type === "spot-error" && (
            <SpotTheErrorExerciseView
              key={`spot-${exerciseIndex}`}
              exercise={exercise.data}
              onComplete={handleExerciseComplete}
            />
          )}
          {exercise.type === "complete-it" && (
            <CompleteItExerciseView
              key={`complete-${exerciseIndex}`}
              exercise={exercise.data}
              skill={skill}
              onComplete={handleExerciseComplete}
            />
          )}
        </>
      )}

      {exerciseDone && (
        <button type="button" className={styles.nextButton} onClick={handleNextExercise}>
          Next exercise
        </button>
      )}

      <p className={styles.progressNote}>
        {completedCount} exercise{completedCount === 1 ? "" : "s"} completed for this skill
      </p>

      <button type="button" className={styles.altLink} onClick={onBack}>
        Try a different skill
      </button>
    </div>
  );
}
