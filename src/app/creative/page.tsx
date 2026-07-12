import type { Metadata } from "next";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import { breadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Creative Writing Drills — Playful English Practice",
  description:
    "Word duels, emotion rewrites, and playful drills that keep English practice engaging. Learn how Wrytesmart Creative builds fluency without boring repetition.",
  path: "/creative",
  keywords: ["creative writing practice", "English games", "writing drills", "vocabulary games"],
});

export default function CreativeFeaturePage() {
  return (
    <MarketingShell
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Creative", href: "/creative" }]}
    >
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Creative", path: "/creative" },
        ])}
      />
      <article className={styles.article}>
        <p className={styles.eyebrow}>Creative</p>
        <h1 className={styles.h1}>Serious skills, playful practice</h1>
        <p className={styles.lead}>
          Creative drills keep you practising when worksheets feel stale. Word duels, emotion
          rewrites, and expressive exercises stretch your vocabulary and sentence control — still
          grounded in real English, but with room to experiment.
        </p>

        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>Emotion rewrite</p>
          <p className={styles.previewSentence}>She was happy about the result.</p>
          <div className={styles.rewriteBlock}>
            <span className={styles.rewriteTag}>Elated</span>
            She was elated about the result.
          </div>
          <div className={styles.rewriteBlock}>
            <span className={styles.rewriteTag}>Restrained</span>
            She allowed herself a quiet smile at the result.
          </div>
          <p className={styles.previewNote}>
            Rewriting for emotion teaches nuance: the same fact can sound thrilled, restrained, or
            ironic depending on word choice.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            Creative mode complements the structured Learn and Grammar tabs. Use it to warm up before
            a writing session, to recycle vocabulary from your collections, or to break a plateau when
            you understand rules but still write flat sentences.
          </p>
          <p>
            Every creative exercise still feeds back into teaching notes and your progress history when
            you are signed in — so play does not mean wasted time.
          </p>
        </div>

        <MarketingCta
          title="Try creative drills free"
          lead="Sign up to unlock the full Creative tab alongside Write, Grammar, and Vocabulary."
        />
      </article>
    </MarketingShell>
  );
}
