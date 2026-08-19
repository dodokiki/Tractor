import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { StarRating } from "@/components/store/star-rating";
import { GradientTile } from "@/components/store/rodlex/gradient-tile";
import { EntityCard } from "@/components/store/rodlex/entity-card";
import { SectionHeader } from "@/components/store/rodlex/section-header";
import { FilterBox } from "@/components/store/rodlex/filter-box";
import { PillLink } from "@/components/store/rodlex/pill";
import { RodlexPagination } from "@/components/store/rodlex/pagination";
import { vendorTileImage } from "@/components/store/rodlex/image";

const PAGE_SIZE = 12;

type VendorRow = { id: string; shopName: string; description: string | null; logoEmoji: string; themeColor: string; approved: boolean; createdAt: Date };

type SearchParams = { q?: string; sort?: string; page?: string };

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const sort = sp.sort || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const hasFilter = Boolean(q || sort || page > 1);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">ร้านอะไหล่</h1>

      {hasFilter ? (
        <CombinedList q={q} sort={sort} page={page} sp={sp} />
      ) : (
        <CuratedView />
      )}
    </div>
  );
}

/** สลับลำดับร้านแบบวนซ้ำ (rotate) — ใช้เป็น placeholder จัดกลุ่ม 3 หมวดจนกว่าจะมี field หมวดหมู่ร้านค้าจริงใน Vendor */
function rotate<T>(arr: T[], shift: number): T[] {
  if (arr.length === 0) return arr;
  const n = shift % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

async function CuratedView() {
  const allApproved = await db.vendor.findMany({
    where: { approved: true },
    orderBy: [{ createdAt: "asc" }],
  });

  const spotlight = allApproved[0] ?? null;
  const popular = await db.vendor.findMany({
    where: { approved: true },
    orderBy: [{ products: { _count: "desc" } }, { createdAt: "desc" }],
    take: 4,
  });

  // ยังไม่มี field หมวดหมู่ร้านค้าใน Vendor model (ก่อสร้าง/เกษตร/ดัดแปลง) —
  // จัดกลุ่มชั่วคราวด้วยการวนลำดับร้านเดิม รอทีม backend เพิ่ม field จริงในอนาคต
  const construction = rotate(allApproved, 0).slice(0, 4);
  const agriculture = rotate(allApproved, 1).slice(0, 4);
  const modification = rotate(allApproved, 2).slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        {spotlight ? <ShopSpotlight vendor={spotlight} /> : <EmptySpotlight />}

        <FilterBox
          basePath="/shops"
          title="ค้นหาร้านอะไหล่"
          searchPlaceholder="ค้นหาชื่อร้านค้า"
          quickFilters={[
            { label: "ร้านอะไหล่ทั้งหมด", params: {} },
            { label: "ร้านเปิดใหม่ล่าสุด", params: { sort: "new" } },
            { label: "ร้านสินค้าเยอะสุด", params: { sort: "popular" } },
          ]}
          initial={{}}
        />
      </div>

      <ShopSection
        title="ร้านค้าอะไหล่ ยอดนิยมประจำเดือน"
        vendors={popular}
        pagerHref={(p) => `/shops?sort=popular&page=${p}`}
      />
      <ShopSection
        title="ร้านค้าอะไหล่รถเหล็ก เครื่องจักรงานก่อสร้าง"
        vendors={construction}
        pagerHref={(p) => `/shops?page=${p}`}
      />
      <ShopSection
        title="ร้านค้าอะไหล่รถเหล็ก เครื่องจักรงานเกษตร"
        vendors={agriculture}
        pagerHref={(p) => `/shops?page=${p}`}
      />
      <ShopSection
        title="ร้านค้าอะไหล่รถเหล็ก และวัสดุอุปกรณ์ดัดแปลง"
        vendors={modification}
        pagerHref={(p) => `/shops?page=${p}`}
      />
    </div>
  );
}

async function CombinedList({
  q,
  sort,
  page,
  sp,
}: {
  q?: string;
  sort?: string;
  page: number;
  sp: SearchParams;
}) {
  const where: Prisma.VendorWhereInput = { approved: true };
  if (q) where.shopName = { contains: q };

  const orderBy: Prisma.VendorOrderByWithRelationInput[] =
    sort === "popular"
      ? [{ products: { _count: "desc" } }]
      : sort === "new"
        ? [{ createdAt: "desc" }]
        : [{ createdAt: "asc" }];

  const [total, rows] = await Promise.all([
    db.vendor.count({ where }),
    db.vendor.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      <div className="flex flex-col gap-4 lg:order-1">
        <p className="text-sm text-muted">พบร้านอะไหล่ {total.toLocaleString("th-TH")} ร้าน</p>

        {rows.length === 0 ? (
          <EmptyList text="ไม่พบร้านอะไหล่ที่ตรงกับเงื่อนไข" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {rows.map((v) => (
              <ShopCard key={v.id} vendor={v} />
            ))}
          </div>
        )}

        <RodlexPagination
          basePath="/shops"
          page={page}
          totalPages={totalPages}
          searchParams={{ q, sort }}
        />
      </div>

      <div className="lg:order-2">
        <FilterBox
          basePath="/shops"
          title="ค้นหาร้านอะไหล่"
          searchPlaceholder="ค้นหาชื่อร้านค้า"
          quickFilters={[
            { label: "ร้านอะไหล่ทั้งหมด", params: {} },
            { label: "ร้านเปิดใหม่ล่าสุด", params: { sort: "new" } },
            { label: "ร้านสินค้าเยอะสุด", params: { sort: "popular" } },
          ]}
          initial={{ q: sp.q }}
        />
      </div>
    </div>
  );
}

async function vendorStats(vendorId: string) {
  const [agg, productCount] = await Promise.all([
    db.review.aggregate({
      where: { product: { vendorId } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    db.product.count({ where: { vendorId, active: true } }),
  ]);
  return {
    rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    reviewCount: agg._count.rating,
    productCount,
  };
}

function ShopSection({
  title,
  vendors,
  pagerHref,
}: {
  title: string;
  vendors: VendorRow[];
  pagerHref: (page: number) => string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title={title} pagerHref={vendors.length > 0 ? pagerHref : undefined} />
      {vendors.length === 0 ? (
        <EmptyList text="ยังไม่มีร้านอะไหล่ในหมวดนี้ตอนนี้" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {vendors.map((v) => (
            <ShopCard key={v.id} vendor={v} />
          ))}
        </div>
      )}
    </section>
  );
}

async function ShopCard({ vendor: v }: { vendor: VendorRow }) {
  const stats = await vendorStats(v.id);
  const img = vendorTileImage(v.logoEmoji, v.themeColor);
  return (
    <EntityCard
      href={`/products?vendorId=${v.id}`}
      image={img}
      title={v.shopName}
      meta={
        <div className="flex flex-col gap-0.5">
          <StarRating rating={stats.rating} reviewCount={stats.reviewCount} />
          <span>สินค้า {stats.productCount.toLocaleString("th-TH")} ชิ้น</span>
        </div>
      }
    />
  );
}

async function ShopSpotlight({ vendor: v }: { vendor: VendorRow }) {
  const stats = await vendorStats(v.id);
  const img = vendorTileImage(v.logoEmoji, v.themeColor);

  return (
    <div className="grid gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-extrabold text-ink sm:text-xl">
            {img.emoji} {v.shopName}
          </h2>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#1B7A43]">
            <span className="h-2 w-2 rounded-full bg-[#1B7A43]" aria-hidden />
            เปิดร้าน
          </span>
          <PillLink href={`/products?vendorId=${v.id}`} className="ml-auto sm:ml-0">
            🛒 สั่งซื้อ
          </PillLink>
        </div>
        {v.description && <p className="text-sm text-ink/80">{v.description}</p>}

        <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
          <span>สินค้าในร้าน: {stats.productCount.toLocaleString("th-TH")} ชิ้น</span>
          <span className="flex items-center gap-1.5">
            คะแนนร้าน: <StarRating rating={stats.rating} reviewCount={stats.reviewCount} />
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
        🏪
      </span>
      <p className="font-bold text-ink">ยังไม่มีร้านอะไหล่ที่อนุมัติแล้วตอนนี้</p>
      <p className="text-sm text-muted">กำลังเปิดรับร้านค้าพาร์ทเนอร์ กลับมาดูใหม่อีกครั้งเร็ว ๆ นี้</p>
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
