import { z } from "zod";

export const aiAssistSchema = z.object({
  action: z.enum(["suggest", "summarize", "explain"]),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  url: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  categories: z.array(z.string()).optional().default([]),
});

export type AiAssistInput = z.infer<typeof aiAssistSchema>;

export type AiSuggestResult = {
  action: "suggest";
  categoryName: string | null;
  tags: string[];
  description: string;
};

export type AiTextResult = {
  action: "summarize" | "explain";
  content: string;
};

export type AiAssistResult = AiSuggestResult | AiTextResult;

function getAiConfig() {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    return {
      provider: "gemini" as const,
      apiKey: geminiKey,
      model: process.env.AI_MODEL?.trim() || "gemini-2.0-flash",
    };
  }

  const apiKey =
    process.env.AI_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.GROQ_API_KEY?.trim();

  if (!apiKey) return null;

  const baseUrl =
    process.env.AI_BASE_URL?.trim() ||
    (process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1");

  const model =
    process.env.AI_MODEL?.trim() ||
    (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini");

  return {
    provider: "openai" as const,
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, ""),
    model,
  };
}

export function isAiConfigured() {
  return Boolean(getAiConfig());
}

export function getAiDiagnostics() {
  const config = getAiConfig();
  return {
    configured: Boolean(config),
    provider: config?.provider ?? null,
    model: config?.model ?? null,
  };
}

function buildSystemPrompt(action: AiAssistInput["action"]) {
  const base =
    "Tu es un assistant expert en réseaux et télécoms (routing, switching, BGP, MPLS, 5G, fibre, CCNA/CCNP). Réponds toujours en français.";

  if (action === "suggest") {
    return `${base}
À partir des infos d'une ressource, propose une catégorie, des tags et une description courte.
Réponds UNIQUEMENT avec un JSON valide de la forme:
{"categoryName":"Nom ou null","tags":["tag1","tag2"],"description":"2-3 phrases max"}
Si une liste de catégories est fournie, categoryName DOIT être l'une d'elles (ou null).
Les tags sont courts (1-3 mots), techniques, sans #.`;
  }

  if (action === "summarize") {
    return `${base}
Résume les notes personnelles en Markdown clair (titres courts, listes à puces, points clés).
Ne invente pas de faits absents des notes.`;
  }

  return `${base}
Explique la ressource de façon pédagogique (niveau étudiant / lab).
Structure en Markdown: idée principale, points clés, pièges fréquents, piste de lab si pertinent.
Reste concis (200-350 mots).`;
}

function buildUserPrompt(input: AiAssistInput) {
  const lines = [
    `Titre: ${input.title || "(vide)"}`,
    `Description: ${input.description || "(vide)"}`,
    `URL: ${input.url || "(aucune)"}`,
    `Notes:\n${input.notes || "(aucune)"}`,
  ];

  if (input.action === "suggest" && input.categories.length > 0) {
    lines.push(`Catégories disponibles: ${input.categories.join(", ")}`);
  }

  return lines.join("\n");
}

async function callGemini(apiKey: string, model: string, system: string, user: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1200,
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Erreur Gemini");
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("");

  if (!text?.trim()) throw new Error("Réponse IA vide");
  return text.trim();
}

async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  system: string,
  user: string
) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Erreur API IA");
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text?.trim()) throw new Error("Réponse IA vide");
  return String(text).trim();
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("JSON IA invalide");
  }
  return JSON.parse(raw.slice(start, end + 1)) as {
    categoryName?: string | null;
    tags?: string[];
    description?: string;
  };
}

export async function runAiAssist(input: AiAssistInput): Promise<AiAssistResult> {
  const config = getAiConfig();
  if (!config) {
    throw new Error(
      "IA non configurée. Ajoute GEMINI_API_KEY ou OPENAI_API_KEY (ou AI_API_KEY) puis Redeploy."
    );
  }

  const system = buildSystemPrompt(input.action);
  const user = buildUserPrompt(input);

  const text =
    config.provider === "gemini"
      ? await callGemini(config.apiKey, config.model, system, user)
      : await callOpenAiCompatible(
          config.baseUrl,
          config.apiKey,
          config.model,
          system,
          user
        );

  if (input.action === "suggest") {
    const parsed = extractJsonObject(text);
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
          .map((tag) => String(tag).replace(/^#/, "").trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];

    let categoryName =
      typeof parsed.categoryName === "string" ? parsed.categoryName.trim() : null;
    if (categoryName && input.categories.length > 0) {
      const match = input.categories.find(
        (name) => name.toLowerCase() === categoryName!.toLowerCase()
      );
      categoryName = match ?? null;
    }

    return {
      action: "suggest",
      categoryName,
      tags,
      description:
        typeof parsed.description === "string"
          ? parsed.description.trim()
          : "",
    };
  }

  return {
    action: input.action,
    content: text,
  };
}
