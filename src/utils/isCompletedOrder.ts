import { OrderStatus } from "@/enum/orderStatus";

/**
 * Pesanan dianggap "selesai/diterima" untuk kedua tipe:
 * pickup selesai = COMPLETED, delivery selesai = DELIVERED.
 * Pakai helper ini untuk semua UI yang gating-nya "pesanan sudah selesai"
 * (mis. tombol ulasan, pesan lagi) agar delivery diperlakukan sama seperti pickup.
 */
export const isCompletedOrder = (status?: OrderStatus | string): boolean =>
    status === OrderStatus.COMPLETED || status === OrderStatus.DELIVERED;
