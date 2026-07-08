import { useState, type CSSProperties } from "react";
import { ApiError } from "../lib/apiClient";
import { isCreativeAvailable, rewriteWithEmotion } from "../lib/creativeClient";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import {
  EMOTION_KEYS,
  EMOTION_LABELS,
  type EmotionKey,
  type EmotionRewriteResult,
} from "../types";
import styles from "./EmotionRewriter.module.css";

const EMOTION_ACCENTS: Record<EmotionKey, string> = {
  hopeful: "var(--color-sage)",
  melancholic: "#7A8FA6",
  tense: "var(--color-terracotta)",
  ironic: "#8F7A9E",
  nostalgic: "var(--color-gold)",
  urgent: "#B85C1A",
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button type="button" className={styles.copyButton} onClick={handleCopy}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className={styles.grid} aria-hidden="true">
      {EMOTION_KEYS.map((emotion) => (
        <div key={emotion} className={styles.skeletonCard}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLineShort} />
        </div>
      ))}
    </div>
  );
}

export function EmotionRewriter() {
  const reducedMotion = usePrefersReducedMotion();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmotionRewriteResult | null>(null);
  const [revealKey, setRevealKey] = useState(0);

  const canRewrite = text.trim().length > 0 && isCreativeAvailable();
  const hint = !isCreativeAvailable()
    ? "Connect InsForge or add NEXT_PUBLIC_GROQ_API_KEY to use this feature."
    : !text.trim()
      ? "Enter a neutral sentence to rewrite."
      : undefined;

  const handleRewrite = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await rewriteWithEmotion(trimmed);
      setResult(response);
      setRevealKey((key) => key + 1);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not rewrite with emotion.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.rewriter} aria-labelledby="emotion-rewriter-heading">
      <p className={styles.eyebrow}>Emotion Rewriter</p>
      <h2 id="emotion-rewriter-heading" className={styles.title}>
        Same facts, six feelings
      </h2>
      <p className={styles.description}>
        Write a neutral sentence. Wrytesmart rewrites it in six emotional registers — teaching how
        word choice carries feeling beyond literal meaning.
      </p>

      <label className={styles.inputLabel} htmlFor="emotion-input">
        Your neutral sentence
      </label>
      <textarea
        id="emotion-input"
        className={styles.input}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        placeholder="e.g. She closed the door and walked down the street."
        disabled={loading}
      />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleRewrite}
          disabled={!canRewrite || loading}
        >
          {loading ? "Rewriting…" : "Rewrite with emotion"}
        </button>
        {hint && <p className={styles.hint}>{hint}</p>}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {loading && <SkeletonGrid />}

      {result && !loading && (
        <div className={styles.grid} key={revealKey}>
          {EMOTION_KEYS.map((emotion, index) => {
            const sentence = result.emotions[emotion];
            const technique = result.techniques[emotion];
            const accentStyle = {
              "--emotion-accent": EMOTION_ACCENTS[emotion],
              "--stagger-index": index,
            } as CSSProperties;
            const cardClass = reducedMotion ? styles.cardVisible : styles.cardReveal;

            return (
              <article
                key={emotion}
                className={`${styles.card} ${cardClass}`}
                style={accentStyle}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.emotionName}>{EMOTION_LABELS[emotion]}</h3>
                  <CopyButton text={sentence !== "—" ? sentence : ""} />
                </div>
                <p className={styles.sentence}>
                  {sentence === "—" ? "Could not load this version." : sentence}
                </p>
                <p className={styles.technique}>
                  Technique: {technique === "—" ? "—" : technique}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
