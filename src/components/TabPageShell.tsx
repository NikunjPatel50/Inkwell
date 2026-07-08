import type { ReactNode } from "react";
import styles from "./TabPageShell.module.css";

interface TabPageShellProps {
  id: string;
  labelledBy: string;
  title?: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  fullBleed?: boolean;
}

export function TabPageShell({
  id,
  labelledBy,
  title,
  description,
  eyebrow,
  action,
  children,
  className,
  contentClassName,
  fullBleed = false,
}: TabPageShellProps) {
  const hasHeader = Boolean(title || description || eyebrow || action);

  return (
    <section
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className={`${styles.shell} ${fullBleed ? styles.shellFullBleed : ""} ${className ?? ""}`}
    >
      <div className={`${styles.content} ${contentClassName ?? ""}`}>
        {hasHeader && (
          <header className={styles.header}>
            <div className={styles.headerText}>
              {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
              {title && <h2 className={styles.title}>{title}</h2>}
              {description && <p className={styles.description}>{description}</p>}
            </div>
            {action && <div className={styles.headerAction}>{action}</div>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
