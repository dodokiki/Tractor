import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { technicianCard } from "../../_lib/rodlex";

/** ช่างสปอตไลต์ + แกลเลอรีช่างเด่นสำหรับหัวหน้า /technicians */
export const GET = handler(async () => {
  const featured =
    (await db.technician.findFirst({
      where: { featured: true },
      orderBy: [{ rating: "desc" }, { jobsDone: "desc" }],
    })) ??
    (await db.technician.findFirst({
      orderBy: [{ rating: "desc" }, { jobsDone: "desc" }],
    }));

  const gallery = await db.technician.findMany({
    where: featured ? { id: { not: featured.id } } : {},
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    take: 8,
  });

  return ok({
    technician: featured ? technicianCard(featured) : null,
    gallery: gallery.map(technicianCard),
  });
});
