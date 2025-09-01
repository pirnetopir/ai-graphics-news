import Link from "next/link";
import type { Item, Source, Summary, Tag, ItemTag } from "@prisma/client";

export function ItemCard({
  item,
  source,
  summary,
  tags
}: {
  item: Item,
  source: Source,
  summary: Summary | null,
  tags: (Tag & { confidence: number })[]
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="source">{source?.name ?? "Neznámy zdroj"}</span>
        <span className="time">{item.publishedAt ? new Date(item.publishedAt).toLocaleString('sk-SK') : ""}</span>
      </div>
      <h3 className="text-lg font-semibold mt-1 mb-1">
        <Link href={item.url} target="_blank">{item.title}</Link>
      </h3>
      {summary?.short ? <p className="opacity-90">{summary.short}</p> : (item.excerpt ? <p className="opacity-90">{item.excerpt}</p> : null)}
      <div className="mt-2">
        {tags.slice(0, 6).map(t => <span key={t.id} className="tag">{t.name}</span>)}
      </div>
    </div>
  );
}
