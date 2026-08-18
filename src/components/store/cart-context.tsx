"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProductImage } from "./image";

export type CartItem = {
  productId: string;
  name: string;
  priceSatang: number;
  qty: number;
  stock: number;
  vendorId: string;
  vendorName: string;
  image: ProductImage;
};

type CartState = {
  items: CartItem[];
  couponCode: string;
};

const STORAGE_KEY = "tractorhub_cart_v1";
const EMPTY_STATE: CartState = { items: [], couponCode: "" };

type CartContextValue = {
  items: CartItem[];
  couponCode: string;
  totalCount: number;
  totalSatang: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  setCouponCode: (code: string) => void;
  isReady: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadState(): CartState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      couponCode: typeof parsed.couponCode === "string" ? parsed.couponCode : "",
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY_STATE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isReady]);

  // ให้แท็บอื่นซิงก์กันเมื่อแก้ตะกร้า
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setState(loadState());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.productId === item.productId);
      if (existing) {
        const nextQty = Math.min(existing.stock, existing.qty + qty);
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.productId === item.productId ? { ...i, qty: nextQty } : i,
          ),
        };
      }
      return {
        ...prev,
        items: [...prev.items, { ...item, qty: Math.max(1, Math.min(item.stock, qty)) }],
      };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productId !== productId),
    }));
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items
        .map((i) =>
          i.productId === productId
            ? { ...i, qty: Math.max(1, Math.min(i.stock, qty)) }
            : i,
        )
        .filter((i) => i.qty > 0),
    }));
  }, []);

  const clear = useCallback(() => {
    setState({ items: [], couponCode: "" });
  }, []);

  const setCouponCode = useCallback((code: string) => {
    setState((prev) => ({ ...prev, couponCode: code }));
  }, []);

  const totalCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.qty, 0),
    [state.items],
  );
  const totalSatang = useMemo(
    () => state.items.reduce((sum, i) => sum + i.qty * i.priceSatang, 0),
    [state.items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      couponCode: state.couponCode,
      totalCount,
      totalSatang,
      addItem,
      removeItem,
      setQty,
      clear,
      setCouponCode,
      isReady,
    }),
    [state, totalCount, totalSatang, addItem, removeItem, setQty, clear, setCouponCode, isReady],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart ต้องถูกใช้ภายใน <CartProvider>");
  return ctx;
}
