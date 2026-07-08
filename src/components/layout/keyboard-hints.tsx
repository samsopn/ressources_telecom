export function KeyboardHints() {
  return (
    <div className="hidden items-center gap-3 text-xs text-muted-foreground lg:flex">
      <span>
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl+K</kbd>{" "}
        rechercher
      </span>
      <span>
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">N</kbd> ajouter
      </span>
    </div>
  );
}
