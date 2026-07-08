"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Changer le thème"
      className="size-10 rounded-xl border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/40 hover:bg-primary/10"
    >
      <Sun className="size-4 scale-100 rotate-0 text-amber-500 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 text-primary transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
