/** Construit une URL d'aperçu embarquable si possible */
export function getPreviewEmbedUrl(resource: {
  type: "LINK" | "FILE";
  url?: string | null;
  filePath?: string | null;
  mimeType?: string | null;
}): string | null {
  const href =
    resource.type === "LINK"
      ? resource.url
      : resource.filePath;

  if (!href || href === "#") return null;

  // Google Drive → preview
  const driveMatch = href.match(/\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // PDF direct / Blob / uploads
  const isPdf =
    resource.mimeType === "application/pdf" ||
    href.toLowerCase().includes(".pdf");

  if (isPdf || resource.type === "FILE") {
    if (href.includes(".private.blob.vercel-storage.com")) {
      return `/api/files?url=${encodeURIComponent(href)}`;
    }
    return href;
  }

  // YouTube
  const yt = href.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  if (yt) {
    return `https://www.youtube.com/embed/${yt[1]}`;
  }

  return null;
}
