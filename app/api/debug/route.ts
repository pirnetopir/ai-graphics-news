import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [sources, items, tags] = await Promise.all([
      prisma.source.count(),
      prisma.item.count(),
      prisma.tag.count(),
    ]);

    // Skúsime si pre info zistiť aktívnu schému
    let schema: string | null = null;
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(`select current_schema() as schema`);
      schema = rows?.[0]?.schema ?? null;
    } catch {}

    return NextResponse.json({ ok: true, schema, counts: { sources, items, tags } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
