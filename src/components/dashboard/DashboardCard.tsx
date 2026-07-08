import type { ReactNode } from "react";
import styles from "./DashboardCard.module.css";

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  compact?: boolean;
}

export function DashboardCard({
  title,
  subtitle,
  badge,
  action,
  children,
  className,
  bodyClassName,
  compact,
}: DashboardCardProps) {
  const hasHeader = Boolean(title || subtitle || badge || action);

  return (
    <article className={`${styles.card} ${compact ? styles.cardCompact : ""} ${className ?? ""}`}>
      {hasHeader && (
        <header className={styles.cardHeader}>
          <div className={styles.cardHeaderText}>
            {title && <h2 className={styles.cardTitle}>{title}</h2>}
            {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          </div>
          <div className={styles.cardHeaderEnd}>
            {badge && <span className={styles.cardBadge}>{badge}</span>}
            {action}
          </div>
        </header>
      )}
      {children !== undefined && (
        <div className={`${styles.cardBody} ${bodyClassName ?? ""}`}>{children}</div>
      )}
    </article>
  );
}
