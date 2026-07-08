import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const result = await uploadFile(file);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
  }
}
