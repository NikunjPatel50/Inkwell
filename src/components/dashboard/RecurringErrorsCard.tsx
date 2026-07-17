import Link from "next/link";
import { useEffect, useState } from "react";
import { BetaProNoticeButton } from "../marketing/BetaProNoticeButton";
import type { RecurringErrorPattern } from "../../lib/errorPatternClient";
import { fetchRecurringErrorPatterns } from "../../lib/errorPatternClient";
import { userCanAccessPatternTracking } from "../../lib/premium";
import type { AuthUser } from "../../hooks/useAuth";
import { DashboardCard } from "./DashboardCard";
import styles from "./RecurringErrorsCard.module.css";

interface RecurringErrorsCardProps {
  user: AuthUser | null;
  refreshKey: number;
}

export function RecurringErrorsCard({ user, refreshKey }: RecurringErrorsCardProps) {
  const [patterns, setPatterns] = useState<RecurringErrorPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPremium = userCanAccessPatternTracking(user);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!isPremium) {
      setPatterns([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchRecurringErrorPatterns(user);
        if (cancelled) return;
        setPatterns(response?.patterns ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load error patterns.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isPremium, refreshKey, user]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardCard
      title="Your recurring errors"
      subtitle="Write & Coach patterns from the last 30 days"
      className={styles.spanFull}
    >
      {!isPremium ? (
        <div className={styles.lockedWrap}>
          <div className={styles.lockedPreview} aria-hidden="true">
            <div className={styles.lockedRow} />
            <div className={styles.lockedRow} />
            <div className={styles.lockedRow} />
          </div>
          <div className={styles.lockedOverlay}>
            <p className={styles.lockedTitle}>Pro feature</p>
            <p className={styles.lockedText}>
              Track recurring grammar and writing mistakes across Write and Coach sessions.
            </p>
            <BetaProNoticeButton className={styles.upgradeBtn} />
          </div>
        </div>
      ) : loading ? (
        <p className={styles.muted}>Loading your patterns…</p>
      ) : error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : patterns.length === 0 ? (
        <p className={styles.muted}>
          Analyse a few pieces of writing in Write or Coach to see your patterns here.
        </p>
      ) : (
        <ol className={styles.patternList}>
          {patterns.map((pattern) => (
            <li key={pattern.category} className={styles.patternItem}>
              <div className={styles.patternHeader}>
                <span className={styles.patternRank}>{pattern.label}</span>
                <span className={styles.patternCount}>{pattern.count}×</span>
              </div>
              <p className={styles.patternDescription}>{pattern.description}</p>
              <blockquote className={styles.patternExample}>
                &ldquo;{pattern.recentExample}&rdquo;
              </blockquote>
              <Link href={`/grammar/${pattern.grammarSlug}`} className={styles.grammarLink}>
                Open grammar lesson →
              </Link>
            </li>
          ))}
        </ol>
      )}
    </DashboardCard>
  );
}
