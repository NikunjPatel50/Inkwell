import styles from "./WritingDna.module.css";

interface DnaPersonalityBadgeProps {
  personality: string;
  badge: string;
}

export function DnaPersonalityBadge({ personality, badge }: DnaPersonalityBadgeProps) {
  const initials = badge.slice(0, 2).toUpperCase();

  return (
    <div className={styles.personalityBadge}>
      <span className={styles.personalityIcon} aria-hidden="true">
        {initials}
      </span>
      <span>{personality}</span>
      <span>· {badge}</span>
    </div>
  );
}
