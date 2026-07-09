import { useCallback, useEffect, useState } from "react";
import {
  EXERCISE_TYPE_LABELS,
  getSkillById,
  randomVarietySeed,
  TIER_INFO,
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

  const tierInfo = TIER_INFO.find((tier) => tier.tier === skill.tier);
  const completedCount = localPracticed?.exercisesCompleted ?? 0;
  const averageScore = localPracticed?.averageScore ?? 0;
  const progressPct = Math.min(100, completedCount * 10);

  return (
    <div className={styles.view}>
      <div className={styles.mainColumn}>
        <section className={styles.skillCard} aria-labelledby="skill-title">
          <div className={styles.skillCardHeader}>
            <p className={styles.skillEyebrow}>Curriculum skill</p>
            <span className={`${styles.tierBadge} ${styles[`tier${skill.tier}`]}`}>
              Tier {skill.tier}
              {tierInfo ? ` · ${tierInfo.name}` : ""}
            </span>
          </div>
          <h2 id="skill-title" className={styles.skillTitle}>
            {skill.name}
          </h2>
          <p className={styles.introduction}>{skill.introduction}</p>
        </section>

        <section className={styles.exerciseCard} aria-labelledby="exercise-heading">
          <header className={styles.exerciseCardHeader}>
            <div className={styles.exerciseCardHeading}>
              <p className={styles.exerciseEyebrow} id="exercise-heading">
                {EXERCISE_TYPE_LABELS[exerciseType]}
              </p>
              <h3 className={styles.exerciseTitle}>Exercise {exerciseIndex + 1}</h3>
            </div>
            <span className={styles.exerciseBadge}>Adaptive practice</span>
          </header>

          <div className={styles.exerciseCardBody}>
            {!isLearnAvailable() && (
              <div className={styles.errorBanner} role="alert">
                Connect InsForge or add NEXT_PUBLIC_GROQ_API_KEY to generate exercises.
              </div>
            )}

            {loading && (
              <div className={styles.loadingRow} aria-live="polite">
                <span className={styles.spinner} aria-hidden="true" />
                <span>Generating your next exercise…</span>
              </div>
            )}

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
          </div>

          {exerciseDone && (
            <footer className={styles.exerciseCardFooter}>
              <button type="button" className={styles.nextButton} onClick={handleNextExercise}>
                Next exercise
              </button>
            </footer>
          )}
        </section>
      </div>

      <aside className={styles.sidebar} aria-label="Skill progress">
        <section className={styles.statsCard}>
          <h3 className={styles.statsTitle}>Your progress</h3>
          <div className={styles.statGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{completedCount}</span>
              <span className={styles.statLabel}>
                Exercise{completedCount === 1 ? "" : "s"} done
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {completedCount > 0 ? `${Math.round(averageScore)}%` : "—"}
              </span>
              <span className={styles.statLabel}>Average score</span>
            </div>
          </div>
          <div className={styles.progressBlock}>
            <div className={styles.progressMeta}>
              <span className={styles.progressLabel}>Skill mastery</span>
              <span className={styles.progressPct}>{progressPct}%</span>
            </div>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Skill mastery progress"
            >
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </section>

        <section className={styles.actionsCard}>
          <p className={styles.actionsHint}>
            Switch skills anytime — your progress is saved for this skill.
          </p>
          <button type="button" className={styles.changeSkillButton} onClick={onBack}>
            Try a different skill
          </button>
        </section>
      </aside>
    </div>
  );
}
