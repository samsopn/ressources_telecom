"use client";

import { useQuery } from "@tanstack/react-query";
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
  Star,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { ResourceFormDialog } from "@/components/resources/resource-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResourceDetail } from "@/lib/types";
import { getResourceOpenHref } from "@/lib/utils";
import { useState } from "react";

async function fetchResource(id: string) {
  const response = await fetch(`/api/resources/${id}`);
  if (!response.ok) throw new Error("Ressource introuvable");
  return response.json() as Promise<ResourceDetail>;
}

export function ResourceDetailPageClient() {
  const params = useParams<{ id: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: resource, isLoading } = useQuery({
    queryKey: ["resource", params.id],
    queryFn: () => fetchResource(params.id),
  });

  if (isLoading) {
    return <div className="px-6 py-6">Chargement...</div>;
  }

  if (!resource) {
    return <div className="px-6 py-6">Ressource introuvable</div>;
  }

  const externalHref = getResourceOpenHref(resource);

  return (
    <>
      <AppHeader title={resource.title} description="Fiche détaillée de la ressource" />

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
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
            {resource.description ? (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm leading-relaxed">{resource.description}</p>
              </div>
            ) : null}

            {resource.notes ? (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Notes personnelles</h3>
                <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">{resource.notes}</p>
              </div>
            ) : null}

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
                    <Badge key={collection.id} variant="secondary" render={<Link href={`/collections/${collection.id}`} />}>
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
      </div>

      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={resource}
      />
    </>
  );
}
