export const COLLOCATION_ESSAY_TOPICS = [
  "Education",
  "Technology",
  "Environment",
  "Health",
  "Working From Home",
  "Social Media",
] as const;

export type CollocationEssayTopic = (typeof COLLOCATION_ESSAY_TOPICS)[number];
