import { APP_TABS, type AppTab } from "../types";
import styles from "./TabBar.module.css";

interface TabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className={styles.tabBar} aria-label="Inkwell sections">
      <ul className={styles.tabs} role="tablist">
        {APP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <li key={tab.id} className={styles.tabItem} role="presentation">
              <button
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                onClick={() => onTabChange(tab.id)}
              >
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
