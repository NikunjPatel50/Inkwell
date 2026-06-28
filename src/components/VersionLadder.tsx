import { useState, type ReactNode } from "react";
import type { CSSProperties } from "react";
import { countWords, formatWordCountDelta } from "../lib/textMetrics";
import { DiffText } from "./DiffText";
import styles from "./VersionLadder.module.css";

interface VersionLadderProps {
  original: string;
  simple: string;
  intermediate: string;
  intermediateTechnique: string;
  advanced: string;
  advancedTechnique: string;
  revealKey: number;
  dimmed?: boolean;
  headerExtra?: ReactNode;
  animateReveal?: boolean;
}

interface LadderStep {
  tier: "simple" | "intermediate" | "advanced";
  label: string;
  description: string;
  text: string;
  technique?: string;
}

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

export function VersionLadder({
  original,
  simple,
  intermediate,
  intermediateTechnique,
  advanced,
  advancedTechnique,
  revealKey,
  dimmed = false,
  headerExtra,
  animateReveal = true,
}: VersionLadderProps) {
  const originalWordCount = countWords(original);

  const steps: LadderStep[] = [
    {
      tier: "simple",
      label: "Simple",
      description: "Plain, accessible English",
      text: simple,
    },
    {
      tier: "intermediate",
      label: "Intermediate",
      description: "Clear, standard English",
      text: intermediate,
      technique: intermediateTechnique,
    },
    {
      tier: "advanced",
      label: "Advanced",
      description: "Sophisticated vocabulary & structure",
      text: advanced,
      technique: advancedTechnique,
    },
  ];

  return (
    <section
      className={`${styles.ladder} ${dimmed ? styles.ladderDimmed : ""}`}
      aria-labelledby="ladder-heading"
    >
      <h2 id="ladder-heading" className={styles.title}>
        Complexity ladder
      </h2>
      <p className={styles.subtitle}>
        Three rewrites with the same meaning — complexity and tone can shift independently.
      </p>

      {headerExtra && <div className={styles.headerExtra}>{headerExtra}</div>}

      <ol className={styles.steps} key={revealKey}>
        {steps.map((step, index) => {
          const rewriteWordCount = countWords(step.text);
          const staggerStyle = { "--stagger-index": index } as CSSProperties;
          const stepClass = animateReveal ? styles.stepReveal : styles.stepVisible;

          return (
            <li
              key={step.tier}
              className={`${styles.step} ${styles[step.tier]} ${stepClass}`}
              data-tier={step.tier}
              style={staggerStyle}
            >
              <div className={styles.markerColumn}>
                <span className={styles.marker} aria-hidden="true" />
                {index < steps.length - 1 && (
                  <span className={styles.connector} aria-hidden="true" />
                )}
              </div>

              <div className={styles.content}>
                <div className={styles.stepHeader}>
                  <div>
                    <div className={styles.tierTitleRow}>
                      <span className={styles.tierLabel}>{step.label}</span>
                      <span className={styles.wordDelta}>
                        {formatWordCountDelta(originalWordCount, rewriteWordCount)}
                      </span>
                    </div>
                    <span className={styles.tierDescription}>{step.description}</span>
                  </div>
                  <CopyButton text={step.text} />
                </div>
                <blockquote className={styles.rewrite}>
                  <DiffText original={original} rewritten={step.text} tier={step.tier} />
                </blockquote>
                {step.technique && (
                  <p className={styles.technique}>{step.technique}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
