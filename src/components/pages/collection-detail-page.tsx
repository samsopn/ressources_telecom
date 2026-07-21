"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceFormDialog } from "@/components/resources/resource-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CollectionWithResources, ResourceWithRelations } from "@/lib/types";

async function fetchCollection(id: string) {
  const response = await fetch(`/api/collections/${id}`);
  if (!response.ok) throw new Error("Collection introuvable");
  return response.json() as Promise<CollectionWithResources>;
}

async function fetchAllResources() {
  const response = await fetch("/api/resources?limit=500&page=1");
  if (!response.ok) throw new Error("Impossible de charger les ressources");
  const data = await response.json();
  return data.resources as ResourceWithRelations[];
}

type StudyStatus = "TODO" | "DOING" | "DONE";

export function CollectionDetailPageClient() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [editingResource, setEditingResource] = useState<ResourceWithRelations | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", params.id],
    queryFn: () => fetchCollection(params.id),
  });

  const { data: allResources = [] } = useQuery({
    queryKey: ["resources"],
    queryFn: fetchAllResources,
  });

  const addResource = useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await fetch(`/api/collections/${params.id}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      });
      if (!response.ok) throw new Error("Échec");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", params.id] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setSelectedResourceId("");
    },
  });

  const removeResource = useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await fetch(
        `/api/collections/${params.id}/resources?resourceId=${resourceId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Échec");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", params.id] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      resourceId,
      status,
    }: {
      resourceId: string;
      status: StudyStatus;
    }) => {
      const response = await fetch(`/api/collections/${params.id}/resources`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId, status }),
      });
      if (!response.ok) throw new Error("Échec");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", params.id] });
    },
  });

  const availableResources = allResources.filter(
    (resource) => !collection?.resources.some((item) => item.resourceId === resource.id)
  );

  const total = collection?.resources.length ?? 0;
  const done = collection?.resources.filter((item) => item.status === "DONE").length ?? 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  if (isLoading) {
    return <div className="px-6 py-6">Chargement...</div>;
  }

  if (!collection) {
    return <div className="px-6 py-6">Collection introuvable</div>;
  }

  return (
    <>
      <AppHeader
        title={collection.name}
        description={collection.description ?? "Parcours de ressources"}
      />

      <div className="space-y-6 px-6 py-6">
        <Card className="glass-card">
          <CardContent className="space-y-3 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Progression du parcours</p>
              <Badge variant="secondary">
                {done}/{total} terminé{done > 1 ? "s" : ""} · {progress}%
              </Badge>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Ajouter une ressource à la collection</p>
              <select
                value={selectedResourceId}
                onChange={(event) => setSelectedResourceId(event.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Choisir une ressource</option>
                {availableResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.title}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => addResource.mutate(selectedResourceId)}
              disabled={!selectedResourceId || addResource.isPending}
              className="rounded-xl"
            >
              <Plus data-icon="inline-start" />
              Ajouter
            </Button>
          </CardContent>
        </Card>

        {collection.resources.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Cette collection est vide. Ajoute des ressources ci-dessus.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collection.resources.map((item, index) => (
              <div key={item.resource.id} className="relative space-y-2">
                <ResourceCard
                  resource={item.resource}
                  index={index}
                  onEdit={(resource) => {
                    setEditingResource(resource);
                    setDialogOpen(true);
                  }}
                />
                <div className="flex items-center justify-between gap-2 px-1">
                  <select
                    value={item.status}
                    onChange={(event) =>
                      updateStatus.mutate({
                        resourceId: item.resource.id,
                        status: event.target.value as StudyStatus,
                      })
                    }
                    className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2 text-xs"
                  >
                    <option value="TODO">À faire</option>
                    <option value="DOING">En cours</option>
                    <option value="DONE">Terminé</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeResource.mutate(item.resource.id)}
                    aria-label="Retirer de la collection"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
                  {item.status === "DONE" ? (
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                  ) : (
                    <Circle className="size-3.5" />
                  )}
                  {item.status === "DONE"
                    ? "Complété"
                    : item.status === "DOING"
                      ? "En cours"
                      : "À étudier"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={editingResource}
      />
    </>
  );
}
