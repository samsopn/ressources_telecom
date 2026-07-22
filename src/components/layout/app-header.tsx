"use client";

import { PanelLeft, Plus, Search, Sparkles, LogOut } from "lucide-react";
import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { KeyboardHints } from "@/components/layout/keyboard-hints";
import { MobileMenuButton } from "@/components/layout/app-shell";
import { useAppActions } from "@/providers/app-actions-provider";
import { useSidebar } from "@/providers/sidebar-provider";

type AppHeaderProps = {
  title: string;
  description?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  onAddClick?: () => void;
};

export function AppHeader({
  title,
  description,
  search,
  onSearchChange,
  onAddClick,
}: AppHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { registerSearchRef, openCommandPalette } = useAppActions();
  const { collapsed, setCollapsed } = useSidebar();

  useEffect(() => {
    if (onSearchChange && searchInputRef.current) {
      registerSearchRef(searchInputRef.current);
    }
    return () => registerSearchRef(null);
  }, [onSearchChange, registerSearchRef]);

  return (
    <header className="header-blur sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <MobileMenuButton />
          <Button
            variant="outline"
            size="icon"
            className="hidden size-9 md:inline-flex"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Réduire la sidebar"
          >
            <PanelLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary signal-dot" />
              <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl animate-fade-in-up">
                {title}
              </h1>
            </div>
            {description ? (
              <p className="mt-1 animate-fade-in stagger-2 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {onSearchChange ? (
            <div className="search-glow relative w-full rounded-xl sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/60" />
              <Input
                ref={searchInputRef}
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Rechercher..."
                className="h-10 rounded-xl border-border/60 bg-card/60 pl-9"
              />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex"
              onClick={openCommandPalette}
            >
              <Search data-icon="inline-start" />
              Recherche
            </Button>
            <KeyboardHints />
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Déconnexion"
            >
              <LogOut className="size-4" />
            </Button>
            {onAddClick ? (
              <Button
                onClick={onAddClick}
                className="h-10 rounded-xl bg-gradient-to-r from-primary to-brand btn-shine"
              >
                <Plus data-icon="inline-start" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
