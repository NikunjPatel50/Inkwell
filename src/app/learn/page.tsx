import type { Metadata } from "next";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import { breadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Adaptive English Learning — Practice Weak Skills in Context",
  description:
    "Wrytesmart Learn adapts to your weak spots with build-it, spot-the-error, and complete-it exercises — always inside real sentences. See how adaptive practice works before you sign up.",
  path: "/learn",
  keywords: ["adaptive English learning", "grammar exercises", "English practice", "skill drills"],
});

export default function LearnFeaturePage() {
  return (
    <MarketingShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Learn", href: "/learn" }]}>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ])}
      />
      <article className={styles.article}>
        <p className={styles.eyebrow}>Learn</p>
        <h1 className={styles.h1}>Adaptive practice that targets what you miss</h1>
        <p className={styles.lead}>
          The Learn tab builds a personalised feed of exercises based on the grammar and vocabulary
          skills you struggle with most. Every drill uses real sentences — not disconnected quiz
          cards — so what you practice transfers directly to your writing.
        </p>

        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>Adaptive exercise</p>
          <p className={styles.previewSentence}>
            Fix the error: She <span className={styles.highlight}>don&apos;t</span> agree with the
            proposal.
          </p>
          <p className={styles.previewNote}>
            <strong>Teaching note:</strong> Third-person singular verbs take <em>doesn&apos;t</em> in
            the present tense — the subject is <em>she</em>, not the noun after the verb.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            Three exercise types keep practice varied. <strong>Build-it</strong> asks you to construct
            correct sentences from prompts. <strong>Spot-the-error</strong> trains your eye to find
            mistakes in context. <strong>Complete-it</strong> fills gaps with the right word or
            phrase. When you answer incorrectly, you get a teaching note that explains the rule — not
            just the right answer.
          </p>
          <p>
            Progress feeds back into your dashboard so you can see which skills are improving and
            which need another round. Because Learn connects to the same workspace as Write, Grammar,
            and Vocabulary, you are never practising rules in isolation from the paragraphs you
            actually care about.
          </p>
        </div>

        <h2 className={styles.h2}>Who it helps</h2>
        <ul className={styles.list}>
          <li>School students building foundational grammar and sentence control</li>
          <li>Exam candidates who need efficient, targeted revision</li>
          <li>Professionals refreshing skills before high-stakes emails or reports</li>
          <li>Self-learners who want structure without a rigid course schedule</li>
        </ul>

        <MarketingCta
          title="Start your adaptive skill feed"
          lead="Sign up free to unlock the full Learn tab and track progress across sessions."
        />
      </article>
    </MarketingShell>
  );
}
