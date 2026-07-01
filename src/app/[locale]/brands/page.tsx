import { WEB_APP_NAME_BRANDS, WEB_APP_NAME_BRANDS_DESCRIPTION } from "@/lib/constant";
import Brands from "./BrandsPage";

export const metadata = {
    title: WEB_APP_NAME_BRANDS,
    description: WEB_APP_NAME_BRANDS_DESCRIPTION,
};

export default function BrandsPage() {
    return <Brands />;
}