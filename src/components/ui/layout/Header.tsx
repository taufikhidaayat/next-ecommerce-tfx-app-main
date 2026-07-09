"use client"

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCoins } from "react-icons/fa";
import { HiClipboardList } from "react-icons/hi";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/client/axios-client";
import { useAuth } from "@/satelite/services/authService";
import { useUser } from "@/satelite/services/userService";
import { usePointBalance } from "@/satelite/services/pointService";
import UserHeaderSkeleton from "@/components/skeletons/UserHeaderSkeleton";
import ProfileMenuDropdown from "./ProfileMenuDropdown";
import CartModal from "@/components/modal/Cart";
import ConfirmModal from "@/components/modal/ConfirmModal";
import CartMenu from "./CartMenu";
import { useSearch } from "@/satelite/services/searchService";
import SearchModalBox from "@/components/modal/SearchModalBox";
import SearchBar from "./SearchBar";
import { useTranslations } from "next-intl";
import AnnouncementBar from "./AnnouncementBar";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ onHeightChange }: { onHeightChange?: (h: number) => void }) {
    const t = useTranslations("header");
    const headerRef = useRef<HTMLElement>(null);
    const tBtn = useTranslations("button");
    const tMenu = useTranslations("profileMenu");
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [hideTopRow, setHideTopRow] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const handleRequestLogout = () => {
        setIsProfileMenuOpen(false);
        setShowLogoutConfirm(true);
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await apiClient.post("/user/logout", {}, { withCredentials: true });
            queryClient.removeQueries({ queryKey: ["profile"] });
            queryClient.removeQueries({ queryKey: ["user"] });
            toast.success(tMenu("logoutSuccess"));
            setShowLogoutConfirm(false);
            router.push("/login");
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const [q, setQ] = useState("");
    const [debouncedQ, setDebouncedQ] = useState(q);
    const desktopSearchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const isUserTyping = useRef(false);

    // Sync input navbar dengan URL ?search= (misal saat user klik "Hapus Pencarian")
    useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        isUserTyping.current = false;
        setQ(urlSearch);
    }, [searchParams]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQ(q);
        }, 300);

        return () => clearTimeout(handler);
    }, [q]);

    // Bungkus setQ agar dropdown suggestion hanya muncul saat user aktif mengetik
    const handleSetQ = useCallback((val: string) => {
        isUserTyping.current = true;
        setQ(val);
    }, []);

    const { data: user, isLoading } = useAuth();
    const { data: userProfile } = useUser({ enabled: !!user });
    const avatarUrl = userProfile?.data?.profileImageUrl || "/images/default-profile.png";
    const { data: search, isPending } = useSearch({ q: debouncedQ });
    const { data: pointData } = usePointBalance();
    const pointBalance = pointData?.data?.points ?? 0;

    // Ingat status login dari kunjungan sebelumnya. Saat refresh, cache auth
    // kosong sehingga status belum diketahui sesaat — tanpa tebakan ini, user
    // yang sudah login akan melihat tombol "Masuk/Daftar" berkedip dulu.
    // null = belum dibaca (render awal/SSR), true/false = hasil kunjungan lalu.
    const [prevLoggedIn, setPrevLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        try {
            setPrevLoggedIn(localStorage.getItem("tl_logged_in") === "1");
        } catch {
            setPrevLoggedIn(false);
        }
    }, []);

    // Simpan status login aktual setiap kali auth selesai dicek.
    useEffect(() => {
        if (isLoading) return;
        try {
            localStorage.setItem("tl_logged_in", user ? "1" : "0");
        } catch { /* localStorage tidak tersedia — abaikan */ }
    }, [user, isLoading]);

    // Tentukan tampilan area auth di header:
    // - "loggedin": sudah pasti login → avatar & poin
    // - "guest": sudah pasti belum login (auth selesai, atau kunjungan lalu guest) → tombol Masuk
    // - "pending": belum tahu & kemungkinan login → skeleton (bukan tombol Masuk, agar tak berkedip)
    const authView: "loggedin" | "guest" | "pending" = user
        ? "loggedin"
        : !isLoading || prevLoggedIn === false
            ? "guest"
            : "pending";

    useEffect(() => {
        if (!isProfileMenuOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setIsProfileMenuOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isProfileMenuOpen]);

    useEffect(() => {
        document.body.classList.toggle("overflow-hidden", isCartOpen);
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [isCartOpen]);

    useEffect(() => {
        if (!isUserTyping.current) {
            setIsSearchOpen(false);
            return;
        }
        setIsSearchOpen(q.trim().length > 0);
    }, [q]);

    const rowRef = useRef<HTMLDivElement>(null);
    const accRef = useRef(0);
    const rowHeightRef = useRef(0);
    const snapTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const fullyHiddenRef = useRef(false);
    // Tinggi dokumen terakhir. Bila berubah di antara dua event scroll, geseran
    // scrollY itu berasal dari layout shift (mis. gambar produk selesai dimuat di
    // atas viewport → scroll anchoring), bukan scroll pengguna → jangan animasikan
    // header agar tidak "kedip".
    const lastScrollHeightRef = useRef(0);

    const measureRow = useCallback(() => {
        const el = rowRef.current;
        if (!el) return 0;
        const h = el.scrollHeight;
        if (h > 0) {
            rowHeightRef.current = h;
            el.style.height = `${h}px`;
        }
        return rowHeightRef.current;
    }, []);

    const applyRowHeight = useCallback((hidden: number) => {
        const el = rowRef.current;
        const rowHeight = rowHeightRef.current;
        if (!el || rowHeight === 0) return;
        const h = Math.max(0, rowHeight - hidden);
        el.style.height = `${h}px`;
        el.style.opacity = `${1 - hidden / rowHeight}`;
    }, []);

    // Ukur tinggi Row 1 saat mount DAN setiap kali isinya berubah karena status
    // login (skeleton → tombol login / ikon profil). Tanpa re-measure, baseline
    // animasi scroll memakai tinggi skeleton yang basi → header "gerak-gerak"
    // (terutama saat belum login, tinggi tombol login beda dari skeleton).
    useEffect(() => {
        const raf = requestAnimationFrame(() => measureRow());
        return () => cancelAnimationFrame(raf);
    }, [measureRow, user, isLoading]);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        lastScrollHeightRef.current = document.documentElement.scrollHeight;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Lazy measure jika belum terukur
            if (rowHeightRef.current === 0) measureRow();
            const rowHeight = rowHeightRef.current;
            if (rowHeight === 0) return;

            // Di paling atas: SELALU tampilkan Row 1 penuh. Cek ini didahulukan agar
            // tidak ikut ter-skip oleh penjaga layout-shift di bawah — kalau ter-skip,
            // Row 1 bisa nyangkut tersembunyi saat scroll ke atas berbarengan dengan
            // gambar yang baru selesai dimuat.
            if (currentScrollY <= 0) {
                accRef.current = 0;
                applyRowHeight(0);
                lastScrollY = currentScrollY;
                lastScrollHeightRef.current = document.documentElement.scrollHeight;
                return;
            }

            // Abaikan event scroll yang disebabkan layout shift (tinggi dokumen
            // berubah), mis. gambar produk selesai dimuat → scroll anchoring
            // menggeser scrollY tanpa pengguna benar-benar men-scroll.
            const currentScrollHeight = document.documentElement.scrollHeight;
            if (currentScrollHeight !== lastScrollHeightRef.current) {
                lastScrollHeightRef.current = currentScrollHeight;
                lastScrollY = currentScrollY;
                return;
            }

            const delta = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;

            // Saat sudah mentok di paling bawah (atau overscroll/bounce di mobile),
            // jangan proses delta. Tinggi header yang berubah ⇄ paddingTop konten
            // menggeser scrollY di batas bawah → memicu loop "kejang-kejang".
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (currentScrollY >= maxScroll - 2) return;

            accRef.current = Math.max(0, Math.min(rowHeight, accRef.current + delta));
            applyRowHeight(accRef.current);

            const isFullyHidden = accRef.current >= rowHeight;
            if (isFullyHidden !== fullyHiddenRef.current) {
                fullyHiddenRef.current = isFullyHidden;
                if (isFullyHidden) {
                    setHideTopRow(true);
                    setIsProfileMenuOpen(false);
                } else {
                    setHideTopRow(false);
                }
            }

            clearTimeout(snapTimerRef.current);
            snapTimerRef.current = setTimeout(() => {
                const fraction = accRef.current / rowHeight;
                const snapTo = fraction > 0.5 ? rowHeight : 0;
                accRef.current = snapTo;
                const el = rowRef.current;
                if (el) {
                    el.style.transition = "height 180ms ease-out, opacity 180ms ease-out";
                    applyRowHeight(snapTo);
                    setTimeout(() => { if (el) el.style.transition = ""; }, 180);
                }
                fullyHiddenRef.current = snapTo > 0;
                setHideTopRow(snapTo > 0);
                if (snapTo === 0) setIsProfileMenuOpen(false);
            }, 150);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(snapTimerRef.current);
        };
    }, [applyRowHeight, measureRow]);

    // Saat dropdown profil/bahasa terbuka, Row 1 (mobile) tidak boleh meng-clip-nya
    // — .header-row-animated punya overflow:hidden + tinggi fixed — dan harus
    // menumpuk di atas baris pencarian di bawahnya. Dipulihkan saat menu ditutup.
    useEffect(() => {
        const el = rowRef.current;
        if (!el) return;
        const menuOpen = isProfileMenuOpen || isLangOpen;
        el.style.overflow = menuOpen ? "visible" : "";
        el.style.position = menuOpen ? "relative" : "";
        el.style.zIndex = menuOpen ? "30" : "";
    }, [isProfileMenuOpen, isLangOpen]);

    useEffect(() => {
        if (!headerRef.current || !onHeightChange) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                onHeightChange(entry.contentRect.height);
            }
        });

        observer.observe(headerRef.current);
        onHeightChange(headerRef.current.offsetHeight);

        return () => observer.disconnect();
    }, [onHeightChange]);

    return (
        <header ref={headerRef} className="bg-green-900 text-white fixed top-0 left-0 w-full z-50">
            <div className="bg-white text-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-3 md:py-6 flex justify-between items-center">
                    {/* DESKTOP/TABLET */}
                    <div className="w-full justify-between items-center hidden md:flex">
                        {/* Logo */}
                        <div className="flex items-center space-x-2 mr-2">
                            <Link href="/">
                                <Image
                                    src="/images/logotoko.png"
                                    alt={t("logoAlt")}
                                    width={39}
                                    height={32}
                                    className="h-8 w-auto object-contain cursor-pointer transition-opacity hover:opacity-80 -mt-1"
                                />
                            </Link>
                            <Link href="/" className="flex items-center pl-2">
                                <Image
                                    src="/images/icon_texttoko.png"
                                    alt="Toko Langgananku"
                                    width={366}
                                    height={36}
                                    className="h-5 w-auto object-contain cursor-pointer transition-opacity hover:opacity-80"
                                    priority
                                />
                            </Link>
                        </div>
                        {/* Search Bar */}
                        <div
                            className="flex-grow mx-4 relative"
                            ref={desktopSearchRef}
                        >
                            <SearchBar
                                query={q}
                                setQuery={handleSetQ}
                                onClose={() => setIsSearchOpen(false)}
                            />
                            <SearchModalBox
                                isOpen={isSearchOpen}
                                onClose={() => setIsSearchOpen(false)}
                                q={q}
                                isPending={isPending}
                                searchBoxRef={desktopSearchRef}
                                data={search?.data ?? { brands: [], categories: [], products: [] }}
                            />
                        </div>
                        {/* Icons */}
                        <div className="flex items-center space-x-2 ml-4">
                            <LanguageSwitcher />
                            {authView === "pending" ? (
                                <UserHeaderSkeleton />
                            ) : user ? (
                                <>
                                    <Link href="/profile/points" className="relative group">
                                        <div
                                            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-500 hover:via-yellow-500 hover:to-orange-500 text-white px-3 py-1.5 rounded-full shadow-sm transition cursor-pointer"
                                            aria-label={t("points")}
                                        >
                                            <FaCoins className="w-4 h-4" />
                                            <span className="font-semibold text-sm">
                                                {pointBalance.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
                                            {t("points")}
                                            <span className="absolute left-1/2 -translate-x-1/2 -top-1 h-2 w-2 rotate-45 bg-gray-800" />
                                        </span>
                                    </Link>
                                    <CartMenu onOpenCart={() => setIsCartOpen(true)} />
                                    <Link href="/orders" className="relative group">
                                        <button
                                            className="p-1.5 bg-[#0B4540] rounded-full hover:bg-[#0a5b54] focus:outline-none transition duration-300"
                                            aria-label={t("orders")}
                                        >
                                            <HiClipboardList className="text-white text-xl" />
                                        </button>
                                        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
                                            {t("orders")}
                                            <span className="absolute left-1/2 -translate-x-1/2 -top-1 h-2 w-2 rotate-45 bg-gray-800" />
                                        </span>
                                    </Link>
                                    <div
                                        className="relative inline-block group"
                                        ref={profileMenuRef}
                                    >
                                        <button
                                            className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-200 focus:outline-none transition"
                                            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                                            aria-label={tBtn("profile")}
                                        >
                                            <Image
                                                src={avatarUrl}
                                                alt={tBtn("profile")}
                                                width={36}
                                                height={36}
                                                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
                                            />
                                        </button>
                                        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
                                            {tBtn("profile")}
                                            <span className="absolute left-1/2 -translate-x-1/2 -top-1 h-2 w-2 rotate-45 bg-gray-800" />
                                        </span>
                                        {isProfileMenuOpen && (
                                            <ProfileMenuDropdown
                                                onCloseMenu={() => setIsProfileMenuOpen(false)}
                                                onRequestLogout={handleRequestLogout}
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <Link href="/login">
                                        <button className="px-4 py-1.5 text-sm text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition">
                                            {tBtn("login")}
                                        </button>
                                    </Link>
                                    <Link href="/register">
                                        <button className="px-4 py-1.5 text-sm text-emerald-600 border border-emerald-600 rounded-full hover:bg-emerald-50 transition">
                                            {tBtn("register")}
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MOBILE */}
                    <div className="w-full flex flex-col md:hidden">
                        {/* Row 1: Logo + actions — hides on scroll down */}
                        <div ref={rowRef} className="header-row-animated">
                        <div className={`min-h-0 ${(isProfileMenuOpen || isLangOpen) ? "" : "overflow-hidden"}`}>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                            <Link href="/" className="flex min-w-0 shrink items-center gap-2 pl-0.5" aria-label={t("logoAlt")}>
                                <Image
                                    src="/images/logotoko.png"
                                    alt={t("logoAlt")}
                                    width={39}
                                    height={32}
                                    className="h-6 w-auto shrink-0 object-contain -mt-1"
                                    priority
                                />
                                <div className="overflow-hidden min-w-0">
                                    <Image
                                        src="/images/icon_texttoko.png"
                                        alt="Toko Langgananku"
                                        width={366}
                                        height={36}
                                        className="h-4 w-auto object-contain"
                                        priority
                                    />
                                </div>
                            </Link>

                            <div className="flex shrink-0 items-center gap-1.5">
                                <LanguageSwitcher onOpenChange={setIsLangOpen} forceClose={hideTopRow} />
                                {authView === "pending" ? (
                                    <UserHeaderSkeleton />
                                ) : user ? (
                                    <>
                                        <Link
                                            href="/profile/points"
                                            className="flex items-center gap-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-500 hover:via-yellow-500 hover:to-orange-500 text-white px-2.5 py-1.5 rounded-full shadow-sm transition"
                                            aria-label={t("points")}
                                        >
                                            <FaCoins className="w-3.5 h-3.5" />
                                            <span className="font-semibold text-xs">
                                                {pointBalance.toLocaleString("id-ID")}
                                            </span>
                                        </Link>
                                        <div className="relative inline-block" ref={profileMenuRef}>
                                            <button
                                                className="flex items-center justify-center p-1 rounded-full hover:bg-gray-200 focus:outline-none transition"
                                                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                                                aria-label={tBtn("profile")}
                                            >
                                                <Image
                                                    src={avatarUrl}
                                                    alt={tBtn("profile")}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                                                />
                                            </button>
                                            {isProfileMenuOpen && (
                                                <ProfileMenuDropdown
                                                onCloseMenu={() => setIsProfileMenuOpen(false)}
                                                onRequestLogout={handleRequestLogout}
                                            />
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <Link href="/login">
                                        <button className="px-4 py-1.5 text-sm text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition">
                                            {tBtn("login")}
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                        </div>
                        </div>

                        {/* Row 2: full-width search */}
                        <div className="relative" ref={mobileSearchRef}>
                            <SearchBar
                                query={q}
                                setQuery={handleSetQ}
                                onClose={() => setIsSearchOpen(false)}
                            />
                            <SearchModalBox
                                isOpen={isSearchOpen}
                                onClose={() => setIsSearchOpen(false)}
                                q={q}
                                isPending={isPending}
                                searchBoxRef={mobileSearchRef}
                                data={search?.data ?? { brands: [], categories: [], products: [] }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Announcement Bar */}
            <AnnouncementBar />

            {/* Cart Modal */}
            {isCartOpen &&
                <CartModal
                    onClose={() => setIsCartOpen(false)}
                    isCartOpen={isCartOpen}
                />
            }

            {/* Logout Confirmation */}
            <ConfirmModal
                open={showLogoutConfirm}
                loading={isLoggingOut}
                title={tMenu("logoutConfirmTitle")}
                message={tMenu("logoutConfirmMessage")}
                confirmButtonText={tMenu("logoutConfirmButton")}
                confirmVariant="danger"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </header>
    );
}
