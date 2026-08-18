import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Card from "@/components/backoffice/Card";
import Forbidden from "@/components/backoffice/Forbidden";
import AddProductForm from "@/components/backoffice/vendor/AddProductForm";
import ProductRow from "@/components/backoffice/vendor/ProductRow";

export default async function VendorProductsPage() {
  const user = await getSessionUser();
  const vendor = user?.vendor;
  if (!vendor) return <Forbidden message="บัญชีนี้ยังไม่ได้ผูกกับร้านค้า" />;

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    db.category.findMany({ orderBy: { sort: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">สินค้า</h1>
        <p className="mt-1 text-sm text-muted">จัดการรายการสินค้าของร้าน {vendor.shopName}</p>
      </div>

      <Card title="เพิ่มสินค้าใหม่">
        <AddProductForm categories={categories} />
      </Card>

      <Card title={`สินค้าทั้งหมด (${products.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">สินค้า</th>
                <th className="py-2 pr-3 font-medium">หมวดหมู่</th>
                <th className="py-2 pr-3 font-medium">ราคา</th>
                <th className="py-2 pr-3 font-medium">สต็อก</th>
                <th className="py-2 pr-3 font-medium">เปิดขาย</th>
                <th className="py-2 pr-3 font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    ยังไม่มีสินค้า เพิ่มสินค้าแรกของร้านได้เลย
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <ProductRow key={p.id} product={p} categories={categories} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
