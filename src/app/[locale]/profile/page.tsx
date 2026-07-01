import { WEB_APP_NAME_PROFILE, WEB_APP_NAME_PROFILE_DESCRIPTION } from "@/lib/constant";
import Profiles from "./ProfilesPage";

export const metadata = {
    title: WEB_APP_NAME_PROFILE,
    description: WEB_APP_NAME_PROFILE_DESCRIPTION,
};

export default function ProfilePage() {
    return <Profiles />;
}