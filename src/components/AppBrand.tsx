import Link from "next/link";
import styles from "./AppBrand.module.css";

interface AppBrandProps {
  size?: "default" | "header";
  href?: string | false;
  onNavigate?: () => void;
}

export function AppBrand({
  size = "default",
  href = "/",
  onNavigate,
}: AppBrandProps) {
  const logo = (
    <>
      <img
        src="/wrytesmart-logo-transparent.png"
        alt=""
        aria-hidden="true"
        className={`${styles.logo} ${styles.logoLight} ${size === "header" ? styles.logoHeader : ""}`}
      />
      <img
        src="/wrytesmart-logo-light.png"
        alt=""
        aria-hidden="true"
        className={`${styles.logo} ${styles.logoDark} ${size === "header" ? styles.logoHeader : ""}`}
      />
    </>
  );

  const label = <span className={styles.srOnly}>Wrytesmart</span>;

  if (href === false) {
    return (
      <div className={styles.root} aria-label="Wrytesmart">
        {label}
        {logo}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={styles.root}
      aria-label="Wrytesmart home"
      onClick={onNavigate}
    >
      {label}
      {logo}
    </Link>
  );
}
