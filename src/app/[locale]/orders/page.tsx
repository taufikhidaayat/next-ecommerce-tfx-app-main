import { WEB_APP_NAME_ORDER, WEB_APP_NAME_ORDER_DESCRIPTION } from "@/lib/constant";
import Orders from "./OrdersPage";

export const metadata = {
    title: WEB_APP_NAME_ORDER,
    description: WEB_APP_NAME_ORDER_DESCRIPTION,
};

export default function OrdersPage() {
    return <Orders />;
}