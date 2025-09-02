import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const TAGS = [
  { slug: "retus", name: "Retuš", group: "Grafika" },
  { slug: "vektor", name: "Vektor", group: "Grafika" },
  { slug: "typografia", name: "Typografia", group: "Grafika" },
  { slug: "farbenie", name: "Farbenie", group: "Grafika" },
  { slug: "kompozicia", name: "Kompozícia", group: "Grafika" },
  { slug: "branding", name: "Branding", group: "Grafika" },
  { slug: "logo", name: "Logo", group: "Grafika" },
  { slug: "mockup", name: "Mockup", group: "Grafika" },
  { slug: "print", name: "Print", group: "Grafika" },
  { slug: "packaging", name: "Packaging", group: "Grafika" },
  { slug: "ui", name: "UI", group: "Grafika" },
  { slug: "webdesign", name: "Webdesign", group: "Grafika" },
  { slug: "ikonky", name: "Ikonky", group: "Grafika" },
  { slug: "fotomontaz", name: "Fotomontáž", group: "Grafika" },
  { slug: "photoshop", name: "Photoshop", group: "Nástroje" },
  { slug: "illustrator", name: "Illustrator", group: "Nástroje" },
  { slug: "indesign", name: "InDesign", group: "Nástroje" },
  { slug: "figma", name: "Figma", group: "Nástroje" },
  { slug: "after-effects", name: "After Effects", group: "Nástroje" },
  { slug: "premiere", name: "Premiere", group: "Nástroje" },
  { slug: "blender", name: "Blender", group: "Nástroje" },
  { slug: "cinema4d", name: "Cinema 4D", group: "Nástroje" },
  { slug: "affinity", name: "Affinity", group: "Nástroje" },
  { slug: "procreate", name: "Procreate", group: "Nástroje" },
  { slug: "comfyui", name: "ComfyUI", group: "Nástroje" },
  { slug: "stable-diffusion", name: "Stable Diffusion", group: "Nástroje" },
  { slug: "midjourney", name: "Midjourney", group: "Nástroje" },
  { slug: "firefly", name: "Firefly", group: "Nástroje" },
  { slug: "runway", name: "Runway", group: "Nástroje" },
  { slug: "upscaling", name: "Upscaling", group: "AI techniky" },
  { slug: "inpainting", name: "Inpainting", group: "AI techniky" },
  { slug: "outpainting", name: "Outpainting", group: "AI techniky" },
  { slug: "controlnet", name: "ControlNet", group: "AI techniky" },
  { slug: "stylization", name: "Štylizácia", group: "AI techniky" },
  { slug: "text2image", name: "Text→Image", group: "AI techniky" },
  { slug: "image2image", name: "Image→Image", group: "AI techniky" },
  { slug: "prompting", name: "Prompting", group: "AI techniky" },
  { slug: "lora", name: "LoRA", group: "AI techniky" },
  { slug: "finetuning", name: "Fine-tuning", group: "AI techniky" },
  { slug: "tutorial", name: "Tutoriál", group: "Formát" },
  { slug: "asset", name: "Asset/Preset", group: "Formát" },
  { slug: "workflow", name: "Workflow tip", group: "Formát" },
  { slug: "update", name: "Update verzie", group: "Formát" },
  { slug: "recenzia", name: "Recenzia", group: "Formát" },
  { slug: "advertising", name: "Advertising", group: "Doména" },
  { slug: "social", name: "Sociálne siete", group: "Doména" },
  { slug: "eshop", name: "E-shop", group: "Doména" },
  { slug: "editorial", name: "Editorial", group: "Doména" },
  { slug: "3dviz", name: "3D vizualizácia", group: "Doména" },
  { slug: "motion", name: "Motion", group: "Doména" },
  { slug: "licencovanie", name: "Licencovanie", group: "Meta" },
  { slug: "etika", name: "Etika", group: "Meta" },
  { slug: "biznis", name: "Biznis", group: "Meta" },
  { slug: "ceny", name: "Ceny", group: "Meta" },
];

const STARTER_SOURCES = [
  { url: "https://blog.adobe.com/en/topics/ai/rss", kind: "rss", name: "Adobe Blog (AI)", authority: 0.8, lang: "en" },
  { url: "https://blog.runwayml.com/feed.xml", kind: "rss", name: "Runway Blog", authority: 0.7, lang: "en" },
  { url: "https://www.figma.com/blog/rss.xml", kind: "rss", name: "Figma Blog", authority: 0.7, lang: "en" },
  { url: "https://stability.ai/blog?format=rss", kind: "rss", name: "Stability AI", authority: 0.7, lang: "en" },
  { url: "https://research.google/blog/category/generative-ai/feed/", kind: "rss", name: "Google Research (GenAI)", authority: 0.6, lang: "en" },
  { url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCt9Kudck8xCfaIue4kXRCkw", kind: "rss", name: "PiXimperfect (YouTube)", authority: 0.6, lang: "en" },
];

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || "";
  const given = new URL(req.url).searchParams.get("secret");
  if (!secret || given !== secret) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  for (const t of TAGS) {
    await prisma.tag.upsert({ where: { slug: t.slug }, update: { name: t.name, group: t.group }, create: t });
  }
  for (const s of STARTER_SOURCES) {
    await prisma.source.upsert({
      where: { url: s.url },
      update: { name: s.name, kind: s.kind, authority: s.authority, lang: s.lang ?? null },
      create: s as any,
    });
  }

  const [sources, tags] = await Promise.all([prisma.source.count(), prisma.tag.count()]);
  return NextResponse.json({ ok: true, seeded: { sources, tags } });
}
