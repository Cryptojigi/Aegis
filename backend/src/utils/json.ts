/**
 * Robust JSON extraction from LLM responses.
 * DeepSeek doesn't support OpenAI's structured output (`response_format`),
 * so we parse the response manually — stripping markdown fences, trimming,
 * and finding the first valid JSON object/array.
 */

export function extractJson(text: string): any {
  if (!text) throw new Error("Empty response from LLM");

  // 1. Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // fall through
  }

  // 2. Strip markdown code fences
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through
  }

  // 3. Find the first `{...}` or `[...]` block
  const braceMatch = cleaned.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {
      // fall through
    }
  }

  const bracketMatch = cleaned.match(/\[[\s\S]*\]/);
  if (bracketMatch) {
    try {
      return JSON.parse(bracketMatch[0]);
    } catch {
      // fall through
    }
  }

  throw new Error("Could not extract valid JSON from LLM response");
}
