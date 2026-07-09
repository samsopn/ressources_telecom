import { NextRequest, NextResponse } from "next/server";
import { getPrivateBlob, isPrivateBlobUrl } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !isPrivateBlobUrl(url)) {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  try {
    const oidcToken = request.headers.get("x-vercel-oidc-token");
    const result = await getPrivateBlob(url, { oidcToken });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          result.blob.pathname.split("/").pop() || "file"
        )}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de lire le fichier";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
