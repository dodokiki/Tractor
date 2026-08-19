import { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { int, str } from "../_lib/http";
import { machineCategory, paging, technicianCard } from "../_lib/rodlex";

const PAGE_SIZE = 12;

export const GET = handler(async (req: Request) => {
  const sp = new URL(req.url).searchParams;
  const category = machineCategory(sp.get("category"));
  const q = str(sp.get("q"));
  const province = str(sp.get("province"));
  const sort = str(sp.get("sort")) ?? "rating";
  const { page, pageSize, skip, take } = paging(
    int(sp.get("page"), 1),
    Math.min(48, Math.max(1, int(sp.get("pageSize"), PAGE_SIZE) ?? PAGE_SIZE)),
  );

  const where: Prisma.TechnicianWhereInput = {};
  if (category) where.category = category;
  if (province) where.province = province;
  if (q)
    where.OR = [
      { name: { contains: q } },
      { code: { contains: q } },
      { bio: { contains: q } },
      { skills: { contains: q } },
      { province: { contains: q } },
    ];

  let orderBy: Prisma.TechnicianOrderByWithRelationInput[];
  switch (sort) {
    case "jobs":
      orderBy = [{ jobsDone: "desc" }, { rating: "desc" }];
      break;
    case "reviews":
      orderBy = [{ reviewCount: "desc" }, { rating: "desc" }];
      break;
    case "new":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "name":
      orderBy = [{ name: "asc" }];
      break;
    default: // rating = เรียงตามความน่าเชื่อถือ
      orderBy = [{ rating: "desc" }, { reviewCount: "desc" }];
  }

  const [total, rows, provinceRows] = await Promise.all([
    db.technician.count({ where }),
    db.technician.findMany({ where, orderBy, skip, take }),
    db.technician.findMany({
      where: { province: { not: null } },
      select: { province: true },
      distinct: ["province"],
      orderBy: { province: "asc" },
    }),
  ]);

  return ok({
    technicians: rows.map(technicianCard),
    total,
    page,
    pageSize,
    provinces: provinceRows.map((p) => p.province).filter(Boolean),
  });
});
