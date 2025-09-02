import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [sources, items, tags] = await Promise.all([
      prisma.source.count(),
      prisma.item.count(),
      prisma.tag.count(),
    ]);

    // zistenie aktívnej DB schémy (bez generík na $queryRawUnsafe)
    let schema: string | null = null;
    try {
      const rows = (await prisma.$queryRawUnsafe(
        `select current_schema() as schema`
      )) as Array<{ schema: string }>;
      schema = rows?.[0]?.schema ?? null;
    } catch {
      // nech to nezhodí endpoint, ak by query zlyhala
    }

    return NextResponse.json({ ok: true, schema, counts: { sources, items, tags } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
