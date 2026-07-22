import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getBlobDiagnostics,
  hasBlobCredentials,
  MAX_CLIENT_UPLOAD_BYTES,
} from "@/lib/storage";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!hasBlobCredentials()) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN manquant. Crée un store Blob Public et Redeploy.",
        diagnostics: getBlobDiagnostics(),
      },
      { status: 500 }
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_CLIENT_UPLOAD_BYTES,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec token upload";
    return NextResponse.json(
      { error: message, diagnostics: getBlobDiagnostics() },
      { status: 400 }
    );
  }
}
