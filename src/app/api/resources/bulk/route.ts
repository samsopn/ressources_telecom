import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  action: z.enum([
    "favorite",
    "unfavorite",
    "delete",
    "setCategory",
    "addTags",
  ]),
  categoryId: z.string().nullable().optional(),
  tagNames: z.array(z.string()).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = bulkSchema.parse(await request.json());
    const { ids, action } = body;

    if (action === "favorite") {
      await prisma.resource.updateMany({
        where: { id: { in: ids } },
        data: { isFavorite: true },
      });
    }

    if (action === "unfavorite") {
      await prisma.resource.updateMany({
        where: { id: { in: ids } },
        data: { isFavorite: false },
      });
    }

    if (action === "delete") {
      await prisma.resource.deleteMany({ where: { id: { in: ids } } });
    }

    if (action === "setCategory") {
      await prisma.resource.updateMany({
        where: { id: { in: ids } },
        data: { categoryId: body.categoryId || null },
      });
    }

    if (action === "addTags") {
      const names = [...new Set((body.tagNames ?? []).map((n) => n.trim()).filter(Boolean))];
      const tags = await Promise.all(
        names.map((name) =>
          prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
          })
        )
      );

      for (const resourceId of ids) {
        for (const tag of tags) {
          await prisma.resourceTag.upsert({
            where: {
              resourceId_tagId: { resourceId, tagId: tag.id },
            },
            update: {},
            create: { resourceId, tagId: tag.id },
          });
        }
      }
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
