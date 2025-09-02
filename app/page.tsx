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
  const items: ItemWithRels[] = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { source: true, summary: true, tags: { include: { tag: true } } },
  });

  return (
    <main>
      {items.length === 0 ? (
        <p>Žiadne položky zatiaľ nie sú. Po prvom fetchnutí sa tu objaví denný výber.</p>
      ) : (
        <div className="grid">
          {items.map((it) => (
            <ItemCard
              key={it.id}
              item={it as any}                // ItemCard očakáva typy z @prisma/client; štruktúra sedí
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
