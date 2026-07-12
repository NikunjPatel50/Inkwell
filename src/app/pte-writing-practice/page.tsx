import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PTE_FAQS = [
  {
    question: "How does Wrytesmart help with PTE writing?",
    answer:
      "PTE Academic writing tasks reward clarity, grammar accuracy, and appropriate vocabulary. Wrytesmart lets you paste responses into Write for feedback, drill weak grammar in context, and build academic vocabulary through curated collections.",
  },
  {
    question: "Which features matter most for PTE essay and summary tasks?",
    answer:
      "Use Write for register and grammar feedback on Summarize Written Text and essay responses. Use Coach for structure on longer essays. Use Learn for targeted drills on tenses, articles, and sentence boundaries.",
  },
  {
    question: "Can I practise PTE writing without installing software?",
    answer:
      "Yes. Wrytesmart runs in your browser. Read these public guides for free, then sign up to open the full workspace.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "PTE Writing Practice — Summaries, Essays & Grammar",
  description:
    "Prepare for PTE Academic writing with in-context grammar lessons, workspace feedback, essay coaching, and vocabulary collections. Free overview of how Wrytesmart supports PTE writing practice.",
  path: "/pte-writing-practice",
  keywords: ["PTE writing practice", "PTE Academic", "PTE essay", "PTE grammar", "PTE preparation"],
});

export default function PteWritingPracticePage() {
  return (
    <MarketingShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PTE writing practice", href: "/pte-writing-practice" },
      ]}
    >
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "PTE writing practice", path: "/pte-writing-practice" },
          ]),
          faqPageJsonLd(PTE_FAQS),
        ]}
      />
      <article className={styles.article}>
        <p className={styles.eyebrow}>Exam prep</p>
        <h1 className={styles.h1}>PTE writing practice with real feedback</h1>
        <p className={styles.lead}>
          PTE Academic writing is timed and machine-scored — small grammar slips and weak vocabulary
          add up fast. Wrytesmart helps you fix patterns in context before they appear in high-stakes
          responses.
        </p>

        <div className={styles.prose}>
          <p>
            Paste Summarize Written Text or essay responses into the{" "}
            <Link href="/write">Write workspace</Link> to catch agreement errors, tense shifts, and
            register problems with teaching notes attached to each issue. The{" "}
            <Link href="/coach">Essay Coach</Link> supports longer responses where structure and
            thesis clarity matter.
          </p>
          <p>
            Browse <Link href="/grammar">grammar topics</Link> for punctuation, complex sentences, and
            common mistakes — each with examples you can read on public pages. Build academic lexis
            with <Link href="/vocabulary/academic">academic vocabulary</Link> and{" "}
            <Link href="/vocabulary/transitions">transition words</Link> collections.
          </p>
        </div>

        <h2 className={styles.h2}>Study loop for PTE writers</h2>
        <ol className={styles.list}>
          <li>Identify recurring errors from a practice response in Write</li>
          <li>Open the matching grammar guide and drill it in Learn</li>
          <li>Add transition and precision vocabulary from collections</li>
          <li>Repeat with a fresh prompt under time pressure</li>
        </ol>

        <h2 className={styles.h2}>Frequently asked questions</h2>
        {PTE_FAQS.map((faq) => (
          <div key={faq.question} className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>{faq.question}</h3>
            <p className={styles.faqAnswer}>{faq.answer}</p>
          </div>
        ))}

        <MarketingCta
          title="Start PTE writing practice free"
          lead="Sign up to analyse responses, run coaching, and track improvement across sessions."
        />
      </article>
    </MarketingShell>
  );
}
