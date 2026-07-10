import { useCallback, useState } from "react";
import { getVocabularyWord } from "../constants/vocabularyTopics";
import type { AppTab } from "../types";
import { writeWorkspaceRoute } from "../lib/workspaceRoute";
import { TabPageShell } from "./TabPageShell";
import { VocabularyWordBrowser } from "./vocabulary/VocabularyWordBrowser";
import { VocabularyWordDetail } from "./vocabulary/VocabularyWordDetail";

interface VocabularyTabProps {
  onTabChange: (tab: AppTab) => void;
  initialWordId?: string | null;
}

export function VocabularyTab({ onTabChange, initialWordId = null }: VocabularyTabProps) {
  const initialWord = initialWordId && getVocabularyWord(initialWordId) ? initialWordId : null;
  const [view, setView] = useState<"browser" | "detail">(initialWord ? "detail" : "browser");
  const [activeWordId, setActiveWordId] = useState<string | null>(initialWord);

  const handleSelectWord = useCallback((wordId: string) => {
    setActiveWordId(wordId);
    setView("detail");
    writeWorkspaceRoute({ vocabularyWordId: wordId });
  }, []);

  const handleBack = useCallback(() => {
    setView("browser");
    setActiveWordId(null);
    writeWorkspaceRoute({ vocabularyWordId: null });
  }, []);

  const handleBackToDashboard = useCallback(() => {
    onTabChange("dashboard");
  }, [onTabChange]);

  if (view === "detail" && activeWordId) {
    return (
      <TabPageShell
        id="panel-vocabulary"
        labelledBy="tab-vocabulary"
        backTo={{ label: "Vocabulary", onBack: handleBack }}
      >
        <VocabularyWordDetail wordId={activeWordId} />
      </TabPageShell>
    );
  }

  return (
    <TabPageShell
      id="panel-vocabulary"
      labelledBy="tab-vocabulary"
      backTo={{ label: "Dashboard", onBack: handleBackToDashboard }}
    >
      <VocabularyWordBrowser onSelectWord={handleSelectWord} />
    </TabPageShell>
  );
}
