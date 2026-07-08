"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { CommandPalette } from "@/components/layout/command-palette";
import { ResourceFormDialog } from "@/components/resources/resource-form-dialog";

type AppActionsContextValue = {
  openAddResource: () => void;
  openCommandPalette: () => void;
  focusSearch: () => void;
  registerSearchRef: (ref: HTMLInputElement | null) => void;
};

const AppActionsContext = createContext<AppActionsContextValue | null>(null);

export function useAppActions() {
  const context = useContext(AppActionsContext);
  if (!context) {
    throw new Error("useAppActions must be used within AppActionsProvider");
  }
  return context;
}

export function AppActionsProvider({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchRef, setSearchRef] = useState<HTMLInputElement | null>(null);

  const openAddResource = useCallback(() => setDialogOpen(true), []);
  const openCommandPalette = useCallback(() => setCommandOpen(true), []);
  const focusSearch = useCallback(() => {
    if (searchRef) {
      searchRef.focus();
      return;
    }
    setCommandOpen(true);
  }, [searchRef]);

  useKeyboardShortcuts({
    onSearch: openCommandPalette,
    onAdd: openAddResource,
  });

  return (
    <AppActionsContext.Provider
      value={{
        openAddResource,
        openCommandPalette,
        focusSearch,
        registerSearchRef: setSearchRef,
      }}
    >
      {children}
      <ResourceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onAddResource={openAddResource}
      />
    </AppActionsContext.Provider>
  );
}
