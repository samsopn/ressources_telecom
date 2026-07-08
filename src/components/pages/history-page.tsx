"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { Card, CardContent } from "@/components/ui/card";
import type { ResourceWithRelations } from "@/lib/types";

async function fetchHistory() {
  const response = await fetch("/api/history");
  if (!response.ok) throw new Error("Impossible de charger l'historique");
  return response.json() as Promise<ResourceWithRelations[]>;
}

export function HistoryPageClient() {
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });

  return (
    <>
      <AppHeader
        title="Historique"
        description="Ressources consultées récemment"
      />

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 animate-shimmer rounded-2xl" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Clock className="size-10 text-muted-foreground" />
              <p className="font-medium">Aucun historique</p>
              <p className="text-sm text-muted-foreground">
                Ouvre des ressources pour les retrouver ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource, index) => (
              <ResourceCard key={resource.id} resource={resource} index={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
