import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

const IELTS_FAQS = [
  {
    question: "How does Wrytesmart help with IELTS writing?",
    answer:
      "You practise grammar and vocabulary in real sentences, analyse Task 1 and Task 2 drafts in the Write workspace, and use the Essay Coach for structure, thesis clarity, and evidence — the skills IELTS examiners reward.",
  },
  {
    question: "Can I improve IELTS grammar without separate textbooks?",
    answer:
      "Yes. Forty grammar topics include tense control, articles, complex sentences, and common mistakes — each taught inside sentences you edit, with teaching notes that explain the rule.",
  },
  {
    question: "Is Wrytesmart free to start for IELTS preparation?",
    answer:
      "You can create a free account to open the workspace. Public guides on this site let you read how each feature works before you sign up.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "IELTS Writing Practice — Essays, Grammar & Feedback",
  description:
    "Prepare for IELTS writing with in-context grammar, essay coaching, register-aware rewrites, and adaptive exercises. Free guide to how Wrytesmart supports Task 1 and Task 2 practice.",
  path: "/ielts-writing-practice",
  keywords: ["IELTS writing practice", "IELTS essay", "IELTS Task 2", "IELTS grammar", "IELTS preparation"],
});

export default function IeltsWritingPracticePage() {
  return (
    <MarketingShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "IELTS writing practice", href: "/ielts-writing-practice" },
      ]}
    >
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "IELTS writing practice", path: "/ielts-writing-practice" },
          ]),
          faqPageJsonLd(IELTS_FAQS),
        ]}
      />
      <article className={styles.article}>
        <p className={styles.eyebrow}>Exam prep</p>
        <h1 className={styles.h1}>IELTS writing practice in one workspace</h1>
        <p className={styles.lead}>
          IELTS rewards clear argument, accurate grammar, and appropriate register — not memorised
          templates alone. Wrytesmart trains those skills inside sentences you write, with feedback
          you can apply immediately on your next paragraph.
        </p>

        <div className={styles.prose}>
          <p>
            For <strong>Task 2</strong>, use Coach to strengthen thesis statements, paragraph structure,
            and conclusions. Paste practice essays into Write for grammar teaching notes and rewrites
            that show how to sound more academic without losing your ideas. For{" "}
            <strong>Task 1</strong>, register scoring helps you match the neutral, factual tone reports
            and charts require.
          </p>
          <p>
            Grammar topics cover the errors that cost bands most often: subject–verb agreement, article
            use, tense consistency, and complex sentence control. Vocabulary collections such as{" "}
            <Link href="/vocabulary/academic">academic words</Link> and{" "}
            <Link href="/vocabulary/argument-words">argument words</Link> help you upgrade lexis
            deliberately instead of guessing synonyms.
          </p>
        </div>

        <h2 className={styles.h2}>Recommended workflow</h2>
        <ol className={styles.list}>
          <li>Read a public grammar topic related to your weakest area</li>
          <li>Drill it in Learn with adaptive exercises</li>
          <li>Write a timed Task 2 paragraph in Write and review teaching notes</li>
          <li>Use Coach for full-essay structure before your next mock test</li>
        </ol>

        <h2 className={styles.h2}>Frequently asked questions</h2>
        {IELTS_FAQS.map((faq) => (
          <div key={faq.question} className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>{faq.question}</h3>
            <p className={styles.faqAnswer}>{faq.answer}</p>
          </div>
        ))}

        <MarketingCta
          title="Start IELTS writing practice free"
          lead="Create an account to analyse essays, run coaching sessions, and track progress."
        />
      </article>
    </MarketingShell>
  );
}
