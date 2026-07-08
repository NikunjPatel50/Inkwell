import Link from "next/link";
import { APP_TABS, type AppTab } from "../types";
import type { Theme } from "../lib/theme";
import type { AuthUser } from "../hooks/useAuth";
import { isAdminEmail } from "../lib/admin";
import { AppBrand } from "./AppBrand";
import { ThemeToggle } from "./ThemeToggle";
import { SignInButton, UserMenu } from "./UserMenu";
import styles from "./AppTopBar.module.css";

interface AppTopBarProps {
  activeTab: AppTab;
  user: AuthUser | null;
  theme: Theme;
  onNavigateHome: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onPasswordChanged?: () => void;
  onToggleTheme: () => void;
  showAdminButton?: boolean;
}

function BreadcrumbIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.breadcrumbIcon}>
      <path
        d="M6 4.5 10 8l-4 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppTopBar({
  activeTab,
  user,
  theme,
  onNavigateHome,
  onSignIn,
  onSignOut,
  onPasswordChanged,
  onToggleTheme,
  showAdminButton = true,
}: AppTopBarProps) {
  const activeLabel = APP_TABS.find((tab) => tab.id === activeTab)?.label ?? "Dashboard";
  const showAdmin = showAdminButton && user && isAdminEmail(user.email);

  return (
    <header className={styles.topBar}>
      <div className={styles.leading}>
        <AppBrand size="header" onNavigate={onNavigateHome} />
      </div>

      <div className={styles.center} aria-label="Current location">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <span className={styles.breadcrumbRoot}>Workspace</span>
          <BreadcrumbIcon />
          <span className={styles.breadcrumbCurrent}>{activeLabel}</span>
        </nav>
      </div>

      <div className={styles.trailing}>
        <div className={styles.actionCluster} role="group" aria-label="Account and display">
          {showAdmin && (
            <Link href="/admin" className={styles.adminButton}>
              Admin
            </Link>
          )}
          {user ? (
            <UserMenu
              user={user}
              onSignOut={onSignOut}
              onPasswordChanged={onPasswordChanged}
              variant="toolbar"
            />
          ) : (
            <SignInButton onClick={onSignIn} variant="toolbar" />
          )}
          <div className={styles.actionDivider} aria-hidden="true" />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="toolbar" />
        </div>
      </div>
    </header>
  );
}
