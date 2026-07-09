import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Stockage Blob non configuré. Ajoute BLOB_READ_WRITE_TOKEN dans Vercel puis Redeploy.",
        },
        { status: 500 }
      );
    }

    const result = await uploadFile(file);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Échec de l'upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
