export const dynamic = "force-dynamic"; // nedovoľ SSG počas build-u
export const revalidate = 0;            // bez cache

import { prisma } from "@/lib/db";
import { ItemCard } from "@/components/ItemCard";
import type { Prisma } from "@prisma/client";

type ItemWithRels = Prisma.ItemGetPayload<{
  include: {
    source: true;
    summary: true;
    tags: { include: { tag: true } };
  };
}>;

export default async function Home() {
  let items: ItemWithRels[] = [];
  try {
    items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { source: true, summary: true, tags: { include: { tag: true } } },
    });
  } catch (e) {
    // Ak DB nie je pripravená počas prvého štartu, stránka sa aj tak vyrenderuje bez pádu
    items = [];
  }

  return (
    <main>
      {items.length === 0 ? (
        <p>Žiadne položky zatiaľ nie sú. Po prvom fetchnutí sa tu objaví denný výber.</p>
      ) : (
        <div className="grid">
          {items.map((it) => (
            <ItemCard
              key={it.id}
              item={it as any}
              source={it.source}
              summary={it.summary}
              tags={it.tags.map((t) => ({ ...t.tag, confidence: t.confidence }))}
            />
          ))}
        </div>
      )}
    </main>
  );
}
