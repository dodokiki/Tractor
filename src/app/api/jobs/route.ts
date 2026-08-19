import { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { str } from "../_lib/http";
import { jobType } from "../_lib/rodlex";

export const GET = handler(async (req: Request) => {
  const sp = new URL(req.url).searchParams;
  const type = jobType(sp.get("type"));
  const q = str(sp.get("q"));

  const where: Prisma.JobPostingWhereInput = { active: true };
  if (type) where.type = type;
  if (q)
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { location: { contains: q } },
    ];

  const jobs = await db.jobPosting.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      type: true,
      location: true,
      wage: true,
      description: true,
      createdAt: true,
    },
  });

  return ok({ jobs, total: jobs.length });
});
