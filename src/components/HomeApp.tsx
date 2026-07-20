"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppTopBar } from "./AppTopBar";
import { DashboardTab } from "./DashboardTab";
import { LearnTab } from "./LearnTab";
import { GrammarTab } from "./GrammarTab";
import { VocabularyTab } from "./VocabularyTab";
import { CoachTab } from "./coach/CoachTab";
import { HistoryTab } from "./HistoryTab";
import { TabBar } from "./TabBar";
import { WorkshopTab } from "./WorkshopTab";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import {
  ApiError,
  fetchHistory,
} from "../lib/apiClient";
import { analyzeGeneral } from "../lib/analyzeGeneral";
import { recordWritingDnaSubmission } from "../lib/writingDnaClient";
import { analyzePTEEssay } from "../lib/analyzePTEEssay";
import { setErrorTrackingUser } from "../lib/coachErrorTracking";
import { isInsforgeConfigured } from "../lib/insforge";
import {
  clearGuestSession,
  consumeLoginSession,
  isGuestSession,
  saveDraftForLogin,
} from "../lib/sessionBridge";
import { hasPersistedAuthSession } from "../lib/authPersistence";
import { readWorkspaceRoute, writeWorkspaceRoute } from "../lib/workspaceRoute";
import { countWords } from "../lib/textMetrics";
import type {
  AnalysisResult,
  AnalysisStatus,
  AppTab,
  LadderResult,
  SkillPatternRow,
  Tone,
  ToneCache,
} from "../types";
import type { PTEEssayScoreResult, WritingMode } from "../types/writingMode";
import { ladderFromAnalysis } from "../types";
import styles from "./HomeApp.module.css";

const LOADING_MESSAGES = [
  "Checking grammar…",
  "Reviewing wording…",
  "Building the simple version…",
  "Crafting the intermediate rewrite…",
  "Polishing the advanced version…",
];

const TONE_LOADING_MESSAGES = [
  "Adjusting tone…",
  "Recasting the simple version…",
  "Shifting the intermediate rewrite…",
  "Refining the advanced version…",
];

const PTE_LOADING_MESSAGES = [
  "Scoring Content…",
  "Checking Form and word count…",
  "Reviewing structure and coherence…",
  "Assessing grammar and vocabulary…",
  "Applying PTE cascading rules…",
];

export function HomeApp() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const initialRoute = useMemo(() => readWorkspaceRoute(), []);
  const [activeTab, setActiveTab] = useState<AppTab>(initialRoute.tab);
  const [pendingAnalyse, setPendingAnalyse] = useState(false);
  const [text, setText] = useState("");
  const [analysedText, setAnalysedText] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [toneLoadingMessageIndex, setToneLoadingMessageIndex] = useState(0);
  const [activeErrorIndex, setActiveErrorIndex] = useState<number | null>(null);
  const [practiceCount, setPracticeCount] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [skillPatterns, setSkillPatterns] = useState<SkillPatternRow[]>([]);
  const [revealKey, setRevealKey] = useState(0);
  const [ladderAnimateReveal, setLadderAnimateReveal] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>("neutral");
  const [toneCache, setToneCache] = useState<ToneCache>({});
  const [toneLoading, setToneLoading] = useState(false);
  const [toneError, setToneError] = useState<string | null>(null);
  const [writingMode, setWritingMode] = useState<WritingMode>(initialRoute.writeMode);
  const [pteResult, setPteResult] = useState<PTEEssayScoreResult | null>(null);
  const [hasCompletedPteScore, setHasCompletedPteScore] = useState(false);
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const analyseAfterAuthRef = useRef(false);
  const sessionRestoredRef = useRef(false);

  const openLogin = useCallback(
    (options?: { pendingAnalyse?: boolean }) => {
      saveDraftForLogin(text, Boolean(options?.pendingAnalyse));
      router.push("/login");
    },
    [router, text],
  );

  const handleSignOut = useCallback(async () => {
    clearGuestSession();
    await signOut();
    router.replace("/login");
  }, [router, signOut]);

  const handlePasswordChanged = useCallback(async () => {
    clearGuestSession();
    await signOut();
    router.replace("/login");
  }, [router, signOut]);

  useEffect(() => {
    document.body.classList.add("app-shell");
    return () => {
      document.body.classList.remove("app-shell");
    };
  }, []);

  useEffect(() => {
    setErrorTrackingUser(user);
  }, [user]);

  useEffect(() => {
    if (authLoading || user) return;
    if (isGuestSession()) return;
    if (hasPersistedAuthSession()) return;
    router.replace("/login");
  }, [authLoading, user, router]);

  const handleTabChange = useCallback((tab: AppTab) => {
    setActiveTab(tab);
    writeWorkspaceRoute({
      tab,
      grammarTopicId: tab === "grammar" ? undefined : null,
      vocabularyWordId: tab === "vocabulary" ? undefined : null,
      vocabularyCollectionId: tab === "vocabulary" ? undefined : null,
      learnSkillId: tab === "learn" ? undefined : null,
    });
  }, []);

  useEffect(() => {
    if (sessionRestoredRef.current) return;
    sessionRestoredRef.current = true;

    const { text: savedText, pendingAnalyse: shouldAnalyse } = consumeLoginSession();
    if (savedText) {
      setText(savedText);
    }
    if (shouldAnalyse) {
      setPendingAnalyse(true);
    }
  }, []);

  const wordCount = countWords(text);
  const isLoading = status === "loading";
  const isAuthenticated = Boolean(user);
  const allowWorkspace = isAuthenticated || isGuestSession() || hasPersistedAuthSession();
  const canAnalyse = text.trim().length > 0 && isInsforgeConfigured();
  const analyseHint = !isInsforgeConfigured()
    ? "Backend is not configured. Add NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY."
    : !text.trim()
      ? "Write or paste some text to analyse."
      : !isAuthenticated
        ? "Sign in to save analysis history. You can still analyse without an account."
        : undefined;

  const displayLadder = useMemo((): LadderResult | null => {
    if (!result) return null;
    if (selectedTone === "neutral") {
      return ladderFromAnalysis(result);
    }
    return toneCache[selectedTone] ?? ladderFromAnalysis(result);
  }, [result, selectedTone, toneCache]);

  useEffect(() => {
    if (!user) {
      setPracticeCount(0);
      setSkillPatterns([]);
      return;
    }

    fetchHistory()
      .then((history) => {
        setPracticeCount(history.sentencesToday);
        setSkillPatterns(history.skillPatterns);
      })
      .catch(() => {
        // Non-blocking
      });
  }, [user]);

  const loadingMessages =
    writingMode === "pte-essay" ? PTE_LOADING_MESSAGES : LOADING_MESSAGES;

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [isLoading, loadingMessages.length]);

  useEffect(() => {
    if (!toneLoading) {
      setToneLoadingMessageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setToneLoadingMessageIndex((prev) => (prev + 1) % TONE_LOADING_MESSAGES.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [toneLoading]);

  useEffect(() => {
    if (!ladderAnimateReveal) return;

    const timeout = window.setTimeout(() => {
      setLadderAnimateReveal(false);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [ladderAnimateReveal, revealKey]);

  const executeAnalyse = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setStatus("loading");
    setErrorMessage("");
    setActiveErrorIndex(null);

    if (writingMode === "pte-essay") {
      setPteResult(null);
      setHasCompletedPteScore(false);

      try {
        const score = await analyzePTEEssay(trimmed, { authenticated: Boolean(user), user });
        setAnalysedText(trimmed);
        setPteResult(score);
        setStatus("success");
        setHasCompletedPteScore(true);
        setHistoryRefreshKey((key) => key + 1);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "An unexpected error occurred. Please try again.";

        if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("sign in")) {
          openLogin({ pendingAnalyse: true });
          setPendingAnalyse(true);
        }

        setErrorMessage(message);
        setStatus("error");
      }
      return;
    }

    setSelectedTone("neutral");
    setToneCache({});
    setToneError(null);
    setToneLoading(false);

    try {
      const analysis = await analyzeGeneral(trimmed, { authenticated: Boolean(user), user });
      setAnalysedText(trimmed);
      setResult(analysis);
      setStatus("success");
      setPracticeCount(analysis.sentencesToday);
      setHasCompletedAnalysis(true);
      setRevealKey((key) => key + 1);
      setLadderAnimateReveal(true);
      try {
        await recordWritingDnaSubmission(user, {
          text: trimmed,
          sourceTool: "write",
          errors: analysis.errors,
          registerScore: analysis.registerScore,
        });
      } catch (dnaErr) {
        // Non-blocking — Write analysis succeeded; DNA sync can be retried from the dashboard.
        if (process.env.NODE_ENV === "development") {
          console.warn("Writing DNA persistence failed:", dnaErr);
        }
      }
      setHistoryRefreshKey((key) => key + 1);
      fetchHistory()
        .then((history) => setSkillPatterns(history.skillPatterns))
        .catch(() => {});
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.";

      if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("sign in")) {
        openLogin({ pendingAnalyse: true });
        setPendingAnalyse(true);
      }

      setErrorMessage(message);
      setStatus("error");
    }
  }, [text, openLogin, user, writingMode]);

  useEffect(() => {
    if (!user || !pendingAnalyse || authLoading) return;

    setPendingAnalyse(false);
    analyseAfterAuthRef.current = true;
  }, [user, pendingAnalyse, authLoading]);

  useEffect(() => {
    if (!analyseAfterAuthRef.current || !user || !text.trim()) return;
    analyseAfterAuthRef.current = false;
    void executeAnalyse();
  }, [user, text, executeAnalyse]);

  const handleAnalyse = useCallback(() => {
    if (!text.trim()) return;
    void executeAnalyse();
  }, [executeAnalyse, text]);

  const handleTextChange = useCallback((nextText: string) => {
    setText(nextText);
    setActiveErrorIndex(null);
  }, []);

  const handleWritingModeChange = useCallback((mode: WritingMode) => {
    setWritingMode(mode);
    writeWorkspaceRoute({ writeMode: mode });
    setStatus("idle");
    setErrorMessage("");
    setActiveErrorIndex(null);
    setSelectedTone("neutral");
    setToneCache({});
    setToneError(null);
    setToneLoading(false);
    setResult(null);
    setPteResult(null);
    setHasCompletedAnalysis(false);
    setHasCompletedPteScore(false);
    setAnalysedText(null);
  }, []);

  const handleToneChange = useCallback(
    async (tone: Tone) => {
      if (!result || !analysedText) return;
      if (tone === selectedTone && (tone === "neutral" || toneCache[tone])) return;

      setSelectedTone(tone);
      setToneError(null);

      if (tone === "neutral" || toneCache[tone]) {
        return;
      }

      setToneLoading(true);

      try {
        const toneResult = await analyzeGeneral(analysedText, { tone, authenticated: Boolean(user) });
        const ladder = ladderFromAnalysis(toneResult);
        setToneCache((cache) => ({ ...cache, [tone]: ladder }));
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not adjust tone. Please try again.";

        if (message.toLowerCase().includes("unauthorized")) {
          openLogin();
        }

        setToneError(message);
      } finally {
        setToneLoading(false);
      }
    },
    [analysedText, openLogin, result, selectedTone, toneCache, user],
  );

  const hasGeneralResultPanels =
    writingMode === "general" &&
    hasCompletedAnalysis &&
    result !== null &&
    analysedText !== null &&
    displayLadder !== null;

  const hasPteResultPanels =
    writingMode === "pte-essay" && hasCompletedPteScore && pteResult !== null;

  if (authLoading || !allowWorkspace) {
    return null;
  }

  return (
    <div className={styles.app}>
      <div className={styles.shell}>
        <AppTopBar
          activeTab={activeTab}
          user={user}
          theme={theme}
          onNavigateHome={() => handleTabChange("dashboard")}
          onSignIn={() => openLogin()}
          onSignOut={handleSignOut}
          onPasswordChanged={handlePasswordChanged}
          onToggleTheme={toggleTheme}
        />

        <div className={styles.shellBody}>
          <aside className={styles.sidebarColumn} aria-label="Application sidebar">
            <TabBar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              practiceCount={isAuthenticated ? practiceCount : 0}
            />
          </aside>

          <div className={styles.mainColumn}>
            <main className={styles.content}>
              <div className={styles.tabPanel} hidden={activeTab !== "dashboard"} id="panel-dashboard">
                <DashboardTab
                  isAuthenticated={isAuthenticated}
                  refreshKey={historyRefreshKey}
                  user={user}
                  onSignIn={() => openLogin()}
                  onTabChange={handleTabChange}
                />
              </div>

              <div className={styles.tabPanel} hidden={activeTab !== "learn"} id="panel-learn">
                <LearnTab
                  isAuthenticated={isAuthenticated}
                  skillPatterns={skillPatterns}
                  onTabChange={handleTabChange}
                  initialSkillId={initialRoute.learnSkillId}
                />
              </div>

              <div className={styles.tabPanel} hidden={activeTab !== "grammar"} id="panel-grammar">
                <GrammarTab
                  onTabChange={handleTabChange}
                  initialTopicId={initialRoute.grammarTopicId}
                />
              </div>

              <div className={styles.tabPanel} hidden={activeTab !== "vocabulary"} id="panel-vocabulary">
                <VocabularyTab
                  onTabChange={handleTabChange}
                  initialWordId={initialRoute.vocabularyWordId}
                  initialCollectionId={initialRoute.vocabularyCollectionId}
                />
              </div>

              <div className={styles.tabPanel} hidden={activeTab !== "write"} id="panel-write">
                <WorkshopTab
                  onTabChange={handleTabChange}
                  text={text}
                  wordCount={wordCount}
                  status={status}
                  isLoading={isLoading}
                  loadingMessage={loadingMessages[loadingMessageIndex]}
                  canAnalyse={canAnalyse}
                  analyseHint={analyseHint}
                  writingMode={writingMode}
                  errorMessage={status === "error" ? errorMessage : null}
                  hasGeneralResults={hasGeneralResultPanels}
                  hasPteResults={hasPteResultPanels}
                  registerScore={result?.registerScore ?? 0}
                  registerMeterKey={revealKey}
                  errors={result?.errors ?? []}
                  activeErrorIndex={activeErrorIndex}
                  analysedText={analysedText}
                  displayLadder={displayLadder}
                  pteResult={pteResult}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  selectedTone={selectedTone}
                  toneLoading={toneLoading}
                  toneLoadingMessage={TONE_LOADING_MESSAGES[toneLoadingMessageIndex]}
                  toneError={toneError}
                  revealKey={revealKey}
                  animateReveal={ladderAnimateReveal}
                  onTextChange={handleTextChange}
                  onWritingModeChange={handleWritingModeChange}
                  onAnalyse={handleAnalyse}
                  onErrorHover={setActiveErrorIndex}
                  onToneChange={handleToneChange}
                />
              </div>

              <div className={styles.tabPanel} hidden={activeTab !== "coach"} id="panel-coach">
                <CoachTab onTabChange={handleTabChange} />
              </div>

              <div className={styles.tabPanel} hidden={activeTab !== "history"} id="panel-history">
                <HistoryTab
                  isAuthenticated={isAuthenticated}
                  refreshKey={historyRefreshKey}
                  onSignIn={() => openLogin()}
                  onTabChange={handleTabChange}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
