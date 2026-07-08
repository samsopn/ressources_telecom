"use client";

import { useEffect } from "react";

type KeyboardShortcutsProps = {
  onSearch?: () => void;
  onAdd?: () => void;
};

export function useKeyboardShortcuts({ onSearch, onAdd }: KeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInput) return;

      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        onSearch?.();
      }

      if (event.key === "n" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onAdd?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearch, onAdd]);
}
