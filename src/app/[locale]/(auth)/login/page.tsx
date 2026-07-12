import { WEB_APP_NAME_LOGIN, WEB_APP_NAME_LOGIN_DESCRIPTION } from "@/lib/constant";
import Login from "./LoginPage";

export const metadata = {
  title: WEB_APP_NAME_LOGIN,
  description: WEB_APP_NAME_LOGIN_DESCRIPTION,
};

// Halaman login pelanggan. Logika ada di komponen Login.
export default function LoginPage() {
  return <Login />;
}