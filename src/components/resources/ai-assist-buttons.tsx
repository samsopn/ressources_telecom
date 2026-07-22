"use client";

import { useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AiSuggestPayload = {
  action: "suggest";
  categoryName: string | null;
  tags: string[];
  description: string;
};

type AiTextPayload = {
  action: "summarize" | "explain";
  content: string;
};

type AiAssistButtonsProps = {
  title: string;
  description: string;
  url?: string;
  notes: string;
  categoryNames: string[];
  onApplySuggest: (data: {
    categoryName: string | null;
    tags: string[];
    description: string;
  }) => void;
  onApplyNotes?: (notes: string) => void;
  className?: string;
  compact?: boolean;
};

export function AiAssistButtons({
  title,
  description,
  url,
  notes,
  categoryNames,
  onApplySuggest,
  onApplyNotes,
  className,
  compact,
}: AiAssistButtonsProps) {
  const [loading, setLoading] = useState<"suggest" | "summarize" | "explain" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function run(action: "suggest" | "summarize" | "explain") {
    setLoading(action);
    setError(null);
    setPreview(null);

    try {
      const response = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          title,
          description,
          url,
          notes,
          categories: categoryNames,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Échec de l'IA"
        );
      }

      if (action === "suggest") {
        const result = data as AiSuggestPayload;
        onApplySuggest({
          categoryName: result.categoryName,
          tags: result.tags,
          description: result.description,
        });
        setPreview(
          `Suggestions appliquées${
            result.tags.length ? ` · tags: ${result.tags.join(", ")}` : ""
          }`
        );
        return;
      }

      const result = data as AiTextPayload;
      if (action === "summarize" && onApplyNotes) {
        onApplyNotes(result.content);
        setPreview("Résumé appliqué aux notes.");
      } else {
        setPreview(result.content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'IA");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-primary/5 p-3",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
        <Sparkles className="size-4" />
        Assistant IA
      </div>

      <div className={cn("flex flex-wrap gap-2", compact && "gap-1.5")}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={Boolean(loading) || !title.trim()}
          onClick={() => void run("suggest")}
        >
          {loading === "suggest" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Wand2 className="size-3.5" />
          )}
          Tags & catégorie
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={Boolean(loading) || !notes.trim()}
          onClick={() => void run("summarize")}
        >
          {loading === "summarize" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          Résumer notes
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={Boolean(loading) || (!title.trim() && !notes.trim())}
          onClick={() => void run("explain")}
        >
          {loading === "explain" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          Expliquer
        </Button>
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      {preview ? (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-background/80 p-2 text-xs leading-relaxed whitespace-pre-wrap">
          {preview}
        </div>
      ) : null}
      <p className="mt-2 text-[11px] text-muted-foreground">
        Nécessite une clé API (`GEMINI_API_KEY` recommandé, gratuit).
      </p>
    </div>
  );
}
