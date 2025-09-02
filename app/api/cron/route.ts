import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; import Parser from "rss-parser"; import { annotateItem } from "@/lib/annotate";
const parser = new Parser();
function canonicalize(url: string): string { try { const u = new URL(url); ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(k => u.searchParams.delete(k)); return u.toString(); } catch { return url; } }
async function upsertItem(sourceId: number, entry: any) {
  const url = canonicalize(entry.link || entry.guid || ""); const title = (entry.title || "Untitled").trim();
  const publishedAt = entry.isoDate ? new Date(entry.isoDate) : null; const excerpt = (entry.contentSnippet || entry.summary || "").trim().slice(0, 300);
  if (!url || !title) return null;
  try { return await prisma.item.upsert({ where: { url }, update: {}, create: { sourceId, url, title, excerpt, publishedAt, contentHtml: (entry as any)["content:encoded"] || entry.content || null, lang: null } }); } catch { return null; }
}
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || ""; const url = new URL(req.url); const given = url.searchParams.get("secret");
  if (!secret || given !== secret) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let total = 0; const sources = await prisma.source.findMany();
  for (const s of sources) { if (s.kind !== "rss") continue; const feed = await parser.parseURL(s.url).catch(() => null); if (!feed) continue;
    for (const entry of feed.items.slice(0, 12)) { const item = await upsertItem(s.id, entry); if (item) { total++; const text = [item.title, item.excerpt, item.contentHtml].filter(Boolean).join("\n\n"); await annotateItem(item.id, text); } }
    await prisma.source.update({ where: { id: s.id }, data: { lastSeenAt: new Date() } });
  } return NextResponse.json({ ok: true, addedApprox: total });
}
