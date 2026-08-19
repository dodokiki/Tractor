"use client";

/** ภาพประกอบ hero หน้าแรก ลอยบนวงกลม gradient — fallback เป็นอิโมจิ 🚜 ถ้าไฟล์ยังไม่มี */
export function HeroImage() {
  return (
    <div className="relative mx-auto hidden aspect-square w-full max-w-md items-center justify-center sm:flex">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-white/5 blur-sm"
      />
      <div
        aria-hidden
        className="absolute inset-8 rounded-full bg-white/10 ring-1 ring-white/20"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/products/hero-tractor.svg"
        alt="รถแทรกเตอร์และอะไหล่ TractorHub"
        className="relative z-10 w-4/5 drop-shadow-2xl"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (sibling) sibling.style.display = "flex";
        }}
      />
      <span
        aria-hidden
        className="relative z-10 hidden text-[10rem] drop-shadow-2xl"
        style={{ display: "none" }}
      >
        🚜
      </span>
    </div>
  );
}
