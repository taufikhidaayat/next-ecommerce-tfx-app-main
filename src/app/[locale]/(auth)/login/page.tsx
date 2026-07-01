import { WEB_APP_NAME_LOGIN, WEB_APP_NAME_LOGIN_DESCRIPTION } from "@/lib/constant";
import Login from "./LoginPage";

export const metadata = {
  title: WEB_APP_NAME_LOGIN,
  description: WEB_APP_NAME_LOGIN_DESCRIPTION,
};

export default function LoginPage() {
  return <Login />;
}