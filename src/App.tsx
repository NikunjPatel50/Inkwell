import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiKeyPanel } from "./components/ApiKeyPanel";
import { WorkshopTab } from "./components/WorkshopTab";
import { getEnvGroqApiKey, hasEnvGroqApiKey } from "./lib/env";
import { analyzeWriting, GroqApiError } from "./lib/groqClient";
import { countWords } from "./lib/textMetrics";
import type {
  AnalysisResult,
  AnalysisStatus,
  GroqModel,
  LadderResult,
  Tone,
  ToneCache,
} from "./types";
import { ladderFromAnalysis } from "./types";
import styles from "./App.module.css";

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

export default function App() {
  const envApiKey = getEnvGroqApiKey();
  const [sessionApiKey, setSessionApiKey] = useState(envApiKey);
  const [draftApiKey, setDraftApiKey] = useState("");
  const [model, setModel] = useState<GroqModel>("llama-3.3-70b-versatile");
  const [text, setText] = useState("");
  const [analysedText, setAnalysedText] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [toneLoadingMessageIndex, setToneLoadingMessageIndex] = useState(0);
  const [activeErrorIndex, setActiveErrorIndex] = useState<number | null>(null);
  const [practiceCount, setPracticeCount] = useState(0);
  const [revealKey, setRevealKey] = useState(0);
  const [ladderAnimateReveal, setLadderAnimateReveal] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>("neutral");
  const [toneCache, setToneCache] = useState<ToneCache>({});
  const [toneLoading, setToneLoading] = useState(false);
  const [toneError, setToneError] = useState<string | null>(null);
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);

  const wordCount = countWords(text);
  const isLoading = status === "loading";
  const resolvedApiKey = sessionApiKey.trim() || draftApiKey.trim();
  const hasApiKey = resolvedApiKey.length > 0;
  const canAnalyse = hasApiKey && text.trim().length > 0;
  const analyseHint = !hasApiKey
    ? "Paste your GROQ API key in the toolbar, then click Analyse (Save is optional)."
    : !text.trim()
      ? "Write or paste some text to analyse."
      : undefined;
  const showDeployHint = import.meta.env.PROD && !hasEnvGroqApiKey();

  const displayLadder = useMemo((): LadderResult | null => {
    if (!result) return null;
    if (selectedTone === "neutral") {
      return ladderFromAnalysis(result);
    }
    return toneCache[selectedTone] ?? ladderFromAnalysis(result);
  }, [result, selectedTone, toneCache]);

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

  const handleSaveApiKey = useCallback((apiKey: string, selectedModel: GroqModel) => {
    setSessionApiKey(apiKey);
    setModel(selectedModel);
  }, []);

  const handleTextChange = useCallback((nextText: string) => {
    setText(nextText);
    setActiveErrorIndex(null);
  }, []);

  const handleAnalyse = useCallback(async () => {
    const trimmed = text.trim();
    const apiKey = sessionApiKey.trim() || draftApiKey.trim();
    if (!trimmed || !apiKey) return;

    if (!sessionApiKey.trim()) {
      setSessionApiKey(apiKey);
    }

    setStatus("loading");
    setErrorMessage("");
    setActiveErrorIndex(null);
    setSelectedTone("neutral");
    setToneCache({});
    setToneError(null);
    setToneLoading(false);

    try {
      const analysis = await analyzeWriting(trimmed, apiKey, model);
      setAnalysedText(trimmed);
      setResult(analysis);
      setStatus("success");
      setPracticeCount((count) => count + 1);
      setHasCompletedAnalysis(true);
      setRevealKey((key) => key + 1);
      setLadderAnimateReveal(true);
    } catch (err) {
      const message =
        err instanceof GroqApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.";
      setErrorMessage(message);
      setStatus("error");
    }
  }, [text, sessionApiKey, draftApiKey, model]);

  const handleToneChange = useCallback(
    async (tone: Tone) => {
      if (!result || !analysedText) return;
      if (tone === selectedTone && (tone === "neutral" || toneCache[tone])) return;

      setSelectedTone(tone);
      setToneError(null);

      if (tone === "neutral" || toneCache[tone]) {
        return;
      }

      const apiKey = sessionApiKey.trim() || draftApiKey.trim();
      if (!apiKey) return;

      setToneLoading(true);

      try {
        const toneResult = await analyzeWriting(analysedText, apiKey, model, { tone });
        const ladder = ladderFromAnalysis(toneResult);
        setToneCache((cache) => ({ ...cache, [tone]: ladder }));
      } catch (err) {
        const message =
          err instanceof GroqApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not adjust tone. Please try again.";
        setToneError(message);
      } finally {
        setToneLoading(false);
      }
    },
    [
      analysedText,
      draftApiKey,
      model,
      result,
      selectedTone,
      sessionApiKey,
      toneCache,
    ],
  );

  const hasResultPanels = hasCompletedAnalysis && result !== null && analysedText !== null && displayLadder !== null;

  return (
    <div className={styles.app}>
      <header className={styles.toolbar}>
        <div className={styles.brand}>
          <span className={styles.logoMark} aria-hidden="true">
            ✒
          </span>
          <div>
            <h1 className={styles.title}>Inkwell</h1>
            <p className={styles.tagline}>Practice your writing, one paragraph at a time.</p>
            {practiceCount > 0 && (
              <p className={styles.practiceCounter} aria-live="polite">
                {practiceCount} sentence{practiceCount === 1 ? "" : "s"} practiced this session
              </p>
            )}
          </div>
        </div>

        {!hasEnvGroqApiKey() && (
          <ApiKeyPanel
            compact
            sessionApiKey={sessionApiKey}
            model={model}
            isEnvKey={false}
            onSave={handleSaveApiKey}
            onDraftKeyChange={setDraftApiKey}
          />
        )}
      </header>

      {showDeployHint && (
        <div className={styles.deployHint} role="note">
          No build-time API key detected. Set{" "}
          <code>VITE_GROQ_API_KEY</code> in Vercel → Settings → Environment Variables, then{" "}
          <strong>redeploy</strong>. Or paste your key in the toolbar below.
        </div>
      )}

      <main className={styles.main}>
        <WorkshopTab
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
          onTextChange={handleTextChange}
          onAnalyse={handleAnalyse}
          onErrorHover={setActiveErrorIndex}
          onToneChange={handleToneChange}
        />
      </main>
    </div>
  );
}
