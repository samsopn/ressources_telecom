import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** URL ouvrable pour un fichier (proxy si Blob privé). */
export function getResourceOpenHref(resource: {
  type: "LINK" | "FILE";
  url?: string | null;
  filePath?: string | null;
}) {
  if (resource.type === "LINK" && resource.url) {
    return resource.url;
  }

  const filePath = resource.filePath;
  if (!filePath) return "#";

  if (filePath.includes(".private.blob.vercel-storage.com")) {
    return `/api/files?url=${encodeURIComponent(filePath)}`;
  }

  return filePath;
}
