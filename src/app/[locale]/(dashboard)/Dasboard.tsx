import DashboardWrapper from "./DasboardWrapper";

// Beranda toko. Hanya kerangka lebar halaman; isi (banner, kategori, produk, promo,
// FAQ) disusun oleh DashboardWrapper dan komponen *Section di folder ini.
export default async function Dashboard() {
    return (
        <main className="min-h-screen w-full">
            <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <DashboardWrapper />
            </div>
        </main>
    );
}
