"use client";

import { upload } from "@vercel/blob/client";

export type ClientUploadResult = {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

const MAX_CLIENT_UPLOAD_BYTES = 50 * 1024 * 1024;

function isLocalHost() {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function safePathname(fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `uploads/${Date.now()}-${safeName}`;
}

/**
 * Upload navigateur → Vercel Blob (évite la limite ~4,5 Mo des Serverless).
 * En local sans Blob token, bascule sur /api/upload (disque).
 */
export async function uploadResourceFile(file: File): Promise<ClientUploadResult> {
  if (file.size > MAX_CLIENT_UPLOAD_BYTES) {
    throw new Error(
      "Fichier trop volumineux (max 50 Mo). Compresse le PDF ou utilise un lien Google Drive (type Lien)."
    );
  }

  const pathname = safePathname(file.name);
  const access =
    process.env.NEXT_PUBLIC_BLOB_ACCESS === "private" ? "private" : "public";

  try {
    const blob = await upload(pathname, file, {
      access,
      handleUploadUrl: "/api/blob/upload",
      multipart: file.size > 4 * 1024 * 1024,
      contentType: file.type || "application/octet-stream",
    });

    return {
      filePath: blob.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
    };
  } catch (error) {
    if (!isLocalHost()) {
      const message =
        error instanceof Error ? error.message : "Échec de l'upload Blob";
      throw new Error(
        `${message}. Vérifie BLOB_READ_WRITE_TOKEN + store Public, ou utilise un lien Drive.`
      );
    }
  }

  // Fallback local (XAMPP) : écriture disque via API serveur
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : "Upload échoué"
    );
  }

  return data as ClientUploadResult;
}
