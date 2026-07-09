import Link from "next/link";
import styles from "./AppBrand.module.css";

interface AppBrandProps {
  size?: "default" | "header";
  href?: string | false;
  onNavigate?: () => void;
  className?: string;
}

export function AppBrand({
  size = "default",
  href = "/",
  onNavigate,
  className,
}: AppBrandProps) {
  const logo = (
    <img
      src="/wrytesmart-logo-transparent.png"
      alt=""
      aria-hidden="true"
      className={`${styles.logo} ${size === "header" ? styles.logoHeader : ""}`}
    />
  );

  const label = <span className={styles.srOnly}>Wrytesmart</span>;

  if (href === false) {
    return (
      <div className={`${styles.root} ${className ?? ""}`.trim()} aria-label="Wrytesmart">
        {label}
        {logo}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${styles.root} ${className ?? ""}`.trim()}
      aria-label="Wrytesmart home"
      onClick={onNavigate}
    >
      {label}
      {logo}
    </Link>
  );
}
