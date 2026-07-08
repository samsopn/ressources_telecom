"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText, Link2, Plus, Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { PaginatedResources } from "@/lib/api-types";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddResource: () => void;
};

async function searchResources(query: string) {
  const params = new URLSearchParams({ q: query, limit: "8", page: "1" });
  const response = await fetch(`/api/resources?${params.toString()}`);
  if (!response.ok) throw new Error("Recherche échouée");
  return response.json() as Promise<PaginatedResources>;
}

export function CommandPalette({ open, onOpenChange, onAddResource }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["command-search", query],
    queryFn: () => searchResources(query),
    enabled: open,
  });

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function navigate(path: string) {
    onOpenChange(false);
    router.push(path);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Recherche globale"
      description="Trouve une ressource ou une action"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Rechercher BGP, MPLS, configs..."
          value={query}
          onValueChange={setQuery}
        />
      <CommandList>
        <CommandEmpty>{isLoading ? "Recherche..." : "Aucun résultat"}</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onAddResource();
            }}
          >
            <Plus />
            Nouvelle ressource
          </CommandItem>
          <CommandItem onSelect={() => navigate("/resources")}>
            <Search />
            Toutes les ressources
          </CommandItem>
        </CommandGroup>

        {(data?.resources.length ?? 0) > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Ressources">
              {data?.resources.map((resource) => (
                <CommandItem
                  key={resource.id}
                  onSelect={() => navigate(`/resources/${resource.id}`)}
                >
                  {resource.type === "LINK" ? <Link2 /> : <FileText />}
                  <span className="truncate">{resource.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
