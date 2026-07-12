import { WEB_APP_NAME_RESET_PASSWORD, WEB_APP_NAME_RESET_PASSWORD_DESCRIPTION } from "@/lib/constant";
import ResetPasswordPage from "./ResetPasswordPage";

export const metadata = {
    title: WEB_APP_NAME_RESET_PASSWORD,
    description: WEB_APP_NAME_RESET_PASSWORD_DESCRIPTION,
};

// Halaman reset password (dibuka dari link email). Logika ada di komponen ResetPasswordPage.
// (Nama fungsi "RegisterPage" di sini tampaknya sisa salin-tempel, perannya tetap reset password.)
export default function RegisterPage() {
    return <ResetPasswordPage />;
}