import type { CollocationEvaluateResult } from "../../types/coach";
import shared from "./CoachShared.module.css";

interface CoachCollocationResultsProps {
  result: CollocationEvaluateResult;
}

export function CoachCollocationResults({ result }: CoachCollocationResultsProps) {
  return (
    <div className={shared.card}>
      <div className={shared.actions}>
        <span className={shared.scorePill}>
          {result.correctCount} / {result.totalCount}
        </span>
      </div>

      <ul className={shared.feedbackList}>
        {result.results.map((item) => (
          <li
            key={item.phrase}
            className={`${shared.feedbackItem} ${item.correct ? shared.feedbackCorrect : shared.feedbackIncorrect}`}
          >
            <span className={shared.feedbackMark} aria-hidden="true">
              {item.correct ? "✓" : "✗"}
            </span>
            <span>
              <strong>{item.phrase}</strong>
              {item.explanation ? ` — ${item.explanation}` : ""}
            </span>
          </li>
        ))}
      </ul>

      {result.missingCollocations.length > 0 && (
        <>
          <p className={shared.sectionTitle}>Missing collocations</p>
          <div className={shared.tagList}>
            {result.missingCollocations.map((phrase) => (
              <span key={phrase} className={shared.tag}>
                {phrase}
              </span>
            ))}
          </div>
        </>
      )}

      {result.teachingSummary && (
        <p className={shared.statusBanner}>{result.teachingSummary}</p>
      )}
    </div>
  );
}
