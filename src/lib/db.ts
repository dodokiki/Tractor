import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * โหมด Demo บน serverless (เช่น Vercel ที่ยังไม่ตั้ง DATABASE_URL):
 * คัดลอกฐานข้อมูลตัวอย่าง prisma/demo.db ไปไว้ที่ /tmp (เขียนได้) แล้วใช้งานแทน
 * ข้อมูลจะรีเซ็ตเองเมื่อ serverless instance ใหม่เริ่มทำงาน — เหมาะสำหรับเดโมลูกค้า
 * เมื่อตั้ง DATABASE_URL เป็น PostgreSQL จริง โหมดนี้จะปิดตัวเองอัตโนมัติ
 */
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  const onServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (url && !url.startsWith("file:")) return url; // Postgres จริง
  if (!onServerless) return url; // dev ในเครื่อง ใช้ค่าจาก .env ตามปกติ

  const tmpDb = "/tmp/tractorhub-demo.db";
  if (!fs.existsSync(tmpDb)) {
    const bundled = path.join(process.cwd(), "prisma", "demo.db");
    fs.copyFileSync(bundled, tmpDb);
  }
  return `file:${tmpDb}`;
}

function createClient() {
  const url = resolveDatabaseUrl();
  return new PrismaClient({
    ...(url ? { datasources: { db: { url } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
