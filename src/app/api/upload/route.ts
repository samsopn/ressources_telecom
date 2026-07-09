import { NextRequest, NextResponse } from "next/server";
import { hasBlobCredentials, uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const oidcToken = request.headers.get("x-vercel-oidc-token");

    if (!(await hasBlobCredentials({ oidcToken })) && process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Stockage Blob non configuré. Active OIDC dans Vercel Settings → Security, puis Redeploy.",
        },
        { status: 500 }
      );
    }

    const result = await uploadFile(file, { oidcToken });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Échec de l'upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
