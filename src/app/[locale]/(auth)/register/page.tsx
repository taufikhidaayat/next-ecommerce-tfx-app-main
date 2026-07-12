import { WEB_APP_NAME_REGISTER, WEB_APP_NAME_REGISTER_DESCRIPTION } from "@/lib/constant";
import Register from "./RegisterPage";

export const metadata = {
    title: WEB_APP_NAME_REGISTER,
    description: WEB_APP_NAME_REGISTER_DESCRIPTION,
};

// Halaman daftar akun pelanggan. Logika ada di komponen Register.
export default function RegisterPage() {
    return <Register />;
}