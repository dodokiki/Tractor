import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // โหมด demo (ไม่มี DATABASE_URL): แนบฐานข้อมูลตัวอย่างไปกับ serverless bundle
  outputFileTracingIncludes: {
    "/**/*": ["./prisma/demo.db"],
  },
};

export default nextConfig;
