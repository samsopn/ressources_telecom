"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileDropZone } from "@/components/resources/file-drop-zone";
import { NotesEditor } from "@/components/resources/notes-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryWithCount, ResourceWithRelations } from "@/lib/types";

type ResourceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: ResourceWithRelations | null;
};

type FormState = {
  title: string;
  description: string;
  type: "LINK" | "FILE";
  url: string;
  notes: string;
  categoryId: string;
  tagNames: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  type: "LINK",
  url: "",
  notes: "",
  categoryId: "",
  tagNames: "",
  filePath: "",
  fileName: "",
  fileSize: 0,
  mimeType: "",
};

async function fetchCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) throw new Error("Impossible de charger les catégories");
  return response.json() as Promise<CategoryWithCount[]>;
}

export function ResourceFormDialog({ open, onOpenChange, resource }: ResourceFormDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (!open) return;

    if (resource) {
      setForm({
        title: resource.title,
        description: resource.description ?? "",
        type: resource.type,
        url: resource.url ?? "",
        notes: resource.notes ?? "",
        categoryId: resource.categoryId ?? "",
        tagNames: resource.tags.map(({ tag }) => tag.name).join(", "),
        filePath: resource.filePath ?? "",
        fileName: resource.fileName ?? "",
        fileSize: resource.fileSize ?? 0,
        mimeType: resource.mimeType ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [open, resource]);

  const saveResource = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        url: form.type === "LINK" ? form.url : undefined,
        notes: form.notes || undefined,
        categoryId: form.categoryId || null,
        tagNames: form.tagNames
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (resource) {
        const response = await fetch(`/api/resources/${resource.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Échec de la modification");
        return response.json();
      }

      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          ...(form.type === "FILE"
            ? {
                filePath: form.filePath,
                fileName: form.fileName,
                fileSize: form.fileSize,
                mimeType: form.mimeType,
              }
            : {}),
        }),
      });

      if (!response.ok) throw new Error("Échec de la création");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      onOpenChange(false);
    },
    onError: () => setError("Impossible d'enregistrer la ressource."),
  });

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        const details =
          data?.diagnostics != null
            ? ` [${data.diagnostics.authMode}/${data.diagnostics.blobAccess}, commit=${String(data.diagnostics.commit ?? "?").slice(0, 7)}]`
            : "";
        throw new Error(
          `${typeof data?.error === "string" ? data.error : "Upload échoué"}${details}`
        );
      }

      setForm((current) => ({
        ...current,
        type: "FILE",
        title: current.title || file.name,
        filePath: data.filePath,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      }));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'uploader le fichier."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{resource ? "Modifier la ressource" : "Ajouter une ressource"}</DialogTitle>
          <DialogDescription>
            Centralise un lien web ou un fichier pour ton hub réseau & télécom.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Ex: Guide BGP avancé"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Résumé rapide de la ressource"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm({ ...form, type: value as "LINK" | "FILE" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LINK">Lien web</SelectItem>
                  <SelectItem value="FILE">Fichier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoryId">Catégorie</Label>
              <select
                id="categoryId"
                value={form.categoryId}
                onChange={(event) =>
                  setForm({ ...form, categoryId: event.target.value })
                }
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Choisir une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.type === "LINK" ? (
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={form.url}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
                placeholder="https://..."
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Fichier</Label>
              <FileDropZone
                fileName={form.fileName}
                uploading={uploading}
                onFileSelect={(file) => void handleFileUpload(file)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              value={form.tagNames}
              onChange={(event) => setForm({ ...form, tagNames: event.target.value })}
              placeholder="BGP, MPLS, CCNP"
            />
          </div>

            <div className="grid gap-2">
              <Label>Notes personnelles</Label>
              <NotesEditor
                value={form.notes}
                onChange={(notes) => setForm({ ...form, notes })}
              />
            </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => saveResource.mutate()}
            disabled={!form.title || saveResource.isPending || uploading}
          >
            {saveResource.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
