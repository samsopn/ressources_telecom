"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, FileText, Layers, Link2, Plus, Star } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceFormDialog } from "@/components/resources/resource-form-dialog";
import { useAppActions } from "@/providers/app-actions-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginatedResources } from "@/lib/api-types";
import type { CollectionWithCount, ResourceWithRelations } from "@/lib/types";

async function fetchResources(params: URLSearchParams) {
  const response = await fetch(`/api/resources?${params.toString()}`);
  if (!response.ok) throw new Error("Impossible de charger les ressources");
  return response.json() as Promise<PaginatedResources>;
}

async function fetchCollections() {
  const response = await fetch("/api/collections");
  if (!response.ok) throw new Error("Impossible de charger les collections");
  return response.json() as Promise<CollectionWithCount[]>;
}

export function ResourcesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAddResource } = useAppActions();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceWithRelations | null>(null);
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") ?? "all");
  const [collectionFilter, setCollectionFilter] = useState(
    searchParams.get("collectionId") ?? "all"
  );
  const page = Number(searchParams.get("page") ?? 1);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set("q", search.trim());
    else params.delete("q");
    if (typeFilter !== "all") params.set("type", typeFilter);
    else params.delete("type");
    if (collectionFilter !== "all") params.set("collectionId", collectionFilter);
    else params.delete("collectionId");
    params.set("page", String(page));
    params.set("limit", "12");
    return params;
  }, [searchParams, search, typeFilter, collectionFilter, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["resources", queryParams.toString()],
    queryFn: () => fetchResources(queryParams),
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const resources = data?.resources ?? [];
  const totalPages = data?.totalPages ?? 1;

  const title = searchParams.get("favorite")
    ? "Favoris"
    : searchParams.get("categoryId")
      ? "Ressources par catégorie"
      : searchParams.get("tag")
        ? `Tag: ${searchParams.get("tag")}`
        : "Toutes les ressources";

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/resources?${params.toString()}`);
  }

  function applyFilters(nextType: string, nextCollection: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextType !== "all") params.set("type", nextType);
    else params.delete("type");
    if (nextCollection !== "all") params.set("collectionId", nextCollection);
    else params.delete("collectionId");
    params.set("page", "1");
    router.push(`/resources?${params.toString()}`);
  }

  return (
    <>
      <AppHeader
        title={title}
        description="Parcours, filtre et ouvre tes ressources centralisées."
        search={search}
        onSearchChange={setSearch}
        onAddClick={() => {
          setEditingResource(null);
          openAddResource();
        }}
      />

      <div className="flex-1 space-y-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap gap-3">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              const next = v ?? "all";
              setTypeFilter(next);
              applyFilters(next, collectionFilter);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="LINK">Liens web</SelectItem>
              <SelectItem value="FILE">Fichiers</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={collectionFilter}
            onValueChange={(v) => {
              const next = v ?? "all";
              setCollectionFilter(next);
              applyFilters(typeFilter, next);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Collection">
                {(value: string | null) => {
                  if (!value || value === "all") return "Toutes collections";
                  return collections.find((c) => c.id === value)?.name ?? "Collection";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" label="Toutes collections">
                Toutes collections
              </SelectItem>
              {collections.map((c) => (
                <SelectItem key={c.id} value={c.id} label={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-shimmer rounded-2xl border" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
              <BookOpen className="size-10 text-muted-foreground" />
              <p className="font-medium">Aucune ressource trouvée</p>
              <Button onClick={openAddResource}>Ajouter une ressource</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource, index) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  index={index}
                  onEdit={(item) => {
                    setEditingResource(item);
                    setDialogOpen(true);
                  }}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Suivant
                </Button>
              </div>
            ) : null}
          </>
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

export function DashboardPageClient() {
  const { openAddResource } = useAppActions();

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Impossible de charger les statistiques");
      return response.json();
    },
  });

  const linkCount =
    stats?.resourcesByType?.find((item: { type: string }) => item.type === "LINK")?._count
      ?._all ?? 0;
  const fileCount =
    stats?.resourcesByType?.find((item: { type: string }) => item.type === "FILE")?._count
      ?._all ?? 0;

  return (
    <>
      <AppHeader
        title="Dashboard"
        description="Vue d'ensemble de ton hub réseau & télécom."
        onAddClick={openAddResource}
      />

      <div className="space-y-8 px-4 py-6 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total ressources" value={stats?.totalResources ?? 0} icon={Layers} accent="blue" />
          <StatCard title="Favoris" value={stats?.favoriteResources ?? 0} icon={Star} accent="amber" delay={80} />
          <StatCard title="Liens web" value={linkCount} icon={Link2} accent="cyan" delay={160} />
          <StatCard title="Fichiers" value={fileCount} icon={FileText} accent="violet" delay={240} />
        </div>

        <div>
          <h2 className="mb-4 font-heading text-xl font-bold">Ressources récentes</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(stats?.recentResources ?? []).map(
              (resource: ResourceWithRelations, index: number) => (
                <ResourceCard key={resource.id} resource={resource} index={index} />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
