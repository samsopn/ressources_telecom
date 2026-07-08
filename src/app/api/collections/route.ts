import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectionSchema } from "@/lib/validations";

export async function GET() {
  const collections = await prisma.collection.findMany({
    include: {
      _count: { select: { resources: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(collections);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = collectionSchema.parse(body);

    const collection = await prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        color: data.color,
        icon: data.icon,
      },
      include: {
        _count: { select: { resources: true } },
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
}
