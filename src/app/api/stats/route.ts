import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalResources, favoriteResources, totalCategories, totalTags, recentResources] =
    await Promise.all([
      prisma.resource.count(),
      prisma.resource.count({ where: { isFavorite: true } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.resource.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      }),
    ]);

  const resourcesByType = await prisma.resource.groupBy({
    by: ["type"],
    _count: { _all: true },
  });

  return NextResponse.json({
    totalResources,
    favoriteResources,
    totalCategories,
    totalTags,
    recentResources,
    resourcesByType,
  });
}
