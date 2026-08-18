export default function Forbidden({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
        <div className="text-4xl">🚫</div>
        <h1 className="mt-3 text-lg font-bold text-ink">ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="mt-2 text-sm text-muted">
          {message ?? "บัญชีของคุณไม่มีสิทธิ์เข้าถึงส่วนนี้ของระบบ"}
        </p>
        <a
          href="/"
          className="mt-5 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
        >
          กลับหน้าแรก
        </a>
      </div>
    </div>
  );
}
