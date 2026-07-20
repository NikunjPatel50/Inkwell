import type { WritingDnaGoal } from "../../types/writingDna";
import { GOAL_PRESETS } from "../../types/writingDna";
import styles from "./WritingDna.module.css";

interface DnaGoalsPanelProps {
  goals: WritingDnaGoal[];
  onAddGoal: (goal: { goalType: string; title: string; targetValue: number; unit?: string }) => Promise<unknown>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

function goalProgress(goal: WritingDnaGoal): number {
  if (goal.target_value <= 0) return 0;
  if (goal.goal_type === "passive_voice") {
    return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
  }
  return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
}

export function DnaGoalsPanel({ goals, onAddGoal, onDeleteGoal }: DnaGoalsPanelProps) {
  return (
    <div>
      <div className={styles.presetRow}>
        {GOAL_PRESETS.map((preset) => (
          <button
            key={preset.goalType}
            type="button"
            className={styles.presetBtn}
            onClick={() =>
              void onAddGoal({
                goalType: preset.goalType,
                title: preset.title,
                targetValue: preset.targetValue,
                unit: preset.unit,
              })
            }
          >
            + {preset.title}
          </button>
        ))}
      </div>
      {goals.length === 0 ? (
        <p className={styles.emptyState}>Set a goal to track daily progress automatically.</p>
      ) : (
        <div className={styles.goalList}>
          {goals.map((goal) => (
            <div key={goal.id} className={styles.goalRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className={styles.goalTitle}>
                  {goal.title} {goal.completed ? "✓" : ""}
                </p>
                <p className={styles.goalProgress}>
                  {goal.current_value} / {goal.target_value} {goal.unit}
                </p>
                <div className={styles.goalBar}>
                  <div className={styles.goalFill} style={{ width: `${goalProgress(goal)}%` }} />
                </div>
              </div>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => void onDeleteGoal(goal.id)}
                aria-label={`Delete goal ${goal.title}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
