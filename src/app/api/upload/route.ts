import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const hasBlob =
      process.env.BLOB_STORE_ID ||
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_OIDC_TOKEN;

    if (!hasBlob && process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Stockage Blob non configuré. Relie le store Blob au projet puis Redeploy.",
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
