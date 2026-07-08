import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectionSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const collectionInclude = {
  resources: {
    include: {
      resource: {
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      },
    },
    orderBy: { order: "asc" as const },
  },
  _count: { select: { resources: true } },
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: collectionInclude,
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection introuvable" }, { status: 404 });
  }

  return NextResponse.json(collection);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const data = collectionSchema.partial().parse(body);

    const collection = await prisma.collection.update({
      where: { id },
      data,
      include: collectionInclude,
    });

    return NextResponse.json(collection);
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  await prisma.collection.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
