"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolveAuthDestination } from "../../lib/authNavigation";
import { saveDraftForLogin } from "../../lib/sessionBridge";
import { AuthAppLink } from "./AuthAppLink";
import styles from "./LandingPage.module.css";

const QUICK_ACTIONS = [
  { label: "Grammar check", href: "/app?tab=write" },
  { label: "Vocabulary", href: "/app?tab=vocabulary" },
  { label: "Adaptive learn", href: "/app?tab=learn" },
  { label: "Essay coach", href: "/app?tab=coach" },
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
          <AuthAppLink key={action.label} href={action.href} className={styles.quickAction}>
            {action.label}
          </AuthAppLink>
        ))}
      </div>
    </div>
  );
}
