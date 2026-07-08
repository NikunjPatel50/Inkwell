export function categorizeError(issue: string): string {
  const lower = issue.toLowerCase();

  if (
    lower.includes("tone") ||
    lower.includes("informal") ||
    lower.includes("formal") ||
    lower.includes("register")
  ) {
    return "Tone";
  }

  if (
    lower.includes("punctuat") ||
    lower.includes("comma") ||
    lower.includes("apostrophe") ||
    lower.includes("period") ||
    lower.includes("semicolon") ||
    lower.includes("quotation")
  ) {
    return "Punctuation";
  }

  if (
    lower.includes("structure") ||
    lower.includes("run-on") ||
    lower.includes("fragment") ||
    lower.includes("clause") ||
    lower.includes("sentence")
  ) {
    return "Sentence Structure";
  }

  return "Word Choice";
}
