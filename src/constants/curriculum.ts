import type { ExerciseType, Tier } from "../types";

export interface CurriculumSkill {
  id: string;
  name: string;
  tier: Tier;
  description: string;
  exerciseTypes: ExerciseType[];
  introduction: string;
}

export interface TierInfo {
  tier: Tier;
  name: string;
  description: string;
}

export const TIER_INFO: TierInfo[] = [
  {
    tier: 1,
    name: "Foundations",
    description: "Core building blocks every sentence needs before complexity.",
  },
  {
    tier: 2,
    name: "Building complexity",
    description: "Link ideas, shift time, and shape longer sentences with confidence.",
  },
  {
    tier: 3,
    name: "Advanced expression",
    description: "Refine voice, rhythm, and precision for mature writing.",
  },
];

export const CURRICULUM_SKILLS: CurriculumSkill[] = [
  {
    id: "basic-sentence-structure",
    name: "Basic sentence structure",
    tier: 1,
    description: "Subject, verb, and object in clear order.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "A sentence needs a subject (who or what) and a verb (what happens). Many strong sentences add an object — the thing acted upon. When these pieces appear in a sensible order, readers follow your meaning instantly. Example: \"The cat (subject) chased (verb) the ball (object).\"",
  },
  {
    id: "capitalization-punctuation",
    name: "Capitalization and end punctuation",
    tier: 1,
    description: "Starts, stops, and sentence boundaries.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Capital letters mark the start of a sentence and proper nouns. End punctuation — a period, question mark, or exclamation — tells readers where one thought ends. These small signals keep writing readable and professional.",
  },
  {
    id: "nouns-verbs",
    name: "Nouns and verbs",
    tier: 1,
    description: "The words that name things and show action.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Nouns name people, places, things, or ideas. Verbs show what happens — action or state. Strong sentences pair concrete nouns with precise verbs instead of vague wording like \"thing\" or \"do.\"",
  },
  {
    id: "simple-adjectives-adverbs",
    name: "Simple adjectives and adverbs",
    tier: 1,
    description: "Describe nouns and verbs without clutter.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Adjectives describe nouns (a quiet room). Adverbs describe verbs, adjectives, or other adverbs (she spoke softly). Use them to add detail — but too many weaken the sentence.",
  },
  {
    id: "articles",
    name: "Articles (a, an, the)",
    tier: 1,
    description: "When to use a, an, and the before nouns.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "\"A\" and \"an\" introduce non-specific nouns; \"the\" points to something specific or already known. Choosing the right article helps readers know whether you mean any example or one particular thing.",
  },
  {
    id: "conjunctions",
    name: "Conjunctions",
    tier: 2,
    description: "Connect ideas with and, but, so, because, although.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Conjunctions join words, phrases, or clauses. \"And\" adds; \"but\" contrasts; \"so\" shows result; \"because\" and \"although\" link reasons and concessions. They let you combine ideas without choppy fragments.",
  },
  {
    id: "compound-sentences",
    name: "Compound sentences",
    tier: 2,
    description: "Two independent clauses joined correctly.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "A compound sentence joins two complete thoughts with a conjunction or semicolon. Each side must stand alone as a sentence. Done well, it shows relationship between ideas; done poorly, it becomes a run-on.",
  },
  {
    id: "verb-tenses",
    name: "Verb tenses",
    tier: 2,
    description: "Present, past, and future time consistently.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Verb tense places your writing in time. Shifting tense without reason confuses readers. Keep time consistent within a passage unless you deliberately signal a change.",
  },
  {
    id: "prepositions-phrases",
    name: "Prepositions and phrases",
    tier: 2,
    description: "Show location, time, and direction clearly.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Prepositions (in, on, at, through, before) begin phrases that locate or time something. They answer where, when, or how. Clear prepositional phrases anchor your meaning.",
  },
  {
    id: "question-formation",
    name: "Question formation",
    tier: 2,
    description: "Word order and punctuation for questions.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Questions often invert subject and verb (\"Are you ready?\") or start with a question word (who, what, where). The right form signals curiosity or need without sounding awkward.",
  },
  {
    id: "subordinate-clauses",
    name: "Subordinate clauses",
    tier: 3,
    description: "Dependent clauses that support a main idea.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "A subordinate clause adds context but cannot stand alone (\"Although it was late, …\"). It depends on a main clause. Used well, it layers detail; used badly, it creates fragments.",
  },
  {
    id: "passive-active-voice",
    name: "Passive vs active voice",
    tier: 3,
    description: "Who does what — direct vs indirect phrasing.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Active voice puts the doer first: \"The team finished the report.\" Passive flips it: \"The report was finished.\" Active is usually clearer; passive can be useful when the actor is unknown or unimportant.",
  },
  {
    id: "tone-and-register",
    name: "Tone and register",
    tier: 3,
    description: "Match formality and attitude to context.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Tone is your attitude; register is how formal you sound. The same fact can sound casual (\"Yeah, it rained\") or formal (\"Precipitation occurred throughout the afternoon\"). Consistent choices build trust with readers.",
  },
  {
    id: "precise-word-choice",
    name: "Precise word choice",
    tier: 3,
    description: "Replace vague intensifiers with specific language.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Words like \"very,\" \"really,\" and \"things\" pad sentences without adding meaning. Precise nouns and verbs do the work instead: \"exhausted\" beats \"very tired\"; \"documents\" beats \"things.\"",
  },
  {
    id: "sentence-rhythm",
    name: "Sentence rhythm and variation",
    tier: 3,
    description: "Mix short and long sentences for flow.",
    exerciseTypes: ["build-it", "spot-error", "complete-it"],
    introduction:
      "Monotonous sentences tire the reader. Varying length and structure creates rhythm — a short punch after a longer explanation, or a flowing line after a blunt fact. Good rhythm guides attention without shouting.",
  },
];

export const VARIETY_SEEDS = [
  "coffee",
  "travel",
  "weather",
  "garden",
  "music",
  "library",
  "kitchen",
  "morning",
  "city",
  "ocean",
  "letters",
  "market",
] as const;

export function getSkillById(id: string): CurriculumSkill | undefined {
  return CURRICULUM_SKILLS.find((skill) => skill.id === id);
}

export function getSkillsByTier(tier: Tier): CurriculumSkill[] {
  return CURRICULUM_SKILLS.filter((skill) => skill.tier === tier);
}

export function randomVarietySeed(): string {
  return VARIETY_SEEDS[Math.floor(Math.random() * VARIETY_SEEDS.length)];
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  "build-it": "Build It",
  "spot-error": "Spot the Error",
  "complete-it": "Complete It",
};

export const EXERCISE_TYPE_ORDER: ExerciseType[] = ["build-it", "spot-error", "complete-it"];
