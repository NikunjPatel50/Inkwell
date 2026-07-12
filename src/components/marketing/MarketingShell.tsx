import type { ReactNode } from "react";
import Link from "next/link";
import { AppBrand } from "@/components/AppBrand";
import { MarketingBodyClass } from "@/components/landing/MarketingBodyClass";
import { MARKETING_NAV } from "@/lib/seo/publicRoutes";
import styles from "./MarketingPage.module.css";

interface MarketingShellProps {
  children: ReactNode;
  breadcrumbs?: { label: string; href: string }[];
}

export function MarketingShell({ children, breadcrumbs }: MarketingShellProps) {
  return (
    <div className={styles.page}>
      <MarketingBodyClass />
      <header className={styles.header}>
        <AppBrand size="header" href="/" />
        <nav className={styles.nav} aria-label="Features">
          {MARKETING_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <Link href="/login" className={styles.navLink}>
            Sign in
          </Link>
          <Link href="/login" className={styles.primaryBtn}>
            Get started free
          </Link>
        </div>
      </header>

      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href} className={styles.breadcrumbItem}>
              {index > 0 ? <span className={styles.breadcrumbSep}>/</span> : null}
              {index === breadcrumbs.length - 1 ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <Link href={crumb.href}>{crumb.label}</Link>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <AppBrand size="header" href="/" />
            <p className={styles.footerText}>
              English writing practice that teaches in context.
            </p>
          </div>
          <div>
            <p className={styles.footerHeading}>Features</p>
            <div className={styles.footerLinks}>
              {MARKETING_NAV.map((item) => (
                <Link key={item.href} href={item.href} className={styles.footerLink}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className={styles.footerHeading}>Exam prep</p>
            <div className={styles.footerLinks}>
              <Link href="/ielts-writing-practice" className={styles.footerLink}>
                IELTS writing
              </Link>
              <Link href="/pte-writing-practice" className={styles.footerLink}>
                PTE writing
              </Link>
              <Link href="/login" className={styles.footerLink}>
                Get started free
              </Link>
            </div>
          </div>
        </div>
        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} Wrytesmart. Built for learners at every level.
        </p>
      </footer>
    </div>
  );
}
