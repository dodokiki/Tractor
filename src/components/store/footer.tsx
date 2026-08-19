import Link from "next/link";

type FooterLink = { label: string; href: string; accent?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

const COLUMNS: FooterColumn[] = [
  {
    title: "สินค้าและบริการงานซ่อม",
    links: [
      { label: "เรียกช่างออนไลน์ ด่วน 24 ชม.", href: "/call", accent: true },
      { label: "ช่างนอกสถานที่ (On-site)", href: "/call" },
      { label: "ช่างในสถานประกอบการ", href: "/technicians" },
      { label: "ติดตามสถานะงานซ่อม", href: "/orders" },
    ],
  },
  {
    title: "ตลาดอะไหล่และอุปกรณ์",
    links: [
      { label: "ซื้ออะไหล่ออนไลน์", href: "/products" },
      { label: "ร้านอะไหล่พันธมิตร", href: "/shops" },
      { label: "รับประกันคุณภาพ", href: "/products" },
      { label: "ส่งด่วนถึงหน้างาน", href: "/products" },
    ],
  },
  {
    title: "ชุมชนและข่าวสาร",
    links: [
      { label: "กระทู้ถาม-ตอบ", href: "/forum" },
      { label: "ข่าวสารและบทความ", href: "/news" },
      { label: "คู่มือการใช้งาน", href: "/news" },
      { label: "กิจกรรมชุมชน", href: "/forum" },
    ],
  },
  {
    title: "ร่วมงานกับเรา",
    links: [
      { label: "สมัครเป็นช่างอิสระ", href: "/jobs" },
      { label: "เปิดร้านค้าอะไหล่", href: "/jobs" },
      { label: "พื้นที่ช่าง (Dashboard)", href: "/vendor" },
      { label: "ดาวน์โหลดแอปพลิเคชัน", href: "/jobs" },
    ],
  },
];

const APPS = ["App สำหรับลูกค้า", "App สำหรับช่าง", "App สำหรับร้านอะไหล่"];

const SOCIALS: { label: string; emoji: string }[] = [
  { label: "TikTok", emoji: "🎵" },
  { label: "YouTube", emoji: "▶️" },
  { label: "Facebook", emoji: "📘" },
  { label: "Instagram", emoji: "📷" },
  { label: "LINE", emoji: "💬" },
];

export function Footer() {
  return (
    <footer className="footer-pastel mt-10 rounded-t-[2.5rem] text-ink sm:mt-16">
      <div className="mx-auto max-w-6xl px-6 pt-10 sm:px-10 sm:pt-14">
        <p className="text-3xl font-extrabold text-ink sm:text-4xl">Rodlex</p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title} className="text-sm">
              <p className="mb-3 font-bold text-ink">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className={`transition hover:text-primary ${l.accent ? "" : "text-ink/75"}`}
                    >
                      {l.accent ? (
                        <>
                          เรียกช่างออนไลน์ <span className="font-semibold text-accent-dark">ด่วน 24 ชม.</span>
                        </>
                      ) : (
                        l.label
                      )}
                    </Link>
                  </li>
                ))}
                {col.title === "ร่วมงานกับเรา" && (
                  <li className="ml-2 space-y-1.5 pt-0.5 text-ink/70">
                    {APPS.map((a) => (
                      <p key={a} className="text-xs">
                        {a}
                      </p>
                    ))}
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 text-sm">
          <p className="mb-2 font-bold text-ink">Office hours</p>
          <p className="text-ink/75">Monday - Friday: 9am – 6pm</p>
          <p className="text-ink/75">Saturday: 9am - 5pm</p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rodlex-logo.png" alt="Rodlex รถเหล็ก" className="h-14 w-auto" />
          <div className="flex gap-3">
            {SOCIALS.map((s) => (
              <span
                key={s.label}
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-base shadow-sm ring-1 ring-black/5"
              >
                {s.emoji}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-gold-line mt-10 px-6 py-4 text-center text-xs text-ink/70 sm:px-10">
        © {new Date().getFullYear()} Rodlex. All rights reserved.
      </div>
    </footer>
  );
}
