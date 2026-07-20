import { NextResponse } from "next/server";
import { normalizeWord } from "@/lib/vocabularyLookup";
import {
  generateWordDetailWithAi,
  rescueLexiconLookup,
  VocabularyAiError,
} from "@/lib/vocabularyServerAi";

export async function POST(request: Request) {
  let word = "";
  try {
    const body = (await request.json()) as { word?: string };
    word = normalizeWord(body.word ?? "");
    if (!word) {
      return NextResponse.json({ error: "word is required." }, { status: 400 });
    }

    const detail = await generateWordDetailWithAi(word);
    return NextResponse.json(detail);
  } catch (error) {
    if (!word) {
      return NextResponse.json({ error: "word is required." }, { status: 400 });
    }

    const rescued = await rescueLexiconLookup(word);
    if (rescued) return NextResponse.json(rescued);

    const message =
      error instanceof VocabularyAiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Could not look up that word.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
