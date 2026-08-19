import { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { int, str } from "../_lib/http";
import { newsGroup, paging, readImage, splitList } from "../_lib/rodlex";

const PAGE_SIZE = 9;

export const GET = handler(async (req: Request) => {
  const sp = new URL(req.url).searchParams;
  const group = newsGroup(sp.get("group"));
  const q = str(sp.get("q"));
  const { page, pageSize, skip, take } = paging(
    int(sp.get("page"), 1),
    Math.min(36, Math.max(1, int(sp.get("pageSize"), PAGE_SIZE) ?? PAGE_SIZE)),
  );

  const where: Prisma.NewsArticleWhereInput = {};
  if (group) where.group = group;
  if (q)
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { tags: { contains: q } },
    ];

  const [total, rows] = await Promise.all([
    db.newsArticle.count({ where }),
    db.newsArticle.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        excerpt: true,
        group: true,
        tags: true,
        imageJson: true,
        videoUrl: true,
        publishedAt: true,
      },
    }),
  ]);

  return ok({
    articles: rows.map((a) => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt,
      group: a.group,
      tags: splitList(a.tags),
      image: readImage(a.imageJson, { emoji: "📰", from: "#1B7A43", to: "#2FA55C" }),
      videoUrl: a.videoUrl,
      publishedAt: a.publishedAt,
    })),
    total,
    page,
    pageSize,
  });
});
