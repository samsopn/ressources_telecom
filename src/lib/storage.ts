import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { get, put } from "@vercel/blob";

export type UploadResult = {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

/** Limite body Vercel (server upload) ≈ 4.5 Mo */
const MAX_SERVER_UPLOAD_BYTES = 4.5 * 1024 * 1024;

/**
 * Doit correspondre au type de store Vercel Blob :
 * - Store Public  → BLOB_ACCESS=public  (recommandé)
 * - Store Private → BLOB_ACCESS=private
 */
export function getBlobAccess(): "private" | "public" {
  if (process.env.BLOB_ACCESS === "private") return "private";
  // Défaut public : plus simple pour un hub perso + URLs ouvrables directement
  return "public";
}

/** Limite upload client (navigateur → Blob), au-delà utiliser un lien Drive */
export const MAX_CLIENT_UPLOAD_BYTES = 50 * 1024 * 1024;

function getReadWriteToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

export function getBlobDiagnostics() {
  const token = getReadWriteToken();
  return {
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    onVercel: Boolean(process.env.VERCEL),
    hasReadWriteToken: Boolean(token),
    tokenPrefix: token ? token.slice(0, 18) : null,
    blobAccess: getBlobAccess(),
    authMode: token ? "read-write-token" : "none",
  };
}

export function hasBlobCredentials() {
  return Boolean(getReadWriteToken());
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const token = getReadWriteToken();

  if (token) {
    if (file.size > MAX_SERVER_UPLOAD_BYTES) {
      throw new Error(
        "Fichier trop volumineux (max 4,5 Mo). Compresse le PDF ou utilise un lien Drive."
      );
    }

    const blob = await put(`uploads/${uniqueName}`, buffer, {
      access: getBlobAccess(),
      contentType,
      token,
      addRandomSuffix: true,
    });

    return {
      filePath: blob.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN manquant. Crée un Blob Public, colle le token, puis Redeploy."
    );
  }

  // Dev local (XAMPP) : disque local
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

export async function getPrivateBlob(url: string) {
  const token = getReadWriteToken();
  return get(url, {
    access: "private",
    ...(token ? { token } : {}),
  });
}

export function isPrivateBlobUrl(url: string) {
  return url.includes(".private.blob.vercel-storage.com");
}
