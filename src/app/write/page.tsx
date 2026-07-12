import type { Metadata } from "next";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import { breadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Writing Workspace — Register Scoring, Feedback & Rewrites",
  description:
    "Paste any draft into Wrytesmart Write for register scoring, in-context grammar teaching, and simple-to-advanced rewrites. See a real example of how the writing workspace works — no login required to read.",
  path: "/write",
  keywords: ["writing feedback", "grammar checker", "text rewriter", "register scoring", "English writing"],
});

export default function WriteFeaturePage() {
  return (
    <MarketingShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Write", href: "/write" }]}>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Write", path: "/write" },
        ])}
      />
      <article className={styles.article}>
        <p className={styles.eyebrow}>Write</p>
        <h1 className={styles.h1}>Analyse your draft where you actually write</h1>
        <p className={styles.lead}>
          Paste an email, essay paragraph, or report into the Write workspace and get register
          scoring, grammar teaching notes, and rewrites at three levels of sophistication — all
          without leaving the sentence you care about.
        </p>

        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>Original</p>
          <p className={styles.previewSentence}>
            The committee <span className={styles.highlight}>have</span> approved the revised draft.
          </p>
          <p className={styles.previewNote}>
            <strong>Subject–verb agreement:</strong> &ldquo;Committee&rdquo; acts as a single unit —
            use <em>has</em>, not <em>have</em>.
          </p>
          <div className={styles.rewriteBlock}>
            <span className={styles.rewriteTag}>Simple</span>
            The committee has approved the revised draft.
          </div>
          <div className={styles.rewriteBlock}>
            <span className={styles.rewriteTag}>Advanced</span>
            The committee has endorsed the amended draft.
          </div>
        </div>

        <div className={styles.prose}>
          <p>
            Register scoring shows whether your tone fits the audience — too casual for academic
            writing, or too stiff for a friendly update. Error notes explain the principle behind each
            issue so you learn while you edit. Rewrite suggestions give you a simple fix, a polished
            version, and a more advanced alternative, helping you see how word choice changes impact
            without losing your meaning.
          </p>
          <p>
            Write connects to Grammar and Learn: mistakes you make repeatedly can feed adaptive
            exercises, and vocabulary you look up can be saved for later depth study. That loop turns
            one-off proofreading into long-term improvement.
          </p>
        </div>

        <h2 className={styles.h2}>What you get</h2>
        <ul className={styles.list}>
          <li>Register and tone analysis for audience fit</li>
          <li>Grammar errors with teaching notes, not just red underlines</li>
          <li>Three rewrite levels: simple, polished, and advanced</li>
          <li>Session history when you sign in to track growth over time</li>
        </ul>

        <MarketingCta
          title="Paste your first paragraph free"
          lead="Create an account to analyse unlimited drafts and save your writing history."
          primaryLabel="Try Write free"
        />
      </article>
    </MarketingShell>
  );
}
