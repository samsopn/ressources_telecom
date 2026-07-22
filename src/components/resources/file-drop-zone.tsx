"use client";

import { useCallback, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type FileDropZoneProps = {
  fileName?: string;
  uploading?: boolean;
  onFileSelect: (file: File) => void;
};

export function FileDropZone({ fileName, uploading, onFileSelect }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-sm transition-all duration-200",
        isDragging
          ? "scale-[1.02] border-primary bg-primary/10 text-primary shadow-[0_0_0_4px_oklch(0.58_0.17_235/0.12)]"
          : "border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/30",
        uploading && "pointer-events-none opacity-60"
      )}
    >
      <div
        className={cn(
          "rounded-xl p-3 transition-colors",
          isDragging ? "bg-primary/20" : "bg-muted"
        )}
      >
        {fileName ? (
          <FileText className="size-6 text-primary" />
        ) : (
          <Upload className={cn("size-6", isDragging && "animate-bounce")} />
        )}
      </div>

      <div className="text-center">
        {fileName ? (
          <p className="font-medium text-foreground">{fileName}</p>
        ) : uploading ? (
          <p>Upload en cours...</p>
        ) : (
          <>
            <p className="font-medium text-foreground">
              {isDragging ? "Dépose le fichier ici" : "Glisse un fichier ou clique pour parcourir"}
            </p>
            <p className="mt-1 text-xs">PDF, configs, docs, images...</p>
          </>
        )}
      </div>

      <input
        type="file"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
    </div>
  );
}
