import type { Item } from "@prisma/client";
import { prisma } from "./db";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Very simple keyword tagging fallback (Slovak-friendly)
const KEYWORD_TAGS: Record<string, string[]> = {
  "photoshop": ["photoshop"],
  "illustrator": ["illustrator"],
  "figma": ["figma"],
  "retuš": ["retus"],
  "retus": ["retus"],
  "vector": ["vektor"],
  "vektor": ["vektor"],
  "web": ["webdesign", "ui"],
  "mockup": ["mockup"],
  "branding": ["branding"],
  "controlnet": ["controlnet"],
  "upscal": ["upscaling"],
  "inpaint": ["inpainting"],
  "outpaint": ["outpainting"],
};

export async function annotateItem(itemId: number, text: string) {
  // naive summary
  let headline = null;
  let short = null;
  let bullets = null;

  const basePrompt = `Si editor pre grafického dizajnéra. Zhrň nasledujúci text po slovensky.
1) Daj 1‑vetový 'headline' (max 18 slov).
2) Daj 2–3 vety 'short' – prakticky čo je nové a prečo je to dôležité pre grafikov.
3) Daj max 3 odrážky 'bullets' – čo si z toho odniesť (stručne).`;

  if (OPENAI_KEY) {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: OPENAI_KEY });
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: basePrompt },
          { role: "user", content: text.slice(0, 6000) }
        ],
        temperature: 0.2,
      });
      const out = res.choices[0].message?.content ?? "";
      // naive parse
      const parts = out.replace(/\r/g, '').split('\n');
      headline = parts[0]?.trim() || null;
      short = parts.slice(1, 3).join(" ").trim() || null;
      bullets = parts.slice(3).join("\n").trim() || null;
    } catch (e) {
      // fall through to naive
      console.warn("OpenAI summarize failed:", e);
    }
  }

  if (!headline) {
    const t = text.replace(/\s+/g, " ").trim();
    headline = t.slice(0, 80) + (t.length > 80 ? "…" : "");
    short = t.slice(0, 220) + (t.length > 220 ? "…" : "");
    bullets = "- Pozri zdroj pre detaily";
  }

  // keyword tag guesses
  const lower = text.toLowerCase();
  const tagSlugs = new Set<string>();
  for (const [needle, slugs] of Object.entries(KEYWORD_TAGS)) {
    if (lower.includes(needle)) slugs.forEach(s => tagSlugs.add(s));
  }

  // Persist
  await prisma.summary.upsert({
    where: { itemId },
    create: { itemId, headline, short, bullets },
    update: { headline, short, bullets }
  });

  if (tagSlugs.size) {
    const tags = await prisma.tag.findMany({ where: { slug: { in: [...tagSlugs] }}});
    for (const tag of tags) {
      await prisma.itemTag.upsert({
        where: { itemId_tagId: { itemId, tagId: tag.id } },
        create: { itemId, tagId: tag.id, confidence: 0.65 },
        update: { confidence: 0.65 }
      });
    }
  }

  // naive scoring
  await prisma.score.upsert({
    where: { itemId },
    create: {
      itemId,
      relevance: Math.min(1, 0.5 + tagSlugs.size * 0.1),
      novelty: 0.7,
      authority: 0.6,
      applicability: 0.6,
      impact: 0.5,
      licenseClarity: 0.5,
      community: 0.4
    },
    update: {}
  });
}
