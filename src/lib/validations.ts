import { z } from "zod";

export const resourceSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  type: z.enum(["LINK", "FILE"]),
  url: z.string().url("URL invalide").optional().or(z.literal("")),
  filePath: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  notes: z.string().optional(),
  isFavorite: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
  tagNames: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  icon: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

export const collectionSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
