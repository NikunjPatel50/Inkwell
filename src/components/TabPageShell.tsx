import type { ReactNode } from "react";
import { TabBackBar } from "./TabBackBar";
import backStyles from "./TabBackBar.module.css";
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
  bodyClassName?: string;
  fullBleed?: boolean;
  backTo?: {
    label: string;
    onBack: () => void;
  };
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
  bodyClassName,
  fullBleed = false,
  backTo,
}: TabPageShellProps) {
  const hasHeader = Boolean(title || description || eyebrow || action);
  const useBackLayout = Boolean(backTo);

  return (
    <section
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className={`${styles.shell} ${useBackLayout || fullBleed ? styles.shellFullBleed : ""} ${className ?? ""}`}
    >
      <div
        className={`${styles.content} ${useBackLayout ? backStyles.subPageView : ""} ${contentClassName ?? ""}`}
      >
        {backTo && <TabBackBar label={backTo.label} onBack={backTo.onBack} />}
        {useBackLayout ? (
          <div className={`${backStyles.subPageBody} ${bodyClassName ?? ""}`}>
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
        ) : (
          <>
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
          </>
        )}
      </div>
    </section>
  );
}
