import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import {
  ENGLISH_WRITING_PRACTICE_META_DESCRIPTION,
  ENGLISH_WRITING_PRACTICE_TITLE,
} from "@/lib/seo/descriptions";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

const ENGLISH_WRITING_FAQS = [
  {
    question: "How can I practice English writing online?",
    answer:
      "Paste a draft into the Write workspace for writing feedback, drill weak grammar in Learn, and browse forty grammar topics and vocabulary collections on the public site. Wrytesmart runs in your browser — create a free account to save progress and unlock adaptive exercises.",
  },
  {
    question: "What is the best way to improve English writing skills?",
    answer:
      "Combine regular drafting with targeted grammar practice, deliberate vocabulary building, and feedback you can apply immediately. Wrytesmart teaches rules inside sentences you edit rather than isolated worksheets, so improvements carry over to emails, essays, and reports.",
  },
  {
    question: "Is there a free English writing practice tool?",
    answer:
      "Yes. Wrytesmart Starter is free and includes grammar and vocabulary hubs, adaptive Learn drills with daily limits, and Write workspace analysis for shorter texts. Upgrade to Pro for unlimited analysis, exam scoring, and progress tracking.",
  },
  {
    question: "Can I use Wrytesmart for exam writing as well as general practice?",
    answer:
      "Absolutely. Many learners start with everyday english writing practice, then move to exam-focused guides for IELTS and PTE when they need structured essay coaching and rubric-style scoring.",
  },
];

const AUDIENCES = [
  {
    title: "Students",
    text: "Prepare for exams, essays, and presentations with lessons that show rules inside sentences you can fix right away.",
  },
  {
    title: "Professionals",
    text: "Polish emails, reports, and pitches with register-aware feedback that keeps your voice while improving clarity.",
  },
  {
    title: "Exam-takers",
    text: "Build confidence for PTE, IELTS, and academic writing with coaching structured for high-stakes tasks.",
  },
  {
    title: "Self-learners",
    text: "Explore grammar, vocabulary, and creative drills at your own pace in one calm browser workspace.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: ENGLISH_WRITING_PRACTICE_TITLE,
  description: ENGLISH_WRITING_PRACTICE_META_DESCRIPTION,
  path: "/english-writing-practice",
});

export default function EnglishWritingPracticePage() {
  return (
    <MarketingShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "English writing practice", href: "/english-writing-practice" },
      ]}
    >
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "English writing practice", path: "/english-writing-practice" },
          ]),
          faqPageJsonLd(ENGLISH_WRITING_FAQS),
        ]}
      />
      <article className={styles.article}>
        <p className={styles.eyebrow}>Writing practice</p>
        <h1 className={styles.h1}>English Writing Practice</h1>
        <p className={styles.lead}>
          Serious english writing practice is more than running spell-check once and moving on.
          Wrytesmart gives you one place for english writing practice online — with grammar
          practice on real sentences, writing feedback on drafts you care about, vocabulary building
          in themed collections, and adaptive learning that targets the skills you miss most. Whether
          you are revising a school essay or a workplace email, every exercise keeps the sentence in
          view so the improvement sticks. That is what effective english writing practice should
          feel like: clear, contextual, and repeatable.
        </p>

        <h2 className={styles.h2}>Why practice English writing?</h2>
        <div className={styles.prose}>
          <p>
            Strong writing is built in layers — accuracy, clarity, register, and word choice. Most
            learners know the feeling of studying a rule in a textbook and still repeating the same
            mistake in the next paragraph. In-context practice closes that gap because you fix real
            language while the meaning still matters to you.
          </p>
          <p>
            Regular english writing practice also builds confidence for presentations, applications,
            and exams. You do not need a separate app for every skill; you need a workspace that
            connects grammar, vocabulary, drafting, and coaching in one flow.
          </p>
        </div>

        <h2 className={styles.h2}>How Wrytesmart&apos;s writing practice works</h2>
        <div className={styles.prose}>
          <p>
            Start in <Link href="/write">Write</Link> when you have a draft to improve — register
            scoring, teaching notes, and rewrites at three levels show you how to sound clearer or
            more formal without losing your ideas. Use <Link href="/learn">Learn</Link> for adaptive
            drills that respond to your weak spots: build-it, spot-the-error, and complete-it
            exercises that reinforce the same principles in fresh sentences.
          </p>
          <p>
            Browse <Link href="/grammar">grammar topics</Link> and the{" "}
            <Link href="/vocabulary">vocabulary hub</Link> for free guides you can read before you
            sign in. When you need structure for longer essays, open the{" "}
            <Link href="/coach">Essay Coach</Link> for step-by-step guidance on thesis, evidence,
            and conclusions.
          </p>
        </div>
        <ol className={styles.list}>
          <li>Read a grammar or vocabulary guide related to your goal</li>
          <li>Drill the skill in Learn with adaptive exercises</li>
          <li>Paste a paragraph into Write and review teaching notes</li>
          <li>Use Coach when you are ready for full-essay structure</li>
        </ol>

        <h2 className={styles.h2}>Who it&apos;s for</h2>
        <div className={styles.prose}>
          {AUDIENCES.map((audience) => (
            <p key={audience.title}>
              <strong>{audience.title}.</strong> {audience.text}
            </p>
          ))}
        </div>

        <h2 className={styles.h2}>Grammar and vocabulary practice built into every exercise</h2>
        <div className={styles.prose}>
          <p>
            Wrytesmart does not treat grammar and vocabulary as side modules. Forty{" "}
            <Link href="/grammar">grammar topics</Link> cover parts of speech, tenses, punctuation,
            and common mistakes — each with examples you can read without an account. Fifteen{" "}
            <Link href="/vocabulary">vocabulary collections</Link> group words by theme, from
            academic argument to workplace communication, with definitions and sample usage on every
            guide page.
          </p>
          <p>
            In the app, vocabulary depth unlocks across four levels — definition, examples, word
            family, and etymology — so you move from knowing a gloss to using a word with the right
            register and collocations.
          </p>
        </div>

        <h2 className={styles.h2}>Exam-specific writing practice</h2>
        <div className={styles.prose}>
          <p>
            If your goal is a band score or PTE trait target, we have dedicated guides for{" "}
            <Link href="/ielts-writing-practice">IELTS writing practice</Link> and{" "}
            <Link href="/pte-writing-practice">PTE writing practice</Link> — essay structure,
            academic tone, and rubric-aware feedback on top of the same grammar and vocabulary
            foundation.
          </p>
        </div>

        <h2 className={styles.h2}>Frequently asked questions</h2>
        {ENGLISH_WRITING_FAQS.map((faq) => (
          <div key={faq.question} className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>{faq.question}</h3>
            <p className={styles.faqAnswer}>{faq.answer}</p>
          </div>
        ))}

        <MarketingCta
          title="Start English writing practice free"
          lead="Create an account to analyse drafts, run adaptive drills, and track progress — no install required."
          primaryLabel="Get started free"
          primaryHref="/login"
        />
      </article>
    </MarketingShell>
  );
}
