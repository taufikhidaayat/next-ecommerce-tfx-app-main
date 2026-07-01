import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ProductDetailSkeleton() {
    return (
        <>
            {/* Gambar Produk */}
            <div className="flex-1 lg:w-1/2 max-h-screen">
                <div className="relative h-full flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center bg-gray-50 p-4">
                        <Skeleton width={300} height={300} />
                    </div>

                    <div className="absolute top-4 left-4">
                        <Skeleton width={60} height={24} borderRadius={4} />
                    </div>
                    <div className="absolute top-4 right-4">
                        <Skeleton width={80} height={24} borderRadius={4} />
                    </div>
                </div>
            </div>

            {/* Detail Produk */}
            <div className="flex-1 flex flex-col gap-6">
                {/* Nama dan Deskripsi */}
                <div className="text-green-900">
                    <Skeleton width="70%" height={36} />
                    <Skeleton width="90%" height={20} style={{ marginTop: 8 }} />
                </div>

                {/* Harga dan Rating */}
                <div className="flex-1 lg:w-full flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Skeleton width={120} height={28} />
                        <Skeleton width={80} height={20} />
                    </div>
                    <div className="flex items-center space-x-1 ml-auto justify-end">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} circle width={16} height={16} />
                        ))}
                        <Skeleton width={24} height={16} />
                    </div>
                </div>

                {/* Kartu Grosir */}
                <Skeleton height={96} borderRadius={8} />
                <Skeleton height={96} borderRadius={8} />

                {/* Pilihan Jumlah dan Stok */}
                <div className="flex items-center gap-3 w-full">
                    <Skeleton width={100} height={32} borderRadius={6} />
                    <Skeleton width={160} height={20} />
                </div>

                {/* Total Harga */}
                <div className="flex justify-between items-start text-base font-semibold text-green-800 mt-2">
                    <Skeleton width={80} height={24} />
                    <div className="flex flex-col items-end">
                        <Skeleton width={100} height={20} style={{ marginBottom: 6 }} />
                        <Skeleton width={140} height={40} />
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-4 w-full font-semibold">
                    <Skeleton width="50%" height={48} borderRadius={8} />
                    <Skeleton width="50%" height={48} borderRadius={8} />
                </div>
            </div>
        </>
    );
}
