import { WEB_APP_NAME_VERIFY, WEB_APP_NAME_VERIFY_DESCRIPTION } from "@/lib/constant";
import VerifyPage from "./VerifyPage";

export const metadata = {
    title: WEB_APP_NAME_VERIFY,
    description: WEB_APP_NAME_VERIFY_DESCRIPTION,
};

export default function RegisterPage() {
    return <VerifyPage />;
}