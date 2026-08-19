import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/store/cart-context";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { ToastHost } from "@/components/store/toast-host";

export const metadata: Metadata = {
  title: "Rodlex รถเหล็ก — รวมช่างซ่อมเครื่องจักรก่อสร้าง เครื่องจักรเกษตร",
  description:
    "มาร์เก็ตเพลสอะไหล่และเรียกช่างซ่อมเครื่องจักรก่อสร้าง-เกษตรครบวงจร งานซ่อม งาน Custom ทำจบครบที่รถเหล็ก",
};

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-surface">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <ToastHost />
    </CartProvider>
  );
}
