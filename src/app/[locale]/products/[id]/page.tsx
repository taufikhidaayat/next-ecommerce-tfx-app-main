import { WEB_APP_NAME_PRODUCT_DETAIL, WEB_APP_NAME_PRODUCT_DETAIL_DESCRIPTION } from "@/lib/constant";
import ProductDetail from "./ProductDetailPage";

export const metadata = {
    title: WEB_APP_NAME_PRODUCT_DETAIL,
    description: WEB_APP_NAME_PRODUCT_DETAIL_DESCRIPTION,
};
// Halaman detail satu produk (/[locale]/products/[id]). Mengambil id dari URL lalu
// menyerahkannya ke komponen ProductDetail (yang memuat data, galeri, ulasan, dll).
// `metadata` di atas mengatur judul/deskripsi tab untuk SEO.
export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ProductDetail productId={id} />;
}