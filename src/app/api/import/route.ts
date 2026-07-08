import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const importSchema = z.object({
  version: z.number().optional(),
  categories: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        slug: z.string(),
        icon: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        parentId: z.string().nullable().optional(),
      })
    )
    .optional(),
  resources: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().nullable().optional(),
        type: z.enum(["LINK", "FILE"]),
        url: z.string().nullable().optional(),
        filePath: z.string().nullable().optional(),
        fileName: z.string().nullable().optional(),
        fileSize: z.number().nullable().optional(),
        mimeType: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        isFavorite: z.boolean().optional(),
        categoryId: z.string().nullable().optional(),
        tagNames: z.array(z.string()).optional(),
      })
    )
    .optional(),
  collections: z
    .array(
      z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
        icon: z.string().nullable().optional(),
        resourceTitles: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = importSchema.parse(body);

    let importedCategories = 0;
    let importedResources = 0;
    let importedCollections = 0;
    let linkedResources = 0;

    const categoryIdMap = new Map<string, string>();
    const resourcesByTitle = new Map<string, string>();

    if (data.categories) {
      for (const category of data.categories) {
        const saved = await prisma.category.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            icon: category.icon,
            color: category.color,
            description: category.description,
          },
          create: {
            name: category.name,
            slug: category.slug,
            icon: category.icon,
            color: category.color,
            description: category.description,
          },
        });

        if (category.id) {
          categoryIdMap.set(category.id, saved.id);
        }
        importedCategories++;
      }
    }

    if (data.resources) {
      for (const resource of data.resources) {
        const tags = await Promise.all(
          (resource.tagNames ?? []).map((name) =>
            prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            })
          )
        );

        const mappedCategoryId = resource.categoryId
          ? (categoryIdMap.get(resource.categoryId) ?? resource.categoryId)
          : null;

        const created = await prisma.resource.create({
          data: {
            title: resource.title,
            description: resource.description,
            type: resource.type,
            url: resource.url,
            filePath: resource.filePath,
            fileName: resource.fileName,
            fileSize: resource.fileSize,
            mimeType: resource.mimeType,
            notes: resource.notes,
            isFavorite: resource.isFavorite ?? false,
            categoryId: mappedCategoryId,
            tags: {
              create: tags.map((tag) => ({ tagId: tag.id })),
            },
          },
        });

        resourcesByTitle.set(resource.title, created.id);
        importedResources++;
      }
    }

    if (data.collections) {
      for (const collection of data.collections) {
        const saved = await prisma.collection.upsert({
          where: { slug: collection.slug },
          update: {
            name: collection.name,
            description: collection.description,
            color: collection.color,
            icon: collection.icon,
          },
          create: collection,
        });
        importedCollections++;

        const titles = collection.resourceTitles ?? [];
        for (let order = 0; order < titles.length; order++) {
          const title = titles[order];
          let resourceId = resourcesByTitle.get(title);

          if (!resourceId) {
            const existing = await prisma.resource.findFirst({
              where: { title },
              select: { id: true },
            });
            resourceId = existing?.id;
          }

          if (!resourceId) continue;

          await prisma.collectionResource.upsert({
            where: {
              collectionId_resourceId: {
                collectionId: saved.id,
                resourceId,
              },
            },
            update: { order },
            create: {
              collectionId: saved.id,
              resourceId,
              order,
            },
          });
          linkedResources++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      importedCategories,
      importedResources,
      importedCollections,
      linkedResources,
    });
  } catch {
    return NextResponse.json({ error: "Fichier JSON invalide" }, { status: 400 });
  }
}
