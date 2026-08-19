# CONTRACT ภาค 2 — รีแบรนด์ Rodlex (รถเหล็ก) + หน้าใหม่

อ้างอิงแบบ UI ลูกค้า: `D:\tractor\UI Frontend\*.png` (ทุกคนต้องเปิดดูภาพที่เกี่ยวกับงานตัวเองก่อนเริ่ม)

## แบรนด์ใหม่
- ชื่อ: **Rodlex รถเหล็ก** — "รวมช่างซ่อมเครื่องจักรก่อสร้าง เครื่องจักรเกษตร"
- โลโก้จริง: `/rodlex-logo.png` (พื้นโปร่งใส โทนทองแดง) — ใช้แทนโลโก้ 🚜 TractorHub ทุกจุดฝั่งหน้าบ้าน
- โทนใหม่ (เพิ่มใน globals.css ได้): พื้นหลังอุ่น `#F1F2EE`, การ์ดขาว glassy มุมโค้งใหญ่ (rounded-3xl), ปุ่ม CTA เขียว pill (ไล่ `#8CC63F→#1B7A43` ตัวขาว), ลิงก์เน้นสีคราม `#4F46E5`, หัวเรื่องใหญ่ใช้ gradient text (เขียว→ส้มทองแดง หรือชมพู→ม่วง→เขียว ตาม mockup), ฟุตเทอร์พื้นไล่พาสเทล (เขียวอ่อน→ชมพูอ่อน) ตัวเข้ม
- ขอบเขตเนื้อหา: ครอบคลุมทั้ง "เครื่องจักรก่อสร้าง" (รถขุด รถตัก รถบด) และ "เครื่องจักรเกษตร" (แทรกเตอร์ รถเกี่ยว)

## Header ใหม่ (ตาม mockup หน้าแรก)
แถวบน: โลโก้ Rodlex + คำโปรย | เมนู: ทีมช่าง, ร้านอะไหล่, สมัครงาน, กระทู้ถาม-ตอบ, ข่าว | ปุ่ม pill เขียว "เข้าสู่ระบบ"/ชื่อผู้ใช้
แถวล่างขวา: ลิงก์เน้น **เรียกช่าง** (→ /call) และ **ซื้ออะไหล่** (→ /products) + ป้าย En/Th (แสดงเฉย ๆ ยังไม่ต้องสลับภาษา)
Footer ใหม่ 4 คอลัมน์ตาม mockup: สินค้าและบริการงานซ่อม / ตลาดอะไหล่และอุปกรณ์ / ชุมชนและข่าวสาร / ร่วมงานกับเรา + Office hours + โลโก้ + โซเชียล (TikTok, YouTube, FB, IG, LINE) + © 2026 Rodlex

## หน้าและเส้นทางใหม่
- `/technicians` ทีมช่าง (mockup ทีมช่าง_0.png): สปอตไลต์ช่างเด่น (ชื่อ, ● ออนไลน์, ปุ่มเรียกช่าง, รหัส RL-xxxx, bio, ความเชี่ยวชาญ, จำนวนงาน, ความน่าเชื่อถือ+รีวิว) + แกลเลอรี + กล่องค้นหา/ตัวกรองขวา (หมวดเครื่องจักร, จังหวัด, เรียงความน่าเชื่อถือ) + 4 เซกชัน: ยอดนิยมประจำเดือน / งานก่อสร้าง / งานเกษตร / งานดัดแปลง (การ์ดช่าง + เพจจิเนชันแบบ 1 2 3 ... ถัดไป)
- `/shops` ร้านอะไหล่ (mockup ร้านอะไหล่_0.png): โครงเดียวกับทีมช่างแต่เป็นร้าน (ใช้ Vendor ที่ approved) — สปอตไลต์ร้าน + ตัวกรอง + เซกชันยอดนิยม/ก่อสร้าง/เกษตร/ดัดแปลง การ์ดร้านกดแล้วไป /products?vendorId=...
- `/jobs` สมัครงาน (โดโด้ออกแบบเอง): hero สั้น + 3 เส้นทางร่วมงาน (สมัครเป็นช่างอิสระ 🧑‍🔧 / เปิดร้านค้าอะไหล่ 🏪 / ร่วมทีมประจำ �server) + รายการตำแหน่งงาน (JobPosting) + ฟอร์มสมัคร (ชื่อ, เบอร์, ข้อความ) → POST /api/jobs/[id]/apply
- `/forum` กระทู้ถาม-ตอบ (mockup กระทู้ถาม-ตอบ_0.png): แท็บหมวด (สำหรับคุณ, ปัญหาและการซ่อมแซม, อะไหล่และวัสดุสิ้นเปลือง, เทคนิคและการดัดแปลง, พื้นที่ช่างรถเหล็ก), ฟีดกระทู้: แกลเลอรีภาพ (1/2/4 ภาพ สลับ layout ตาม mockup — ภาพเป็น gradient+emoji จาก imagesJson), หัวเรื่อง, เนื้อย่อ, โปรไฟล์ผู้โพสต์, ❤️ ถูกใจ (toggle, ต้อง login), 💬 จำนวนถาม-ตอบ; `/forum/[id]` อ่าน + ตอบ; ปุ่มตั้งกระทู้ (ต้อง login, ฟอร์ม: หัวเรื่อง, เนื้อหา, หมวด, เลือก emoji ภาพประกอบ 0-4 รูป)
- `/news` ข่าว (mockup ข่าว_0.png = สเปกเนื้อหา, หน้าฟิต_0.png = layout): ฟีดบทความเรียงวันที่ล่าสุด, แท็บกลุ่ม 3 กลุ่ม (🏗️ เครื่องจักรก่อสร้าง / 🌾 เครื่องจักรเกษตร / 🛠️ ข่าวแพลตฟอร์มและอุตสาหกรรม), ช่องค้นหา, layout สลับซ้าย-ขวาภาพ-ข้อความแบบ mockup หน้าฟิต + บล็อกเน้นพื้นสีเข้มคั่น; `/news/[id]` อ่านเต็ม
- `/call` เรียกช่าง: ฟอร์ม ServiceRequest (ชื่อ, เบอร์, ชนิดเครื่องจักร, อาการ, จังหวัด) → POST /api/service-requests → หน้าขอบคุณ "ทีมงานติดต่อกลับใน 24 ชม."
- `/login` ปรับตาม mockup เข้าสู่ระบบ_0.png: การ์ดเรียบ ช่อง "เบอร์โทรศัพท์" เด่น + โลโก้ Rodlex ขวา + "หรือ" + ปุ่ม Google/Facebook (แสดง disabled + tooltip "เร็ว ๆ นี้") — โฟลว์ OTP เดิมคงไว้

## API ใหม่ (Opus)
รูปแบบ {ok,data|error} เดิม · public GET ทั้งหมด ยกเว้นที่ระบุ
- GET /api/technicians?category=&q=&sort=&page= · GET /api/technicians/featured
- GET /api/news?group=&q=&page= · GET /api/news/[id]
- GET /api/forum?category=&page= (รวม replyCount, author{name}) · GET /api/forum/[id] (รวม replies+authors) · POST /api/forum (login) · POST /api/forum/[id]/replies (login) · POST /api/forum/[id]/like (login, toggle)
- GET /api/jobs · POST /api/jobs/[id]/apply {name,phone,note}
- POST /api/service-requests {name,phone,machineType,problem,province}
- Admin: GET/POST/PATCH /api/admin/news, /api/admin/jobs · GET /api/admin/service-requests + POST /api/admin/service-requests/[id] {status} · GET /api/admin/technicians + POST/PATCH
- seed เพิ่ม (ภาษาไทยสมจริง): ช่าง 12 คน (คละ 3 หมวด, featured 1 = "นายช่าง สมชาย คำบุญโต" รหัส RL-0001 งาน 128 คะแนน 4.6 รีวิว 29), ข่าว 9 บทความ (กลุ่มละ 3 อิงหัวข้อในภาพสเปกข่าว เช่น EV Heavy Machinery, PM รถขุด, โดรนเกษตร, ราคาพืชผล, ข่าวอะไหล่ปลอม, ประกาศฟีเจอร์แพลตฟอร์ม), กระทู้ 8 อัน (คละหมวด มี replies 2-6 + likes), งาน 5 ตำแหน่ง (ช่างอิสระ 2, ร้านพาร์ทเนอร์ 1, ประจำ 2), ServiceRequest ตัวอย่าง 2

## การแบ่งเขตไฟล์
- Opus: `src/app/api/**` (เฉพาะ route ใหม่), `prisma/seed.js` (เพิ่มส่วนใหม่ + reset ตารางใหม่ด้วย — ห้ามแตะของเดิมนอกจาก reset list)
- Sonnet A: layout กลาง `(store)/layout.tsx`, header, footer, globals.css (เพิ่ม token), หน้าแรกรีแบรนด์, `/news`, `/news/[id]`, `/login`, `/call` + ปรับสีหน้า products/cart/checkout/orders ให้เข้าธีมใหม่ (แค่โทนสี ไม่รื้อโครง)
- Sonnet B: `/technicians`, `/shops`, `/jobs`, `/forum`, `/forum/[id]` + component ใหม่ใน `src/components/store/rodlex/**`
- แบรนด์ฝั่ง Backoffice: Sonnet B เปลี่ยนโลโก้/ชื่อใน Sidebar เป็น Rodlex (ไฟล์ `src/components/backoffice/Sidebar.tsx` ข้อความ+รูปเท่านั้น)

กติกาเดิม: เงินสตางค์/formatBaht, Next16 params เป็น Promise, Server Component อ่าน db ได้, ห้าม npm install, ห้ามรัน dev server, จบงานรัน `npx tsc --noEmit`
