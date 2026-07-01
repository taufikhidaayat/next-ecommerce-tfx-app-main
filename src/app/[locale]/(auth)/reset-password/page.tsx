import { WEB_APP_NAME_RESET_PASSWORD, WEB_APP_NAME_RESET_PASSWORD_DESCRIPTION } from "@/lib/constant";
import ResetPasswordPage from "./ResetPasswordPage";

export const metadata = {
    title: WEB_APP_NAME_RESET_PASSWORD,
    description: WEB_APP_NAME_RESET_PASSWORD_DESCRIPTION,
};

export default function RegisterPage() {
    return <ResetPasswordPage />;
}