import { WEB_APP_NAME_PRODUCTS, WEB_APP_NAME_PRODUCTS_DESCRIPTION } from "@/lib/constant";
import Products from "./ProductsPage";

export const metadata = {
    title: WEB_APP_NAME_PRODUCTS,
    description: WEB_APP_NAME_PRODUCTS_DESCRIPTION,
};

export default function ProductsPage() {
    return <Products />;
}