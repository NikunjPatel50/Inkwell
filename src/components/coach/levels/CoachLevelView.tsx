"use client";

import {
  PARAGRAPH_BUILDER_STEPS,
  SENTENCE_EXPANSION_STEPS,
  THINKING_MODE_STEPS,
} from "../../../constants/coachLevels";
import type { CoachLevelId, CoachProgressState } from "../../../types/coach";
import { getLevelProgress } from "../../../lib/coachClient";
import { CoachStepFlow } from "../CoachStepFlow";
import { CollocationBuilderLevel } from "./CollocationBuilderLevel";
import { NounFamiliesLevel } from "./NounFamiliesLevel";
import { TopicLanguageBankLevel } from "./TopicLanguageBankLevel";
import { EssayBuilderLevel } from "./EssayBuilderLevel";

interface CoachLevelViewProps {
  levelId: CoachLevelId;
  progress: CoachProgressState;
  onProgressUpdate: () => void;
}

export function CoachLevelView({ levelId, progress, onProgressUpdate }: CoachLevelViewProps) {
  const levelProgress = getLevelProgress(progress, levelId);

  switch (levelId) {
    case "collocation-builder":
      return <CollocationBuilderLevel onProgressUpdate={onProgressUpdate} />;
    case "noun-families":
      return <NounFamiliesLevel onProgressUpdate={onProgressUpdate} />;
    case "topic-language-bank":
      return <TopicLanguageBankLevel onProgressUpdate={onProgressUpdate} />;
    case "sentence-expansion":
      return (
        <CoachStepFlow
          levelId={levelId}
          title="Sentence Expansion"
          steps={SENTENCE_EXPANSION_STEPS}
          initialStep={levelProgress.inProgressStep ?? 0}
          initialData={levelProgress.inProgressData}
          onProgressUpdate={onProgressUpdate}
        />
      );
    case "paragraph-builder":
      return (
        <CoachStepFlow
          levelId={levelId}
          title="Paragraph Builder"
          steps={PARAGRAPH_BUILDER_STEPS}
          initialStep={levelProgress.inProgressStep ?? 0}
          initialData={levelProgress.inProgressData}
          onProgressUpdate={onProgressUpdate}
        />
      );
    case "thinking-mode":
      return (
        <CoachStepFlow
          levelId={levelId}
          title="Thinking Mode"
          steps={THINKING_MODE_STEPS}
          initialStep={levelProgress.inProgressStep ?? 0}
          initialData={levelProgress.inProgressData}
          onProgressUpdate={onProgressUpdate}
        />
      );
    case "essay-builder":
      return <EssayBuilderLevel onProgressUpdate={onProgressUpdate} />;
    default:
      return null;
  }
}
