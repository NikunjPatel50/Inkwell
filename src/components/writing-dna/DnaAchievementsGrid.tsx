import type { WritingDnaAchievement } from "../../types/writingDna";
import styles from "./WritingDna.module.css";

interface DnaAchievementsGridProps {
  achievements: WritingDnaAchievement[];
}

export function DnaAchievementsGrid({ achievements }: DnaAchievementsGridProps) {
  return (
    <div className={styles.achievementGrid}>
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`${styles.achievementCard} ${achievement.unlocked ? styles.achievementUnlocked : ""}`}
        >
          <p className={styles.achievementTitle}>{achievement.title}</p>
          <p className={styles.achievementDesc}>{achievement.description}</p>
        </div>
      ))}
    </div>
  );
}
