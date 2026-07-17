import type { GrammarTopic } from "../constants/grammarTopics";
import type {
  FillBlankExercise,
  FillBlankResult,
  IdentifyItExercise,
  TransformItExercise,
  TransformItResult,
} from "../types";

function hashSeed(seed: string): number {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickExample(topic: GrammarTopic, seed: string) {
  if (topic.examples.length === 0) {
    return {
      sentence: topic.teaser,
      highlights: [{ text: topic.teaser.split(/\s+/)[0] ?? "word", tooltip: topic.keyRule }],
    };
  }
  const index = hashSeed(seed) % topic.examples.length;
  return topic.examples[index] ?? topic.examples[0];
}

function phraseWordIndex(sentence: string, phrase: string): number {
  const tokens = sentence.split(/\s+/);
  const phraseTokens = phrase.split(/\s+/);
  for (let i = 0; i <= tokens.length - phraseTokens.length; i += 1) {
    const slice = tokens.slice(i, i + phraseTokens.length).join(" ");
    if (slice.toLowerCase() === phrase.toLowerCase()) return i;
  }
  const single = tokens.findIndex((token) => token.toLowerCase() === phrase.toLowerCase());
  return single >= 0 ? single : 0;
}

export function isValidIdentifyItExercise(value: unknown): value is IdentifyItExercise {
  if (!value || typeof value !== "object") return false;
  const exercise = value as IdentifyItExercise;
  const tokens = exercise.sentence?.split(/\s+/) ?? [];
  return Boolean(
    exercise.sentence &&
      exercise.targetPhrase &&
      exercise.confirmation &&
      exercise.hint &&
      exercise.explanation &&
      exercise.targetIndex >= 0 &&
      exercise.targetIndex < tokens.length,
  );
}

export function isValidFillBlankExercise(value: unknown): value is FillBlankExercise {
  if (!value || typeof value !== "object") return false;
  const exercise = value as FillBlankExercise;
  return Boolean(exercise.stem?.includes("___") && exercise.hint);
}

export function isValidTransformItExercise(value: unknown): value is TransformItExercise {
  if (!value || typeof value !== "object") return false;
  const exercise = value as TransformItExercise;
  return Boolean(exercise.originalSentence && exercise.prompt && exercise.modelAnswer);
}

export function buildLocalIdentifyItExercise(
  topic: GrammarTopic,
  seed: string,
): IdentifyItExercise {
  const example = pickExample(topic, seed);
  const highlight = example.highlights[0];
  const targetPhrase = highlight?.text ?? topic.teaser.split(/\s+/)[0] ?? "word";

  return {
    sentence: example.sentence,
    targetPhrase,
    targetIndex: phraseWordIndex(example.sentence, targetPhrase),
    confirmation: `Correct — that's the ${topic.name.toLowerCase()} in this sentence.`,
    hint: highlight?.tooltip ?? `Look for the ${topic.name.toLowerCase()} in this sentence.`,
    explanation: highlight?.tooltip ?? topic.keyRule,
  };
}

export function buildLocalFillBlankExercise(
  topic: GrammarTopic,
  seed: string,
): FillBlankExercise {
  const example = pickExample(topic, `${seed}-fill`);
  const highlight = example.highlights[0];
  const target = highlight?.text ?? "";
  const stem = target
    ? example.sentence.replace(new RegExp(`\\b${escapeRegex(target)}\\b`, "i"), "___")
    : example.sentence;

  return {
    stem: stem.includes("___") ? stem : `${example.sentence.replace(target, "___")}`,
    hint: highlight?.tooltip ?? topic.keyRule,
  };
}

function localFillBlankAnswer(topic: GrammarTopic, stem: string): string {
  for (const example of topic.examples) {
    for (const highlight of example.highlights) {
      const candidate = example.sentence.replace(
        new RegExp(`\\b${escapeRegex(highlight.text)}\\b`, "i"),
        "___",
      );
      if (candidate === stem) return highlight.text;
    }
  }
  return topic.examples[0]?.highlights[0]?.text ?? "";
}

export function checkFillBlankLocally(
  topic: GrammarTopic,
  stem: string,
  answer: string,
): FillBlankResult {
  const expected = localFillBlankAnswer(topic, stem);
  const normalizedAnswer = answer.trim().toLowerCase();
  const normalizedExpected = expected.trim().toLowerCase();
  const correct =
    normalizedAnswer === normalizedExpected ||
    (normalizedExpected.length > 0 && stem.toLowerCase().includes(normalizedAnswer) && normalizedAnswer.length > 1);

  return {
    correct,
    feedback: correct
      ? "That's the right word for this sentence."
      : "Not quite — compare your answer with the example in Section 2.",
    correctAnswer: expected || answer.trim(),
    explanation: topic.keyRule,
  };
}

export function buildLocalTransformItExercise(
  topic: GrammarTopic,
  seed: string,
): TransformItExercise {
  const example = pickExample(topic, `${seed}-transform`);
  const highlight = example.highlights[0];
  const target = highlight?.text ?? "";

  const originalSentence = target
    ? example.sentence.replace(new RegExp(`\\b${escapeRegex(target)}\\b`, "i"), "___")
    : topic.teaser;

  return {
    originalSentence,
    prompt: `Rewrite the sentence to apply this rule: ${topic.keyRule}`,
    modelAnswer: example.sentence,
  };
}

export function checkTransformItLocally(
  topic: GrammarTopic,
  originalSentence: string,
  userRewrite: string,
): TransformItResult {
  const match = topic.examples.find((example) => {
    const highlight = example.highlights[0];
    if (!highlight) return false;
    const blanked = example.sentence.replace(
      new RegExp(`\\b${escapeRegex(highlight.text)}\\b`, "i"),
      "___",
    );
    return blanked === originalSentence;
  });
  const example = match ?? pickExample(topic, originalSentence);
  const highlight = example.highlights[0]?.text ?? "";
  const normalizedRewrite = userRewrite.trim().toLowerCase();
  const normalizedModel = example.sentence.trim().toLowerCase();
  const includesTarget = highlight
    ? normalizedRewrite.includes(highlight.toLowerCase())
    : true;
  const correct =
    normalizedRewrite === normalizedModel ||
    (includesTarget && normalizedRewrite.length >= normalizedModel.length * 0.6);

  return {
    correct,
    feedback: correct
      ? "Nice rewrite — you applied the concept clearly."
      : "Your rewrite doesn't quite demonstrate the rule yet.",
    modelAnswer: example.sentence,
    explanation: topic.keyRule,
  };
}
