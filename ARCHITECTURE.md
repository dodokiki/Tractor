# TractorHub — สถาปัตยกรรมระบบ (Phase 1)

> แพลตฟอร์มศูนย์กลางบริการซ่อมบำรุงรถแทรกเตอร์แบบครบวงจร — เว็บมาร์เก็ตเพลส Multi-vendor + ระบบหลังบ้าน

## 1. ภาพรวมการตัดสินใจเชิงสถาปัตยกรรม

| การตัดสินใจ | ทางเลือกที่ใช้ | เหตุผล |
|---|---|---|
| รูปแบบระบบ | **Modular Monolith** บน Next.js (App Router) | งบเฟส 1 จำกัด (25,000) ทีมเล็ก deploy จุดเดียว แต่แยกชั้นชัดเจนพอที่จะแตกเป็น service ภายหลังได้ |
| API | REST ผ่าน Next.js Route Handlers (`/api/*`) | **API-first ตามข้อเสนอ** — โมบายแอปเฟส 3 เรียก API ชุดเดียวกันนี้ได้ทันที ไม่ต้องเขียนหลังบ้านใหม่ |
| ฐานข้อมูล | Prisma ORM + SQLite (dev) → **PostgreSQL (production)** | schema พอร์ตได้ด้วยการเปลี่ยน provider เดียว; เงินเก็บเป็นสตางค์ (Int) กันปัญหาทศนิยม |
| การเงิน | ชั้น `lib/wallet.ts` เป็น service เดียวที่แตะกระเป๋าเงิน ทุกการเงินอยู่ใน DB transaction | ยอดเงินร้านค้าผิดไม่ได้ — รวม logic ไว้จุดเดียว ตรวจสอบง่าย มี WalletTransaction เป็น ledger |
| ชำระเงิน | ชั้น `lib/payment.ts` แบบสลับ provider ได้ (mock ↔ Omise/2C2P/GBPrimePay) | dev ใช้ mock + QR PromptPay จริง (EMVCo) โปรดักชันสลับที่ชั้นเดียว |
| Auth | Session cookie (httpOnly) + OTP ทางเบอร์โทร | เกษตรกรคุ้นเบอร์โทรมากกว่าอีเมล ตาม Proposal; dev ใช้ OTP คงที่ `123456` |
| UI | React Server Components + Tailwind v4 (design tokens กลาง) | โหลดเร็ว SEO ดี (สำคัญกับมาร์เก็ตเพลส) โทนสีตรง mockup ใน Proposal |

## 2. โครงสร้างชั้น (Layered)

```
┌────────────────────────────────────────────────────────┐
│  Presentation                                          │
│  src/app/(store)/*     หน้าร้านลูกค้า (Sonnet A)        │
│  src/app/vendor/*      พอร์ทัลร้านค้า (Sonnet B)        │
│  src/app/admin/*       หลังบ้านแอดมิน (Sonnet B)        │
├────────────────────────────────────────────────────────┤
│  API Layer — src/app/api/* (Opus)                      │
│  REST handlers: ตรวจสิทธิ์ → validate → เรียก service    │
├────────────────────────────────────────────────────────┤
│  Domain Services — src/lib/ (PM เป็นเจ้าของ)            │
│  auth.ts / wallet.ts / payment.ts / money.ts / api.ts  │
├────────────────────────────────────────────────────────┤
│  Data — prisma/schema.prisma + src/lib/db.ts           │
└────────────────────────────────────────────────────────┘
```

กติกาสำคัญ: **UI ห้าม import db โดยตรงในฝั่ง client** — Server Components อ่านผ่าน `db` ได้ (read-only) แต่การเขียนข้อมูลทุกอย่างต้องผ่าน API layer เพื่อให้โมบายแอปเฟส 3 ใช้เส้นทางเดียวกัน

## 3. โฟลว์เงิน (Multi-vendor Wallet)

```
ลูกค้าชำระเงิน (Payment → PAID)
  └─ creditPendingOnPaid(): แยกยอดต่อร้าน หัก commission (bps ต่อร้าน)
       └─ Wallet.pendingSatang += net   [SubOrder → PENDING_CONFIRM]
ร้านยืนยัน → จัดส่ง → งานสำเร็จ (SubOrder → COMPLETED)
  └─ settleSubOrder(): pending → balance + บันทึก ledger 2 รายการ
       (SALE_CREDIT ยอดเต็ม, COMMISSION_FEE ติดลบ)
ร้านขอถอน → ตัด balance ทันที (จองยอด) → แอดมินอนุมัติ/ปฏิเสธ(คืนยอด)
```

ทุกขั้นอยู่ใน `db.$transaction` — ยอดรวม ledger ต้องเท่ากับ balance เสมอ

## 4. Order Splitting

ตะกร้าหนึ่งใบมีสินค้าหลายร้าน → สร้าง `Order` (แม่) 1 ใบ + `SubOrder` (ลูก) ต่อร้าน
ลูกค้าจ่ายครั้งเดียวที่ Order แม่ / ร้านค้าเห็นเฉพาะ SubOrder ของตัวเอง / คอมมิชชันคิดต่อ SubOrder

## 5. เตรียมพร้อมเฟสถัดไป

- **เฟส 3 (แอป):** ทุก endpoint คืน JSON มาตรฐาน `{ok, data|error}` — Bearer token เพิ่มได้ที่ `lib/auth.ts` จุดเดียว
- **เฟส 4 (ประวัติรถ/RFID):** ตาราง `Vehicle` มี `refCode` unique พร้อมผูกแท็ก RFID, `VehicleLog` รองรับพิกัด GPS + รายการเปลี่ยนอะไหล่แล้ว
- **Scale:** ย้าย SQLite → PostgreSQL + ยก `lib/wallet.ts` เป็น service แยกได้โดย UI ไม่ต้องแก้

## 6. การรันโปรเจกต์

```bash
npm install
npx prisma db push      # สร้างฐานข้อมูล dev.db
npx prisma db seed      # ข้อมูลตัวอย่าง (ร้านค้า/สินค้า/บัญชีทดสอบ)
npm run dev             # http://localhost:3000
```

บัญชีทดสอบ (OTP dev = `123456`): ลูกค้า `0811111111` · ร้านค้า `0822222222` · แอดมิน `0899999999`
