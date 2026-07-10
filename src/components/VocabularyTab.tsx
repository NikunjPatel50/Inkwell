import { useCallback, useState } from "react";
import { normalizeWord } from "../lib/vocabularyLookup";
import type { AppTab } from "../types";
import { writeWorkspaceRoute } from "../lib/workspaceRoute";
import { TabPageShell } from "./TabPageShell";
import { CollectionView } from "./vocabulary/CollectionView";
import { VocabHub } from "./vocabulary/VocabHub";
import { WordDetailView } from "./vocabulary/WordDetail";

type VocabularyView = "hub" | "word" | "collection";

interface VocabularyTabProps {
  onTabChange: (tab: AppTab) => void;
  initialWordId?: string | null;
  initialCollectionId?: string | null;
}

export function VocabularyTab({
  onTabChange,
  initialWordId = null,
  initialCollectionId = null,
}: VocabularyTabProps) {
  const initialWord = initialWordId ? normalizeWord(initialWordId) : null;
  const [view, setView] = useState<VocabularyView>(
    initialWord ? "word" : initialCollectionId ? "collection" : "hub",
  );
  const [activeWord, setActiveWord] = useState<string | null>(initialWord);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    initialCollectionId,
  );

  const handleSelectWord = useCallback((word: string) => {
    const normalized = normalizeWord(word);
    setActiveWord(normalized);
    setActiveCollectionId(null);
    setView("word");
    writeWorkspaceRoute({ vocabularyWordId: normalized, vocabularyCollectionId: null });
  }, []);

  const handleSelectCollection = useCallback((collectionId: string) => {
    setActiveCollectionId(collectionId);
    setActiveWord(null);
    setView("collection");
    writeWorkspaceRoute({ vocabularyWordId: null, vocabularyCollectionId: collectionId });
  }, []);

  const handleBackToHub = useCallback(() => {
    setView("hub");
    setActiveWord(null);
    setActiveCollectionId(null);
    writeWorkspaceRoute({ vocabularyWordId: null, vocabularyCollectionId: null });
  }, []);

  const handleBackToDashboard = useCallback(() => {
    onTabChange("dashboard");
  }, [onTabChange]);

  if (view === "word" && activeWord) {
    return (
      <TabPageShell
        id="panel-vocabulary"
        labelledBy="tab-vocabulary"
        backTo={{ label: "Vocabulary", onBack: handleBackToHub }}
      >
        <WordDetailView word={activeWord} />
      </TabPageShell>
    );
  }

  if (view === "collection" && activeCollectionId) {
    return (
      <TabPageShell
        id="panel-vocabulary"
        labelledBy="tab-vocabulary"
        backTo={{ label: "Vocabulary", onBack: handleBackToHub }}
      >
        <CollectionView
          collectionId={activeCollectionId}
          onSelectWord={handleSelectWord}
        />
      </TabPageShell>
    );
  }

  return (
    <TabPageShell
      id="panel-vocabulary"
      labelledBy="tab-vocabulary"
      backTo={{ label: "Dashboard", onBack: handleBackToDashboard }}
    >
      <VocabHub onSelectWord={handleSelectWord} onSelectCollection={handleSelectCollection} />
    </TabPageShell>
  );
}
