# การ Deploy ขึ้น Vercel

โปรเจกต์นี้ออกแบบให้ dev ด้วย SQLite (ไม่ต้องติดตั้งอะไร) และ deploy จริงด้วย **PostgreSQL** — โครงสร้าง schema พอร์ตได้ 100% (เงินเป็น Int, enum รองรับทั้งสองฐาน)

## ขั้นตอน (ครั้งแรก)

> โครงสร้าง schema: `prisma/schema.prisma` = **PostgreSQL** (ใช้ตอน build/deploy อัตโนมัติ) · `prisma/schema.sqlite.prisma` = SQLite สำหรับ dev ในเครื่อง (`npm run dev` / `npm run db:push:dev` จัดการให้เอง)

1. **สร้างฐานข้อมูล Postgres ฟรี** — ในโปรเจกต์ Vercel ไปที่แท็บ **Storage → Create Database → Neon (Postgres)** (หรือสมัคร [Neon](https://neon.tech) ตรงก็ได้) เมื่อสร้างเสร็จ Vercel จะเพิ่ม env `DATABASE_URL` ให้อัตโนมัติ — ให้ใช้ connection string แบบ **pooled** (มี `-pooler`)

2. **Import โปรเจกต์เข้า Vercel** (repo: github.com/dodokiki/Tractor, Root Directory = `tractorhub`) แล้วตั้ง Environment Variables:

| ตัวแปร | ค่า |
|---|---|
| `DATABASE_URL` | postgres pooled connection string |
| `SESSION_SECRET` | สุ่มยาว ๆ (เช่น `openssl rand -hex 32`) |
| `PROMPTPAY_ID` | เบอร์/เลขประจำตัวผู้เสียภาษีรับเงิน PromptPay จริง |
| `PAYMENT_MODE` | `mock` (จนกว่าจะเชื่อม Omise/2C2P จริง) |

3. **สร้างตาราง + ข้อมูลตัวอย่าง** (รันครั้งเดียวจากเครื่องคุณ ชี้ไปที่ Postgres — PowerShell):

```bash
cd tractorhub
$env:DATABASE_URL = "<postgres connection string>"
npx prisma db push
npx prisma generate
node prisma/seed.js
Remove-Item Env:DATABASE_URL
npm run dev   # กลับสู่โหมด dev (สลับ client กลับเป็น SQLite ให้อัตโนมัติ)
```

4. **Redeploy** — สคริปต์ `build` รัน `prisma generate` (schema Postgres) ให้อัตโนมัติแล้ว

## เช็คลิสต์ก่อนขึ้น Production จริง

- [ ] เปลี่ยน `SESSION_SECRET` เป็นค่าสุ่มจริง
- [ ] เชื่อม Payment Gateway จริง (แก้ที่ `src/lib/payment.ts` ชั้นเดียว) และปิด `PAYMENT_MODE=mock`
- [ ] เชื่อม SMS OTP จริง (แก้ `issueOtp` ใน `src/lib/auth.ts`)
- [ ] ตั้ง cron/monitoring ตามสัญญา Maintenance

## หมายเหตุเรื่อง Connection Pooling

Vercel เป็น serverless — ใช้ pooled connection string (Neon pooler / Supabase pgbouncer / Prisma Accelerate) เสมอ มิฉะนั้น connection จะหมดเมื่อทราฟฟิกสูง
