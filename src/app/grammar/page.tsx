import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { HubFaqSection } from "@/components/marketing/HubFaqSection";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import { GRAMMAR_CATEGORIES } from "@/constants/grammarTopics";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";
import { GRAMMAR_HUB_FAQS } from "@/lib/seo/hubFaqs";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Grammar Lessons Taught Through Real Sentences",
  description:
    "Explore 40 grammar topics across parts of speech, tenses, punctuation, and common mistakes. Each lesson shows rules inside sentences you can read, fix, and practice — free overview pages you can read without signing in.",
  path: "/grammar",
  keywords: ["English grammar lessons", "grammar topics", "grammar in context", "writing grammar"],
});

export default function GrammarOverviewPage() {
  return (
    <MarketingShell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Grammar", href: "/grammar" }]}>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Grammar", path: "/grammar" },
          ]),
          faqPageJsonLd(GRAMMAR_HUB_FAQS),
        ]}
      />
      <article className={styles.articleWide}>
        <p className={styles.eyebrow}>Grammar</p>
        <h1 className={styles.h1}>Grammar you can see inside real sentences</h1>
        <p className={styles.lead}>
          Most grammar apps quiz isolated rules. Wrytesmart teaches forty topics through sentences
          you actually write — with highlights, teaching notes, and exercises that connect back to
          your drafts. Browse every topic below; each page includes an explanation, key rule, and
          worked examples you can read without an account.
        </p>

        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>Example in action</p>
          <p className={styles.previewSentence}>
            The committee <span className={styles.highlight}>have</span> approved the revised draft.
          </p>
          <p className={styles.previewNote}>
            <strong>Subject–verb agreement:</strong> &ldquo;Committee&rdquo; acts as a single unit
            here — use <em>has</em>, not <em>have</em>. In the app you fix the sentence immediately
            and see why the rule applies.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            Topics are grouped into five areas: parts of speech, sentence structure, verb tenses,
            punctuation, and common mistakes. Whether you are preparing for exams, polishing workplace
            writing, or building school English skills, you can start with the category that matches
            your weakest area and drill it in context.
          </p>
          <p>
            After you create a free account, each topic opens inside the workspace with adaptive
            exercises — build-it, spot-the-error, and transform-it drills that reinforce the same
            principle in fresh sentences.
          </p>
        </div>

        {GRAMMAR_CATEGORIES.map((category) => (
          <section key={category.id} className={styles.categoryBlock} aria-labelledby={`cat-${category.id}`}>
            <h2 id={`cat-${category.id}`} className={styles.h2}>
              {category.title}
            </h2>
            <div className={styles.topicGrid}>
              {category.topics.map((topic) => (
                <Link key={topic.id} href={`/grammar/${topic.id}`} className={styles.topicCard}>
                  <h3 className={styles.topicCardTitle}>{topic.name}</h3>
                  <p className={styles.topicCardTeaser}>{topic.teaser}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <HubFaqSection faqs={GRAMMAR_HUB_FAQS} />

        <MarketingCta
          title="Practice grammar inside your own writing"
          lead="Sign up free to open interactive exercises for every topic and track the skills you improve over time."
        />
      </article>
    </MarketingShell>
  );
}
