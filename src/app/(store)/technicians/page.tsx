import type { Prisma, MachineCategory, Technician } from "@prisma/client";
import { db } from "@/lib/db";
import { StarRating } from "@/components/store/star-rating";
import { GradientTile } from "@/components/store/rodlex/gradient-tile";
import { EntityCard } from "@/components/store/rodlex/entity-card";
import { SectionHeader } from "@/components/store/rodlex/section-header";
import { FilterBox } from "@/components/store/rodlex/filter-box";
import { PillLink } from "@/components/store/rodlex/pill";
import { RodlexPagination } from "@/components/store/rodlex/pagination";
import { parseTileImage } from "@/components/store/rodlex/image";

const PAGE_SIZE = 12;

const CATEGORY_LABEL: Record<MachineCategory, string> = {
  CONSTRUCTION: "เครื่องจักรงานก่อสร้าง",
  AGRICULTURE: "เครื่องจักรงานเกษตร",
  MODIFICATION: "เครื่องจักรงานดัดแปลง",
};

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  online?: string;
  page?: string;
};

export default async function TechniciansPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const category = (sp.category?.trim() || undefined) as MachineCategory | undefined;
  const sort = sp.sort || undefined;
  const online = sp.online === "1";
  const page = Math.max(1, Number(sp.page) || 1);

  const hasFilter = Boolean(q || category || sort || online || page > 1);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">ทีมช่าง</h1>

      {hasFilter ? (
        <CombinedList q={q} category={category} sort={sort} online={online} page={page} sp={sp} />
      ) : (
        <CuratedView />
      )}
    </div>
  );
}

async function CuratedView() {
  const [featured, popular, construction, agriculture, modification] = await Promise.all([
    db.technician.findFirst({ where: { featured: true }, orderBy: { createdAt: "asc" } }),
    db.technician.findMany({ orderBy: [{ jobsDone: "desc" }], take: 4 }),
    db.technician.findMany({
      where: { category: "CONSTRUCTION" },
      orderBy: [{ rating: "desc" }, { jobsDone: "desc" }],
      take: 4,
    }),
    db.technician.findMany({
      where: { category: "AGRICULTURE" },
      orderBy: [{ rating: "desc" }, { jobsDone: "desc" }],
      take: 4,
    }),
    db.technician.findMany({
      where: { category: "MODIFICATION" },
      orderBy: [{ rating: "desc" }, { jobsDone: "desc" }],
      take: 4,
    }),
  ]);

  const spotlight = featured ?? popular[0] ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        {spotlight ? <TechnicianSpotlight technician={spotlight} /> : <EmptySpotlight />}

        <FilterBox
          basePath="/technicians"
          title="ค้นหาทีมช่าง"
          searchPlaceholder="ค้นหาชื่อช่าง / ความเชี่ยวชาญ"
          quickFilters={[
            { label: "ทีมช่างทั้งหมด", params: {} },
            { label: "ทีมช่างที่ออนไลน์", params: { online: "1" } },
            { label: "เรียงความน่าเชื่อถือ", params: { sort: "rating" } },
          ]}
          categoryOptions={Object.entries(CATEGORY_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
          initial={{}}
        />
      </div>

      <TechSection
        title="ทีมช่างรถเหล็ก ยอดนิยมประจำเดือน"
        items={popular}
        pagerHref={(p) => `/technicians?sort=popular&page=${p}`}
      />
      <TechSection
        title="เครื่องจักรงานก่อสร้าง"
        items={construction}
        pagerHref={(p) => `/technicians?category=CONSTRUCTION&page=${p}`}
      />
      <TechSection
        title="เครื่องจักรงานเกษตร"
        items={agriculture}
        pagerHref={(p) => `/technicians?category=AGRICULTURE&page=${p}`}
      />
      <TechSection
        title="เครื่องจักรงานดัดแปลง"
        items={modification}
        pagerHref={(p) => `/technicians?category=MODIFICATION&page=${p}`}
      />
    </div>
  );
}

async function CombinedList({
  q,
  category,
  sort,
  online,
  page,
  sp,
}: {
  q?: string;
  category?: MachineCategory;
  sort?: string;
  online: boolean;
  page: number;
  sp: SearchParams;
}) {
  const where: Prisma.TechnicianWhereInput = {};
  if (category) where.category = category;
  if (online) where.online = true;
  if (q) where.OR = [{ name: { contains: q } }, { skills: { contains: q } }, { code: { contains: q } }];

  const orderBy: Prisma.TechnicianOrderByWithRelationInput[] =
    sort === "popular"
      ? [{ jobsDone: "desc" }]
      : sort === "rating"
        ? [{ rating: "desc" }]
        : [{ featured: "desc" }, { rating: "desc" }];

  const [total, rows] = await Promise.all([
    db.technician.count({ where }),
    db.technician.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="flex flex-col gap-4 lg:order-1">
          <p className="text-sm text-muted">พบทีมช่าง {total.toLocaleString("th-TH")} คน</p>

          {rows.length === 0 ? (
            <EmptyList text="ไม่พบทีมช่างที่ตรงกับเงื่อนไข" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {rows.map((t) => (
                <TechnicianCard key={t.id} technician={t} />
              ))}
            </div>
          )}

          <RodlexPagination
            basePath="/technicians"
            page={page}
            totalPages={totalPages}
            searchParams={{ q, category, sort, online: online ? "1" : undefined }}
          />
        </div>

        <div className="lg:order-2">
          <FilterBox
            basePath="/technicians"
            title="ค้นหาทีมช่าง"
            searchPlaceholder="ค้นหาชื่อช่าง / ความเชี่ยวชาญ"
            quickFilters={[
              { label: "ทีมช่างทั้งหมด", params: {} },
              { label: "ทีมช่างที่ออนไลน์", params: { online: "1" } },
              { label: "เรียงความน่าเชื่อถือ", params: { sort: "rating" } },
            ]}
            categoryOptions={Object.entries(CATEGORY_LABEL).map(([value, label]) => ({
              value,
              label,
            }))}
            initial={{ q: sp.q, category: sp.category }}
          />
        </div>
      </div>
    </div>
  );
}

function TechSection({
  title,
  items,
  pagerHref,
}: {
  title: string;
  items: Technician[];
  pagerHref: (page: number) => string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title={title} pagerHref={items.length > 0 ? pagerHref : undefined} />
      {items.length === 0 ? (
        <EmptyList text="ยังไม่มีทีมช่างในหมวดนี้ตอนนี้" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {items.map((t) => (
            <TechnicianCard key={t.id} technician={t} />
          ))}
        </div>
      )}
    </section>
  );
}

function TechnicianCard({ technician: t }: { technician: Technician }) {
  const img = parseTileImage(t.imageJson);
  return (
    <EntityCard
      href={`/technicians?q=${encodeURIComponent(t.code)}`}
      image={img}
      title={t.name}
      chip={CATEGORY_LABEL[t.category].replace("เครื่องจักรงาน", "")}
      meta={
        <div className="flex flex-col gap-0.5">
          <StarRating rating={t.rating} reviewCount={t.reviewCount} />
          <span>งานที่ทำ {t.jobsDone.toLocaleString("th-TH")} งาน</span>
        </div>
      }
    />
  );
}

function TechnicianSpotlight({ technician: t }: { technician: Technician }) {
  const img = parseTileImage(t.imageJson);
  const skills = (t.skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="grid gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-extrabold text-ink sm:text-xl">{t.name}</h2>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#1B7A43]">
            <span
              className={`h-2 w-2 rounded-full ${t.online ? "bg-[#1B7A43]" : "bg-line"}`}
              aria-hidden
            />
            {t.online ? "ออนไลน์" : "ออฟไลน์"}
          </span>
          <PillLink href="/call" className="ml-auto sm:ml-0">
            📞 เรียกช่าง
          </PillLink>
        </div>
        <p className="text-xs font-semibold text-muted">รหัส: {t.code}</p>
        {t.bio && <p className="text-sm text-ink/80">{t.bio}</p>}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-[#1B7A43]/10 px-2.5 py-1 text-xs font-semibold text-[#1B7A43]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
          <span>จำนวนงาน: {t.jobsDone.toLocaleString("th-TH")} งาน</span>
          <span className="flex items-center gap-1.5">
            ความน่าเชื่อถือ: <StarRating rating={t.rating} reviewCount={t.reviewCount} />
          </span>
        </div>
      </div>

      <div className="grid w-full max-w-xs grid-cols-3 grid-rows-2 gap-2 md:w-56">
        <GradientTile image={img} size="lg" className="col-span-2 row-span-2 aspect-square" />
        <GradientTile
          image={{ ...img, from: img.to, to: img.from }}
          size="sm"
          className="aspect-square"
        />
        <GradientTile image={img} size="sm" className="aspect-square" />
        <GradientTile
          image={{ ...img, from: img.to, to: img.from }}
          size="sm"
          className="col-span-2 aspect-[2/1]"
        />
      </div>
    </div>
  );
}

function EmptySpotlight() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
      <span className="text-5xl" aria-hidden>
        🧑‍🔧
      </span>
      <p className="font-bold text-ink">ยังไม่มีทีมช่างในระบบตอนนี้</p>
      <p className="text-sm text-muted">กำลังเพิ่มข้อมูลทีมช่าง กลับมาดูใหม่อีกครั้งเร็ว ๆ นี้</p>
    </div>
  );
}

function EmptyList({ text }: { text: string }) {
  return (
    <div className="rounded-3xl bg-white p-8 text-center text-sm text-muted shadow-sm ring-1 ring-black/5">
      {text}
    </div>
  );
}
