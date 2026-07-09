import { NextRequest, NextResponse } from "next/server";
import {
  getBlobDiagnostics,
  hasBlobCredentials,
  uploadFile,
} from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const oidcToken = request.headers.get("x-vercel-oidc-token");
    const diagnostics = await getBlobDiagnostics({ oidcToken });

    if (!(await hasBlobCredentials({ oidcToken })) && process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Stockage Blob non configuré. Vérifie BLOB_READ_WRITE_TOKEN puis Redeploy.",
          diagnostics,
        },
        { status: 500 }
      );
    }

    const result = await uploadFile(file, { oidcToken });
    return NextResponse.json(result);
  } catch (error) {
    const oidcToken = request.headers.get("x-vercel-oidc-token");
    const diagnostics = await getBlobDiagnostics({ oidcToken });
    const message =
      error instanceof Error ? error.message : "Échec de l'upload";
    return NextResponse.json({ error: message, diagnostics }, { status: 500 });
  }
}
