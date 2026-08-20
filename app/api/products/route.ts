import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  try {
    const products = await prisma.caseStudy.findMany({
      where: q
        ? { exampleProduct: { contains: q, mode: "insensitive" } }
        : undefined,
      include: {
        nanomaterial: true,
      },
      orderBy: { slNumber: "asc" },
      take: 20,
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("[product-search] DB error:", err);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}
