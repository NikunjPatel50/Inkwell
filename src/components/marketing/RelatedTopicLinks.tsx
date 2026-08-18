import Link from "next/link";
import type { RelatedLink } from "@/lib/seo/relatedLinks";
import styles from "./MarketingPage.module.css";

interface RelatedTopicLinksProps {
  title: string;
  links: RelatedLink[];
}

export function RelatedTopicLinks({ title, links }: RelatedTopicLinksProps) {
  if (links.length === 0) return null;

  return (
    <section className={styles.relatedTopics} aria-labelledby="related-topics-heading">
      <h2 id="related-topics-heading" className={styles.h2}>
        {title}
      </h2>
      <ul className={styles.relatedTopicList}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
