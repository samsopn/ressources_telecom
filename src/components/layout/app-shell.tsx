"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppSidebar, SidebarNav } from "@/components/layout/app-sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSidebar } from "@/providers/sidebar-provider";
import { Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const [enterKey, setEnterKey] = useState(0);

  useEffect(() => {
    setEnterKey((key) => key + 1);
  }, [pathname]);

  return (
    <div className="mesh-bg flex min-h-screen bg-background">
      <Suspense fallback={<div className="hidden w-64 border-r md:block" />}>
        <div className="animate-slide-in-left">
          <AppSidebar />
        </div>
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

      <main key={enterKey} className="page-enter flex min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}

export function MobileMenuButton() {
  const { setMobileOpen } = useSidebar();

  return (
    <button
      type="button"
      className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 transition-all duration-200 hover:scale-105 hover:border-primary/40 hover:bg-primary/5 md:hidden"
      onClick={() => setMobileOpen(true)}
      aria-label="Ouvrir le menu"
    >
      <Menu className="size-4" />
    </button>
  );
}
