import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, readBody, str } from "../../_lib/http";
import { joinList, newsGroup, toImage } from "../../_lib/rodlex";
import { applyNewsPatch } from "./_update";

export const GET = handler(async (req: Request) => {
  await requireUser("ADMIN");
  const group = newsGroup(new URL(req.url).searchParams.get("group"));
  const articles = await db.newsArticle.findMany({
    where: group ? { group } : {},
    orderBy: [{ publishedAt: "desc" }],
  });
  return ok({ articles, total: articles.length });
});

export const POST = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const title = str(b.title);
  const body = str(b.body);
  const group = newsGroup(b.group);
  if (!title) return fail("กรุณากรอกหัวข้อข่าว");
  if (!body) return fail("กรุณากรอกเนื้อหาข่าว");
  if (!group) return fail("กลุ่มข่าวไม่ถูกต้อง (CONSTRUCTION/AGRICULTURE/PLATFORM)");

  const publishedAt = str(b.publishedAt);
  const article = await db.newsArticle.create({
    data: {
      title,
      excerpt: str(b.excerpt) ?? body.replace(/\s+/g, " ").slice(0, 180),
      body,
      group,
      tags: joinList(b.tags),
      imageJson: JSON.stringify(
        toImage(b.image, { emoji: "📰", from: "#1B7A43", to: "#2FA55C" }),
      ),
      videoUrl: str(b.videoUrl) ?? null,
      ...(publishedAt && !Number.isNaN(Date.parse(publishedAt))
        ? { publishedAt: new Date(publishedAt) }
        : {}),
    },
  });

  await audit(db, {
    userId: admin.id,
    action: "NEWS_CREATE",
    entity: "NewsArticle",
    entityId: article.id,
    detail: { title },
  });
  return ok({ article }, { status: 201 });
});

/** รองรับ PATCH ที่ collection ด้วย (ส่ง id มาใน body) ตามที่ระบุใน CONTRACT2 */
export const PATCH = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const id = str(b.id);
  if (!id) return fail("กรุณาระบุ id ของบทความ");
  return applyNewsPatch(admin.id, id, b);
});
