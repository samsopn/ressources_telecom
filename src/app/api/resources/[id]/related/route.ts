import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!resource) {
    return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });
  }

  const tagIds = resource.tags.map((item) => item.tagId);

  const related = await prisma.resource.findMany({
    where: {
      id: { not: id },
      OR: [
        ...(resource.categoryId ? [{ categoryId: resource.categoryId }] : []),
        ...(tagIds.length
          ? [{ tags: { some: { tagId: { in: tagIds } } } }]
          : []),
      ],
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    take: 6,
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
  });

  // Score simple : +2 même catégorie, +1 par tag commun
  const scored = related
    .map((item) => {
      let score = 0;
      if (resource.categoryId && item.categoryId === resource.categoryId) score += 2;
      const shared = item.tags.filter((t) => tagIds.includes(t.tagId)).length;
      score += shared;
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return NextResponse.json(scored);
}
