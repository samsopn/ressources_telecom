import { NextRequest, NextResponse } from "next/server";
import { getBlobDiagnostics } from "@/lib/storage";

/** Diagnostic upload Blob — ouvre /api/upload/health sur Vercel */
export async function GET(request: NextRequest) {
  const oidcToken = request.headers.get("x-vercel-oidc-token");
  const diagnostics = await getBlobDiagnostics({ oidcToken });
  return NextResponse.json(diagnostics);
}
