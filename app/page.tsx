import { prisma } from "@/lib/db";
import { ItemCard } from "@/components/ItemCard";

export default async function Home() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      source: true,
      summary: true,
      tags: { include: { tag: true } }
    }
  });

  return (
    <main>
      {items.length === 0 ? (
        <p>Žiadne položky zatiaľ nie sú. Po prvom fetchi sa tu objaví denný výber.</p>
      ) : (
        <div className="grid">
          {items.map(it => (
            <ItemCard
              key={it.id}
              item={it}
              source={it.source}
              summary={it.summary}
              tags={it.tags.map(t => ({ ...t.tag, confidence: t.confidence }))}
            />
          ))}
        </div>
      )}
    </main>
  )
}
