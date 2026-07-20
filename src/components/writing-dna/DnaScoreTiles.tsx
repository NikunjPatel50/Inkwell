import styles from "./WritingDna.module.css";

interface DnaScoreTilesProps {
  dnaScore: number;
  grammar: number;
  vocabulary: number;
  clarity: number;
  style: number;
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.scoreTile}>
      <p className={styles.scoreTileLabel}>{label}</p>
      <p className={styles.scoreTileValue}>{value}</p>
    </div>
  );
}

export function DnaScoreTiles({ dnaScore, grammar, vocabulary, clarity, style }: DnaScoreTilesProps) {
  return (
    <div className={styles.scoreTiles}>
      <ScoreTile label="DNA Score" value={dnaScore} />
      <ScoreTile label="Grammar" value={grammar} />
      <ScoreTile label="Vocabulary" value={vocabulary} />
      <ScoreTile label="Clarity" value={clarity} />
      <ScoreTile label="Writing Style" value={style} />
    </div>
  );
}
