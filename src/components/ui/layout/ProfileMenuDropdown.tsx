import Link from "next/link";
import { HiUser, HiClipboardList } from "react-icons/hi";
import { IoLogOut } from "react-icons/io5";
import { useTranslations } from "next-intl";

type ProfileMenuDropdownProps = {
    onCloseMenu?: () => void;
    onRequestLogout?: () => void;
};

export default function ProfileMenuDropdown({ onCloseMenu, onRequestLogout }: ProfileMenuDropdownProps) {
    const t = useTranslations("profileMenu");

    return (
        <div
            className="absolute right-0 top-full mt-2 w-44 z-50"
            onClick={e => e.stopPropagation()}
        >
            {/* Arrow */}
            <div className="absolute right-4 -top-2 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-200"></div>

            {/* Dropdown box */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
                <ul className="py-2 text-sm text-gray-700">
                    <li>
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                            onClick={onCloseMenu}
                            aria-label={t("profile")}
                        >
                            <HiUser className="text-lg" />
                            {t("profile")}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/orders"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                            onClick={onCloseMenu}
                            aria-label={t("orders")}
                        >
                            <HiClipboardList className="text-lg" />
                            {t("orders")}
                        </Link>
                    </li>
                    <button
                        onClick={onRequestLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                        aria-label={t("logout")}
                    >
                        <IoLogOut className="text-lg" />
                        {t("logout")}
                    </button>
                </ul>
            </div>
        </div>
    );
}
