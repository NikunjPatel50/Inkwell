import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import { WORD_COLLECTIONS, getWordCollection } from "@/constants/wordCollections";
import { breadcrumbJsonLd, learningResourceJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface VocabularyCollectionPageProps {
  params: Promise<{ collection: string }>;
}

export function generateStaticParams() {
  return WORD_COLLECTIONS.map((collection) => ({ collection: collection.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: VocabularyCollectionPageProps): Promise<Metadata> {
  const { collection: collectionId } = await params;
  const collection = getWordCollection(collectionId);
  if (!collection) return {};

  return buildPageMetadata({
    title: `${collection.title} — Vocabulary Collection`,
    description: `Learn ${collection.teaser} and more. Sample definitions from the ${collection.title} collection in Wrytesmart — vocabulary taught through real sentences and four depth levels.`,
    path: `/vocabulary/${collection.id}`,
    keywords: [collection.title, "English vocabulary", "word list", collection.id],
  });
}

export default async function VocabularyCollectionPage({ params }: VocabularyCollectionPageProps) {
  const { collection: collectionId } = await params;
  const collection = getWordCollection(collectionId);
  if (!collection) notFound();

  const previewWords = collection.words.slice(0, 8);

  return (
    <MarketingShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Vocabulary", href: "/vocabulary" },
        { label: collection.title, href: `/vocabulary/${collection.id}` },
      ]}
    >
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Vocabulary", path: "/vocabulary" },
            { name: collection.title, path: `/vocabulary/${collection.id}` },
          ]),
          learningResourceJsonLd({
            name: collection.title,
            description: `Vocabulary collection: ${collection.teaser}`,
            path: `/vocabulary/${collection.id}`,
          }),
        ]}
      />
      <article className={styles.article}>
        <p className={styles.eyebrow}>Vocabulary collection</p>
        <h1 className={styles.h1}>{collection.title}</h1>
        <p className={styles.lead}>
          Words in this collection include {collection.teaser}. Each entry includes a clear
          definition and part of speech; in the app you unlock example sentences, word families, and
          etymology as you go deeper.
        </p>

        <div className={styles.prose}>
          <p>
            Studying themed collections helps you remember words in clusters — the way they appear in
            essays, reports, and exam tasks. Use this page as a reference guide, then sign in to
            search any word, save favourites, and practice using new vocabulary inside sentences you
            write.
          </p>
        </div>

        <h2 className={styles.h2}>Sample words</h2>
        <ul className={styles.list}>
          {previewWords.map((entry) => (
            <li key={entry.word}>
              <strong>{entry.word}</strong> ({entry.partOfSpeech}) — {entry.definition}
            </li>
          ))}
        </ul>
        {collection.words.length > previewWords.length ? (
          <p className={styles.lead}>
            Plus {collection.words.length - previewWords.length} more words in this collection inside
            Wrytesmart.
          </p>
        ) : null}

        <MarketingCta
          title="Explore the full collection in your workspace"
          lead="Free to start. Build vocabulary depth and practice words in the same place you write."
        />

        <p>
          <Link href="/vocabulary">← All vocabulary collections</Link>
        </p>
      </article>
    </MarketingShell>
  );
}
