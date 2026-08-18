import type { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { int, str } from "../../_lib/http";

export const GET = handler(async (req: Request) => {
  await requireUser("ADMIN");
  const sp = new URL(req.url).searchParams;
  const q = str(sp.get("q"));
  const role = str(sp.get("role"));
  const take = Math.min(200, int(sp.get("limit"), 100) ?? 100);

  const where: Prisma.UserWhereInput = {};
  if (role && role !== "ALL") where.role = role as Prisma.UserWhereInput["role"];
  if (q)
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ];

  const rows = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    include: {
      vendor: { select: { id: true, shopName: true, approved: true } },
      _count: { select: { orders: true, vehicles: true } },
    },
  });

  return ok({
    users: rows.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      vendor: u.vendor,
      orderCount: u._count.orders,
      vehicleCount: u._count.vehicles,
    })),
    total: rows.length,
  });
});
