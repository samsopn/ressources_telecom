"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCategoryIcon } from "@/lib/category-icons";
import { slugify } from "@/lib/slugify";
import type { CategoryWithCount } from "@/lib/types";

async function fetchCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) throw new Error("Impossible de charger les catégories");
  return response.json() as Promise<CategoryWithCount[]>;
}

export function CategoriesPageClient() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createCategory = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slugify(name), description }),
      });
      if (!response.ok) throw new Error("Échec");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      setDescription("");
    },
  });

  const updateCategory = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const response = await fetch(`/api/categories/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          slug: slugify(editName),
          description: editDescription,
        }),
      });
      if (!response.ok) throw new Error("Échec");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditing(null);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Échec");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  return (
    <>
      <AppHeader title="Catégories" description="Organise ton hub par thématiques." />

      <div className="grid gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            return (
              <Card key={category.id} className="glass-card relative">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-xl p-3"
                      style={{
                        backgroundColor: `${category.color ?? "#3b82f6"}18`,
                        color: category.color ?? undefined,
                      }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      {category.description ? (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditing(category);
                        setEditName(category.name);
                        setEditDescription(category.description ?? "");
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteCategory.mutate(category.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{category._count.resources} ressources</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="glass-card h-fit">
          <CardHeader>
            <CardTitle>Nouvelle catégorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Nom</Label>
              <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-description">Description</Label>
              <Input
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button
              onClick={() => createCategory.mutate()}
              disabled={!name.trim() || createCategory.isPending}
              className="w-full"
            >
              Créer
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button onClick={() => updateCategory.mutate()} disabled={updateCategory.isPending}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
