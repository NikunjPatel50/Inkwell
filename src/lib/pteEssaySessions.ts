import type { PTEEssayScoreResult, PTEEssaySession } from "../types/writingMode";
import { ESSAY_PROMPT } from "../constants/coachLevels";

const STORAGE_KEY = "wrytesmart_pte_essay_sessions";
const MAX_SESSIONS = 80;

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pte-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function readPTESessions(): PTEEssaySession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PTEEssaySession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePTESessions(sessions: PTEEssaySession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
}

export function recordPTESession(
  essayText: string,
  score: PTEEssayScoreResult,
  prompt: string = ESSAY_PROMPT,
): PTEEssaySession {
  const session: PTEEssaySession = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    essayText: essayText.trim(),
    prompt,
    score,
  };

  const sessions = [session, ...readPTESessions()].slice(0, MAX_SESSIONS);
  writePTESessions(sessions);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pte-session-recorded"));
  }
  return session;
}

export function getPTESessionById(id: string): PTEEssaySession | undefined {
  return readPTESessions().find((session) => session.id === id);
}

/** Guest preview data — mirrors realistic PTE essay session history. */
export function getDemoPTESessions(): PTEEssaySession[] {
  const now = Date.now();
  const day = 86_400_000;

  const makeSession = (
    offsetDays: number,
    totalScore: number,
    traits: Array<{ id: string; score: number; feedback: string }>,
    topFixes: string[],
    prompt: string,
  ): PTEEssaySession => ({
    id: `demo-${offsetDays}`,
    createdAt: new Date(now - offsetDays * day).toISOString(),
    essayText: "Demo essay text for preview.",
    prompt,
    score: {
      totalScore,
      maxTotalScore: 26,
      cascadeNote: traits.some((t) => t.score === 0 && (t.id === "content" || t.id === "form"))
        ? "Content or Form scored 0 — other traits were not counted."
        : null,
      topFixes,
      traits: [
        { id: "content", label: "Content", maxScore: 6, score: 0, feedback: "" },
        { id: "form", label: "Form", maxScore: 2, score: 0, feedback: "" },
        {
          id: "development",
          label: "Development, Structure & Coherence",
          maxScore: 6,
          score: 0,
          feedback: "",
        },
        { id: "grammar", label: "Grammar", maxScore: 2, score: 0, feedback: "" },
        {
          id: "linguisticRange",
          label: "General Linguistic Range",
          maxScore: 6,
          score: 0,
          feedback: "",
        },
        { id: "vocabulary", label: "Vocabulary Range", maxScore: 2, score: 0, feedback: "" },
        { id: "spelling", label: "Spelling", maxScore: 2, score: 0, feedback: "" },
      ].map((def) => {
        const match = traits.find((t) => t.id === def.id);
        return {
          ...def,
          id: def.id as PTEEssaySession["score"]["traits"][number]["id"],
          score: match?.score ?? def.score,
          feedback: match?.feedback ?? "Adequate for this trait.",
        };
      }),
    },
  });

  return [
    makeSession(
      0,
      18,
      [
        { id: "content", score: 4, feedback: "Addresses the prompt but supporting points need depth." },
        { id: "form", score: 2, feedback: "Word count within 200–300." },
        { id: "development", score: 3, feedback: "Weak paragraph linking between body paragraphs." },
        { id: "grammar", score: 2, feedback: "Generally accurate grammar." },
        { id: "linguisticRange", score: 4, feedback: "Some sentence variety." },
        { id: "vocabulary", score: 2, feedback: "Appropriate academic vocabulary." },
        { id: "spelling", score: 1, feedback: "Minor spelling slips detected." },
      ],
      ["Strengthen paragraph transitions", "Add a clearer thesis in the introduction"],
      "Some people believe technology in education does more harm than good. Discuss.",
    ),
    makeSession(
      1,
      14,
      [
        { id: "content", score: 3, feedback: "Partially off-topic content in the second body paragraph." },
        { id: "form", score: 2, feedback: "Word count within 200–300." },
        { id: "development", score: 2, feedback: "Weak paragraph linking." },
        { id: "grammar", score: 1, feedback: "Several agreement errors." },
        { id: "linguisticRange", score: 3, feedback: "Limited sentence structures." },
        { id: "vocabulary", score: 2, feedback: "Adequate range." },
        { id: "spelling", score: 1, feedback: "A few spelling errors." },
      ],
      ["Stay on topic throughout", "Vary sentence openings"],
      "Governments should fund public transport instead of roads. To what extent do you agree?",
    ),
    makeSession(
      2,
      21,
      [
        { id: "content", score: 5, feedback: "Fully addresses the prompt with relevant examples." },
        { id: "form", score: 2, feedback: "Word count within 200–300." },
        { id: "development", score: 5, feedback: "Clear four-paragraph structure with logical flow." },
        { id: "grammar", score: 2, feedback: "Accurate grammar throughout." },
        { id: "linguisticRange", score: 5, feedback: "Good range of complex structures." },
        { id: "vocabulary", score: 2, feedback: "Precise academic vocabulary." },
        { id: "spelling", score: 0, feedback: "Not counted due to cascade." },
      ],
      [],
      "Working from home benefits employees more than employers. Discuss both views.",
    ),
    makeSession(
      4,
      8,
      [
        { id: "content", score: 0, feedback: "Off-topic content — the essay does not address the prompt." },
        { id: "form", score: 2, feedback: "Word count within 200–300." },
        { id: "development", score: 0, feedback: "Not counted — Content scored 0." },
        { id: "grammar", score: 0, feedback: "Not counted — Content scored 0." },
        { id: "linguisticRange", score: 0, feedback: "Not counted — Content scored 0." },
        { id: "vocabulary", score: 0, feedback: "Not counted — Content scored 0." },
        { id: "spelling", score: 0, feedback: "Not counted — Content scored 0." },
      ],
      ["Re-read the prompt before writing", "Outline two points that directly answer the question"],
      "Climate change is the greatest threat facing humanity. Do you agree?",
    ),
    makeSession(
      5,
      16,
      [
        { id: "content", score: 4, feedback: "Relevant ideas with room for stronger examples." },
        { id: "form", score: 1, feedback: "Under 200 words — Form penalty applied." },
        { id: "development", score: 3, feedback: "Conclusion does not summarise main points." },
        { id: "grammar", score: 2, feedback: "Mostly accurate." },
        { id: "linguisticRange", score: 4, feedback: "Some complex sentences." },
        { id: "vocabulary", score: 1, feedback: "Repetitive word choices." },
        { id: "spelling", score: 1, feedback: "Minor errors." },
      ],
      ["Expand to at least 200 words", "Use topic-specific vocabulary"],
      "University education should be free for all students. Discuss.",
    ),
    makeSession(
      7,
      19,
      [
        { id: "content", score: 5, feedback: "Clear position with relevant supporting detail." },
        { id: "form", score: 2, feedback: "Word count within 200–300." },
        { id: "development", score: 4, feedback: "Logical progression with minor linking gaps." },
        { id: "grammar", score: 2, feedback: "Accurate grammar." },
        { id: "linguisticRange", score: 4, feedback: "Varied structures." },
        { id: "vocabulary", score: 2, feedback: "Good academic range." },
        { id: "spelling", score: 0, feedback: "Not counted due to cascade." },
      ],
      ["Improve cohesive devices between paragraphs"],
      "Social media has a negative impact on young people. To what extent do you agree?",
    ),
  ];
}
