'use client';

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

// Footer toko: info toko, tautan, dan hak cipta di bagian bawah halaman.
export default function Footer() {
    const t = useTranslations("footer");
    const currentYear = new Date().getFullYear();

    return (
        <footer className="max-w-7xl mx-auto bg-green-900 text-white rounded-t-3xl mt-8 sm:mt-12 -mb-4">
            <div className="mx-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

                    {/* Brand / About */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <Image
                                src="/images/logotoko.png"
                                alt="Logo"
                                width={48}
                                height={40}
                                className="h-10 w-auto object-contain brightness-0 invert opacity-90"
                            />
                        </Link>
                        <p className="text-sm text-green-200 leading-relaxed max-w-xs">
                            {t("description")}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-green-300 mb-4">
                            {t("quickLinks")}
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { href: "/products", label: t("products") },
                                { href: "/categories", label: t("categories") },
                                { href: "/brands", label: t("brands") },
                                { href: "/orders", label: t("orders") },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="relative text-sm text-green-200 hover:text-white transition-colors duration-200 inline-flex items-center group"
                                    >
                                        <span className="absolute -left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-green-300 mb-4">
                            {t("support")}
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { href: "/#faqs", label: t("faq") },
                                { href: "https://instagram.com/galeri_maduku", label: t("emailSupport") },
                                { href: "/profile", label: t("profile") },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="relative text-sm text-green-200 hover:text-white transition-colors duration-200 inline-flex items-center group"
                                    >
                                        <span className="absolute -left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-green-300 mb-4">
                            {t("contactUs")}
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                {/* Tombol WhatsApp, full-width di mobile. Lift dipasang di <span>
                                    bagian dalam (bukan <a>) supaya area hover tetap diam → halus, tanpa jitter. */}
                                <a
                                    href={`https://wa.me/${t("contactPhone").replace(/\D/g, "").replace(/^0/, "62")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block w-full sm:inline-block sm:w-auto"
                                >
                                    <span className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-green-900 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-active:scale-95">
                                        <FaWhatsapp className="w-5 h-5 text-[#25D366] transition-transform duration-200 group-hover:scale-110" />
                                        {t("chatAdmin")}
                                    </span>
                                </a>
                            </li>
                            <li className="flex items-start justify-center sm:justify-start gap-2.5 text-sm text-green-200">
                                <FiMapPin className="flex-shrink-0 w-4 h-4 text-green-400 mt-0.5" />
                                <span>{t("contactAddress")}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider & Copyright */}
                <div className="border-t border-green-800 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-green-400">
                        {t("copyright", { year: currentYear.toString() })}
                    </p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                        {t("madeWith")} Yogyakarta
                    </p>
                </div>
            </div>
        </footer>
    );
}
