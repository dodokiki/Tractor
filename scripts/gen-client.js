// เลือก Prisma schema ตามสภาพแวดล้อม:
// - มี DATABASE_URL ที่เป็น postgres → schema หลัก (PostgreSQL)
// - ไม่มี DATABASE_URL หรือเป็น file: → schema.sqlite.prisma (dev / โหมด demo บน Vercel)
const { execSync } = require("child_process");

const url = process.env.DATABASE_URL || "";
const useSqlite = !url || url.startsWith("file:");
const schema = useSqlite ? "prisma/schema.sqlite.prisma" : "prisma/schema.prisma";
console.log(`[gen-client] DATABASE_URL=${url ? (useSqlite ? url : "postgres:***") : "(none)"} → ${schema}`);
execSync(`npx prisma generate --schema ${schema}`, { stdio: "inherit" });
