"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceFormDialog } from "@/components/resources/resource-form-dialog";
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

  const availableResources = allResources.filter(
    (resource) => !collection?.resources.some((item) => item.resourceId === resource.id)
  );

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
            {collection.resources.map(({ resource }, index) => (
              <div key={resource.id} className="relative">
                <ResourceCard
                  resource={resource}
                  index={index}
                  onEdit={(item) => {
                    setEditingResource(item);
                    setDialogOpen(true);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-3 right-12 text-destructive hover:text-destructive"
                  onClick={() => removeResource.mutate(resource.id)}
                  aria-label="Retirer de la collection"
                >
                  <Trash2 className="size-4" />
                </Button>
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
