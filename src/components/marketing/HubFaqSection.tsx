import styles from "./MarketingPage.module.css";

interface HubFaqSectionProps {
  faqs: { question: string; answer: string }[];
}

export function HubFaqSection({ faqs }: HubFaqSectionProps) {
  return (
    <section aria-labelledby="hub-faq-heading">
      <h2 id="hub-faq-heading" className={styles.h2}>
        Frequently asked questions
      </h2>
      {faqs.map((faq) => (
        <div key={faq.question} className={styles.faqItem}>
          <h3 className={styles.faqQuestion}>{faq.question}</h3>
          <p className={styles.faqAnswer}>{faq.answer}</p>
        </div>
      ))}
    </section>
  );
}
