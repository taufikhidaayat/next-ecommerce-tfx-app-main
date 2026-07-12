import { OrderStatus } from "@/enum/orderStatus";
import { OrderType } from "@/enum/orderType";
import { PaymentStatus } from "@/enum/paymentStatus";

// Menerjemahkan status order + status bayar + tipe order menjadi NOMOR LANGKAH
// untuk penanda progres (stepper) di halaman detail pesanan pelanggan. Alur pickup
// dan delivery beda tahapnya, jadi dipisah. Mengembalikan juga flag isCancelled
// (order batal) supaya UI bisa menampilkan tampilan khusus "dibatalkan".
export const currentStep = (
    orderStatus: OrderStatus,
    paymentStatus: PaymentStatus,
    orderType?: string
): { step: number; isCancelled: boolean; isDeliveryFailed: boolean } => {
    if (orderStatus === OrderStatus.CANCELLED) {
        return { step: 0, isCancelled: true, isDeliveryFailed: false };
    }

    if (paymentStatus === PaymentStatus.UNPAID) return { step: 0, isCancelled: false, isDeliveryFailed: false };
    if (paymentStatus === PaymentStatus.PENDING) return { step: 1, isCancelled: false, isDeliveryFailed: false };

    if (orderType === OrderType.DELIVERY) {
        // Delivery flow: Payment → Processing → Sedang Diantar → Telah Diantar → Selesai.
        // "Telah Diantar" otomatis dianggap "Selesai" (tanpa langkah manual), jadi DELIVERED
        // langsung loncat ke node terakhir (step 5) supaya "Telah Diantar" + "Selesai" sama-sama hijau.
        if (paymentStatus === PaymentStatus.CONFIRMED && orderStatus === OrderStatus.PAID)
            return { step: 2, isCancelled: false, isDeliveryFailed: false };
        if (orderStatus === OrderStatus.PROCESSING) return { step: 2, isCancelled: false, isDeliveryFailed: false };
        if (orderStatus === OrderStatus.ON_DELIVERY) return { step: 3, isCancelled: false, isDeliveryFailed: false };
        if (orderStatus === OrderStatus.DELIVERED) return { step: 5, isCancelled: false, isDeliveryFailed: false };
        if (orderStatus === OrderStatus.COMPLETED) return { step: 5, isCancelled: false, isDeliveryFailed: false };
    } else {
        // Pickup flow: Payment → Processing → Ready for Pickup → Completed
        if (paymentStatus === PaymentStatus.CONFIRMED && orderStatus === OrderStatus.PAID)
            return { step: 2, isCancelled: false, isDeliveryFailed: false };
        if (orderStatus === OrderStatus.PROCESSING) return { step: 2, isCancelled: false, isDeliveryFailed: false };
        if (orderStatus === OrderStatus.READY_FOR_PICKUP) return { step: 3, isCancelled: false, isDeliveryFailed: false };
        if (orderStatus === OrderStatus.SHIPPED) return { step: 2, isCancelled: false, isDeliveryFailed: false };
        if (orderStatus === OrderStatus.COMPLETED) return { step: 4, isCancelled: false, isDeliveryFailed: false };
    }

    return { step: 0, isCancelled: false, isDeliveryFailed: false };
};
