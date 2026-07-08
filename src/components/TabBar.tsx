import { APP_TABS, type AppTab } from "../types";
import styles from "./TabBar.module.css";

interface TabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  practiceCount?: number;
}

function TabIcon({ tab }: { tab: AppTab }) {
  switch (tab) {
    case "dashboard":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.icon}>
          <rect x="3" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
          <rect x="11" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
          <rect x="3" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
          <rect x="11" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "learn":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.icon}>
          <path
            d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v9A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M7 4v12M10.5 8h4M10.5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "write":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.icon}>
          <path
            d="M12.5 3.5 16.5 7.5 7 17H3v-4L12.5 3.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M11 5 15 9" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "creative":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.icon}>
          <path
            d="M10 3.5 11.4 8.6 16.5 10 11.4 11.4 10 16.5 8.6 11.4 3.5 10 8.6 8.6 10 3.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "history":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.icon}>
          <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 7v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
  }
}

export function TabBar({ activeTab, onTabChange, practiceCount = 0 }: TabBarProps) {
  return (
    <nav className={styles.sidebar} aria-label="Workspace navigation">
      <div className={styles.sidebarSection}>
        <p className={styles.sidebarLabel}>Workspace</p>
        <ul className={styles.navList} role="tablist">
          {APP_TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <li key={tab.id} className={styles.navItem} role="presentation">
                <button
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  className={`${styles.navButton} ${isActive ? styles.navActive : ""}`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <span className={styles.iconWrap}>
                    <TabIcon tab={tab.id} />
                  </span>
                  <span className={styles.navText}>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {practiceCount > 0 && (
        <div className={styles.sidebarFooter} aria-live="polite">
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Today</p>
            <p className={styles.statValue}>
              {practiceCount} sentence{practiceCount === 1 ? "" : "s"} practiced
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
