import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";

export const GET = handler(async () => {
  const banners = await db.banner.findMany({
    where: { active: true },
    orderBy: [{ sort: "asc" }],
  });
  return ok({ banners });
});
