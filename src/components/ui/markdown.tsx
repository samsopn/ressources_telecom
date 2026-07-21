"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-muted-foreground italic">Aucune note pour le moment.</p>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-heading prose-headings:tracking-tight",
        "prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1",
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border/50",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
