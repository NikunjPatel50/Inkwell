import styles from "./KeyRuleQuote.module.css";

interface KeyRuleQuoteProps {
  children: string;
}

export function KeyRuleQuote({ children }: KeyRuleQuoteProps) {
  return (
    <blockquote className={styles.quote}>
      <p className={styles.eyebrow}>Key rule to remember</p>
      <p className={styles.text}>{children}</p>
    </blockquote>
  );
}
