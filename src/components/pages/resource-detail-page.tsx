"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AiAssistButtons } from "@/components/resources/ai-assist-buttons";
import { ResourceFormDialog } from "@/components/resources/resource-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { getPreviewEmbedUrl } from "@/lib/preview";
import type { ResourceDetail, ResourceWithRelations } from "@/lib/types";
import { getResourceOpenHref } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  FolderKanban,
  Link2,
  Pencil,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";

async function fetchResource(id: string) {
  const response = await fetch(`/api/resources/${id}`);
  if (!response.ok) throw new Error("Ressource introuvable");
  return response.json() as Promise<ResourceDetail>;
}

async function fetchRelated(id: string) {
  const response = await fetch(`/api/resources/${id}/related`);
  if (!response.ok) throw new Error("Impossible de charger les suggestions");
  return response.json() as Promise<(ResourceWithRelations & { score: number })[]>;
}

async function fetchCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) throw new Error("Impossible de charger les catégories");
  return response.json() as Promise<{ id: string; name: string }[]>;
}

export function ResourceDetailPageClient() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: resource, isLoading } = useQuery({
    queryKey: ["resource", params.id],
    queryFn: () => fetchResource(params.id),
  });

  const { data: related = [] } = useQuery({
    queryKey: ["resource-related", params.id],
    queryFn: () => fetchRelated(params.id),
    enabled: Boolean(params.id),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const patchResource = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await fetch(`/api/resources/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Impossible de mettre à jour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource", params.id] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  if (isLoading) {
    return <div className="px-6 py-6">Chargement...</div>;
  }

  if (!resource) {
    return <div className="px-6 py-6">Ressource introuvable</div>;
  }

  const externalHref = getResourceOpenHref(resource);
  const previewUrl = getPreviewEmbedUrl(resource);

  return (
    <>
      <AppHeader title={resource.title} description="Fiche détaillée de la ressource" />

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-6">
        <Button variant="outline" size="sm" render={<Link href="/resources" />}>
          <ArrowLeft data-icon="inline-start" />
          Retour
        </Button>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                {resource.type === "LINK" ? (
                  <Link2 className="size-5" />
                ) : (
                  <FileText className="size-5" />
                )}
              </div>
              <div>
                <CardTitle className="font-heading text-xl">{resource.title}</CardTitle>
                {resource.category ? (
                  <p className="mt-1 text-sm text-muted-foreground">{resource.category.name}</p>
                ) : null}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                <Pencil data-icon="inline-start" />
                Modifier
              </Button>
              <Button size="sm" render={<a href={externalHref} target="_blank" rel="noreferrer" />}>
                Ouvrir
                <ExternalLink data-icon="inline-end" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {previewUrl ? (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Aperçu</h3>
                <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                  <iframe
                    title={`Aperçu ${resource.title}`}
                    src={previewUrl}
                    className="h-[420px] w-full"
                  />
                </div>
              </div>
            ) : null}

            {resource.description ? (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm leading-relaxed">{resource.description}</p>
              </div>
            ) : null}

            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Notes personnelles</h3>
              <div className="rounded-lg bg-muted/50 p-3">
                <Markdown content={resource.notes ?? ""} />
              </div>
            </div>

            <AiAssistButtons
              title={resource.title}
              description={resource.description ?? ""}
              url={resource.url ?? undefined}
              notes={resource.notes ?? ""}
              categoryNames={categories.map((category) => category.name)}
              onApplySuggest={({ categoryName, tags, description }) => {
                const matched = categories.find(
                  (category) =>
                    category.name.toLowerCase() ===
                    (categoryName ?? "").toLowerCase()
                );
                void patchResource.mutateAsync({
                  ...(matched ? { categoryId: matched.id } : {}),
                  ...(description ? { description } : {}),
                  ...(tags.length ? { tagNames: tags } : {}),
                });
              }}
              onApplyNotes={(notes) => {
                void patchResource.mutateAsync({ notes });
              }}
            />

            <div className="flex flex-wrap gap-2">
              {resource.tags.map(({ tag }) => (
                <Badge key={tag.id} variant="outline" className="font-mono text-xs">
                  #{tag.name}
                </Badge>
              ))}
              {resource.isFavorite ? (
                <Badge className="gap-1">
                  <Star className="size-3 fill-current" />
                  Favori
                </Badge>
              ) : null}
            </div>

            {resource.collections.length > 0 ? (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FolderKanban className="size-4" />
                  Collections
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resource.collections.map(({ collection }) => (
                    <Badge
                      key={collection.id}
                      variant="secondary"
                      render={<Link href={`/collections/${collection.id}`} />}
                    >
                      {collection.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                Créé le {new Date(resource.createdAt).toLocaleDateString("fr-FR")}
              </div>
              {resource.lastViewedAt ? (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  Vu le {new Date(resource.lastViewedAt).toLocaleDateString("fr-FR")}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {related.length > 0 ? (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Sparkles className="size-4 text-primary" />
                Ressources liées
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/resources/${item.id}`}
                  className="rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <p className="font-medium line-clamp-1">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.category?.name ?? "Sans catégorie"} · score {item.score}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={resource}
      />
    </>
  );
}
