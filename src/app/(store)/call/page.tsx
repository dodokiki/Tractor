import { CallForm } from "@/components/store/call-form";

export default function CallPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-3 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-3xl shadow-lg shadow-primary/30 sm:h-20 sm:w-20 sm:text-4xl" aria-hidden>
          🔧
        </span>
        <h1 className="mt-4 text-xl font-bold text-ink sm:text-2xl">เรียกช่างรถเหล็ก</h1>
        <p className="mt-1 text-sm text-muted">
          กรอกข้อมูลด้านล่าง ทีมงานช่างรถเหล็กจะติดต่อกลับโดยเร็วที่สุด
        </p>
      </div>

      <CallForm />
    </div>
  );
}
