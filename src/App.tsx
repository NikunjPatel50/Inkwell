import { useCallback, useEffect, useRef, useState } from "react";
import { ApiKeyPanel } from "./components/ApiKeyPanel";
import { Editor } from "./components/Editor";
import { FeedbackCard } from "./components/FeedbackCard";
import { VersionLadder } from "./components/VersionLadder";
import { getEnvGroqApiKey, hasEnvGroqApiKey } from "./lib/env";
import { analyzeWriting, GroqApiError } from "./lib/groqClient";
import { countWords } from "./lib/textMetrics";
import type { AnalysisResult, AnalysisStatus, GroqModel } from "./types";
import styles from "./App.module.css";

const LOADING_MESSAGES = [
  "Checking grammar…",
  "Reviewing wording…",
  "Building the simple version…",
  "Crafting the intermediate rewrite…",
  "Polishing the advanced version…",
];

export default function App() {
  const envApiKey = getEnvGroqApiKey();
  const [sessionApiKey, setSessionApiKey] = useState(envApiKey);
  const [model, setModel] = useState<GroqModel>("llama-3.3-70b-versatile");
  const [text, setText] = useState("");
  const [analysedText, setAnalysedText] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [activeErrorIndex, setActiveErrorIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const resultsRef = useRef<HTMLElement>(null);

  const wordCount = countWords(text);
  const isLoading = status === "loading";
  const canAnalyse = sessionApiKey.length > 0 && text.trim().length > 0;

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
    if (status !== "success" || !resultsRef.current) return;

    const isStacked = window.matchMedia("(max-width: 860px)").matches;
    if (isStacked) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status]);

  const handleSaveApiKey = useCallback((apiKey: string, selectedModel: GroqModel) => {
    setSessionApiKey(apiKey);
    setModel(selectedModel);
  }, []);

  const handleTextChange = useCallback((nextText: string) => {
    setText(nextText);
    setIsEditing(true);
    setActiveErrorIndex(null);
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setActiveErrorIndex(null);
  }, []);

  const handleErrorFocus = useCallback((errorIndex: number) => {
    setActiveErrorIndex(errorIndex);
  }, []);

  const handleErrorBlur = useCallback(() => {
    setActiveErrorIndex(null);
  }, []);

  const handleAnalyse = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !sessionApiKey) return;

    setStatus("loading");
    setErrorMessage("");
    setResult(null);
    setAnalysedText(null);
    setActiveErrorIndex(null);
    setIsEditing(false);

    try {
      const analysis = await analyzeWriting(trimmed, sessionApiKey, model);
      setAnalysedText(trimmed);
      setResult(analysis);
      setStatus("success");
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
  }, [text, sessionApiKey, model]);

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
          </div>
        </div>

        {!hasEnvGroqApiKey() && (
          <ApiKeyPanel
            compact
            sessionApiKey={sessionApiKey}
            model={model}
            isEnvKey={false}
            onSave={handleSaveApiKey}
          />
        )}
      </header>

      <main className={styles.main}>
        <div className={styles.workspace}>
          <div className={styles.editorColumn}>
            <Editor
              text={text}
              wordCount={wordCount}
              isLoading={isLoading}
              canAnalyse={canAnalyse}
              showHighlights={status === "success"}
              analysedText={analysedText}
              errors={result?.errors ?? []}
              isEditing={isEditing}
              activeErrorIndex={activeErrorIndex}
              onTextChange={handleTextChange}
              onAnalyse={handleAnalyse}
              onEdit={handleEdit}
              onErrorFocus={handleErrorFocus}
              onErrorBlur={handleErrorBlur}
            />
          </div>

          <div className={styles.panelDivider} aria-hidden="true" />

          <aside ref={resultsRef} className={styles.resultsColumn} aria-label="Analysis results">
            {status === "idle" && (
              <section className={styles.emptyState}>
                <p className={styles.emptyText}>
                  Your feedback and rewrites will appear here after you click{" "}
                  <strong>Analyse my writing</strong>.
                </p>
              </section>
            )}

            {status === "loading" && (
              <section className={styles.loadingState} aria-live="polite">
                <span className={styles.loadingSpinner} aria-hidden="true" />
                <p className={styles.loadingMessage}>
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </p>
              </section>
            )}

            {status === "error" && (
              <section className={styles.errorState} role="alert">
                <h2 className={styles.errorTitle}>Something went wrong</h2>
                <p className={styles.errorMessage}>{errorMessage}</p>
              </section>
            )}

            {status === "success" && result && analysedText && (
              <div className={styles.results}>
                <FeedbackCard
                  errors={result.errors}
                  activeErrorIndex={activeErrorIndex}
                  onErrorHover={setActiveErrorIndex}
                />
                <VersionLadder
                  original={analysedText}
                  simple={result.simple}
                  intermediate={result.intermediate}
                  intermediateTechnique={result.intermediateTechnique}
                  advanced={result.advanced}
                  advancedTechnique={result.advancedTechnique}
                />
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
