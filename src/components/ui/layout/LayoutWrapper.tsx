"use client";

import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ScrollToTop from "./ScrollToTop";
import PullToRefresh from "./PullToRefresh";
import { NO_HEADER_ROUTES } from "@/lib/constant";
import { stripLocale } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathWithoutLocale = stripLocale(pathname || "/");
  const [headerHeight, setHeaderHeight] = useState(100);

  // Toast: desktop top-right (standar web), mobile snackbar bottom-center
  // (di atas BottomNav). Pakai matchMedia <768px = breakpoint `md` (BottomNav md:hidden).
  const [isMobileToast, setIsMobileToast] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileToast(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const isAuthPage = NO_HEADER_ROUTES.includes(pathWithoutLocale);

  const handleHeaderHeight = useCallback((h: number) => {
    setHeaderHeight(h);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {!isAuthPage && <Header onHeightChange={handleHeaderHeight} />}
      <main className="relative min-h-screen bg-white">
        <div
          className={`relative ${!isAuthPage ? 'px-2 py-4 pb-28 md:pb-4' : ''}`}
          style={!isAuthPage ? { paddingTop: `${headerHeight + 16}px` } : undefined}
        >
          {isAuthPage ? (
            children
          ) : (
            <PullToRefresh topOffset={8}>{children}</PullToRefresh>
          )}
        </div>
      </main>
      {!isAuthPage && <ScrollToTop />}
      {!isAuthPage && <BottomNav />}
      <ToastContainer
        position={isMobileToast ? "bottom-center" : "top-right"}
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="!z-[9999]"
        // Mobile: hanya angkat container di atas BottomNav — JANGAN override
        // posisi/transform container (itu bikin toast ke-clip "setengah" karena
        // bentrok dgn animasi bawaan react-toastify).
        style={
          isMobileToast
            ? { bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }
            : undefined
        }
        // Mobile: kecilkan & center lewat TOAST-nya (container tetap full-width
        // bawaan, toast dibatasi lebarnya + mx-auto). Tinggi/padding/font diperkecil.
        toastClassName={
          isMobileToast
            ? "!min-h-0 !w-auto !max-w-[min(88vw,340px)] !mx-auto !rounded-xl !mb-2 !px-3 !py-2.5 !text-sm !shadow-lg"
            : undefined
        }
      />
    </QueryClientProvider>
  );
}
