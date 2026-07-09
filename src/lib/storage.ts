import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { get, put } from "@vercel/blob";
import { getVercelOidcToken } from "@vercel/oidc";

export type UploadResult = {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

/** Limite body Vercel (server upload) ≈ 4.5 Mo */
const MAX_SERVER_UPLOAD_BYTES = 4.5 * 1024 * 1024;

export type BlobAuthOptions = {
  /** Token OIDC runtime (header x-vercel-oidc-token sur Vercel) */
  oidcToken?: string | null;
};

async function resolveOidcToken(auth?: BlobAuthOptions) {
  if (auth?.oidcToken) return auth.oidcToken;
  if (process.env.VERCEL_OIDC_TOKEN) return process.env.VERCEL_OIDC_TOKEN;

  try {
    return await getVercelOidcToken();
  } catch {
    return undefined;
  }
}

function getStoreId() {
  return process.env.BLOB_STORE_ID ?? undefined;
}

async function buildAuthOptions(contentType: string, auth?: BlobAuthOptions) {
  const storeId = getStoreId();
  const oidcToken = await resolveOidcToken(auth);

  // Sur Vercel : OIDC + storeId (recommandé)
  if (oidcToken && storeId) {
    return {
      access: "private" as const,
      contentType,
      oidcToken,
      storeId,
    };
  }

  // Fallback : token read-write du store
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      access: "private" as const,
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    };
  }

  return {
    access: "private" as const,
    contentType,
  };
}

export async function hasBlobCredentials(auth?: BlobAuthOptions) {
  if (
    auth?.oidcToken ||
    process.env.VERCEL_OIDC_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN
  ) {
    return true;
  }

  if (process.env.BLOB_STORE_ID) {
    const token = await resolveOidcToken(auth);
    return Boolean(token);
  }

  return false;
}

export async function uploadFile(
  file: File,
  auth?: BlobAuthOptions
): Promise<UploadResult> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";

  if (await hasBlobCredentials(auth)) {
    if (file.size > MAX_SERVER_UPLOAD_BYTES) {
      throw new Error(
        "Fichier trop volumineux (max 4,5 Mo sur Vercel). Compresse le PDF ou utilise un lien."
      );
    }

    const blob = await put(
      `uploads/${uniqueName}`,
      buffer,
      await buildAuthOptions(contentType, auth)
    );

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

export async function getPrivateBlob(url: string, auth?: BlobAuthOptions) {
  const options = await buildAuthOptions(
    "application/octet-stream",
    auth
  );

  return get(url, options);
}

export function isPrivateBlobUrl(url: string) {
  return url.includes(".private.blob.vercel-storage.com");
}
