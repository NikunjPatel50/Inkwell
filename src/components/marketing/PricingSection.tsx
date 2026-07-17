import Link from "next/link";
import { BetaProNoticeButton } from "@/components/marketing/BetaProNoticeButton";
import { PRICING_FAQS, PRICING_TIERS } from "@/lib/seo/pricingContent";
import styles from "./PricingSection.module.css";

interface PricingSectionProps {
  id?: string;
  variant?: "landing" | "page";
  showFaq?: boolean;
}

export function PricingSection({
  id = "pricing",
  variant = "landing",
  showFaq = true,
}: PricingSectionProps) {
  return (
    <section
      id={id}
      className={`${styles.section} ${variant === "landing" ? styles.sectionLanding : ""}`}
      aria-labelledby="pricing-heading"
    >
      <div className={styles.sectionIntro}>
        <h2 id="pricing-heading" className={styles.sectionTitle}>
          Simple pricing for every learner
        </h2>
        <p className={styles.sectionLead}>
          Start free with grammar, vocabulary, and writing practice. Upgrade when you need full
          exam scoring, unlimited analysis, and progress tracking.
        </p>
      </div>

      <div className={styles.pricingGrid}>
        {PRICING_TIERS.map((tier) => (
          <article
            key={tier.id}
            className={`${styles.pricingCard} ${tier.featured ? styles.pricingCardFeatured : ""}`}
            aria-labelledby={`pricing-tier-${tier.id}`}
          >
            {tier.badge ? <span className={styles.pricingBadge}>{tier.badge}</span> : null}
            <p className={styles.tierEyebrow}>{tier.id === "starter" ? "Free" : "Premium"}</p>
            <h3 id={`pricing-tier-${tier.id}`} className={styles.tierName}>
              {tier.name}
            </h3>
            <div className={styles.priceRow}>
              <p className={styles.priceValue}>{tier.price}</p>
              {tier.priceSuffix ? <span className={styles.priceSuffix}>{tier.priceSuffix}</span> : null}
            </div>
            <ul className={styles.featureList}>
              {tier.features.map((feature) => {
                const isLead = feature.startsWith("Everything in Starter");
                return (
                  <li
                    key={feature}
                    className={`${styles.featureItem} ${isLead ? styles.featureItemStrong : ""}`}
                  >
                    <span className={styles.featureCheck} aria-hidden="true">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                );
              })}
            </ul>
            {tier.featured ? (
              <BetaProNoticeButton className={styles.ctaPrimary} label={tier.ctaLabel} />
            ) : (
              <Link href={tier.ctaHref} className={styles.ctaSecondary}>
                {tier.ctaLabel}
              </Link>
            )}
          </article>
        ))}
      </div>

      {showFaq ? (
        <div className={styles.faqSection}>
          <h3 className={styles.faqTitle}>Pricing questions</h3>
          {PRICING_FAQS.map((faq) => (
            <div key={faq.question} className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>{faq.question}</h4>
              <p className={styles.faqAnswer}>{faq.answer}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
