export type RegisterTier = "Simple" | "Intermediate" | "Advanced";

/** Clamp API registerScore to 0–100; default to 50 when missing or invalid. */
export function clampRegisterScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 50;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function registerLabelFromScore(score: number): RegisterTier {
  if (score <= 33) return "Simple";
  if (score <= 66) return "Intermediate";
  return "Advanced";
}

export function registerMeterLabel(score: number): string {
  return `Your writing reads as: ${registerLabelFromScore(score)}`;
}
