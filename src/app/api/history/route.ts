import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const resources = await prisma.resource.findMany({
    where: { lastViewedAt: { not: null } },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { lastViewedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(resources);
}
