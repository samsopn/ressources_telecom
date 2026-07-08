"use client";

import { Suspense } from "react";
import { Menu } from "lucide-react";
import { AppSidebar, SidebarNav } from "@/components/layout/app-sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSidebar } from "@/providers/sidebar-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="mesh-bg flex min-h-screen bg-background">
      <Suspense fallback={<div className="hidden w-64 border-r md:block" />}>
        <AppSidebar />
      </Suspense>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-4">
            <SheetTitle>Ressources Telecom</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-3 py-4">
            <Suspense fallback={null}>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </Suspense>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

export function MobileMenuButton() {
  const { setMobileOpen } = useSidebar();

  return (
    <button
      type="button"
      className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 md:hidden"
      onClick={() => setMobileOpen(true)}
      aria-label="Ouvrir le menu"
    >
      <Menu className="size-4" />
    </button>
  );
}
