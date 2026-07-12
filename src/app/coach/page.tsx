import type { Metadata } from "next";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { HubFaqSection } from "@/components/marketing/HubFaqSection";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";
import { COACH_HUB_FAQS } from "@/lib/seo/hubFaqs";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "AI Essay Coach — Step-by-Step Writing Guidance",
  description:
    "Structured essay coaching for academic and exam writing. See a sample walkthrough of how Wrytesmart Coach explains thesis, evidence, and structure — readable without signing in.",
  path: "/coach",
  keywords: ["essay coach", "writing coach", "academic writing", "essay feedback", "IELTS essay"],
});

const COACH_STEPS = [
  "Clarify your thesis in one clear sentence",
  "Strengthen the topic sentence of each body paragraph",
  "Add evidence that directly supports your claim",
  "Check transitions between ideas read smoothly",
  "Revise the conclusion so it answers the question, not just repeats",
];

export default function CoachFeaturePage() {
  return (
    <MarketingShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Coach", href: "/coach" }]}>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Coach", path: "/coach" },
          ]),
          faqPageJsonLd(COACH_HUB_FAQS),
        ]}
      />
      <article className={styles.article}>
        <p className={styles.eyebrow}>Coach</p>
        <h1 className={styles.h1}>Essay coaching that explains the why</h1>
        <p className={styles.lead}>
          The AI Writing Coach walks you through academic and exam-style essays step by step. Instead
          of dumping a corrected essay on you, it highlights what to fix next and why that move
          strengthens your argument.
        </p>

        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>Sample coaching path</p>
          <ol className={styles.list}>
            {COACH_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className={styles.previewNote}>
            Each step includes a short explanation and a concrete edit you can apply before moving
            on — like a tutor marking one priority at a time.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            Coach is built for tasks with structure: school essays, IELTS and PTE writing tasks,
            university assignments, and professional reports that need a clear line of reasoning. You
            bring a draft or outline; the coach meets you at your level and escalates detail as your
            writing improves.
          </p>
          <p>
            Because Coach lives beside Write, Grammar, and Learn, you can fix a structural issue in
            coaching, drill a recurring grammar error in exercises, and polish phrasing in the rewrite
            workspace — without switching tools.
          </p>
        </div>

        <h2 className={styles.h2}>Best for</h2>
        <ul className={styles.list}>
          <li>Students learning essay structure for the first time</li>
          <li>Exam candidates who need checklist-style feedback under time pressure</li>
          <li>Professionals drafting proposals, memos, or long-form reports</li>
        </ul>

        <HubFaqSection faqs={COACH_HUB_FAQS} />

        <MarketingCta
          title="Open the essay coach"
          lead="Sign up free to run full coaching sessions and save your work."
          primaryLabel="Try Coach free"
        />
      </article>
    </MarketingShell>
  );
}
