import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resourceSchema } from "@/lib/validations";
import { Prisma, ResourceType } from "@/generated/prisma/client";

const resourceInclude = {
  category: true,
  tags: { include: { tag: true } },
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId");
  const type = searchParams.get("type") as ResourceType | null;
  const favorite = searchParams.get("favorite");
  const tag = searchParams.get("tag");
  const tags = searchParams.getAll("tags").flatMap((value) => value.split(",")).map((t) => t.trim()).filter(Boolean);
  const collectionId = searchParams.get("collectionId");
  const recent = searchParams.get("recent");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const uncategorized = searchParams.get("uncategorized");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 12)));

  const tagFilters = [...new Set([...(tag ? [tag] : []), ...tags])];

  const where: Prisma.ResourceWhereInput = {
    ...(categoryId ? { categoryId } : {}),
    ...(uncategorized === "true" ? { categoryId: null } : {}),
    ...(type ? { type } : {}),
    ...(favorite === "true" ? { isFavorite: true } : {}),
    ...(recent === "true" ? { lastViewedAt: { not: null } } : {}),
    ...(collectionId
      ? {
          collections: {
            some: { collectionId },
          },
        }
      : {}),
    ...(tagFilters.length
      ? {
          AND: tagFilters.map((name) => ({
            tags: {
              some: {
                tag: { name },
              },
            },
          })),
        }
      : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { notes: { contains: q } },
            { url: { contains: q } },
            { fileName: { contains: q } },
          ],
        }
      : {}),
  };

  const orderBy =
    recent === "true"
      ? [{ lastViewedAt: "desc" as const }]
      : [{ isFavorite: "desc" as const }, { updatedAt: "desc" as const }];

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      include: resourceInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.resource.count({ where }),
  ]);

  return NextResponse.json({
    resources,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = resourceSchema.parse(body);
    const tags = await syncTags(data.tagNames);

    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        url: data.type === "LINK" ? data.url || null : null,
        filePath: data.type === "FILE" ? data.filePath || null : null,
        fileName: data.type === "FILE" ? data.fileName || null : null,
        fileSize: data.type === "FILE" ? data.fileSize || null : null,
        mimeType: data.type === "FILE" ? data.mimeType || null : null,
        notes: data.notes,
        isFavorite: data.isFavorite ?? false,
        categoryId: data.categoryId || null,
        tags: {
          create: tags.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: resourceInclude,
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
