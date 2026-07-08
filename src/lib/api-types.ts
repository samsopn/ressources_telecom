import type { ResourceWithRelations } from "@/lib/types";

export type PaginatedResources = {
  resources: ResourceWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
