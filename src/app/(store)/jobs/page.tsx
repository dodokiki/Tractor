import type { Prisma, JobType } from "@prisma/client";
import { db } from "@/lib/db";
import { PillLink } from "@/components/store/rodlex/pill";
import { JobApplyForm } from "@/components/store/rodlex/jobs/job-apply-form";

const TYPE_LABEL: Record<JobType, string> = {
  TECHNICIAN_FREELANCE: "ช่างอิสระ",
  SHOP_PARTNER: "ร้านค้าพาร์ทเนอร์",
  STAFF: "พนักงานประจำ",
};

const TYPE_CHIP_CLASS: Record<JobType, string> = {
  TECHNICIAN_FREELANCE: "bg-[#1B7A43]/10 text-[#1B7A43]",
  SHOP_PARTNER: "bg-[#4F46E5]/10 text-[#4F46E5]",
  STAFF: "bg-orange-100 text-accent-dark",
};

type SearchParams = { type?: string };

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const type = sp.type?.trim() as JobType | undefined;

  const where: Prisma.JobPostingWhereInput = { active: true };
  if (type && Object.keys(TYPE_LABEL).includes(type)) where.type = type;

  const jobs = await db.jobPosting.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#F1F2EE] via-white to-[#eef1ff] px-3 py-10 text-center sm:px-6 sm:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
          <h1 className="bg-gradient-to-r from-[#1B7A43] via-[#2FA55C] to-[#F5862B] bg-clip-text text-2xl font-extrabold text-transparent sm:text-4xl">
            มาสร้างงานซ่อมที่ดีที่สุดในไทยด้วยกัน
          </h1>
          <p className="text-sm text-muted sm:text-base">
            ร่วมเป็นส่วนหนึ่งของ Rodlex ไม่ว่าจะเป็นช่าง ร้านอะไหล่ หรือทีมงานประจำ
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-3 pb-12 sm:px-6">
        {/* เส้นทางร่วมงาน 3 ใบ */}
        <section className="grid gap-4 sm:grid-cols-3">
          <PathCard
            emoji="🧑‍🔧"
            title="สมัครเป็นช่างอิสระ"
            desc="รับงานซ่อมตามพื้นที่ รายได้ต่องาน สะสมคะแนนความน่าเชื่อถือ"
            href="/jobs?type=TECHNICIAN_FREELANCE#positions"
            cta="ดูตำแหน่งช่างอิสระ"
          />
          <PathCard
            emoji="🏪"
            title="เปิดร้านค้าอะไหล่"
            desc="ขายอะไหล่บนแพลตฟอร์ม รับเงินเข้า Wallet อัตโนมัติ"
            href="/vendor"
            cta="เปิดร้านค้าของฉัน"
          />
          <PathCard
            emoji="👷"
            title="ร่วมทีมประจำ"
            desc="ร่วมงานกับทีม Rodlex แบบพนักงานประจำในตำแหน่งต่าง ๆ"
            href="/jobs?type=STAFF#positions"
            cta="ดูตำแหน่งงานประจำ"
          />
        </section>

        {/* รายการตำแหน่งงาน */}
        <section id="positions" className="flex flex-col gap-4 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold text-[#1B7A43] sm:text-xl">ตำแหน่งงานที่เปิดรับ</h2>
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold sm:text-sm">
              <TypeTab label="ทั้งหมด" href="/jobs" active={!type} />
              {(Object.keys(TYPE_LABEL) as JobType[]).map((t) => (
                <TypeTab key={t} label={TYPE_LABEL[t]} href={`/jobs?type=${t}#positions`} active={type === t} />
              ))}
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
              <span className="text-5xl" aria-hidden>
                📋
              </span>
              <p className="mt-2 font-bold text-ink">ยังไม่มีตำแหน่งงานเปิดรับตอนนี้</p>
              <p className="text-sm text-muted">กลับมาดูใหม่อีกครั้งเร็ว ๆ นี้</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="flex flex-col gap-2.5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-ink">{j.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${TYPE_CHIP_CLASS[j.type]}`}
                    >
                      {TYPE_LABEL[j.type]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted sm:text-sm">
                    {j.location && <span>📍 {j.location}</span>}
                    {j.wage && <span>💰 {j.wage}</span>}
                  </div>
                  <p className="text-sm text-ink/80">{j.description}</p>
                  <div className="mt-1">
                    <JobApplyForm jobId={j.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA ท้ายหน้า */}
        <section className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-r from-[#1B7A43] to-[#2FA55C] px-5 py-8 text-center text-white sm:py-10">
          <p className="text-lg font-extrabold sm:text-xl">📱 ดาวน์โหลดแอปช่าง</p>
          <p className="text-sm text-white/80">เฟส 3 เร็ว ๆ นี้ — รับงาน ติดตามสถานะ และกระเป๋าเงินในที่เดียว</p>
          <span className="rounded-full bg-white/20 px-5 py-2.5 text-sm font-bold text-white/90 ring-1 ring-white/30">
            เร็ว ๆ นี้
          </span>
        </section>
      </div>
    </div>
  );
}

function PathCard({
  emoji,
  title,
  desc,
  href,
  cta,
}: {
  emoji: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="text-base font-extrabold text-ink">{title}</h3>
      <p className="flex-1 text-sm text-muted">{desc}</p>
      <PillLink href={href} className="self-center">
        {cta}
      </PillLink>
    </div>
  );
}

function TypeTab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <PillLink href={href} variant={active ? "solid" : "ghost"}>
      {label}
    </PillLink>
  );
}
