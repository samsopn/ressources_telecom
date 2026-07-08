import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AppActionsProvider } from "@/providers/app-actions-provider";
import { SidebarProvider } from "@/providers/sidebar-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppActionsProvider>
      <SidebarProvider>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <AppShell>{children}</AppShell>
        </Suspense>
      </SidebarProvider>
    </AppActionsProvider>
  );
}
