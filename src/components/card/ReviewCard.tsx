import { useEffect, useRef, useState } from "react";
import RatingStars from "../ui/layout/RatingStar";
import { FiMoreVertical, FiFlag } from "react-icons/fi";
import { BsPatchCheckFill } from "react-icons/bs";
import { maskFirstLast } from "@/utils/maskFirstLast";
import { getTimeDifference } from "@/utils/getTimeDifference";
import Image from "next/image";
import { ProductReview } from "@/types/product/productReview";
import { FaUserCircle } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/satelite/services/authService";
import ReportReviewModal from "../modal/ReportReviewModal";

const DEFAULT_AVATAR = "/images/default-profile.png";

type ReviewCardProps = {
    review: ProductReview;
    isOwner?: boolean;
};

export default function ReviewCard({ review, isOwner = false }: ReviewCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("reviewCard");
    const router = useRouter();
    const { data: user } = useAuth();

    // Avatar reviewer: kosong → default (lewat ||); URL rusak/menggantung → default (lewat onError).
    const [avatarSrc, setAvatarSrc] = useState(review.user.avatar || DEFAULT_AVATAR);

    // Sinkronkan ulang kalau data avatar berubah (mis. setelah refetch / ganti foto).
    useEffect(() => {
        setAvatarSrc(review.user.avatar || DEFAULT_AVATAR);
    }, [review.user.avatar]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenReport = () => {
        setMenuOpen(false);
        // Lapor ulasan butuh login (anti-spam & bisa dipertanggungjawabkan).
        if (!user) {
            router.push("/login");
            return;
        }
        setReportModalOpen(true);
    };

    return (
        <div className={`relative shadow-sm rounded-2xl p-4 sm:p-5 border hover:shadow-md transition-shadow ${
            isOwner
                ? 'bg-green-50/50 border-green-200 ring-1 ring-green-100'
                : 'bg-white border-gray-200'
        }`}>
            {/* Top-right: owner badge or report menu */}
            {isOwner ? (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                    <BsPatchCheckFill size={12} />
                    {t("yourReview")}
                </span>
            ) : (
                <div className="absolute right-3 top-3" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label={t("report")}
                    >
                        <FiMoreVertical size={18} className="text-gray-400" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg text-sm overflow-hidden z-10">
                            <button
                                onClick={handleOpenReport}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <FiFlag size={14} />
                                <span>{t("report")}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Header: Avatar + Name + Rating + Time */}
            <div className={`flex items-start gap-3 ${isOwner ? "pr-24" : "pr-10"}`}>
                {review.isPublic ? (
                    <Image
                        src={avatarSrc}
                        alt="User Avatar"
                        onError={() => setAvatarSrc(DEFAULT_AVATAR)}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                        width={40}
                        height={40}
                    />
                ) : (
                    <FaUserCircle className="w-10 h-10 text-gray-300" />
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                        {review.user.name && (
                            <p className={`font-semibold text-sm ${isOwner ? 'text-green-800' : 'text-gray-900'}`}>
                                {review.isPublic
                                    ? review.user.name
                                    : maskFirstLast(review.user.name)}
                            </p>
                        )}
                        {review.createdAt && (
                            <span className="text-xs text-gray-400">
                                {getTimeDifference(review.createdAt)}
                            </span>
                        )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <RatingStars
                            value={review.rating}
                            className="flex gap-0.5 text-yellow-400 text-sm"
                        />
                        {review.updatedAt > review.createdAt && (
                            <span className="text-xs text-gray-400 italic">
                                {t("edited")}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Content */}
            {review.review && (
                <p className="mt-3 text-gray-700 text-sm leading-relaxed">
                    {review.review}
                </p>
            )}

            <ReportReviewModal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                reviewId={review.id}
            />
        </div>
    );
}
