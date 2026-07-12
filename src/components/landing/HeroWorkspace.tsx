"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolveAuthDestination } from "../../lib/authNavigation";
import { saveDraftForLogin } from "../../lib/sessionBridge";
import styles from "./LandingPage.module.css";

const QUICK_ACTIONS = [
  { label: "Grammar check", href: "/grammar" },
  { label: "Vocabulary", href: "/vocabulary" },
  { label: "Adaptive learn", href: "/learn" },
  { label: "Essay coach", href: "/coach" },
];

export function HeroWorkspace() {
  const router = useRouter();
  const [text, setText] = useState("");

  const openWorkspace = () => {
    if (text.trim()) {
      saveDraftForLogin(text.trim(), false);
    }
    router.push(resolveAuthDestination("/app?tab=dashboard"));
  };

  return (
    <div className={styles.heroWorkspace}>
      <div className={styles.heroInputRow}>
        <textarea
          className={styles.heroTextarea}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write, paste, or open your workspace to start practicing"
          rows={2}
          aria-label="Start writing"
        />
        <button type="button" className={styles.heroCreateBtn} onClick={openWorkspace}>
          Analyse
        </button>
      </div>
      <div className={styles.quickActions} aria-label="Quick actions">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.label} href={action.href} className={styles.quickAction}>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
