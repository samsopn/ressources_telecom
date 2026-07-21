"use client";

import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";

type NotesEditorProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

export function NotesEditor({ value, onChange, rows = 5 }: NotesEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Markdown supporté (`**gras**`, listes, liens, code…)
        </p>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "edit" ? "default" : "outline"}
            onClick={() => setMode("edit")}
          >
            <Pencil className="size-3.5" />
            Éditer
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "preview" ? "default" : "outline"}
            onClick={() => setMode("preview")}
          >
            <Eye className="size-3.5" />
            Aperçu
          </Button>
        </div>
      </div>

      {mode === "edit" ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={"## Points clés\n- Notion 1\n- Notion 2\n\n> Astuce perso…"}
          className="font-mono text-sm"
        />
      ) : (
        <div
          className={cn(
            "min-h-[120px] rounded-lg border border-border/60 bg-muted/20 p-3"
          )}
        >
          <Markdown content={value} />
        </div>
      )}
    </div>
  );
}
