import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const material = await prisma.nanomaterial.findUnique({
      where: { id: numId },
      include: { caseStudies: true },
    });

    if (!material) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(material);
  } catch (err) {
    console.error("[nanomaterial] DB error:", err);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}
