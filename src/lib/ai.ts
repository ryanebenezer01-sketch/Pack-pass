import Anthropic from "@anthropic-ai/sdk";

/**
 * Thin wrapper around the Anthropic SDK.
 *
 * Defaults follow the house style: `claude-opus-4-8` with adaptive thinking,
 * and streaming so long generations (full blog posts) don't hit HTTP timeouts.
 * When `ANTHROPIC_API_KEY` is unset the helpers throw `MissingApiKeyError`, and
 * callers fall back to deterministic mock output so the app still runs locally.
 */

export const MODEL = "claude-opus-4-8";

export class MissingApiKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set");
    this.name = "MissingApiKeyError";
  }
}

let client: Anthropic | null = null;

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new MissingApiKeyError();
  if (!client) client = new Anthropic();
  return client;
}

interface GenerateOptions {
  system: string;
  prompt: string;
  /** Stream the generation (recommended for long output). Default true. */
  stream?: boolean;
  maxTokens?: number;
}

/** Generate free-form text. Returns the concatenated text blocks. */
export async function generateText({
  system,
  prompt,
  stream = true,
  maxTokens = 8000,
}: GenerateOptions): Promise<string> {
  const anthropic = getClient();

  if (stream) {
    const s = anthropic.messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      thinking: { type: "adaptive" },
      system,
      messages: [{ role: "user", content: prompt }],
    });
    const message = await s.finalMessage();
    return textOf(message.content);
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system,
    messages: [{ role: "user", content: prompt }],
  });
  return textOf(message.content);
}

/**
 * Generate a value matching a JSON schema using structured outputs, so callers
 * get guaranteed-parseable JSON instead of scraping it out of prose.
 */
export async function generateJson<T>({
  system,
  prompt,
  schema,
  maxTokens = 4000,
}: {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system,
    messages: [{ role: "user", content: prompt }],
    // Structured outputs: constrain the response to our schema.
    output_config: { format: { type: "json_schema", schema } },
  } as Anthropic.MessageCreateParamsNonStreaming);

  const text = textOf(message.content);
  return JSON.parse(text) as T;
}

function textOf(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}
