import { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { str } from "../../_lib/http";
import { serviceStatus } from "../../_lib/rodlex";

export const GET = handler(async (req: Request) => {
  await requireUser("ADMIN");
  const sp = new URL(req.url).searchParams;
  const status = serviceStatus(sp.get("status"));
  const q = str(sp.get("q"));

  const where: Prisma.ServiceRequestWhereInput = {};
  if (status) where.status = status;
  if (q)
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { machineType: { contains: q } },
      { problem: { contains: q } },
      { province: { contains: q } },
    ];

  const requests = await db.serviceRequest.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
  });
  const grouped = await db.serviceRequest.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return ok({
    requests,
    total: requests.length,
    counts: Object.fromEntries(grouped.map((g) => [g.status, g._count._all])),
  });
});
