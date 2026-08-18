import { NextResponse } from "next/server";
import { AuthError } from "./auth";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** ครอบ handler ของ API route ให้จัดการ AuthError/Error เป็นรูปแบบเดียวกัน */
export function handler<T extends unknown[]>(
  fn: (...args: T) => Promise<Response>,
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof AuthError) return fail(e.message, e.status);
      console.error(e);
      return fail("เกิดข้อผิดพลาดในระบบ", 500);
    }
  };
}
