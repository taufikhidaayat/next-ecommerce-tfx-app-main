import { WEB_APP_NAME_ORDER, WEB_APP_NAME_ORDER_DESCRIPTION } from "@/lib/constant";
import Orders from "./OrdersPage";

export const metadata = {
    title: WEB_APP_NAME_ORDER,
    description: WEB_APP_NAME_ORDER_DESCRIPTION,
};

// Halaman "Pesanan Saya" (daftar pesanan pelanggan, per tab status). Logika ada di komponen Orders.
export default function OrdersPage() {
    return <Orders />;
}