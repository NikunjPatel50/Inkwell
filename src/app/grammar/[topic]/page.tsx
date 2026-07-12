import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/MarketingPage.module.css";
import {
  GRAMMAR_CATEGORIES,
  GRAMMAR_TOPICS,
  getGrammarTopic,
} from "@/constants/grammarTopics";
import { breadcrumbJsonLd, learningResourceJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface GrammarTopicPageProps {
  params: Promise<{ topic: string }>;
}

export function generateStaticParams() {
  return GRAMMAR_TOPICS.map((topic) => ({ topic: topic.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: GrammarTopicPageProps): Promise<Metadata> {
  const { topic: topicId } = await params;
  const topic = getGrammarTopic(topicId);
  if (!topic) return {};

  const category = GRAMMAR_CATEGORIES.find((entry) => entry.id === topic.categoryId);
  return buildPageMetadata({
    title: `${topic.name} — Grammar Guide`,
    description: `${topic.keyRule} Read explanations, see highlighted examples, and practice ${topic.name.toLowerCase()} in context with Wrytesmart.${category ? ` Part of ${category.title}.` : ""}`,
    path: `/grammar/${topic.id}`,
    keywords: [topic.name, "English grammar", topic.categoryId.replace(/-/g, " ")],
  });
}

export default async function GrammarTopicPage({ params }: GrammarTopicPageProps) {
  const { topic: topicId } = await params;
  const topic = getGrammarTopic(topicId);
  if (!topic) notFound();

  const category = GRAMMAR_CATEGORIES.find((entry) => entry.id === topic.categoryId);
  const example = topic.examples[0];

  return (
    <MarketingShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Grammar", href: "/grammar" },
        { label: topic.name, href: `/grammar/${topic.id}` },
      ]}
    >
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Grammar", path: "/grammar" },
            { name: topic.name, path: `/grammar/${topic.id}` },
          ]),
          learningResourceJsonLd({
            name: topic.name,
            description: topic.keyRule,
            path: `/grammar/${topic.id}`,
          }),
        ]}
      />
      <article className={styles.article}>
        <p className={styles.eyebrow}>{category?.title ?? "Grammar"}</p>
        <h1 className={styles.h1}>{topic.name}</h1>
        <p className={styles.lead}>{topic.keyRule}</p>

        <div className={styles.prose}>
          {topic.explanation.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {example ? (
          <div className={styles.previewCard}>
            <p className={styles.previewLabel}>See it in a sentence</p>
            <p className={styles.previewSentence}>{example.sentence}</p>
            {example.highlights[0] ? (
              <p className={styles.previewNote}>
                <strong>Teaching note:</strong> {example.highlights[0].tooltip}
              </p>
            ) : null}
          </div>
        ) : null}

        {topic.examples.length > 1 ? (
          <>
            <h2 className={styles.h2}>More examples</h2>
            <ul className={styles.list}>
              {topic.examples.slice(1).map((item) => (
                <li key={item.sentence}>{item.sentence}</li>
              ))}
            </ul>
          </>
        ) : null}

        <h2 className={styles.h2}>Practice this topic in Wrytesmart</h2>
        <p className={styles.lead}>
          Open the grammar workspace to complete interactive exercises for {topic.name.toLowerCase()}.
          You will spot errors, fill blanks, and transform sentences — always with teaching notes that
          explain the principle, not just the correction.
        </p>

        <MarketingCta
          title={`Master ${topic.name.toLowerCase()} in context`}
          lead="Free to start. Sign in to save progress and get adaptive drills linked to your writing."
          primaryLabel="Try this topic free"
          primaryHref="/login"
        />

        <p>
          <Link href="/grammar">← All grammar topics</Link>
        </p>
      </article>
    </MarketingShell>
  );
}
