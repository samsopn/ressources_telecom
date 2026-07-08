"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, FolderKanban, Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { useAppActions } from "@/providers/app-actions-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/slugify";
import type { CollectionWithCount } from "@/lib/types";

async function fetchCollections() {
  const response = await fetch("/api/collections");
  if (!response.ok) throw new Error("Impossible de charger les collections");
  return response.json() as Promise<CollectionWithCount[]>;
}

export function CollectionsPageClient() {
  const queryClient = useQueryClient();
  const { openAddResource } = useAppActions();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const createCollection = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slugify(name),
          description,
          color: "#3b82f6",
        }),
      });
      if (!response.ok) throw new Error("Échec de la création");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setName("");
      setDescription("");
    },
  });

  return (
    <>
      <AppHeader
        title="Collections"
        description="Parcours thématiques : CCNA, labs, certifications..."
        onAddClick={openAddResource}
      />

      <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.2fr_0.8fr]">
        {collections.length === 0 ? (
          <Card className="glass-card border-dashed xl:col-span-2">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <FolderKanban className="size-10 text-muted-foreground" />
              <p className="font-medium">Aucune collection</p>
              <p className="text-sm text-muted-foreground">
                Crée un parcours pour regrouper tes ressources par objectif.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <Card className="interactive-card glass-card h-full transition-colors hover:border-primary/30">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-xl p-3"
                        style={{
                          backgroundColor: `${collection.color ?? "#3b82f6"}18`,
                          color: collection.color ?? "#3b82f6",
                        }}
                      >
                        <BookOpen className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="font-heading text-base">{collection.name}</CardTitle>
                        {collection.description ? (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {collection.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono tabular-nums">
                      {collection._count.resources}
                    </Badge>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Card className="glass-card h-fit">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Nouvelle collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="collection-name">Nom</Label>
              <Input
                id="collection-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prépa CCNP"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="collection-desc">Description</Label>
              <Input
                id="collection-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objectif du parcours"
                className="rounded-xl"
              />
            </div>
            <Button
              onClick={() => createCollection.mutate()}
              disabled={!name.trim() || createCollection.isPending}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-brand"
            >
              <Plus data-icon="inline-start" />
              Créer la collection
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
