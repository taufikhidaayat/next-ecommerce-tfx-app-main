import { toast, ToastOptions } from "react-toastify";

type ToastBody = {
    title: string;
    description?: string;
};

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
