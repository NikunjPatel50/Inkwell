import { useCallback, useState } from "react";
import { getGrammarTopic } from "../constants/grammarTopics";
import type { AppTab } from "../types";
import { writeWorkspaceRoute } from "../lib/workspaceRoute";
import { TabPageShell } from "./TabPageShell";
import { GrammarTopicBrowser } from "./grammar/GrammarTopicBrowser";
import { GrammarTopicDetail } from "./grammar/GrammarTopicDetail";

interface GrammarTabProps {
  onTabChange: (tab: AppTab) => void;
  initialTopicId?: string | null;
}

export function GrammarTab({ onTabChange, initialTopicId = null }: GrammarTabProps) {
  const initialTopic = initialTopicId && getGrammarTopic(initialTopicId) ? initialTopicId : null;
  const [view, setView] = useState<"browser" | "detail">(initialTopic ? "detail" : "browser");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(initialTopic);

  const handleSelectTopic = useCallback((topicId: string) => {
    setActiveTopicId(topicId);
    setView("detail");
    writeWorkspaceRoute({ grammarTopicId: topicId });
  }, []);

  const handleBack = useCallback(() => {
    setView("browser");
    setActiveTopicId(null);
    writeWorkspaceRoute({ grammarTopicId: null });
  }, []);

  const handleBackToDashboard = useCallback(() => {
    onTabChange("dashboard");
  }, [onTabChange]);

  if (view === "detail" && activeTopicId) {
    return (
      <TabPageShell
        id="panel-grammar"
        labelledBy="tab-grammar"
        backTo={{ label: "Grammar", onBack: handleBack }}
      >
        <GrammarTopicDetail topicId={activeTopicId} />
      </TabPageShell>
    );
  }

  return (
    <TabPageShell
      id="panel-grammar"
      labelledBy="tab-grammar"
      backTo={{ label: "Dashboard", onBack: handleBackToDashboard }}
    >
      <GrammarTopicBrowser onSelectTopic={handleSelectTopic} />
    </TabPageShell>
  );
}
