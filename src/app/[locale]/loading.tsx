export default function Loading() {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-3 sm:gap-4 text-center px-6">
      <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full border-[3px] sm:border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
      <p className="text-gray-800 text-base sm:text-xl font-bold">Mohon Tunggu, Memuat...</p>
      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-sm">
        Kami sedang menyiapkan konten terbaik untuk Anda.
        Proses ini mungkin membutuhkan beberapa detik.
        Terima kasih atas kesabaran Anda!
      </p>
    </div>
  );
}