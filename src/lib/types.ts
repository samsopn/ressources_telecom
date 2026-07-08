import type { Prisma } from "@/generated/prisma/client";

export type ResourceWithRelations = Prisma.ResourceGetPayload<{
  include: {
    category: true;
    tags: { include: { tag: true } };
  };
}>;

export type ResourceDetail = Prisma.ResourceGetPayload<{
  include: {
    category: true;
    tags: { include: { tag: true } };
    collections: { include: { collection: true } };
  };
}>;

export type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: {
    _count: { select: { resources: true } };
    children: {
      include: {
        _count: { select: { resources: true } };
      };
    };
  };
}>;

export type TagWithCount = Prisma.TagGetPayload<{
  include: {
    _count: { select: { resources: true } };
  };
}>;

export type CollectionWithCount = Prisma.CollectionGetPayload<{
  include: {
    _count: { select: { resources: true } };
  };
}>;

export type CollectionWithResources = Prisma.CollectionGetPayload<{
  include: {
    resources: {
      include: {
        resource: {
          include: {
            category: true;
            tags: { include: { tag: true } };
          };
        };
      };
      orderBy: { order: "asc" };
    };
    _count: { select: { resources: true } };
  };
}>;
