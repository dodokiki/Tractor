import { handler, ok, fail } from "@/lib/api";
import { db } from "@/lib/db";
import { readImage, splitList } from "../../_lib/rodlex";

const NEWS_IMAGE = { emoji: "📰", from: "#1B7A43", to: "#2FA55C" };

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const a = await db.newsArticle.findUnique({ where: { id } });
    if (!a) return fail("ไม่พบบทความนี้", 404);

    const related = await db.newsArticle.findMany({
      where: { group: a.group, id: { not: a.id } },
      orderBy: [{ publishedAt: "desc" }],
      take: 3,
      select: {
        id: true,
        title: true,
        excerpt: true,
        group: true,
        imageJson: true,
        publishedAt: true,
      },
    });

    return ok({
      article: {
        id: a.id,
        title: a.title,
        excerpt: a.excerpt,
        body: a.body,
        paragraphs: a.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
        group: a.group,
        tags: splitList(a.tags),
        image: readImage(a.imageJson, NEWS_IMAGE),
        videoUrl: a.videoUrl,
        publishedAt: a.publishedAt,
      },
      related: related.map((r) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        group: r.group,
        image: readImage(r.imageJson, NEWS_IMAGE),
        publishedAt: r.publishedAt,
      })),
    });
  },
);
