/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * TractorHub — ข้อมูลตัวอย่างสำหรับเดโม (idempotent: ล้างของเดิมทุกครั้งก่อนใส่ใหม่)
 * รัน: node prisma/seed.js   หรือ   npm run db:seed
 *
 * เงินทุกจำนวนเก็บเป็น "สตางค์" (Int)
 * ยอดกระเป๋าเงินร้านค้าสร้างผ่านฟังก์ชันที่เลียนแบบ creditPendingOnPaid / settleSubOrder
 * ใน src/lib/wallet.ts เพื่อให้ ledger รวมแล้วตรงกับ balance เสมอ
 */
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

// ---------- helper ----------
const baht = (n) => Math.round(n * 100);
const daysAgo = (n) => new Date(Date.now() - n * 24 * 3600 * 1000);
/** ค่าคอมมิชชันจาก basis points — ปัดเศษเข้าแพลตฟอร์ม (ตรงกับ lib/money.ts) */
const commission = (amountSatang, bps) => Math.ceil((amountSatang * bps) / 10000);

const GRAD = [
  { from: "#1B7A43", to: "#2FA55C" }, // เขียวเกษตร
  { from: "#F5862B", to: "#D9631A" }, // ส้ม
  { from: "#3D5AC9", to: "#6D8CFF" }, // น้ำเงิน
];
const img = (emoji, i) =>
  JSON.stringify({ emoji, from: GRAD[i % 3].from, to: GRAD[i % 3].to });

// ---------- 1) ล้างข้อมูลเดิมตามลำดับ FK ----------
async function reset() {
  await db.auditLog.deleteMany();
  await db.vehicleLog.deleteMany();
  await db.vehicle.deleteMany();
  await db.walletTransaction.deleteMany();
  await db.withdrawalRequest.deleteMany();
  await db.wallet.deleteMany();
  await db.payment.deleteMany();
  await db.orderItem.deleteMany();
  await db.subOrder.deleteMany();
  await db.order.deleteMany();
  await db.review.deleteMany();
  await db.compatibility.deleteMany();
  await db.product.deleteMany();
  await db.tractorModel.deleteMany();
  await db.category.deleteMany();
  await db.banner.deleteMany();
  await db.coupon.deleteMany();
  await db.setting.deleteMany();
  await db.address.deleteMany();
  await db.session.deleteMany();
  await db.otpCode.deleteMany();
  await db.vendor.deleteMany();
  await db.user.deleteMany();
}

// ---------- ข้อมูลตั้งต้น ----------
const CATEGORIES = [
  { name: "เครื่องยนต์", slug: "engine", emoji: "⚙️", sort: 1 },
  { name: "ระบบไฮดรอลิก", slug: "hydraulic", emoji: "💧", sort: 2 },
  { name: "ใบมีด/ผาน", slug: "blades", emoji: "🔪", sort: 3 },
  { name: "ยางและล้อ", slug: "tires", emoji: "🛞", sort: 4 },
  { name: "ไส้กรอง", slug: "filters", emoji: "🧰", sort: 5 },
  { name: "น้ำมันหล่อลื่น", slug: "lubricants", emoji: "🛢️", sort: 6 },
  { name: "แบตเตอรี่", slug: "battery", emoji: "🔋", sort: 7 },
  { name: "อุปกรณ์ต่อพ่วง", slug: "implements", emoji: "🔗", sort: 8 },
];

const MODELS = [
  { brand: "Kubota", model: "L4708" },
  { brand: "Kubota", model: "M6040" },
  { brand: "Kubota", model: "L5018" },
  { brand: "John Deere", model: "5045D" },
  { brand: "John Deere", model: "5310" },
  { brand: "Massey Ferguson", model: "2635" },
  { brand: "Ford", model: "6610" },
  { brand: "New Holland", model: "TT4.90" },
];

const VENDORS = [
  {
    key: "thaikaset",
    shopName: "ร้านไทยเกษตรอะไหล่",
    logoEmoji: "🏪",
    themeColor: "1B7A43",
    description:
      "อะไหล่แท้ Kubota ครบวงจร ประสบการณ์กว่า 20 ปี ย่านนครราชสีมา ส่งไวทั่วไทย",
    owner: { phone: "0822222222", name: "สมศักดิ์ ไทยเกษตร" },
  },
  {
    key: "korat",
    shopName: "โคราชแทรกเตอร์พาร์ท",
    logoEmoji: "🏬",
    themeColor: "F5862B",
    description: "ยาง ล้อ แบตเตอรี่ และอุปกรณ์ต่อพ่วงรถแทรกเตอร์ทุกยี่ห้อ",
    owner: { phone: "0833333333", name: "วิรัตน์ โคราชยนต์" },
  },
  {
    key: "isan",
    shopName: "อีสานพาร์ทเซ็นเตอร์",
    logoEmoji: "🏭",
    themeColor: "3D5AC9",
    description: "ศูนย์รวมอะไหล่ John Deere / New Holland ราคาส่งจากขอนแก่น",
    owner: { phone: "0844444444", name: "ประเสริฐ อีสานพาร์ท" },
  },
  {
    key: "petrofarm",
    shopName: "ปิโตรฟาร์มออยส์",
    logoEmoji: "⛽",
    themeColor: "14351F",
    description: "น้ำมันเครื่อง น้ำมันไฮดรอลิก จาระบี สำหรับเครื่องจักรกลเกษตร",
    owner: { phone: "0855555555", name: "กนกวรรณ ปิโตรฟาร์ม" },
  },
];

// vendor = key ของร้าน, cat = slug หมวด, price = บาท, fit = [รุ่นรถ]
const PRODUCTS = [
  // --- ไส้กรอง ---
  {
    key: "air-filter-l4708",
    vendor: "thaikaset",
    cat: "filters",
    name: "ไส้กรองอากาศ Kubota L4708",
    sku: "TK-AF-L4708",
    partCode: "TA020-16130",
    brand: "Kubota",
    price: 450,
    stock: 42,
    emoji: "🧰",
    desc: "ไส้กรองอากาศแท้ กรองฝุ่นละเอียดในไร่อ้อย/นาข้าว แนะนำเปลี่ยนทุก 250 ชั่วโมง",
    fit: ["Kubota L4708", "Kubota L5018"],
  },
  {
    key: "oil-filter-m6040",
    vendor: "thaikaset",
    cat: "filters",
    name: "ไส้กรองน้ำมันเครื่อง Kubota M6040",
    sku: "TK-OF-M6040",
    partCode: "HH160-32430",
    brand: "Kubota",
    price: 320,
    stock: 38,
    emoji: "🧰",
    desc: "กรองน้ำมันเครื่องแท้ ป้องกันเศษโลหะเข้าสู่ระบบหล่อลื่น",
    fit: ["Kubota M6040"],
  },
  {
    key: "fuel-filter-jd",
    vendor: "isan",
    cat: "filters",
    name: "ไส้กรองโซล่า (ดีเซล) John Deere 5045D",
    sku: "IS-FF-JD5045",
    partCode: "RE509208",
    brand: "John Deere",
    price: 380,
    stock: 26,
    emoji: "🧰",
    desc: "กรองน้ำและตะกอนในน้ำมันดีเซล ยืดอายุหัวฉีดและปั๊มแรงดันสูง",
    fit: ["John Deere 5045D", "John Deere 5310"],
  },
  // --- แบตเตอรี่ ---
  {
    key: "battery-85",
    vendor: "korat",
    cat: "battery",
    name: "แบตเตอรี่ 12V 85Ah ชนิดเติมน้ำ",
    sku: "KR-BAT-85",
    brand: "3K",
    price: 2890,
    stock: 18,
    emoji: "🔋",
    desc: "แบตเตอรี่รถแทรกเตอร์ กำลังสตาร์ทสูง ทนความร้อน รับประกัน 12 เดือน",
    fit: ["Kubota M6040", "Ford 6610", "Massey Ferguson 2635"],
  },
  {
    key: "battery-100",
    vendor: "korat",
    cat: "battery",
    name: "แบตเตอรี่ 12V 100Ah แห้ง ไม่ต้องเติมน้ำ",
    sku: "KR-BAT-100",
    brand: "GS",
    price: 3750,
    stock: 12,
    emoji: "🔋",
    desc: "แบตแห้งดูแลง่าย เหมาะกับงานหนักต่อเนื่องและรถที่จอดนาน",
    fit: ["John Deere 5310", "New Holland TT4.90"],
  },
  // --- ใบมีด/ผาน ---
  {
    key: "rotary-blade-24",
    vendor: "isan",
    cat: "blades",
    name: "ใบมีดโรตารี่ 24 นิ้ว (ชุด 6 ใบ)",
    sku: "IS-RB-24",
    brand: "TractorHub",
    price: 680,
    stock: 50,
    emoji: "🔪",
    desc: "เหล็กกล้าชุบแข็ง คมทน สับฟางและวัชพืชได้เนียน ติดตั้งกับโรตารี่มาตรฐาน",
    fit: ["Kubota L4708", "Kubota L5018", "Massey Ferguson 2635"],
  },
  {
    key: "disc-plow-3",
    vendor: "isan",
    cat: "blades",
    name: "ผานไถ 3 จาน พร้อมโครงเหล็ก",
    sku: "IS-DP-3",
    brand: "TractorHub",
    price: 4150,
    stock: 9,
    emoji: "🔪",
    desc: "ผานจาน 26 นิ้ว 3 จาน โครงเหล็กหนา เหมาะกับดินเหนียวและดินร่วนปนทราย",
    fit: ["Kubota M6040", "John Deere 5310", "Ford 6610"],
  },
  {
    key: "harrow-blade-22",
    vendor: "thaikaset",
    cat: "blades",
    name: "ใบผานพรวน 22 นิ้ว เหล็กกล้า",
    sku: "TK-HB-22",
    brand: "TractorHub",
    price: 520,
    stock: 34,
    emoji: "🔪",
    desc: "ใบผานพรวนดินหลังไถ ขอบเรียบลดการติดดิน ใช้ได้กับผานพรวนทั่วไป",
    fit: ["Kubota L4708", "New Holland TT4.90"],
  },
  // --- ยางและล้อ ---
  {
    key: "tire-front-816",
    vendor: "korat",
    cat: "tires",
    name: "ยางหน้า 8-16 ลายก้างปลา",
    sku: "KR-TR-816",
    brand: "Deestone",
    price: 3250,
    stock: 16,
    emoji: "🛞",
    desc: "ยางหน้ารถแทรกเตอร์ ดอกก้างปลา เกาะดีทั้งในนาและบนถนนลูกรัง",
    fit: ["Kubota L4708", "Kubota L5018", "John Deere 5045D"],
  },
  {
    key: "tire-rear-1492",
    vendor: "korat",
    cat: "tires",
    name: "ยางหลัง 14.9-28 ลายบั้ง 8 ชั้น",
    sku: "KR-TR-1492",
    brand: "Deestone",
    price: 8900,
    stock: 8,
    emoji: "🛞",
    desc: "ยางหลังงานหนัก ผ้าใบ 8 ชั้น ลุยโคลนลึกได้ดี อายุการใช้งานยาว",
    fit: ["Kubota M6040", "John Deere 5310", "Ford 6610"],
  },
  {
    key: "tube-1224",
    vendor: "korat",
    cat: "tires",
    name: "ยางในรถแทรกเตอร์ 12.4-24",
    sku: "KR-TB-1224",
    brand: "Deestone",
    price: 890,
    stock: 30,
    emoji: "🛞",
    desc: "ยางในยางธรรมชาติ ทนแรงดันสูง จุกลมโลหะแบบมาตรฐาน",
    fit: ["Kubota M6040", "Massey Ferguson 2635"],
  },
  // --- น้ำมันหล่อลื่น ---
  {
    key: "oil-15w40-6l",
    vendor: "petrofarm",
    cat: "lubricants",
    name: "น้ำมันเครื่องดีเซล 15W-40 ขนาด 6 ลิตร",
    sku: "PF-EO-1540",
    brand: "PTT",
    price: 890,
    stock: 46,
    emoji: "🛢️",
    desc: "น้ำมันเครื่องดีเซลงานหนัก มาตรฐาน API CI-4 เหมาะกับเครื่องยนต์แทรกเตอร์ทุกยี่ห้อ",
    fit: ["Kubota L4708", "Kubota M6040", "John Deere 5045D", "Ford 6610"],
  },
  {
    key: "oil-hyd-68",
    vendor: "petrofarm",
    cat: "lubricants",
    name: "น้ำมันไฮดรอลิก HD 68 ขนาด 18 ลิตร",
    sku: "PF-HY-68",
    brand: "PTT",
    price: 1450,
    stock: 24,
    emoji: "🛢️",
    desc: "น้ำมันไฮดรอลิกเกรดพรีเมียม ป้องกันการสึกหรอของปั๊มและวาล์ว",
    fit: ["Kubota M6040", "New Holland TT4.90"],
  },
  {
    key: "grease-ep2",
    vendor: "petrofarm",
    cat: "lubricants",
    name: "จาระบีลิเธียม EP2 ขนาด 1 กก.",
    sku: "PF-GR-EP2",
    brand: "PTT",
    price: 180,
    stock: 50,
    emoji: "🛢️",
    desc: "จาระบีอเนกประสงค์สำหรับจุดหมุนและลูกปืน ทนน้ำและแรงกดสูง",
    fit: ["Kubota L4708", "Massey Ferguson 2635", "Ford 6610"],
  },
  {
    key: "gear-oil-85w140",
    vendor: "petrofarm",
    cat: "lubricants",
    name: "น้ำมันเกียร์-เฟืองท้าย 85W-140 ขนาด 5 ลิตร",
    sku: "PF-GO-85140",
    brand: "PTT",
    price: 780,
    stock: 28,
    emoji: "🛢️",
    desc: "น้ำมันเกียร์งานหนัก GL-5 ปกป้องเฟืองท้ายจากแรงบิดสูง",
    fit: ["John Deere 5310", "New Holland TT4.90"],
  },
  // --- ระบบไฮดรอลิก ---
  {
    key: "hyd-pump-m",
    vendor: "thaikaset",
    cat: "hydraulic",
    name: "ปั๊มไฮดรอลิก Kubota M ซีรีส์",
    sku: "TK-HP-M",
    partCode: "3C081-82202",
    brand: "Kubota",
    price: 5400,
    stock: 7,
    emoji: "💧",
    desc: "ปั๊มไฮดรอลิกเฟืองแท้ แรงดันคงที่ ยกผานได้เต็มกำลัง รับประกัน 6 เดือน",
    fit: ["Kubota M6040", "Kubota L5018"],
  },
  {
    key: "hyd-cylinder",
    vendor: "isan",
    cat: "hydraulic",
    name: 'กระบอกไฮดรอลิกยกผาน 2" ระยะชัก 16 นิ้ว',
    sku: "IS-HC-2",
    brand: "TractorHub",
    price: 2650,
    stock: 14,
    emoji: "💧",
    desc: "กระบอกไฮดรอลิกสองทาง ซีลคุณภาพสูง ใช้กับผานไถและอุปกรณ์ต่อพ่วง",
    fit: ["John Deere 5045D", "Ford 6610", "Massey Ferguson 2635"],
  },
  {
    key: "hyd-hose",
    vendor: "isan",
    cat: "hydraulic",
    name: 'สายไฮดรอลิกแรงดันสูง 1/2" ยาว 1.5 ม.',
    sku: "IS-HH-15",
    brand: "TractorHub",
    price: 640,
    stock: 40,
    emoji: "💧",
    desc: "สายถักลวด 2 ชั้น ทนแรงดัน 4,000 PSI พร้อมหัวต่อสองด้าน",
    fit: ["Kubota M6040", "John Deere 5310", "New Holland TT4.90"],
  },
  // --- เครื่องยนต์ ---
  {
    key: "head-gasket-l",
    vendor: "thaikaset",
    cat: "engine",
    name: "ปะเก็นฝาสูบ Kubota L ซีรีส์",
    sku: "TK-HG-L",
    partCode: "16394-03310",
    brand: "Kubota",
    price: 1250,
    stock: 15,
    emoji: "⚙️",
    desc: "ปะเก็นฝาสูบแท้ ทนความร้อนสูง กันรั่วซึมระหว่างฝาสูบและเสื้อสูบ",
    fit: ["Kubota L4708", "Kubota L5018"],
  },
  {
    key: "piston-kit-l4708",
    vendor: "thaikaset",
    cat: "engine",
    name: "ชุดลูกสูบ + แหวน Kubota L4708 (STD)",
    sku: "TK-PK-L4708",
    partCode: "1G795-21110",
    brand: "Kubota",
    price: 3480,
    stock: 10,
    emoji: "⚙️",
    desc: "ชุดลูกสูบขนาดมาตรฐานพร้อมแหวน 3 ตัว สำหรับงานโอเวอร์ฮอลเครื่องยนต์",
    fit: ["Kubota L4708"],
  },
  {
    key: "water-pump-jd5310",
    vendor: "isan",
    cat: "engine",
    name: "ปั๊มน้ำเครื่องยนต์ John Deere 5310",
    sku: "IS-WP-5310",
    partCode: "RE545573",
    brand: "John Deere",
    price: 2150,
    stock: 11,
    emoji: "⚙️",
    desc: "ปั๊มน้ำพร้อมปะเก็น หมุนลื่นไม่มีเสียง แก้ปัญหาเครื่องร้อนจัด",
    fit: ["John Deere 5310", "John Deere 5045D"],
  },
  {
    key: "injector-m6040",
    vendor: "thaikaset",
    cat: "engine",
    name: "หัวฉีดน้ำมันเชื้อเพลิง Kubota M6040",
    sku: "TK-IJ-M6040",
    partCode: "1G924-53000",
    brand: "Kubota",
    price: 1680,
    stock: 13,
    emoji: "⚙️",
    desc: "หัวฉีดแท้ ละอองน้ำมันสม่ำเสมอ ช่วยประหยัดน้ำมันและลดควันดำ",
    fit: ["Kubota M6040"],
  },
  // --- อุปกรณ์ต่อพ่วง ---
  {
    key: "hitch-cat1",
    vendor: "korat",
    cat: "implements",
    name: "ชุดข้อต่อพ่วง 3 จุด Cat.1 ครบชุด",
    sku: "KR-HT-CAT1",
    brand: "TractorHub",
    price: 2980,
    stock: 12,
    emoji: "🔗",
    desc: "ชุดต่อพ่วง 3 จุดมาตรฐาน Cat.1 พร้อมสลักและคลิปล็อกครบชุด",
    fit: ["Kubota L4708", "John Deere 5045D", "Massey Ferguson 2635"],
  },
  {
    key: "pto-shaft",
    vendor: "korat",
    cat: "implements",
    name: "เพลาขับ PTO 6 ร่อง ยาว 1.2 ม.",
    sku: "KR-PTO-6",
    brand: "TractorHub",
    price: 1890,
    stock: 17,
    emoji: "🔗",
    desc: "เพลา PTO พร้อมกาชูดและครอบนิรภัย ปรับความยาวได้ ใช้กับโรตารี่และเครื่องสูบน้ำ",
    fit: ["Kubota M6040", "Ford 6610", "New Holland TT4.90"],
  },
];

const REVIEWS = [
  { product: "air-filter-l4708", by: "somchai", rating: 5, comment: "ของแท้ ใส่พอดีเป๊ะ ส่งไวมากครับ สั่งเช้าได้บ่ายวันรุ่งขึ้น" },
  { product: "air-filter-l4708", by: "oratai", rating: 4, comment: "ราคาถูกกว่าศูนย์พอสมควร คุณภาพใช้ได้ค่ะ" },
  { product: "battery-85", by: "prayut", rating: 5, comment: "สตาร์ทติดฉับ ไม่ต้องรอ ใช้มา 3 เดือนยังดีอยู่" },
  { product: "battery-85", by: "somchai", rating: 4, comment: "แพ็กมาดี ไม่มีรอยรั่ว แต่หนักพอสมควรครับ" },
  { product: "rotary-blade-24", by: "prayut", rating: 5, comment: "ใบคมมาก สับฟางเรียบเนียน คุ้มราคาสุด ๆ" },
  { product: "oil-15w40-6l", by: "somchai", rating: 5, comment: "ใช้ประจำอยู่แล้ว เครื่องเดินเรียบ ไม่มีควันดำ" },
  { product: "oil-15w40-6l", by: "oratai", rating: 4, comment: "ราคาโอเค แต่อยากให้มีขนาด 18 ลิตรด้วยค่ะ" },
  { product: "tire-front-816", by: "somchai", rating: 5, comment: "ดอกยางลึก เกาะดินดี ลุยแปลงอ้อยสบาย" },
  { product: "hyd-pump-m", by: "oratai", rating: 5, comment: "เปลี่ยนแล้วยกผานได้เต็มแรงเหมือนใหม่เลยค่ะ" },
  { product: "disc-plow-3", by: "prayut", rating: 4, comment: "โครงแข็งแรงดี ไถดินเหนียวได้ไม่มีปัญหา" },
  { product: "grease-ep2", by: "somchai", rating: 5, comment: "เนื้อจาระบีเหนียวดี ทนน้ำ ไม่ละลายง่าย" },
  { product: "hyd-hose", by: "prayut", rating: 4, comment: "ความยาวพอดี หัวต่อแน่นไม่รั่วซึม" },
  { product: "pto-shaft", by: "oratai", rating: 5, comment: "ประกอบง่าย มีครอบนิรภัยมาให้ ปลอดภัยขึ้นเยอะค่ะ" },
];

// คำสั่งซื้อตัวอย่าง — กระจายย้อนหลัง 6 เดือนเพื่อให้กราฟแดชบอร์ดมีข้อมูล
const ORDERS = [
  {
    code: "TH-10452",
    by: "somchai",
    daysAgo: 165,
    status: "COMPLETED",
    method: "CARD",
    coupon: "WELCOME50",
    items: [
      { product: "air-filter-l4708", qty: 2 },
      { product: "oil-15w40-6l", qty: 1 },
    ],
  },
  {
    code: "TH-10531",
    by: "oratai",
    daysAgo: 133,
    status: "COMPLETED",
    method: "PROMPTPAY",
    items: [
      { product: "battery-85", qty: 1 },
      { product: "tube-1224", qty: 2 },
    ],
  },
  {
    code: "TH-10688",
    by: "prayut",
    daysAgo: 101,
    status: "COMPLETED",
    method: "CARD",
    items: [
      { product: "rotary-blade-24", qty: 4 },
      { product: "hyd-hose", qty: 2 },
    ],
  },
  {
    code: "TH-10774",
    by: "somchai",
    daysAgo: 70,
    status: "COMPLETED",
    method: "BANK_TRANSFER",
    items: [
      { product: "tire-front-816", qty: 2 },
      { product: "disc-plow-3", qty: 1 },
    ],
  },
  {
    code: "TH-10902",
    by: "oratai",
    daysAgo: 42,
    status: "PAID",
    method: "PROMPTPAY",
    items: [
      { product: "hyd-pump-m", qty: 1 },
      { product: "grease-ep2", qty: 3 },
    ],
  },
  {
    code: "TH-11035",
    by: "somchai",
    daysAgo: 10,
    status: "PAID",
    method: "CARD",
    items: [
      { product: "oil-filter-m6040", qty: 1 },
      { product: "fuel-filter-jd", qty: 1 },
      { product: "oil-15w40-6l", qty: 2 },
    ],
  },
  {
    code: "TH-11147",
    by: "prayut",
    daysAgo: 5,
    status: "PENDING_PAYMENT",
    method: "PROMPTPAY",
    items: [
      { product: "pto-shaft", qty: 1 },
      { product: "hitch-cat1", qty: 1 },
    ],
  },
  {
    code: "TH-11208",
    by: "somchai",
    daysAgo: 1,
    status: "PENDING_PAYMENT",
    method: "BANK_TRANSFER",
    slipNote: "โอนแล้ว 09:14 น. ธ.กสิกรไทย ยอด 4,780 บาท (แนบสลิปทางไลน์)",
    items: [
      { product: "head-gasket-l", qty: 1 },
      { product: "piston-kit-l4708", qty: 1 },
    ],
  },
];

const SHIPPING_SATANG = 5000; // ค่าส่งเหมา ฿50 ต่อคำสั่งซื้อ

async function main() {
  console.log("🧹 ล้างข้อมูลเดิม...");
  await reset();

  // ---------- ผู้ใช้ ----------
  console.log("👤 สร้างผู้ใช้...");
  const customers = {};
  for (const c of [
    { key: "somchai", phone: "0811111111", name: "สมชาย ใจงาม" },
    { key: "oratai", phone: "0866666666", name: "อรทัย ชาวนา" },
    { key: "prayut", phone: "0877777777", name: "ประยุทธ์ นาโพธิ์" },
  ]) {
    customers[c.key] = await db.user.create({
      data: { phone: c.phone, name: c.name, role: "CUSTOMER" },
    });
  }

  const admin = await db.user.create({
    data: {
      phone: "0899999999",
      name: "ทีมงาน TractorHub",
      email: "admin@tractorhub.co.th",
      role: "ADMIN",
    },
  });

  // ---------- ร้านค้า + กระเป๋าเงิน ----------
  console.log("🏪 สร้างร้านค้า...");
  const vendors = {};
  for (const v of VENDORS) {
    const owner = await db.user.create({
      data: { phone: v.owner.phone, name: v.owner.name, role: "VENDOR" },
    });
    const vendor = await db.vendor.create({
      data: {
        userId: owner.id,
        shopName: v.shopName,
        description: v.description,
        logoEmoji: v.logoEmoji,
        themeColor: v.themeColor,
        commissionBps: 700,
        approved: true,
      },
    });
    await db.wallet.create({ data: { vendorId: vendor.id } });
    vendors[v.key] = vendor;
  }

  // ---------- หมวดหมู่ + รุ่นรถ ----------
  console.log("🗂️  สร้างหมวดหมู่และรุ่นรถ...");
  const categories = {};
  for (const c of CATEGORIES)
    categories[c.slug] = await db.category.create({ data: c });

  const models = {};
  for (const m of MODELS) {
    const row = await db.tractorModel.create({ data: m });
    models[`${m.brand} ${m.model}`] = row;
  }

  // ---------- สินค้า ----------
  console.log("📦 สร้างสินค้า...");
  const products = {};
  let gi = 0;
  for (const p of PRODUCTS) {
    const row = await db.product.create({
      data: {
        vendorId: vendors[p.vendor].id,
        categoryId: categories[p.cat].id,
        name: p.name,
        sku: p.sku,
        partCode: p.partCode ?? null,
        brand: p.brand ?? null,
        description: p.desc,
        priceSatang: baht(p.price),
        stock: p.stock,
        imageJson: img(p.emoji, gi++),
        active: true,
        createdAt: daysAgo(200 - gi * 3),
      },
    });
    products[p.key] = row;
    for (const fit of p.fit) {
      const m = models[fit];
      if (m)
        await db.compatibility.create({
          data: { productId: row.id, tractorModelId: m.id },
        });
    }
  }

  // ---------- รีวิว ----------
  console.log("⭐ สร้างรีวิว...");
  let ri = 0;
  for (const r of REVIEWS) {
    await db.review.create({
      data: {
        productId: products[r.product].id,
        userId: customers[r.by].id,
        rating: r.rating,
        comment: r.comment,
        createdAt: daysAgo(90 - ri++ * 5),
      },
    });
  }

  // ---------- แบนเนอร์ / คูปอง / ที่อยู่ / การตั้งค่า ----------
  console.log("🎏 สร้างแบนเนอร์ คูปอง และที่อยู่...");
  await db.banner.create({
    data: {
      title: "อะไหล่แท้ ช่างถึงที่ ดูแลรถแทรกเตอร์ครบวงจร",
      subtitle:
        "ส่งไวทั่วไทย · รับประกันของแท้ · ปรึกษาช่างผู้เชี่ยวชาญฟรีทุกวัน",
      ctaText: "เลือกซื้ออะไหล่",
      ctaHref: "/products",
      active: true,
      sort: 1,
    },
  });

  await db.coupon.create({
    data: {
      code: "WELCOME50",
      type: "FIXED",
      value: baht(50),
      minTotalSatang: baht(500),
      active: true,
      expiresAt: new Date(Date.now() + 180 * 24 * 3600 * 1000),
    },
  });

  const somchaiAddress = await db.address.create({
    data: {
      userId: customers.somchai.id,
      recipient: "สมชาย ใจงาม",
      phone: "0811111111",
      line1: "88/12 หมู่ 4 บ้านหนองบัว",
      subdistrict: "ท่าช้าง",
      district: "เมือง",
      province: "นครราชสีมา",
      postcode: "30000",
      isDefault: true,
    },
  });
  await db.address.create({
    data: {
      userId: customers.oratai.id,
      recipient: "อรทัย ชาวนา",
      phone: "0866666666",
      line1: "45 หมู่ 9 บ้านโนนสูง",
      subdistrict: "โนนสูง",
      district: "โนนสูง",
      province: "นครราชสีมา",
      postcode: "30160",
      isDefault: true,
    },
  });
  await db.address.create({
    data: {
      userId: customers.prayut.id,
      recipient: "ประยุทธ์ นาโพธิ์",
      phone: "0877777777",
      line1: "120 หมู่ 2 บ้านนาโพธิ์",
      subdistrict: "ในเมือง",
      district: "เมืองขอนแก่น",
      province: "ขอนแก่น",
      postcode: "40000",
      isDefault: true,
    },
  });

  await db.setting.createMany({
    data: [
      { key: "shipping_flat_satang", value: String(SHIPPING_SATANG) },
      { key: "default_commission_bps", value: "700" },
      { key: "support_line", value: "@tractorhub" },
    ],
  });

  // ---------- คำสั่งซื้อ + การเงิน ----------
  console.log("🧾 สร้างคำสั่งซื้อและยอดกระเป๋าเงิน...");
  const addressOf = {
    somchai: {
      recipient: "สมชาย ใจงาม",
      phone: "0811111111",
      line1: "88/12 หมู่ 4 บ้านหนองบัว",
      subdistrict: "ท่าช้าง",
      district: "เมือง",
      province: "นครราชสีมา",
      postcode: "30000",
    },
    oratai: {
      recipient: "อรทัย ชาวนา",
      phone: "0866666666",
      line1: "45 หมู่ 9 บ้านโนนสูง",
      subdistrict: "โนนสูง",
      district: "โนนสูง",
      province: "นครราชสีมา",
      postcode: "30160",
    },
    prayut: {
      recipient: "ประยุทธ์ นาโพธิ์",
      phone: "0877777777",
      line1: "120 หมู่ 2 บ้านนาโพธิ์",
      subdistrict: "ในเมือง",
      district: "เมืองขอนแก่น",
      province: "ขอนแก่น",
      postcode: "40000",
    },
  };

  for (const o of ORDERS) {
    const createdAt = daysAgo(o.daysAgo);

    // --- คำนวณยอด ---
    const lines = o.items.map((i) => {
      const p = products[i.product];
      return { product: p, qty: i.qty, lineSatang: p.priceSatang * i.qty };
    });
    const itemsSatang = lines.reduce((s, l) => s + l.lineSatang, 0);
    let discountSatang = 0;
    if (o.coupon === "WELCOME50" && itemsSatang >= baht(500))
      discountSatang = baht(50);
    const totalSatang = itemsSatang + SHIPPING_SATANG - discountSatang;

    const order = await db.order.create({
      data: {
        code: o.code,
        userId: customers[o.by].id,
        status: o.status,
        itemsSatang,
        shippingSatang: SHIPPING_SATANG,
        discountSatang,
        totalSatang,
        couponCode: o.coupon ?? null,
        addressJson: JSON.stringify(addressOf[o.by]),
        createdAt,
      },
    });
    if (o.coupon)
      await db.coupon.update({
        where: { code: o.coupon },
        data: { usedCount: { increment: 1 } },
      });

    // --- แยก SubOrder ตามร้าน + ตัดสต็อก ---
    const byVendor = new Map();
    for (const l of lines) {
      const list = byVendor.get(l.product.vendorId) ?? [];
      list.push(l);
      byVendor.set(l.product.vendorId, list);
    }

    const subOrders = [];
    for (const [vendorId, list] of byVendor) {
      const subItems = list.reduce((s, l) => s + l.lineSatang, 0);
      const sub = await db.subOrder.create({
        data: {
          orderId: order.id,
          vendorId,
          status: "AWAITING_PAYMENT",
          itemsSatang: subItems,
        },
      });
      for (const l of list) {
        await db.orderItem.create({
          data: {
            subOrderId: sub.id,
            productId: l.product.id,
            nameSnapshot: l.product.name,
            priceSatang: l.product.priceSatang,
            qty: l.qty,
          },
        });
        await db.product.update({
          where: { id: l.product.id },
          data: { stock: { decrement: l.qty } },
        });
      }
      subOrders.push(sub);
    }

    // --- การชำระเงิน ---
    const paid = o.status === "PAID" || o.status === "COMPLETED";
    await db.payment.create({
      data: {
        orderId: order.id,
        method: o.method,
        status: paid ? "PAID" : "PENDING",
        amountSatang: totalSatang,
        ref: paid ? `SEED-${o.code}` : null,
        slipNote: o.slipNote ?? null,
        paidAt: paid ? createdAt : null,
        createdAt,
      },
    });

    if (!paid) continue;

    // --- creditPendingOnPaid(): ยอดเข้า pending ของแต่ละร้าน ---
    for (const sub of subOrders) {
      const vendor = await db.vendor.findUnique({ where: { id: sub.vendorId } });
      const fee = commission(sub.itemsSatang, vendor.commissionBps);
      const net = sub.itemsSatang - fee;
      await db.subOrder.update({
        where: { id: sub.id },
        data: {
          status: "PENDING_CONFIRM",
          commissionSatang: fee,
          netSatang: net,
        },
      });
      await db.wallet.update({
        where: { vendorId: sub.vendorId },
        data: { pendingSatang: { increment: net } },
      });
      sub.commissionSatang = fee;
      sub.netSatang = net;
    }
    await db.auditLog.create({
      data: {
        userId: customers[o.by].id,
        action: "PAYMENT_PAID",
        entity: "Order",
        entityId: order.id,
        detailJson: JSON.stringify({
          method: o.method,
          amountSatang: totalSatang,
          via: "seed",
        }),
        createdAt,
      },
    });

    if (o.status !== "COMPLETED") continue;

    // --- settleSubOrder(): pending → balance + ledger 2 รายการ ---
    const settledAt = new Date(createdAt.getTime() + 5 * 24 * 3600 * 1000);
    for (const sub of subOrders) {
      const vendor = await db.vendor.findUnique({ where: { id: sub.vendorId } });
      const wallet = await db.wallet.findUnique({
        where: { vendorId: sub.vendorId },
      });
      await db.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingSatang: { decrement: sub.netSatang },
          balanceSatang: { increment: sub.netSatang },
        },
      });
      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "SALE_CREDIT",
          amountSatang: sub.itemsSatang,
          note: `ยอดขายคำสั่งซื้อ ${order.code}`,
          subOrderId: sub.id,
          createdAt: settledAt,
        },
      });
      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "COMMISSION_FEE",
          amountSatang: -sub.commissionSatang,
          note: `ค่าคอมมิชชันแพลตฟอร์ม ${(vendor.commissionBps / 100).toFixed(2)}%`,
          subOrderId: sub.id,
          createdAt: settledAt,
        },
      });
      await db.subOrder.update({
        where: { id: sub.id },
        data: { status: "COMPLETED", settledAt },
      });
      await db.auditLog.create({
        data: {
          userId: null,
          action: "SUBORDER_COMPLETED",
          entity: "SubOrder",
          entityId: sub.id,
          detailJson: JSON.stringify({ netSatang: sub.netSatang }),
          createdAt: settledAt,
        },
      });
    }
  }

  // ---------- คำขอถอนเงินตัวอย่าง (ตัด balance ทันที + ลง ledger) ----------
  console.log("💸 สร้างคำขอถอนเงินตัวอย่าง...");
  const koratWallet = await db.wallet.findUnique({
    where: { vendorId: vendors.korat.id },
  });
  const wdAmount = baht(5000);
  if (koratWallet && koratWallet.balanceSatang >= wdAmount) {
    await db.wallet.update({
      where: { id: koratWallet.id },
      data: { balanceSatang: { decrement: wdAmount } },
    });
    const wd = await db.withdrawalRequest.create({
      data: {
        vendorId: vendors.korat.id,
        amountSatang: wdAmount,
        bankJson: JSON.stringify({
          bank: "ธนาคารกรุงไทย",
          accountNo: "301-0-45678-9",
          accountName: "วิรัตน์ โคราชยนต์",
        }),
        status: "PENDING",
        createdAt: daysAgo(4),
      },
    });
    await db.walletTransaction.create({
      data: {
        walletId: koratWallet.id,
        type: "WITHDRAWAL",
        amountSatang: -wdAmount,
        note: `คำขอถอนเงิน #${wd.id.slice(-6).toUpperCase()}`,
        createdAt: daysAgo(4),
      },
    });
    await db.auditLog.create({
      data: {
        action: "WITHDRAWAL_REQUEST",
        entity: "WithdrawalRequest",
        entityId: wd.id,
        detailJson: JSON.stringify({ amountSatang: wdAmount }),
        createdAt: daysAgo(4),
      },
    });
  }

  // ---------- ข้อมูลรถ (เตรียมเฟส 4) ----------
  console.log("🚜 สร้างข้อมูลรถและประวัติการเข้าซ่อม...");
  const v1 = await db.vehicle.create({
    data: {
      refCode: "TRC-0001",
      ownerId: customers.somchai.id,
      tractorModelId: models["Kubota M6040"].id,
      plateNo: "ตค 1234 นครราชสีมา",
      vin: "KBTM6040-TH-002841",
      engineHours: 1240,
      mileageKm: 1842,
      notes: "รถหลักใช้ไถแปลงอ้อย 40 ไร่ · เปลี่ยนถ่ายน้ำมันทุก 250 ชม.",
      createdAt: daysAgo(320),
    },
  });
  await db.vehicle.create({
    data: {
      refCode: "TRC-0002",
      ownerId: customers.oratai.id,
      tractorModelId: models["John Deere 5045D"].id,
      plateNo: "ตค 5678 นครราชสีมา",
      vin: "JD5045D-TH-115902",
      engineHours: 640,
      mileageKm: 720,
      notes: "ใช้งานในนาข้าว ฤดูกาลละประมาณ 200 ชั่วโมง",
      createdAt: daysAgo(210),
    },
  });

  await db.vehicleLog.create({
    data: {
      vehicleId: v1.id,
      type: "SERVICE",
      lat: 14.9799,
      lng: 102.0977,
      mileageKm: 1780,
      detailJson: JSON.stringify({
        work: "เปลี่ยนถ่ายน้ำมันเครื่อง + ไส้กรองอากาศ ตรวจระบบไฮดรอลิก",
        parts: ["ไส้กรองอากาศ Kubota L4708", "น้ำมันเครื่องดีเซล 15W-40 6 ลิตร"],
        technician: "ช่างวิรัช ศูนย์บริการโคราช",
        costSatang: baht(1340),
      }),
      createdAt: daysAgo(38),
    },
  });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED_RUN",
      entity: "System",
      detailJson: JSON.stringify({ at: new Date().toISOString() }),
    },
  });

  // ---------- ตรวจความสอดคล้องของ ledger ----------
  const wallets = await db.wallet.findMany({ include: { vendor: true } });
  console.log("\n💰 สรุปกระเป๋าเงินร้านค้า (ledger ต้องเท่ากับ balance)");
  for (const w of wallets) {
    const agg = await db.walletTransaction.aggregate({
      where: { walletId: w.id },
      _sum: { amountSatang: true },
    });
    const ledger = agg._sum.amountSatang ?? 0;
    const okMark = ledger === w.balanceSatang ? "✅" : "❌";
    console.log(
      `  ${okMark} ${w.vendor.shopName}: balance ${(w.balanceSatang / 100).toLocaleString("th-TH")} ฿ · pending ${(w.pendingSatang / 100).toLocaleString("th-TH")} ฿ · ledger ${(ledger / 100).toLocaleString("th-TH")} ฿`,
    );
    if (ledger !== w.balanceSatang)
      throw new Error(`ledger ไม่ตรงกับ balance ของร้าน ${w.vendor.shopName}`);
  }

  const counts = {
    users: await db.user.count(),
    vendors: await db.vendor.count(),
    categories: await db.category.count(),
    products: await db.product.count(),
    orders: await db.order.count(),
    subOrders: await db.subOrder.count(),
    reviews: await db.review.count(),
    vehicles: await db.vehicle.count(),
  };
  console.log("\n📊 สรุปข้อมูล:", counts);
  console.log(
    `\n✅ Seed สำเร็จ — เข้าสู่ระบบด้วย OTP 123456\n   ลูกค้า 0811111111 (${somchaiAddress.province}) · ร้านค้า 0822222222 · แอดมิน 0899999999`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed ล้มเหลว:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
