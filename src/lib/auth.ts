import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "./db";
import type { Role, User, Vendor } from "@prisma/client";

const COOKIE = "th_session";
const SESSION_DAYS = 30;

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await db.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
    jar.delete(COOKIE);
  }
}

export type SessionUser = User & { vendor: Vendor | null };

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: { include: { vendor: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

/** ใช้ใน API route — โยน Response 401/403 ถ้าไม่ผ่าน */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError(401, "กรุณาเข้าสู่ระบบ");
  if (role && user.role !== role && user.role !== "ADMIN")
    throw new AuthError(403, "ไม่มีสิทธิ์เข้าถึงส่วนนี้");
  return user;
}

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** OTP: โหมด mock ใช้รหัสคงที่ 123456 */
export async function issueOtp(phone: string): Promise<string> {
  const code =
    process.env.PAYMENT_MODE === "mock"
      ? "123456"
      : Math.floor(100000 + Math.random() * 900000).toString();
  await db.otpCode.create({
    data: { phone, code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
  });
  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await db.otpCode.findFirst({
    where: { phone, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;
  await db.otpCode.update({ where: { id: otp.id }, data: { used: true } });
  return true;
}
