import Link from "next/link";
import styles from "./MarketingPage.module.css";

interface MarketingCtaProps {
  title?: string;
  lead?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function MarketingCta({
  title = "Ready to practice in context?",
  lead = "Create a free account and open the full workspace — grammar, vocabulary, writing feedback, and coaching in one place.",
  primaryLabel = "Get started free",
  primaryHref = "/login",
  secondaryLabel = "Sign in",
  secondaryHref = "/login",
}: MarketingCtaProps) {
  return (
    <section className={styles.ctaBand} aria-label="Get started">
      <h2 className={styles.ctaTitle}>{title}</h2>
      <p className={styles.ctaLead}>{lead}</p>
      <div className={styles.ctaActions}>
        <Link href={primaryHref} className={styles.primaryBtn}>
          {primaryLabel}
        </Link>
        <Link href={secondaryHref} className={styles.secondaryBtn}>
          {secondaryLabel}
        </Link>
      </div>
    </section>
  );
}
