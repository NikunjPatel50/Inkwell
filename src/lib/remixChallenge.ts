import { COMPLEXITY_LEVELS, TONES, type RemixChallenge } from "../types";

export function pickRandomRemixChallenge(): RemixChallenge {
  const complexity =
    COMPLEXITY_LEVELS[Math.floor(Math.random() * COMPLEXITY_LEVELS.length)].value;
  const tone = TONES[Math.floor(Math.random() * TONES.length)].value;
  return { complexity, tone };
}

export function formatRemixChallenge(challenge: RemixChallenge): string {
  const complexityLabel =
    COMPLEXITY_LEVELS.find((level) => level.value === challenge.complexity)?.label ??
    challenge.complexity;
  const toneLabel =
    TONES.find((tone) => tone.value === challenge.tone)?.label ?? challenge.tone;

  return `${complexityLabel} + ${toneLabel}`;
}
