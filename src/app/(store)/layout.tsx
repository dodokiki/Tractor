import type { ReactNode } from "react";
import { CartProvider } from "@/components/store/cart-context";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-surface">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
