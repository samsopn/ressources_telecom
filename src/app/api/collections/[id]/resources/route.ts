import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const addResourceSchema = z.object({
  resourceId: z.string().min(1),
});

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { resourceId } = addResourceSchema.parse(body);

    const count = await prisma.collectionResource.count({
      where: { collectionId: id },
    });

    await prisma.collectionResource.upsert({
      where: {
        collectionId_resourceId: { collectionId: id, resourceId },
      },
      update: {},
      create: {
        collectionId: id,
        resourceId,
        order: count,
      },
    });

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        resources: {
          include: {
            resource: {
              include: {
                category: true,
                tags: { include: { tag: true } },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { resources: true } },
      },
    });

    return NextResponse.json(collection);
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const resourceId = request.nextUrl.searchParams.get("resourceId");

  if (!resourceId) {
    return NextResponse.json({ error: "resourceId requis" }, { status: 400 });
  }

  await prisma.collectionResource.delete({
    where: {
      collectionId_resourceId: { collectionId: id, resourceId },
    },
  });

  return NextResponse.json({ success: true });
}
