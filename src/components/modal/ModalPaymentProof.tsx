"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import Image from "next/image";
import { PaymentMethod } from "@/enum/paymentMethod";
import { useAddPayment, usePayment } from "@/satelite/services/paymentService";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import ErrorComponent from "../ui/feedback/Error";
import { Payment } from "@/types/payment/payment";
import PaymentProofSkeleton from "../skeletons/PaymentProofSkeleton";
import { BsBank2, BsClipboard, BsCheckLg, BsCloudUpload } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";

type Props = {
    orderId: string;
    paymentMethod?: PaymentMethod;
    totalPrice?: number;
    uniqueCode?: number;
    onClose: () => void;
    refetch: () => void;
};

function CopyButton({ text }: { text: string }) {
    const t = useTranslations("paymentProof");
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            // navigator.clipboard hanya tersedia di secure context (HTTPS/localhost).
            // Kalau via HTTP/IP, pakai fallback execCommand agar tetap bisa menyalin.
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.position = "fixed";
                ta.style.left = "-9999px";
                ta.setAttribute("readonly", "");
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand("copy");
                document.body.removeChild(ta);
                if (!ok) throw new Error("execCommand failed");
            }
            setCopied(true);
            toast.success(t("copiedToClipboard"));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t("copyFailed"));
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition"
        >
            {copied ? <BsCheckLg className="w-3 h-3" /> : <BsClipboard className="w-3 h-3" />}
            {copied ? t("copied") : t("copy")}
        </button>
    );
}

// Modal unggah bukti pembayaran: menampilkan rekening/QRIS tujuan + nominal (termasuk
// kode unik), lalu pelanggan mengunggah foto bukti transfer untuk diverifikasi admin.
export default function ModalPaymentProof({
    orderId,
    paymentMethod,
    totalPrice,
    uniqueCode,
    onClose,
    refetch
}: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [inputKey, setInputKey] = useState(0);
    const [qrisZoom, setQrisZoom] = useState(false);
    const [previewZoom, setPreviewZoom] = useState(false);
    const t = useTranslations("paymentProof");

    useScrollLock(true);

    // --- Drag bottom-sheet (mobile), tarik header/handle ke bawah untuk menutup ---
    const [isMobile, setIsMobile] = useState(false);
    const [viewportH, setViewportH] = useState(0);
    const [translateY, setTranslateY] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const currentTranslateRef = useRef(0);
    const dragStartRef = useRef<{ startY: number; startTranslate: number } | null>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const hasEnteredRef = useRef(false);
    const onCloseRef = useRef(onClose);
    const isPendingRef = useRef(false);

    useEffect(() => {
        const update = () => {
            setIsMobile(window.innerWidth < 640);
            setViewportH(window.innerHeight);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // JS-driven entrance (mobile): posisikan off-screen lalu slide ke 0,
    // tanpa CSS animation supaya tidak bentrok dengan sistem drag/transition.
    useEffect(() => {
        if (!isMobile || hasEnteredRef.current) return;
        hasEnteredRef.current = true;
        const ih = window.innerHeight;
        setIsDragging(true);
        setTranslateY(ih);
        currentTranslateRef.current = ih;
        const id = window.setTimeout(() => {
            setIsDragging(false);
            setTranslateY(0);
            currentTranslateRef.current = 0;
        }, 30);
        return () => window.clearTimeout(id);
    }, [isMobile]);

    // Pull-to-dismiss dari area konten (body): hanya aktif saat scroll di paling
    // atas dan ditarik ke bawah, supaya geser-tutup juga bisa dari tengah modal.
    useEffect(() => {
        const el = bodyRef.current;
        if (!isMobile || !el) return;

        let state: { startY: number; active: boolean } | null = null;

        const onStart = (e: TouchEvent) => {
            state = { startY: e.touches[0].clientY, active: false };
        };
        const onMove = (e: TouchEvent) => {
            if (!state) return;
            const atTop = el.scrollTop <= 0;
            if (!state.active) {
                const delta = e.touches[0].clientY - state.startY;
                if (atTop && delta > 0) {
                    state.active = true;
                    state.startY = e.touches[0].clientY; // rebase agar sheet mulai dari 0
                    setIsDragging(true);
                } else {
                    return; // biarkan body scroll seperti biasa
                }
            }
            let next = e.touches[0].clientY - state.startY;
            if (next < 0) next = 0;
            e.preventDefault(); // hentikan scroll bawaan selagi menyeret sheet
            currentTranslateRef.current = next;
            if (sheetRef.current) sheetRef.current.style.transform = `translateY(${next}px)`;
        };
        const onEnd = () => {
            if (state?.active) {
                setIsDragging(false);
                const cur = currentTranslateRef.current;
                if (cur > window.innerHeight * 0.25 && !isPendingRef.current) {
                    onCloseRef.current(); // ditarik turun cukup jauh → tutup
                } else {
                    setTranslateY(0); // jentik kembali ke posisi penuh (atau saat sedang mengirim)
                    currentTranslateRef.current = 0;
                    if (sheetRef.current) {
                        sheetRef.current.style.transition = "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
                        sheetRef.current.style.transform = "translateY(0px)";
                    }
                }
            }
            state = null;
        };

        el.addEventListener("touchstart", onStart, { passive: true });
        el.addEventListener("touchmove", onMove, { passive: false });
        el.addEventListener("touchend", onEnd, { passive: true });
        return () => {
            el.removeEventListener("touchstart", onStart);
            el.removeEventListener("touchmove", onMove);
            el.removeEventListener("touchend", onEnd);
        };
    }, [isMobile]);

    const beginDrag = (clientY: number) => {
        if (!isMobile) return;
        setIsDragging(true);
        dragStartRef.current = { startY: clientY, startTranslate: currentTranslateRef.current };
    };

    const moveDrag = (clientY: number) => {
        if (!isMobile || !dragStartRef.current) return;
        let next = dragStartRef.current.startTranslate + (clientY - dragStartRef.current.startY);
        if (next < 0) next = 0; // kunci di batas penuh, tidak boleh ditarik ke atas (biar dasar sheet tetap nempel)
        currentTranslateRef.current = next;
        // Update DOM langsung, tanpa re-render React selama drag
        if (sheetRef.current) sheetRef.current.style.transform = `translateY(${next}px)`;
    };

    const endDrag = () => {
        if (!isMobile || !dragStartRef.current) return;
        dragStartRef.current = null;
        setIsDragging(false);
        const cur = currentTranslateRef.current;
        if (cur > window.innerHeight * 0.25 && !isPendingRef.current) {
            onClose(); // ditarik turun cukup jauh → tutup
        } else {
            setTranslateY(0); // jentik kembali ke posisi penuh (atau saat sedang mengirim)
            currentTranslateRef.current = 0;
            // Set transform imperatif juga, kalau state sudah 0, React melewati
            // update sehingga sheet bisa macet di posisi terakhir drag.
            if (sheetRef.current) {
                sheetRef.current.style.transition = "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
                sheetRef.current.style.transform = "translateY(0px)";
            }
        }
    };

    const SHEET_VH = 0.92;
    const sheetStyle: CSSProperties = isMobile
        ? {
            height: (viewportH || window.innerHeight) * SHEET_VH,
            transform: translateY !== null ? `translateY(${translateY}px)` : undefined,
            transition: isDragging ? "none" : "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
            willChange: "transform",
        }
        : {};

    const filters = { page: 1, limit: 100 };
    const { mutate: createPayment, isPending } = useAddPayment();
    const { data, isPending: isPendingPayment, isError } = usePayment(filters);

    // Cegah menutup modal selagi pembayaran sedang dikirim, supaya tidak terkirim ganda.
    const handleClose = () => {
        if (isPending) return;
        onClose();
    };
    onCloseRef.current = handleClose;
    isPendingRef.current = isPending;

    const payments: Payment[] = data?.data?.data ?? [];

    const bankAccounts = payments.filter(
        (payment) => payment.qrisMedia == null || payment.qrisMedia.url == null
    );

    const qrisAccount = payments.find(
        (payment) => payment.qrisMedia != null && payment.qrisMedia.url != null
    );
    const qrisImageUrl = qrisAccount?.qrisMedia?.url ?? "/images/qris.png";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        setFile(selected);
        if (selected) {
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target?.result as string);
            reader.readAsDataURL(selected);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = () => {
        if (isPending) return; // sudah ada pengiriman berjalan, abaikan klik ganda
        if (!file) {
            toast.error(t("fileRequired"));
            return;
        }
        createPayment(
            { orderId, file },
            {
                onSuccess: () => {
                    toast.success(t("success"));
                    refetch();
                    onClose();
                },
                onError: (error: unknown) => {
                    const message =
                        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "";
                    // Server menolak karena bukti sudah dikirim/sudah dibayar →
                    // sinkronkan status lalu tutup, bukan tampilkan "gagal".
                    if (message.includes("already been submitted") || message.includes("already been paid")) {
                        toast.info(t("alreadySubmitted"));
                        refetch();
                        onClose();
                        return;
                    }
                    // Error lain (jaringan/upload) → biarkan modal terbuka untuk kirim ulang.
                    toast.error(t("failed"));
                },
            }
        );
    };

    if (isError) return <ErrorComponent />;

    const portal = createPortal(
        <div className="fixed inset-x-0 top-0 h-[100dvh] z-[60] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 animate-backdrop-in">
            <div
                ref={sheetRef}
                style={sheetStyle}
                className="flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl bg-gray-50 shadow-2xl sm:max-h-[94vh] overflow-hidden sm:animate-zoom-in"
            >

                {/* Grab zone, tarik untuk menutup di mobile */}
                <div
                    className="shrink-0 touch-none select-none"
                    onTouchStart={(e) => beginDrag(e.touches[0].clientY)}
                    onTouchMove={(e) => moveDrag(e.touches[0].clientY)}
                    onTouchEnd={endDrag}
                >
                    {/* Drag handle, bottom-sheet affordance (mobile only) */}
                    <div className="sm:hidden flex justify-center bg-white pt-3 pb-2">
                        <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                    </div>

                    {/* Header */}
                    <div className="relative flex items-center justify-center bg-white px-5 pt-3 pb-4 sm:pt-6 sm:pb-5 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-green-700 text-center">
                            {paymentMethod === PaymentMethod.QRIS ? t("qrisTitle") : t("bankTitle")}
                        </h3>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isPending}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Close"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 sm:px-6 py-5 space-y-5">
                    {isPendingPayment ? (
                        <PaymentProofSkeleton paymentMethod={paymentMethod} bankAccountCount={2} />
                    ) : (
                        <>
                            {/* Nominal */}
                            {totalPrice != null && totalPrice > 0 && (
                                <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                                    <p className="text-xs text-emerald-700 font-medium mb-1">{t("amountLabel")}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-2xl font-extrabold text-emerald-700">
                                            Rp {Number(totalPrice).toLocaleString("id-ID")}
                                        </p>
                                        <CopyButton text={String(totalPrice)} />
                                    </div>
                                    {uniqueCode != null && uniqueCode > 0 && (
                                        <p className="text-xs text-emerald-600 mt-2 leading-relaxed italic">
                                            {t("uniqueCodeNotice", { code: uniqueCode })}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* QRIS */}
                            {paymentMethod === PaymentMethod.QRIS && qrisImageUrl && (
                                <div className="flex justify-center">
                                    <div
                                        className="group relative rounded-2xl border border-gray-100 shadow-sm p-3 bg-white inline-block cursor-pointer overflow-hidden"
                                        onClick={() => setQrisZoom(true)}
                                    >
                                        <Image
                                            src={qrisImageUrl}
                                            alt={t("qrisAlt")}
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            className="w-auto max-h-64 object-contain rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <span className="text-white text-sm font-semibold drop-shadow">Klik untuk memperbesar</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bank Transfer */}
                            {paymentMethod === PaymentMethod.BANK_TRANSFER && (
                                <div className="grid gap-3">
                                    {bankAccounts.length === 0 ? (
                                        <p className="text-sm text-gray-500">{t("noBankAccount")}</p>
                                    ) : (
                                        bankAccounts.map((account) => (
                                            <div key={account.id} className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                                        <BsBank2 className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <span className="font-bold text-gray-800">{account.bankName}</span>
                                                </div>
                                                <div className="h-px bg-gray-100" />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-400 mb-0.5">{t("accountNumber")}</p>
                                                        <p className="text-base font-bold text-gray-800 tracking-wider">{account.bankAccountNumber}</p>
                                                    </div>
                                                    <CopyButton text={account.bankAccountNumber} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-0.5">{t("accountName")}</p>
                                                    <p className="text-sm font-semibold text-gray-700">{account.accountHolder}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Upload bukti */}
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700">{t("uploadLabel")}</p>
                                <label
                                    onClick={(e) => { if (preview) e.preventDefault(); }}
                                    className={`relative flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed transition ${preview ? "cursor-default border-emerald-400 bg-emerald-50" : "cursor-pointer border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"}`}
                                >
                                    {preview ? (
                                        <>
                                            {/* X di pojok kanan atas kotak dashed */}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); setInputKey(k => k + 1); }}
                                                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white shadow border border-gray-200 text-red-400 hover:bg-red-50 hover:text-red-500 transition"
                                            >
                                                <FaTimes size={11} />
                                            </button>
                                            <div className="w-full p-3 pt-7">
                                                <div className="flex justify-center">
                                                    {/* Klik gambar untuk lihat bukti yang akan dikirim */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); setPreviewZoom(true); }}
                                                        className="group relative block cursor-zoom-in"
                                                        aria-label={t("viewProof")}
                                                    >
                                                        <Image
                                                            src={preview}
                                                            alt="Preview"
                                                            width={400}
                                                            height={300}
                                                            className="max-h-48 w-auto rounded-xl object-contain"
                                                        />
                                                        <span className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition">
                                                            <span className="text-white text-xs font-semibold drop-shadow">{t("viewProof")}</span>
                                                        </span>
                                                    </button>
                                                </div>
                                                <p className="text-center text-xs text-emerald-600 font-medium mt-2">{file?.name}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-8 flex flex-col items-center gap-2">
                                            <BsCloudUpload className="w-8 h-8 text-gray-400" />
                                            <p className="text-sm text-gray-500 font-medium">{t("uploadLabel")}</p>
                                            <p className="text-xs text-gray-400">PNG, JPG, JPEG</p>
                                        </div>
                                    )}
                                    <input key={inputKey} type="file" accept="image/*" onChange={handleFileChange} className="hidden" aria-label={t("uploadLabel")} />
                                </label>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-gray-100 bg-white px-4 py-3 shrink-0">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isPending}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!file || isPending}
                        className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending && (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {isPending ? t("uploading") : t("submit")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );

    return (
        <>
            {portal}
            {qrisZoom && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                    onClick={() => setQrisZoom(false)}
                >
                    <button
                        type="button"
                        onClick={() => setQrisZoom(false)}
                        className="fixed top-4 right-4 z-[10000] bg-white text-red-500 hover:bg-red-50 rounded-full p-2.5 shadow-xl transition"
                        aria-label="Close"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                    <div
                        className="relative w-[90vw] h-[90vh] max-w-[1200px] max-h-[900px]"
                        onClick={e => e.stopPropagation()}
                    >
                        <Image
                            src={qrisImageUrl}
                            alt={t("qrisAlt")}
                            fill
                            className="object-contain drop-shadow-2xl"
                            sizes="90vw"
                        />
                    </div>
                </div>,
                document.body
            )}

            {/* Pratinjau bukti yang akan dikirim */}
            {previewZoom && preview && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                    onClick={() => setPreviewZoom(false)}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewZoom(false)}
                        className="fixed top-4 right-4 z-[10000] bg-white text-red-500 hover:bg-red-50 rounded-full p-2.5 shadow-xl transition"
                        aria-label="Close"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                    <div
                        className="relative w-[90vw] h-[85vh] max-w-[900px]"
                        onClick={e => e.stopPropagation()}
                    >
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-contain drop-shadow-2xl"
                            sizes="90vw"
                            unoptimized
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
