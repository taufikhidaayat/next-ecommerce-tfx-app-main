import { WEB_APP_NAME_PRODUCT_DETAIL, WEB_APP_NAME_PRODUCT_DETAIL_DESCRIPTION } from "@/lib/constant";
import ProductDetail from "./ProductDetailPage";

export const metadata = {
    title: WEB_APP_NAME_PRODUCT_DETAIL,
    description: WEB_APP_NAME_PRODUCT_DETAIL_DESCRIPTION,
};
export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ProductDetail productId={id} />;
}