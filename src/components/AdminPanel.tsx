"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppTopBar } from "./AppTopBar";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { isAdminEmail } from "../lib/admin";
import { getClientAccessToken } from "../lib/authToken";
import styles from "./AdminPanel.module.css";

interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: string;
  isProjectAdmin: boolean;
}

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function AdminPanel() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const isAdmin = isAdminEmail(user?.email);

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setLoadError(null);

    const token = getClientAccessToken();
    if (!token) {
      setLoadError("Your session expired. Sign in again to open the admin panel.");
      setIsLoadingUsers(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await response.json()) as {
        users?: AdminUserRow[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load users.");
      }

      setUsers(payload.users ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load users.");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
      return;
    }

    void loadUsers();
  }, [isAdmin, loadUsers, loading, router, user]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/login");
  }, [router, signOut]);

  if (loading || !user || !isAdmin) {
    return null;
  }

  const verifiedCount = users.filter((row) => row.emailVerified).length;
  const pendingCount = users.length - verifiedCount;

  return (
    <div className={styles.page}>
      <AppTopBar
        activeTab="dashboard"
        user={user}
        theme={theme}
        onNavigateHome={() => router.push("/")}
        onSignIn={() => router.push("/login")}
        onSignOut={() => void handleSignOut()}
        onToggleTheme={toggleTheme}
        showAdminButton={false}
      />

      <main className={styles.main}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Administration</p>
              <h1 className={styles.title}>User management</h1>
              <p className={styles.subtitle}>
                Review accounts created through Wrytesmart sign-up and verification status.
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.refreshButton}
                onClick={() => void loadUsers()}
                disabled={isLoadingUsers}
              >
                {isLoadingUsers ? "Refreshing…" : "Refresh"}
              </button>
              <Link href="/" className={styles.backLink}>
                Back to workspace
              </Link>
            </div>
          </header>

          <section className={styles.stats} aria-label="User summary">
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Total users</p>
              <p className={styles.statValue}>{users.length}</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Verified</p>
              <p className={styles.statValue}>{verifiedCount}</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Pending verification</p>
              <p className={styles.statValue}>{pendingCount}</p>
            </article>
          </section>

          {loadError && (
            <div className={styles.errorBanner} role="alert">
              {loadError}
            </div>
          )}

          <section className={styles.tableCard} aria-labelledby="admin-users-title">
            <div className={styles.tableHeader}>
              <h2 id="admin-users-title" className={styles.tableTitle}>
                Registered users
              </h2>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Email</th>
                    <th scope="col">Name</th>
                    <th scope="col">Verified</th>
                    <th scope="col">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyCell}>
                        Loading users…
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyCell}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((row) => (
                      <tr key={row.id}>
                        <td className={styles.emailCell}>{row.email}</td>
                        <td>{row.name ?? "—"}</td>
                        <td>
                          <span
                            className={
                              row.emailVerified ? styles.badgeVerified : styles.badgePending
                            }
                          >
                            {row.emailVerified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td>{formatDate(row.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
