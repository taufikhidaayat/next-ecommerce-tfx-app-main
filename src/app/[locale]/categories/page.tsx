import { WEB_APP_NAME_CATEGORIES, WEB_APP_NAME_CATEGORIES_DESCRIPTION } from "@/lib/constant";
import Categories from "./CategoriesPage";

export const metadata = {
    title: WEB_APP_NAME_CATEGORIES,
    description: WEB_APP_NAME_CATEGORIES_DESCRIPTION,
};

// Halaman daftar kategori toko. Logika ada di komponen Categories.
export default function CategoriesPage() {
    return <Categories />;
}