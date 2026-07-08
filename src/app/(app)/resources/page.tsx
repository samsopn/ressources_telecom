import { Suspense } from "react";
import { ResourcesPageClient } from "@/components/pages/client-pages";

export default function ResourcesPage() {
  return (
    <Suspense fallback={<div className="px-6 py-6">Chargement...</div>}>
      <ResourcesPageClient />
    </Suspense>
  );
}
