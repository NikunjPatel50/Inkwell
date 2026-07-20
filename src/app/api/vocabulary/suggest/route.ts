import { NextResponse } from "next/server";
import {
  isVocabularyAiConfigured,
  suggestWordsWithAi,
  VocabularyAiError,
} from "@/lib/vocabularyServerAi";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim() ?? "";
    if (!query) {
      return NextResponse.json({ error: "query is required." }, { status: 400 });
    }

    if (!isVocabularyAiConfigured()) {
      return NextResponse.json({ suggestions: [query] });
    }

    try {
      const suggestions = await suggestWordsWithAi(query);
      return NextResponse.json({
        suggestions: suggestions.length > 0 ? suggestions : [query],
      });
    } catch {
      return NextResponse.json({ suggestions: [query] });
    }
  } catch (error) {
    const message =
      error instanceof VocabularyAiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Could not fetch suggestions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
