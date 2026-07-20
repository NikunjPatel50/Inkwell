import type { WritingDnaCalendarDay } from "../../types/writingDna";
import styles from "./WritingDna.module.css";

interface DnaStreakCalendarProps {
  calendar: WritingDnaCalendarDay[];
  streak: {
    current: number;
    best: number;
    wordsToday: number;
    wordsWeek: number;
    wordsMonth: number;
    wordsYear: number;
  };
}

function cellLevel(words: number): string {
  if (words >= 400) return styles.calendarActive4;
  if (words >= 200) return styles.calendarActive3;
  if (words >= 80) return styles.calendarActive2;
  if (words > 0) return styles.calendarActive1;
  return "";
}

export function DnaStreakCalendar({ calendar, streak }: DnaStreakCalendarProps) {
  const recent = calendar.slice(-28);

  return (
    <div>
      <div className={styles.streakStats}>
        <div className={styles.streakTile}>
          <p className={styles.streakValue}>{streak.current}</p>
          <p className={styles.streakLabel}>Current streak</p>
        </div>
        <div className={styles.streakTile}>
          <p className={styles.streakValue}>{streak.best}</p>
          <p className={styles.streakLabel}>Longest streak</p>
        </div>
        <div className={styles.streakTile}>
          <p className={styles.streakValue}>{streak.wordsToday}</p>
          <p className={styles.streakLabel}>Words today</p>
        </div>
        <div className={styles.streakTile}>
          <p className={styles.streakValue}>{streak.wordsWeek}</p>
          <p className={styles.streakLabel}>Words this week</p>
        </div>
      </div>
      <p className={styles.emptyState}>
        Month: {streak.wordsMonth.toLocaleString()} words · Year: {streak.wordsYear.toLocaleString()} words
      </p>
      <div className={styles.calendarScroll}>
        <div className={styles.calendar} aria-label="Writing activity calendar">
          {recent.map((day) => (
            <div
              key={day.date}
              className={`${styles.calendarCell} ${cellLevel(day.words)}`}
              title={`${day.date}: ${day.words} words`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
