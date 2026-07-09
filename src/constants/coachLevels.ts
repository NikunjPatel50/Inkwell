import type { CoachLevelDefinition } from "../types/coach";

export const COACH_VERBS = [
  "Improve",
  "Reduce",
  "Enhance",
  "Increase",
  "Develop",
  "Maintain",
  "Achieve",
  "Support",
  "Promote",
  "Address",
] as const;

export const COACH_NOUNS = [
  "Productivity",
  "Communication",
  "Performance",
  "Efficiency",
  "Learning",
  "Innovation",
  "Collaboration",
  "Wellbeing",
  "Sustainability",
  "Engagement",
] as const;

export const COACH_LEVELS: CoachLevelDefinition[] = [
  {
    id: "collocation-builder",
    level: 1,
    title: "Collocation Builder",
    description: "Learn natural verb + noun combinations through active recall.",
    badge: "Vocabulary",
  },
  {
    id: "noun-families",
    level: 2,
    title: "Noun Families",
    description: "Discover every verb that pairs with a key academic noun.",
    badge: "Vocabulary",
  },
  {
    id: "topic-language-bank",
    level: 3,
    title: "Topic Language Bank",
    description: "Ready-made collocations for common PTE essay topics.",
    badge: "Topics",
  },
  {
    id: "sentence-expansion",
    level: 4,
    title: "Sentence Expansion",
    description: "Build one strong sentence step by step before writing essays.",
    badge: "Writing",
  },
  {
    id: "paragraph-builder",
    level: 5,
    title: "Paragraph Builder",
    description: "Construct a full paragraph with feedback at every stage.",
    badge: "Writing",
  },
  {
    id: "essay-builder",
    level: 6,
    title: "Essay Builder",
    description: "Write a complete essay and receive teaching feedback, not just scores.",
    badge: "Essay",
  },
];

export const THINKING_MODE_LEVEL: CoachLevelDefinition = {
  id: "thinking-mode",
  level: 0,
  title: "Thinking Mode",
  description: "Plan your ideas before you write — then generate a polished paragraph.",
  badge: "Planning",
};

export const SENTENCE_EXPANSION_STEPS = [
  {
    id: "seed",
    prompt: "Start with a simple idea sentence.",
    question: "Write your opening sentence (e.g. Technology improves productivity).",
    placeholder: "Technology improves productivity.",
  },
  {
    id: "why",
    prompt: "Explain why this happens.",
    question: "Why does this happen? Give one clear reason.",
    placeholder: "Because digital tools automate repetitive tasks…",
  },
  {
    id: "explain",
    prompt: "Develop the explanation.",
    question: "Explain your reason in more detail.",
    placeholder: "Employees spend less time on manual work and more on creative tasks…",
  },
  {
    id: "research",
    prompt: "Add evidence or an example.",
    question: "Add research, a statistic, or a concrete example.",
    placeholder: "Studies show remote teams using collaboration software complete projects 20% faster…",
  },
  {
    id: "support",
    prompt: "Add another supporting point.",
    question: "Add a second supporting point that strengthens your argument.",
    placeholder: "Furthermore, cloud-based systems allow teams to share information instantly…",
  },
  {
    id: "result",
    prompt: "State the result.",
    question: "Write a result sentence — what is the outcome?",
    placeholder: "As a result, organisations that invest in technology gain a significant competitive advantage.",
  },
] as const;

export const PARAGRAPH_BUILDER_STEPS = [
  { id: "main-idea", question: "What is the main idea of your paragraph?", placeholder: "Online learning offers flexibility for working professionals." },
  { id: "explanation", question: "Explain this main idea.", placeholder: "Students can access lectures and materials at any time…" },
  { id: "research", question: "Add evidence or an example.", placeholder: "A 2023 survey found that 68% of online learners…" },
  { id: "support", question: "Add a supporting point.", placeholder: "Additionally, online platforms provide recorded sessions…" },
  { id: "result", question: "Write a concluding result sentence.", placeholder: "Therefore, online learning has become an essential option…" },
] as const;

export const THINKING_MODE_STEPS = [
  { id: "ideas", question: "List three possible ideas for this topic.", placeholder: "1. Flexibility\n2. Cost savings\n3. Social interaction" },
  { id: "choose", question: "Which idea is strongest? Write it in one sentence.", placeholder: "Flexibility is the strongest idea because…" },
  { id: "why", question: "Explain why this idea is the best choice.", placeholder: "It affects the largest number of students and…" },
  { id: "evidence", question: "Add evidence or an example.", placeholder: "Research from several universities shows…" },
  { id: "support", question: "Add another supporting point.", placeholder: "Furthermore, flexible schedules allow learners to…" },
  { id: "conclusion", question: "Write a conclusion sentence.", placeholder: "In conclusion, the flexibility of online learning…" },
] as const;

export const ESSAY_PROMPT =
  "Some people believe technology has made life more complicated, while others think it has simplified daily tasks. Discuss both views and give your own opinion.";

export function pickRandomVerb(): string {
  return COACH_VERBS[Math.floor(Math.random() * COACH_VERBS.length)];
}

export function pickRandomNoun(): string {
  return COACH_NOUNS[Math.floor(Math.random() * COACH_NOUNS.length)];
}
