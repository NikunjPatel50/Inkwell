import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import { WORD_COLLECTIONS } from "@/constants/wordCollections";
import { breadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

const DEPTH_LEVELS = [
  {
    level: 1,
    title: "Definition",
    text: "Clear meaning and part of speech so you know how to use the word.",
  },
  {
    level: 2,
    title: "Example sentences",
    text: "Real sentences showing natural usage — not dictionary fragments alone.",
  },
  {
    level: 3,
    title: "Word family & collocations",
    text: "Related forms and common pairings that fluent writers actually use.",
  },
  {
    level: 4,
    title: "Etymology & nuance",
    text: "Origin and subtle shade of meaning for advanced learners and exam prep.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Vocabulary Builder — Words in Real Context",
  description:
    "Build vocabulary through curated word collections and four depth levels — from definition to etymology. Explore 14 free collection guides with sample words and meanings, no login required.",
  path: "/vocabulary",
  keywords: ["vocabulary builder", "English vocabulary", "word collections", "academic vocabulary"],
});

export default function VocabularyOverviewPage() {
  return (
    <MarketingShell
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Vocabulary", href: "/vocabulary" }]}
    >
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Vocabulary", path: "/vocabulary" },
        ])}
      />
      <article className={styles.articleWide}>
        <p className={styles.eyebrow}>Vocabulary</p>
        <h1 className={styles.h1}>Vocabulary depth, not flashcard stacks</h1>
        <p className={styles.lead}>
          Wrytesmart helps you learn words inside the sentences you read and write. Search any word
          for layered explanations, explore curated collections for exams and professional writing,
          and practice with exercises that connect back to your drafts.
        </p>

        <div className={styles.prose}>
          <p>
            Each word unlocks four depth levels: definition, examples, word family, and etymology.
            That progression mirrors how strong readers move from knowing a gloss to using a word with
            the right register and collocations. Collections group words by theme — emotions, academic
            argument, workplace communication, and more — so you can study purposefully instead of
            memorising random lists.
          </p>
        </div>

        <h2 className={styles.h2}>Four depth levels</h2>
        <ul className={styles.list}>
          {DEPTH_LEVELS.map((item) => (
            <li key={item.level}>
              <strong>
                Level {item.level}: {item.title}
              </strong>{" "}
              — {item.text}
            </li>
          ))}
        </ul>

        <h2 className={styles.h2}>Word collections</h2>
        <div className={styles.topicGrid}>
          {WORD_COLLECTIONS.map((collection) => (
            <Link
              key={collection.id}
              href={`/vocabulary/${collection.id}`}
              className={styles.topicCard}
            >
              <h3 className={styles.topicCardTitle}>{collection.title}</h3>
              <p className={styles.topicCardTeaser}>{collection.teaser}</p>
            </Link>
          ))}
        </div>

        <MarketingCta
          title="Search any word and practice in context"
          lead="Create a free account to unlock full depth levels, save words, and drill vocabulary inside your writing workspace."
        />
      </article>
    </MarketingShell>
  );
}
