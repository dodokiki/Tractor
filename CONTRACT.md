# CONTRACT — สัญญากลางของทีมพัฒนา (ทุกคนต้องยึดตามนี้)

## การแบ่งเขตไฟล์ (ห้ามแก้ไฟล์นอกเขตตัวเอง)

| ทีม | เขตไฟล์ |
|---|---|
| PM (Fable) | `prisma/`, `src/lib/`, `src/app/layout.tsx`, `src/app/globals.css`, เอกสาร |
| Opus — Backend | `src/app/api/**`, `prisma/seed.ts`, `package.json` (เฉพาะเพิ่ม script seed) |
| Sonnet A — Storefront | `src/app/(store)/**`, `src/components/store/**` |
| Sonnet B — Back office | `src/app/admin/**`, `src/app/vendor/**`, `src/components/backoffice/**` |

- ห้ามรัน `npm install` เพิ่ม (deps ครบแล้ว: prisma, @prisma/client, qrcode, promptpay-qr)
- ห้ามรัน dev server (PM เป็นคน integrate และทดสอบ)
- ตรวจ type ได้ด้วย `npx tsc --noEmit`

## Design Tokens (Tailwind v4 — ใช้ได้เลย)

`bg-primary` #1B7A43 · `bg-primary-dark` #14351F · `bg-primary-light` #2FA55C · `bg-accent` #F5862B · `bg-surface` #F4F7F5 · `text-ink` #1E2B23 · `text-muted` #6C7A70 · `border-line` #D5E2D9
ฟอนต์ Noto Sans Thai ตั้งไว้ที่ root layout แล้ว — โทนดีไซน์ตาม UI mockup ใน Proposal (การ์ดขาว มุมโค้ง rounded-2xl เงาบาง สีเขียวเกษตร ปุ่มส้มสำหรับ CTA เรียกช่าง/รับงาน)

## รูปสินค้า (MVP ไม่มีไฟล์รูปจริง)

`Product.imageJson` = `{"emoji":"🔩","from":"#1B7A43","to":"#2FA55C"}` → แสดงเป็นการ์ด gradient + emoji ใหญ่กลางการ์ด (เหมือน mockup)

## เงินและ Types

- เงินทุกจำนวน = สตางค์ (Int) — แสดงผลด้วย `formatBaht(satang)` จาก `@/lib/money`
- Prisma types import จาก `@prisma/client` — ดู schema ที่ `prisma/schema.prisma`
- Server Component อ่านข้อมูลผ่าน `db` จาก `@/lib/db` ได้ (read-only) / การเขียนทุกอย่างผ่าน API ด้วย `fetch`

## Auth helpers (`@/lib/auth`)

- `getSessionUser()` → `SessionUser | null` (มี `.vendor` ติดมาด้วย)
- `requireUser(role?)` → ใช้ใน API, โยน AuthError อัตโนมัติ (ADMIN ผ่านทุก role)
- คุกกี้ session ชื่อ `th_session` — login flow: request-otp → verify

## API Endpoints (Opus implement / UI เรียกใช้)

รูปแบบ response เสมอ: สำเร็จ `{ok:true, data}` · ล้มเหลว `{ok:false, error}` (status 4xx/5xx)

### Auth
- `POST /api/auth/request-otp` `{phone}` → `{sent:true, devCode?}` (devCode มีเฉพาะโหมด mock)
- `POST /api/auth/verify` `{phone, code, name?}` → `{user}` สร้าง user ใหม่ role CUSTOMER ถ้ายังไม่มี + set cookie
- `POST /api/auth/logout` → `{}`
- `GET /api/me` → `{user}` หรือ 401

### Catalog (public)
- `GET /api/categories` → `{categories:[{id,name,slug,emoji}]}`
- `GET /api/products?category=&q=&brand=&vendorId=&sort=&page=` → `{products:[...], total, page, pageSize}` โดย product รวม `{vendor:{shopName}, category, image:{emoji,from,to}, priceSatang, avgRating, reviewCount}`
- `GET /api/products/[id]` → product เต็ม + `compatibility:[{brand,model}]` + reviews ล่าสุด
- `GET /api/banners` → active banners

### Orders (login: CUSTOMER)
- `POST /api/orders` `{items:[{productId,qty}], addressId | address:{...}, couponCode?}` → สร้าง Order+SubOrders (แยกตามร้าน, ตัดสต็อก, คำนวณส่วนลด) → `{orderId, code, totalSatang}`
- `GET /api/orders` → คำสั่งซื้อของฉัน (รวม subOrders+items+payment)
- `GET /api/orders/[id]` → รายละเอียด (เจ้าของหรือ ADMIN เท่านั้น)

### Payment
- `POST /api/payments/init` `{orderId, method:"CARD"|"BANK_TRANSFER"|"PROMPTPAY"}` → CARD(mock): จ่ายสำเร็จทันที `{status:"PAID"}` · PROMPTPAY: `{status:"PENDING", qrDataUrl}` · BANK_TRANSFER: `{status:"PENDING", bankInfo}`
- `POST /api/payments/notify` `{orderId, slipNote?}` → ลูกค้าแจ้งโอนแล้ว (รอแอดมินยืนยัน)
- เมื่อ Payment → PAID: API ต้องเรียก `creditPendingOnPaid(tx, orderId)` ใน transaction เดียวกัน + ตั้ง Order → PAID

### Addresses (login)
- `GET/POST /api/addresses`, `DELETE /api/addresses/[id]`

### Vendor (role VENDOR)
- `GET /api/vendor/summary` → `{shop, wallet:{balanceSatang,pendingSatang}, todayOrders, monthSalesSatang}`
- `GET/POST /api/vendor/products`, `PATCH/DELETE /api/vendor/products/[id]`
- `GET /api/vendor/orders` → SubOrders ของร้าน (รวม order.code, items, ที่อยู่ลูกค้า)
- `POST /api/vendor/orders/[id]/status` `{status:"CONFIRMED"|"SHIPPED"|"COMPLETED"}` — COMPLETED ต้องเรียก `settleSubOrder(id)` จาก `@/lib/wallet`
- `GET /api/vendor/wallet` → wallet + transactions ล่าสุด 50 รายการ
- `POST /api/vendor/withdrawals` `{amountSatang, bank, accountNo, accountName}` — ใช้ `requestWithdrawal()`

### Admin (role ADMIN)
- `GET /api/admin/dashboard` → `{monthSalesSatang, orderCount, completedSubOrders, commissionSatang, salesByMonth:[{label,satang}], pendingTransfers:[...], latestOrders:[...]}`
- `GET /api/admin/orders?status=` / `GET /api/admin/orders/[id]`
- `POST /api/admin/payments/[orderId]/confirm` — ยืนยันยอดโอน/PromptPay → PAID + creditPendingOnPaid
- `GET /api/admin/vendors` / `POST /api/admin/vendors` (สร้างร้าน+user) / `PATCH /api/admin/vendors/[id]` (approve, commissionBps)
- `GET /api/admin/withdrawals?status=` / `POST /api/admin/withdrawals/[id]` `{action:"APPROVE"|"REJECT"|"MARK_PAID", note?}` (REJECT ใช้ `rejectWithdrawal`)
- `GET/POST /api/admin/coupons`, `PATCH /api/admin/coupons/[id]`
- `GET/POST /api/admin/banners`, `PATCH/DELETE /api/admin/banners/[id]`
- `GET /api/admin/vehicles` + `POST /api/admin/vehicles` (โครงเฟส 4)
- `GET /api/admin/users?q=`

## เส้นทางหน้าจอ

### Storefront `(store)` — Sonnet A
`/` หน้าแรก (แบนเนอร์, หมวดหมู่, สินค้าขายดี) · `/products` ค้นหา+กรอง · `/products/[id]` รายละเอียด+เลือกจำนวน · `/cart` ตะกร้า (state ใน localStorage ผ่าน context) · `/checkout` ที่อยู่+วิธีจ่าย · `/checkout/pay/[orderId]` หน้าชำระ (QR/สลิป/บัตร) · `/orders`, `/orders/[id]` ของฉัน · `/login` OTP · `/account` ข้อมูล+ที่อยู่
มี Header กลาง (โลโก้ 🚜 TractorHub, ช่องค้นหา, ตะกร้า badge, เข้าสู่ระบบ/ชื่อผู้ใช้) + Footer

### Back office — Sonnet B
`/admin` แดชบอร์ด (KPI 4 ใบ + กราฟแท่ง 6 เดือน CSS + ตารางรอโอน + คำสั่งซื้อล่าสุด — เหมือน mockup) · `/admin/orders` (+ ปุ่มยืนยันยอดโอน) · `/admin/vendors` · `/admin/withdrawals` · `/admin/coupons` · `/admin/banners` · `/admin/vehicles` · sidebar เขียวเข้ม #14351F
`/vendor` สรุปร้าน · `/vendor/products` CRUD · `/vendor/orders` อัปเดตสถานะ · `/vendor/wallet` ยอด+ledger+ขอถอน
ทั้งสองส่วนมี guard: ไม่ login → redirect `/login?next=...` / role ไม่ตรง → หน้า 403 สั้น ๆ
