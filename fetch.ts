import { prisma } from "../src/lib/db.js";
import Parser from "rss-parser";

const parser = new Parser();

async function fetchRss(url: string) {
  try {
    return await parser.parseURL(url);
  } catch (e) {
    console.error("RSS fetch failed:", url, e);
    return null;
  }
}

function canonicalize(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("utm_term");
    u.searchParams.delete("utm_content");
    return u.toString();
  } catch {
    return url;
  }
}

async function upsertItem(sourceId: number, entry: any) {
  const url = canonicalize(entry.link || entry.guid || "");
  const title = (entry.title || "Untitled").trim();
  const publishedAt = entry.isoDate ? new Date(entry.isoDate) : null;
  const excerpt = (entry.contentSnippet || entry.summary || "").trim().slice(0, 300);

  if (!url || !title) return null;

  try {
    const item = await prisma.item.upsert({
      where: { url },
      update: {},
      create: {
        sourceId,
        url,
        title,
        excerpt,
        publishedAt,
        contentHtml: entry["content:encoded"] || entry.content || null,
        lang: null
      }
    });
    return item;
  } catch (e) {
    // Duplicate etc.
    return null;
  }
}

import { annotateItem } from "../src/lib/annotate.js";

async function main() {
  console.log("Starting fetch job…");
  const sources = await prisma.source.findMany();
  for (const s of sources) {
    console.log("Source:", s.name, s.url);
    if (s.kind !== "rss") {
      console.log("  (skipping non-RSS for MVP)");
      continue;
    }
    const feed = await fetchRss(s.url);
    if (!feed) continue;
    let newCount = 0;
    for (const entry of feed.items.slice(0, 12)) {
      const item = await upsertItem(s.id, entry);
      if (item) {
        newCount++;
        const text = [item.title, item.excerpt, item.contentHtml].filter(Boolean).join("\n\n");
        await annotateItem(item.id, text);
      }
    }
    await prisma.source.update({ where: { id: s.id }, data: { lastSeenAt: new Date() } });
    console.log(`  Added ~${newCount} new items.`);
  }
  console.log("Fetch job done.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
