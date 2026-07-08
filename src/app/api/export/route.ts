import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [categories, tags, resources, collections] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.resource.findMany({
      include: {
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.collection.findMany({
      include: {
        resources: {
          select: { resourceId: true, order: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    tags,
    resources: resources.map((resource) => ({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url,
      filePath: resource.filePath,
      fileName: resource.fileName,
      fileSize: resource.fileSize,
      mimeType: resource.mimeType,
      notes: resource.notes,
      isFavorite: resource.isFavorite,
      categoryId: resource.categoryId,
      tagNames: resource.tags.map(({ tag }) => tag.name),
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    })),
    collections: collections.map((collection) => ({
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      color: collection.color,
      icon: collection.icon,
      resourceTitles: collection.resources.map((item) => {
        const resource = resources.find((r) => r.id === item.resourceId);
        return resource?.title ?? null;
      }).filter(Boolean),
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ressources-telecom-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
