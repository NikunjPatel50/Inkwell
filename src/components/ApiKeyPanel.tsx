import { useState } from "react";
import { GROQ_MODELS, type GroqModel } from "../types";
import styles from "./ApiKeyPanel.module.css";

interface ApiKeyPanelProps {
  sessionApiKey: string;
  model: GroqModel;
  isEnvKey: boolean;
  compact?: boolean;
  onSave: (apiKey: string, model: GroqModel) => void;
}

export function ApiKeyPanel({
  sessionApiKey,
  model,
  isEnvKey,
  compact = false,
  onSave,
}: ApiKeyPanelProps) {
  const [draftKey, setDraftKey] = useState(sessionApiKey);
  const [draftModel, setDraftModel] = useState<GroqModel>(model);
  const [savedFlash, setSavedFlash] = useState(false);

  const handleSave = () => {
    const trimmed = draftKey.trim();
    if (!trimmed) return;
    onSave(trimmed, draftModel);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleModelChange = (nextModel: GroqModel) => {
    setDraftModel(nextModel);
    if (isEnvKey && sessionApiKey) {
      onSave(sessionApiKey, nextModel);
    }
  };

  const isSaved =
    !isEnvKey && sessionApiKey.length > 0 && sessionApiKey === draftKey.trim();

  return (
    <section
      className={`${styles.panel} ${compact ? styles.compact : ""}`}
      aria-labelledby="api-key-heading"
    >
      <div className={styles.header}>
        <h2 id="api-key-heading" className={styles.title}>
          API settings
        </h2>
        {!compact && (
          <p className={styles.hint}>
            {isEnvKey
              ? "Key loaded from .env for local development. It is still sent only to GROQ from your browser."
              : "Your key stays in memory for this tab only — it is never stored or sent anywhere except directly to GROQ."}
          </p>
        )}
      </div>

      {isEnvKey && !compact && (
        <p className={styles.envNotice} role="status">
          Using <code>VITE_GROQ_API_KEY</code> from <code>.env</code>
        </p>
      )}

      {isEnvKey && compact && (
        <span className={styles.envBadge} role="status" title="Key loaded from .env">
          .env
        </span>
      )}

      <div className={styles.fields}>
        {!isEnvKey && (
          <label className={styles.field}>
            <span className={styles.label}>GROQ API key</span>
            <input
              type="password"
              className={styles.input}
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="gsk_…"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.label}>Model</span>
          <select
            className={styles.select}
            value={draftModel}
            onChange={(e) => handleModelChange(e.target.value as GroqModel)}
          >
            {GROQ_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        {!isEnvKey && (
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!draftKey.trim()}
          >
            Save for session
          </button>
        )}
      </div>

      {(isSaved || savedFlash) && !compact && (
        <p className={styles.savedNotice} role="status">
          Key saved for this session.
        </p>
      )}
    </section>
  );
}
