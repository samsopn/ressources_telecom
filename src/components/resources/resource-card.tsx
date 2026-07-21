"use client";

import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Link2,
  MoreVertical,
  Star,
  Trash2,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getResourceOpenHref } from "@/lib/utils";
import type { ResourceWithRelations } from "@/lib/types";

type ResourceCardProps = {
  resource: ResourceWithRelations;
  onEdit?: (resource: ResourceWithRelations) => void;
  index?: number;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
};

export function ResourceCard({
  resource,
  onEdit,
  index = 0,
  selectable,
  selected,
  onSelectChange,
}: ResourceCardProps) {
  const queryClient = useQueryClient();

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !resource.isFavorite }),
      });
      if (!response.ok) throw new Error("Échec de la mise à jour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const deleteResource = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Échec de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const href = getResourceOpenHref(resource);

  const categoryColor = resource.category?.color;

  return (
    <Card
      className={cn(
        "interactive-card glass-card group relative overflow-hidden animate-fade-in-up",
        "before:absolute before:top-0 before:right-0 before:left-0 before:h-0.5 before:origin-left before:scale-x-0 before:bg-gradient-to-r before:from-primary before:to-brand before:transition-transform before:duration-300 hover:before:scale-x-100"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {selectable ? (
              <input
                type="checkbox"
                checked={selected}
                onChange={(event) => onSelectChange?.(event.target.checked)}
                className="size-4 rounded border-border"
                aria-label="Sélectionner la ressource"
              />
            ) : null}
            <div
              className={cn(
                "rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110",
                resource.type === "LINK"
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  : "bg-violet-500/15 text-violet-600 dark:text-violet-400"
              )}
            >
              {resource.type === "LINK" ? (
                <Link2 className="size-4" />
              ) : (
                <FileText className="size-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/resources/${resource.id}`}>
                <CardTitle className="line-clamp-1 text-base font-semibold transition-colors hover:text-primary">
                  {resource.title}
                </CardTitle>
              </Link>
              {resource.category ? (
                <CardDescription className="flex items-center gap-1.5">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: categoryColor ?? "currentColor" }}
                  />
                  {resource.category.name}
                </CardDescription>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-0.5 opacity-70 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => toggleFavorite.mutate()}
              aria-label="Basculer favori"
              className="rounded-lg transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "size-4 transition-all duration-300",
                  resource.isFavorite
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "text-muted-foreground hover:text-amber-400"
                )}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Actions"
                    className="rounded-lg"
                  />
                }
              >
                <MoreVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit ? (
                  <DropdownMenuItem onClick={() => onEdit(resource)}>Modifier</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => deleteResource.mutate()}
                >
                  <Trash2 />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {resource.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {resource.description}
          </p>
        ) : null}

        {resource.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="tag-pill font-mono text-[10px]"
              >
                #{tag.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between border-t border-border/40 bg-muted/20 pt-4">
        <span className="font-mono text-[11px] text-muted-foreground">
          {new Date(resource.updatedAt).toLocaleDateString("fr-FR")}
        </span>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={href} target="_blank" />}
          className="rounded-lg border-primary/20 transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          Ouvrir
          <ExternalLink data-icon="inline-end" className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
