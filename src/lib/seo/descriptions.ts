/** Keep meta descriptions within Google's typical display limit. */
export function trimMetaDescription(text: string, maxLength = 155): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const clipped = normalized.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const safe = lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped;
  return `${safe.trim()}…`;
}

export const HOME_META_DESCRIPTION = trimMetaDescription(
  "Improve English writing with AI feedback, grammar lessons, vocabulary depth, and adaptive learning—all taught through real sentences.",
);

export const LEARN_META_DESCRIPTION = trimMetaDescription(
  "Adaptive English drills that target your weak spots—build-it, spot-the-error, and complete-it exercises taught inside real sentences.",
);

export const GRAMMAR_HUB_META_DESCRIPTION = trimMetaDescription(
  "Explore 40 grammar topics with explanations, highlighted examples, and practice—parts of speech, tenses, punctuation, and common mistakes.",
);

export const VOCABULARY_HUB_META_DESCRIPTION = trimMetaDescription(
  "Build vocabulary through curated collections and four depth levels—from definitions to etymology—taught inside sentences you write.",
);

export const WRITE_META_DESCRIPTION = trimMetaDescription(
  "Paste any draft for register scoring, in-context grammar teaching, and simple-to-advanced rewrites. See how the Write workspace works free.",
);

export const COACH_META_DESCRIPTION = trimMetaDescription(
  "Essay coaching with step-by-step feedback for academic and exam writing. Learn why each change matters—not just what to fix.",
);

export const CREATIVE_META_DESCRIPTION = trimMetaDescription(
  "Creative writing drills and games—rewrites, duels, and playful exercises that build vocabulary and sentence craft in context.",
);

export const PRICING_META_DESCRIPTION = trimMetaDescription(
  "Compare Wrytesmart Starter (free) and Pro (₹49/month). Grammar, vocabulary, and writing practice free—upgrade for PTE/IELTS scoring.",
);

export const IELTS_META_DESCRIPTION = trimMetaDescription(
  "IELTS writing practice with essay coaching, grammar lessons, and academic vocabulary—Task 2 structure, feedback, and rewrites in one workspace.",
);

export const PTE_META_DESCRIPTION = trimMetaDescription(
  "PTE writing practice with essay scoring, grammar support, and academic vocabulary—summaries, essays, and trait-level feedback in Wrytesmart.",
);

export const ENGLISH_WRITING_PRACTICE_META_DESCRIPTION = trimMetaDescription(
  "Practice English writing online with AI feedback, grammar lessons, and vocabulary building. Free to start — no install needed.",
);

export const ENGLISH_WRITING_PRACTICE_TITLE = "English Writing Practice Online | Wrytesmart";

export function grammarTopicMetaDescription(
  topicName: string,
  keyRule: string,
  categoryTitle?: string,
): string {
  const categoryHint = categoryTitle ? ` Part of ${categoryTitle}.` : "";
  return trimMetaDescription(
    `${keyRule} Learn ${topicName.toLowerCase()} with examples and practice exercises.${categoryHint}`,
  );
}

export function vocabularyCollectionMetaDescription(
  title: string,
  teaser: string,
): string {
  return trimMetaDescription(
    `Learn ${teaser} and more from the ${title} collection—definitions, examples, and depth levels in Wrytesmart.`,
  );
}
