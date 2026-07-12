import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PaymentMethod } from "@/enum/paymentMethod";
import { FaQrcode, FaUniversity, FaLock, FaTimes, FaSearchPlus } from "react-icons/fa";
import { Order } from "@/types/order/order";
import ConfirmModal from "@/components/modal/ConfirmModal";
import { useUpdatePaymentMethod } from "@/satelite/services/orderService";
import { toast } from "react-toastify";
import { formatWaitTime } from "@/utils/formatWaitTime";
import { Payment } from "@/types/order/payment";
import Image from "next/image";
import { PaymentStatus } from "@/enum/paymentStatus";
import { FiXCircle, FiClock } from "react-icons/fi";
import { useTranslations } from "next-intl";

type Props = {
  order: Order;
  payment: Payment;
  refetch: () => void;
  confirmModalOpen: boolean;
  setConfirmModalOpen: (show: boolean) => void;
};

// Info pembayaran di halaman detail order: metode bayar, status, bukti transfer,
// dan opsi mengganti metode bayar (bila masih boleh) atau membatalkan pesanan.
export default function PaymentInformation({ order, payment, refetch, confirmModalOpen, setConfirmModalOpen }: Props) {
  const t = useTranslations("orderDetail.payment");

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    order.paymentMethod || PaymentMethod.BANK_TRANSFER
  );
  const [pendingMethod, setPendingMethod] = useState<PaymentMethod | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(order.waitSeconds || 0);
  const [proofZoom, setProofZoom] = useState(false);

  const isUnpaid = order.paymentStatus === PaymentStatus.UNPAID;
  const isCancelled = order.paymentStatus === PaymentStatus.CANCELLED;
  const isWaitingConfirmation = order.paymentStatus === PaymentStatus.PENDING;
  const isPaid = order.paymentStatus === PaymentStatus.CONFIRMED;

  // Sudah mengganti metode 3x → terkunci ke pilihan terakhir.
  const reachedLimit = order.paymentMethodUpdateCount >= 3;
  // Masih dalam masa tunggu antar-penggantian.
  const inCooldown = waitSeconds > 0 && order.paymentMethodUpdateCount > 0;

  const { mutate: updatePaymentMethod, isPending } = useUpdatePaymentMethod(order.id);

  const handleMethodChange = (method: PaymentMethod) => {
    if (method === selectedMethod) return;
    setPendingMethod(method);
    setConfirmModalOpen(true);
  };

  const handleConfirmChange = async () => {
    if (!pendingMethod) return;

    updatePaymentMethod(
      {
        paymentMethod: pendingMethod,
      },
      {
        onSuccess: () => {
          setSelectedMethod(pendingMethod);
          toast.success(t("toast.success"));
          setConfirmModalOpen(false);
          setPendingMethod(null);
          setWaitSeconds(300);
          refetch();
        },
        onError: () => {
          toast.error(t("toast.error"));
        },
      }
    );
  };

  useEffect(() => {
    if (waitSeconds <= 0) return;

    const interval = setInterval(() => {
      setWaitSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [waitSeconds]);

  const paymentMethods = [
    {
      label: t("method.bankTransfer"),
      value: PaymentMethod.BANK_TRANSFER,
      icon: <FaUniversity className="w-4 h-4 text-purple-600" />,
      iconBg: "bg-purple-100/70",
    },
    {
      label: t("method.qris"),
      value: PaymentMethod.QRIS,
      icon: <FaQrcode className="w-4 h-4 text-pink-600" />,
      iconBg: "bg-pink-100/70",
    },
  ];

  // Gambar bukti pembayaran yang bisa diklik untuk diperbesar.
  const renderProofImage = (proofSrc: string) => (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => setProofZoom(true)}
        className="group relative cursor-zoom-in rounded-lg"
        aria-label={t("viewProof")}
      >
        <Image
          src={proofSrc}
          alt="Payment Proof"
          width={400}
          height={600}
          className="rounded-lg border border-gray-200 shadow object-contain max-h-80"
          style={{ width: "auto", height: "auto" }}
          unoptimized
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/30 opacity-0 group-hover:opacity-100 transition">
          <FaSearchPlus className="w-6 h-6 text-white drop-shadow" />
        </span>
      </button>
    </div>
  );

  return (
    <>
      <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-green-700">{t("title")}</h2>
          <hr className="mt-2 border-gray-200" />
        </div>

        {isCancelled && (
          <div className="flex items-start gap-3 p-4 bg-red-100 border border-red-200 rounded-xl">
            <FiXCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div className="text-sm text-red-800 space-y-1">
              <p className="font-semibold">{t("cancelledTitle")}</p>
              <p>{t("cancelledDesc")}</p>
            </div>
          </div>
        )}

        {isUnpaid && (
          <>
            {/* SELECT PAYMENT METHOD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {paymentMethods.map((method) => {
                const isThisSelected = selectedMethod === method.value;
                // Hanya opsi yang TIDAK dipilih yang diredam saat terkunci/cooldown,
                // pilihan aktif tetap menonjol.
                const isDisabled = !isThisSelected && (reachedLimit || inCooldown);

                return (
                  <button
                    type="button"
                    key={method.value}
                    disabled={isDisabled}
                    aria-pressed={isThisSelected}
                    onClick={() => handleMethodChange(method.value)}
                    className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-2xl border backdrop-blur-xl text-left transition-all duration-200
                      ${isThisSelected
                        ? "border-green-500/50 bg-green-50/70 shadow-md shadow-green-600/10 ring-1 ring-green-500/20"
                        : isDisabled
                          ? "border-gray-200/60 bg-gray-100/40 opacity-60 cursor-not-allowed"
                          : "border-gray-200/70 bg-white/60 shadow-sm hover:bg-white/90 hover:shadow-md cursor-pointer"
                      }`}
                  >
                    {/* Radio indicator */}
                    <span
                      className={`flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 transition
                        ${isThisSelected ? "border-green-600" : "border-gray-300 group-hover:border-green-500"}`}
                    >
                      {isThisSelected && <span className="w-2 h-2 rounded-full bg-green-600" />}
                    </span>
                    {/* Icon badge */}
                    <span className={`flex items-center justify-center w-7 h-7 rounded-xl shrink-0 backdrop-blur ${isDisabled ? "bg-gray-200/50" : method.iconBg}`}>
                      {method.icon}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{method.label}</span>
                    {isDisabled && <FaLock className="w-3 h-3 text-gray-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* INFO */}
            {reachedLimit ? (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <FaLock className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 font-medium leading-relaxed">{t("limitInfo")}</p>
              </div>
            ) : inCooldown ? (
              <div className="flex items-center justify-between gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                <span className="flex items-center gap-2 text-amber-700">
                  <FiClock className="w-3.5 h-3.5 shrink-0" />
                  {t("waitInfo", { time: formatWaitTime(waitSeconds) })}
                </span>
                <span className="font-semibold text-amber-600 shrink-0">{order.paymentMethodUpdateCount}/3</span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 px-1 text-xs text-gray-500">
                <span className="italic">{t("changeInfo")}</span>
                <span className="font-semibold text-gray-600 shrink-0">{order.paymentMethodUpdateCount}/3</span>
              </div>
            )}
          </>
        )}

        {(isWaitingConfirmation || isPaid) && payment.paymentProof && (
          <div className="space-y-4 text-center">
            {isWaitingConfirmation && (
              <p className="text-xs sm:text-sm text-gray-600">
                {t("pendingConfirmation")}
              </p>
            )}
            {renderProofImage(payment.paymentProof)}
            <p className="text-xs text-gray-400 italic">{t("transactionId")}: {payment.transactionId}</p>
          </div>
        )}

        {payment.paymentStatus === PaymentStatus.CONFIRMED && !payment.transactionId && (
          <div className="space-y-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              {t("posPaid")}
            </p>
          </div>
        )}

        {payment.paymentStatus === PaymentStatus.REJECTED && payment.paymentProof && (
          <div className="space-y-4 text-center">
            <p className="text-xs sm:text-sm text-red-600">
              {t("rejected")}
            </p>
            {renderProofImage(payment.paymentProof)}
            {payment.transactionId && (
              <p className="text-xs text-gray-400 italic">
                {t("transactionId")}: {payment.transactionId}
              </p>
            )}
          </div>
        )}
      </div>

      {isUnpaid && (
        <ConfirmModal
          open={confirmModalOpen}
          loading={isPending}
          title={t("confirmTitle")}
          message={t("confirmMessage")}
          onCancel={() => setConfirmModalOpen(false)}
          onConfirm={handleConfirmChange}
          confirmButtonText={t("confirmButton")}
        />
      )}

      {/* Lightbox bukti pembayaran */}
      {proofZoom && payment.paymentProof && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={() => setProofZoom(false)}
        >
          <button
            type="button"
            onClick={() => setProofZoom(false)}
            className="fixed top-4 right-4 z-[10000] bg-white text-red-500 hover:bg-red-50 rounded-full p-2.5 shadow-xl transition"
            aria-label="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <div
            className="relative w-[90vw] h-[85vh] max-w-[900px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={payment.paymentProof}
              alt="Payment Proof"
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