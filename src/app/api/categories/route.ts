import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";

export const GET = handler(async () => {
  const categories = await db.category.findMany({
    orderBy: [{ sort: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      emoji: true,
      _count: { select: { products: true } },
    },
  });
  return ok({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      emoji: c.emoji,
      productCount: c._count.products,
    })),
  });
});
