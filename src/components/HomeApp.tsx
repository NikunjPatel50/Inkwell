"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppTopBar } from "./AppTopBar";
import { DashboardTab } from "./DashboardTab";
import { LearnTab } from "./LearnTab";
import { GrammarTab } from "./GrammarTab";
import { VocabularyTab } from "./VocabularyTab";
import { CreativeTab } from "./CreativeTab";
import { CoachTab } from "./coach/CoachTab";
import { HistoryTab } from "./HistoryTab";
import { TabBar } from "./TabBar";
import { WorkshopTab } from "./WorkshopTab";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import {
  analyzeWriting,
  ApiError,
  checkCorrection,
  fetchHistory,
} from "../lib/apiClient";
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
  CorrectionResult,
  LadderResult,
  SelfCorrectionPhase,
  SkillPatternRow,
  Tone,
  ToneCache,
} from "../types";
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

interface SelfCorrectionState {
  phase: SelfCorrectionPhase;
  attempt: string;
  result: CorrectionResult | null;
  isChecking: boolean;
  checkError: string | null;
  collapsed: boolean;
  feedbackRevealed: boolean;
}

const INITIAL_SELF_CORRECTION: SelfCorrectionState = {
  phase: "hidden",
  attempt: "",
  result: null,
  isChecking: false,
  checkError: null,
  collapsed: false,
  feedbackRevealed: true,
};

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
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);
  const [selfCorrection, setSelfCorrection] = useState<SelfCorrectionState>(INITIAL_SELF_CORRECTION);
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
        ? "Sign in when you analyse — your history will be saved."
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

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [isLoading]);

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
    setSelectedTone("neutral");
    setToneCache({});
    setToneError(null);
    setToneLoading(false);
    setSelfCorrection(INITIAL_SELF_CORRECTION);

    try {
      const analysis = await analyzeWriting(trimmed);
      setAnalysedText(trimmed);
      setResult(analysis);
      setStatus("success");
      setPracticeCount(analysis.sentencesToday);
      setHasCompletedAnalysis(true);
      setRevealKey((key) => key + 1);
      setLadderAnimateReveal(true);
      setHistoryRefreshKey((key) => key + 1);
      fetchHistory()
        .then((history) => setSkillPatterns(history.skillPatterns))
        .catch(() => {});

      if (analysis.errors.length > 0) {
        setSelfCorrection({
          phase: "active",
          attempt: trimmed,
          result: null,
          isChecking: false,
          checkError: null,
          collapsed: false,
          feedbackRevealed: false,
        });
      } else {
        setSelfCorrection({
          ...INITIAL_SELF_CORRECTION,
          feedbackRevealed: true,
        });
      }
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
  }, [text, openLogin]);

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

    if (!user) {
      openLogin({ pendingAnalyse: true });
      setPendingAnalyse(true);
      return;
    }

    void executeAnalyse();
  }, [executeAnalyse, openLogin, text, user]);

  const handleTextChange = useCallback((nextText: string) => {
    setText(nextText);
    setActiveErrorIndex(null);
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

      if (!user) {
        openLogin();
        return;
      }

      setToneLoading(true);

      try {
        const toneResult = await analyzeWriting(analysedText, { tone });
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

  const hasResultPanels =
    hasCompletedAnalysis && result !== null && analysedText !== null && displayLadder !== null;

  const handleCorrectionAttemptChange = useCallback((attempt: string) => {
    setSelfCorrection((state) => ({ ...state, attempt, checkError: null }));
  }, []);

  const handleCheckCorrection = useCallback(async () => {
    if (!analysedText || !result || result.errors.length === 0 || !user) return;

    const attempt = selfCorrection.attempt.trim();
    if (!attempt) return;

    setSelfCorrection((state) => ({
      ...state,
      isChecking: true,
      checkError: null,
    }));

    try {
      const correctionResult = await checkCorrection(
        analysedText,
        attempt,
        result.errors,
      );
      setSelfCorrection((state) => ({
        ...state,
        phase: "completed",
        result: correctionResult,
        isChecking: false,
        feedbackRevealed: true,
        collapsed: false,
      }));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not check your correction. Please try again.";
      setSelfCorrection((state) => ({
        ...state,
        isChecking: false,
        checkError: message,
      }));
    }
  }, [analysedText, result, selfCorrection.attempt, user]);

  const handleSkipCorrection = useCallback(() => {
    setSelfCorrection((state) => ({
      ...state,
      phase: "skipped",
      feedbackRevealed: true,
    }));
  }, []);

  const handleToggleCorrectionCollapse = useCallback(() => {
    setSelfCorrection((state) => ({
      ...state,
      collapsed: !state.collapsed,
    }));
  }, []);

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
                  practiceCount={practiceCount}
                  skillPatterns={skillPatterns}
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
                  loadingMessage={LOADING_MESSAGES[loadingMessageIndex]}
                  canAnalyse={canAnalyse}
                  analyseHint={analyseHint}
                  errorMessage={status === "error" ? errorMessage : null}
                  hasResults={hasResultPanels}
                  registerScore={result?.registerScore ?? 0}
                  registerMeterKey={revealKey}
                  errors={result?.errors ?? []}
                  activeErrorIndex={activeErrorIndex}
                  analysedText={analysedText}
                  displayLadder={displayLadder}
                  selectedTone={selectedTone}
                  toneLoading={toneLoading}
                  toneLoadingMessage={TONE_LOADING_MESSAGES[toneLoadingMessageIndex]}
                  toneError={toneError}
                  revealKey={revealKey}
                  animateReveal={ladderAnimateReveal}
                  selfCorrectionPhase={selfCorrection.phase}
                  correctionAttempt={selfCorrection.attempt}
                  correctionResult={selfCorrection.result}
                  correctionChecking={selfCorrection.isChecking}
                  correctionCheckError={selfCorrection.checkError}
                  correctionCollapsed={selfCorrection.collapsed}
                  feedbackRevealed={selfCorrection.feedbackRevealed}
                  onTextChange={handleTextChange}
                  onAnalyse={handleAnalyse}
                  onErrorHover={setActiveErrorIndex}
                  onToneChange={handleToneChange}
                  onCorrectionAttemptChange={handleCorrectionAttemptChange}
                  onCheckCorrection={handleCheckCorrection}
                  onSkipCorrection={handleSkipCorrection}
                  onToggleCorrectionCollapse={handleToggleCorrectionCollapse}
                />
              </div>

              <div className={styles.tabPanel} hidden={activeTab !== "coach"} id="panel-coach">
                <CoachTab onTabChange={handleTabChange} />
              </div>

              <div className={styles.tabPanel} hidden={activeTab !== "creative"} id="panel-creative">
                <CreativeTab onTabChange={handleTabChange} />
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
