import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  try {
    const materials = await prisma.nanomaterial.findMany({
      where: q
        ? {
            name: { contains: q, mode: "insensitive" },
          }
        : undefined,
      include: { caseStudies: true },
      orderBy: { sampleId: "asc" },
      take: 20,
    });

    return NextResponse.json(materials);
  } catch (err) {
    console.error("[search] DB error:", err);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}
