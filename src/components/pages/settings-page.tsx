"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropZone } from "@/components/resources/file-drop-zone";

export function SettingsPageClient() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const importData = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Import échoué");
      return response.json();
    },
    onSuccess: (result) => {
      setImportMessage({
        type: "success",
        text: `Import réussi : ${result.importedCategories ?? 0} catégorie(s), ${result.importedResources} ressource(s), ${result.importedCollections} collection(s), ${result.linkedResources ?? 0} lien(s) collection.`,
      });
      queryClient.invalidateQueries();
    },
    onError: () => {
      setImportMessage({ type: "error", text: "Fichier JSON invalide ou import échoué." });
    },
  });

  return (
    <>
      <AppHeader
        title="Paramètres"
        description="Sauvegarde et restauration de tes données"
      />

      <div className="grid max-w-2xl gap-6 px-6 py-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Download className="size-5 text-primary" />
              Exporter les données
            </CardTitle>
            <CardDescription>
              Télécharge toutes tes ressources, catégories et collections en JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              render={<a href="/api/export" download />}
              className="rounded-xl bg-gradient-to-r from-primary to-brand"
            >
              <Download data-icon="inline-start" />
              Télécharger l&apos;export JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Upload className="size-5 text-primary" />
              Importer des données
            </CardTitle>
            <CardDescription>
              Restaure un fichier JSON exporté précédemment. Les données sont ajoutées, pas remplacées.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropZone
              uploading={importData.isPending}
              onFileSelect={(file) => {
                setImportMessage(null);
                importData.mutate(file);
              }}
            />

            {importMessage ? (
              <div
                className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                  importMessage.type === "success"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {importMessage.type === "success" ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
                {importMessage.text}
              </div>
            ) : null}

            <input ref={fileInputRef} type="file" accept=".json" className="hidden" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-base">Raccourcis clavier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">Ctrl+K</kbd>{" "}
              — Focus recherche
            </p>
            <p>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">N</kbd> —
              Nouvelle ressource
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
