// ตรรกะแก้ไขข่าวที่ใช้ร่วมกันระหว่าง PATCH /api/admin/news (id ใน body)
// และ PATCH /api/admin/news/[id] — ไม่ใช่ route (Next.js อ่านเฉพาะไฟล์ชื่อ route.ts)
import type { Prisma } from "@prisma/client";
import { ok, fail } from "@/lib/api";
import { db } from "@/lib/db";
import { audit, str } from "../../_lib/http";
import { joinList, newsGroup, toImage } from "../../_lib/rodlex";

export async function applyNewsPatch(
  adminId: string,
  id: string,
  b: Record<string, unknown>,
): Promise<Response> {
  const current = await db.newsArticle.findUnique({ where: { id } });
  if (!current) return fail("ไม่พบบทความนี้", 404);

  const data: Prisma.NewsArticleUpdateInput = {};
  const title = str(b.title);
  if (title) data.title = title;
  const excerpt = str(b.excerpt);
  if (excerpt) data.excerpt = excerpt;
  const body = str(b.body);
  if (body) data.body = body;
  const group = newsGroup(b.group);
  if (group) data.group = group;
  if (b.tags !== undefined) data.tags = joinList(b.tags);
  if (b.image !== undefined)
    data.imageJson = JSON.stringify(
      toImage(b.image, { emoji: "📰", from: "#1B7A43", to: "#2FA55C" }),
    );
  if (b.videoUrl !== undefined) data.videoUrl = str(b.videoUrl) ?? null;
  const publishedAt = str(b.publishedAt);
  if (publishedAt && !Number.isNaN(Date.parse(publishedAt)))
    data.publishedAt = new Date(publishedAt);

  if (!Object.keys(data).length) return fail("ไม่มีข้อมูลที่ต้องแก้ไข");

  const article = await db.newsArticle.update({ where: { id }, data });
  await audit(db, {
    userId: adminId,
    action: "NEWS_UPDATE",
    entity: "NewsArticle",
    entityId: id,
    detail: { fields: Object.keys(data) },
  });
  return ok({ article });
}
