import { toast, ToastOptions } from "react-toastify";

// Pembungkus notifikasi toast dengan format seragam (judul + deskripsi opsional).
// Dipakai di seluruh app lewat showSuccessToast/showErrorToast/dst, supaya semua
// notifikasi tampil konsisten tanpa menulis JSX-nya berulang.
type ToastBody = {
    title: string;
    description?: string;
};

// Membentuk isi toast (judul tebal + deskripsi kecil di bawahnya).
function buildBody({ title, description }: ToastBody) {
    return (
        <div className="toast-content">
            <span className="toast-title">{title}</span>
            {description && <span className="toast-desc">{description}</span>}
        </div>
    );
}

export const showSuccessToast = (title: string, description?: string, options?: ToastOptions) =>
    toast.success(buildBody({ title, description }), options);

export const showErrorToast = (title: string, description?: string, options?: ToastOptions) =>
    toast.error(buildBody({ title, description }), options);

export const showWarningToast = (title: string, description?: string, options?: ToastOptions) =>
    toast.warning(buildBody({ title, description }), options);

export const showInfoToast = (title: string, description?: string, options?: ToastOptions) =>
    toast.info(buildBody({ title, description }), options);
