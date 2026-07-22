import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  aiAssistSchema,
  getAiDiagnostics,
  isAiConfigured,
  runAiAssist,
} from "@/lib/ai";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  return NextResponse.json(getAiDiagnostics());
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error:
          "IA non configurée. Ajoute GEMINI_API_KEY (gratuit) ou OPENAI_API_KEY sur Vercel, puis Redeploy.",
        diagnostics: getAiDiagnostics(),
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const parsed = aiAssistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête IA invalide" }, { status: 400 });
    }

    const result = await runAiAssist(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec IA";
    return NextResponse.json(
      { error: message, diagnostics: getAiDiagnostics() },
      { status: 500 }
    );
  }
}
