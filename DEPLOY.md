# การ Deploy ขึ้น Vercel

โปรเจกต์นี้ออกแบบให้ dev ด้วย SQLite (ไม่ต้องติดตั้งอะไร) และ deploy จริงด้วย **PostgreSQL** — โครงสร้าง schema พอร์ตได้ 100% (เงินเป็น Int, enum รองรับทั้งสองฐาน)

## ขั้นตอน (ครั้งแรก)

1. **สร้างฐานข้อมูล Postgres ฟรี** — แนะนำ [Neon](https://neon.tech) หรือ Vercel Postgres (Storage tab ในโปรเจกต์ Vercel) แล้วคัดลอก connection string แบบ **pooled** (มี `-pooler` / pgbouncer)

2. **สลับ provider ใน `prisma/schema.prisma`** (แก้บรรทัดเดียว):

```prisma
datasource db {
  provider = "postgresql"   // เดิม: "sqlite"
  url      = env("DATABASE_URL")
}
```

3. **Import โปรเจกต์เข้า Vercel** (repo: github.com/dodokiki/Tractor, Root Directory = `tractorhub`) แล้วตั้ง Environment Variables:

| ตัวแปร | ค่า |
|---|---|
| `DATABASE_URL` | postgres pooled connection string |
| `SESSION_SECRET` | สุ่มยาว ๆ (เช่น `openssl rand -hex 32`) |
| `PROMPTPAY_ID` | เบอร์/เลขประจำตัวผู้เสียภาษีรับเงิน PromptPay จริง |
| `PAYMENT_MODE` | `mock` (จนกว่าจะเชื่อม Omise/2C2P จริง) |

4. **สร้างตาราง + ข้อมูลตัวอย่าง** (รันจากเครื่องคุณ ชี้ DATABASE_URL ไปที่ Postgres):

```bash
npx prisma db push
node prisma/seed.js
```

5. Deploy — สคริปต์ `build` รัน `prisma generate` ให้อัตโนมัติแล้ว

## เช็คลิสต์ก่อนขึ้น Production จริง

- [ ] เปลี่ยน `SESSION_SECRET` เป็นค่าสุ่มจริง
- [ ] เชื่อม Payment Gateway จริง (แก้ที่ `src/lib/payment.ts` ชั้นเดียว) และปิด `PAYMENT_MODE=mock`
- [ ] เชื่อม SMS OTP จริง (แก้ `issueOtp` ใน `src/lib/auth.ts`)
- [ ] ตั้ง cron/monitoring ตามสัญญา Maintenance

## หมายเหตุเรื่อง Connection Pooling

Vercel เป็น serverless — ใช้ pooled connection string (Neon pooler / Supabase pgbouncer / Prisma Accelerate) เสมอ มิฉะนั้น connection จะหมดเมื่อทราฟฟิกสูง
