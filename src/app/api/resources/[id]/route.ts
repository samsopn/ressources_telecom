import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resourceSchema } from "@/lib/validations";
import { Prisma } from "@/generated/prisma/client";

const resourceInclude = {
  category: true,
  tags: { include: { tag: true } },
  collections: {
    include: { collection: true },
    orderBy: { order: "asc" },
  },
} satisfies Prisma.ResourceInclude;

async function syncTags(tagNames: string[] = []) {
  const uniqueNames = [...new Set(tagNames.map((name) => name.trim()).filter(Boolean))];
  return Promise.all(
    uniqueNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: resourceInclude,
  });

  if (!resource) {
    return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });
  }

  await prisma.resource.update({
    where: { id },
    data: { lastViewedAt: new Date() },
  });

  return NextResponse.json(resource);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const data = resourceSchema.partial().parse(body);

    if (data.tagNames) {
      const tags = await syncTags(data.tagNames);
      await prisma.resourceTag.deleteMany({ where: { resourceId: id } });
      await prisma.resourceTag.createMany({
        data: tags.map((tag) => ({ resourceId: id, tagId: tag.id })),
      });
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.url !== undefined ? { url: data.url || null } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.isFavorite !== undefined ? { isFavorite: data.isFavorite } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId || null } : {}),
      },
      include: resourceInclude,
    });

    return NextResponse.json(resource);
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  await prisma.resource.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
