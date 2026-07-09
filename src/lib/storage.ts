import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { get, put, type PutCommandOptions } from "@vercel/blob";
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
  oidcToken?: string | null;
};

function getBlobAccess(): "private" | "public" {
  // Store Private → "private" (défaut). Store Public → mets BLOB_ACCESS=public
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}

async function resolveOidcToken(auth?: BlobAuthOptions) {
  if (auth?.oidcToken) return auth.oidcToken;
  if (process.env.VERCEL_OIDC_TOKEN) return process.env.VERCEL_OIDC_TOKEN;
  try {
    return await getVercelOidcToken();
  } catch {
    return undefined;
  }
}

/**
 * Priorité :
 * 1. BLOB_READ_WRITE_TOKEN (le plus fiable pour un store lié)
 * 2. OIDC + BLOB_STORE_ID (Vercel runtime)
 */
async function buildPutOptions(
  contentType: string,
  auth?: BlobAuthOptions
): Promise<PutCommandOptions> {
  const access = getBlobAccess();
  const rwToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (rwToken) {
    return {
      access,
      contentType,
      token: rwToken,
      addRandomSuffix: true,
    };
  }

  const storeId = process.env.BLOB_STORE_ID;
  const oidcToken = await resolveOidcToken(auth);

  if (oidcToken && storeId) {
    return {
      access,
      contentType,
      oidcToken,
      storeId,
      addRandomSuffix: true,
    };
  }

  return {
    access,
    contentType,
    addRandomSuffix: true,
  };
}

export async function getBlobDiagnostics(auth?: BlobAuthOptions) {
  const oidcToken = await resolveOidcToken(auth);
  return {
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    onVercel: Boolean(process.env.VERCEL),
    hasReadWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
    hasStoreId: Boolean(process.env.BLOB_STORE_ID),
    hasOidcToken: Boolean(oidcToken),
    blobAccess: getBlobAccess(),
    authMode: process.env.BLOB_READ_WRITE_TOKEN?.trim()
      ? "read-write-token"
      : oidcToken && process.env.BLOB_STORE_ID
        ? "oidc"
        : "none",
  };
}

export async function hasBlobCredentials(auth?: BlobAuthOptions) {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  if (auth?.oidcToken || process.env.VERCEL_OIDC_TOKEN) return true;
  if (process.env.BLOB_STORE_ID) {
    return Boolean(await resolveOidcToken(auth));
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
      await buildPutOptions(contentType, auth)
    );

    return {
      filePath: blob.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Aucun credential Blob. Vérifie BLOB_READ_WRITE_TOKEN dans Environment Variables, puis Redeploy."
    );
  }

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
  const access = getBlobAccess();
  const rwToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (rwToken) {
    return get(url, { access, token: rwToken });
  }

  const storeId = process.env.BLOB_STORE_ID;
  const oidcToken = await resolveOidcToken(auth);

  if (oidcToken && storeId) {
    return get(url, { access, oidcToken, storeId });
  }

  return get(url, { access });
}

export function isPrivateBlobUrl(url: string) {
  return url.includes(".private.blob.vercel-storage.com");
}
