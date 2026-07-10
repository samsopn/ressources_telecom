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

    const diagnostics = getBlobDiagnostics();

    if (!hasBlobCredentials() && process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "BLOB_READ_WRITE_TOKEN manquant. Crée un store Blob Public et Redeploy.",
          diagnostics,
        },
        { status: 500 }
      );
    }

    const result = await uploadFile(file);
    return NextResponse.json(result);
  } catch (error) {
    const diagnostics = getBlobDiagnostics();
    const message =
      error instanceof Error ? error.message : "Échec de l'upload";
    return NextResponse.json({ error: message, diagnostics }, { status: 500 });
  }
}
