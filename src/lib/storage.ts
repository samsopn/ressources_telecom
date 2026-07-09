import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export type UploadResult = {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

/** Limite body Vercel (server upload) ≈ 4.5 Mo */
const MAX_SERVER_UPLOAD_BYTES = 4.5 * 1024 * 1024;

function hasBlobCredentials() {
  // Sur Vercel : OIDC (BLOB_STORE_ID + VERCEL_OIDC_TOKEN) est préféré.
  // Hors Vercel : BLOB_READ_WRITE_TOKEN.
  return Boolean(
    process.env.BLOB_STORE_ID ||
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_OIDC_TOKEN
  );
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (hasBlobCredentials()) {
    if (file.size > MAX_SERVER_UPLOAD_BYTES) {
      throw new Error(
        "Fichier trop volumineux (max 4,5 Mo sur Vercel). Compresse le PDF ou utilise un lien."
      );
    }

    // Ne PAS passer `token` explicitement : un token explicite écrase OIDC.
    // Sur Vercel, le SDK utilise BLOB_STORE_ID + VERCEL_OIDC_TOKEN automatiquement.
    const blob = await put(`uploads/${uniqueName}`, buffer, {
      access: "private",
      contentType: file.type || "application/octet-stream",
    });

    return {
      filePath: blob.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  // Fallback local (dev XAMPP / hors Vercel)
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, uniqueName), buffer);

  return {
    filePath: `/uploads/${uniqueName}`,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}
