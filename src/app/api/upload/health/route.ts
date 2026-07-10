import { NextResponse } from "next/server";
import { getBlobDiagnostics } from "@/lib/storage";

/** Diagnostic upload — ouvre /api/upload/health après deploy */
export async function GET() {
  return NextResponse.json(getBlobDiagnostics());
}
