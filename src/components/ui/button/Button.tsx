import React, {
    ReactNode,
    forwardRef,
    MouseEvent,
    ButtonHTMLAttributes,
} from "react";
import { FaSpinner } from "react-icons/fa";

type ButtonProps = {
    children: ReactNode;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info" | "link" | "ghost";
    className?: string;
    icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

// Tombol serba-guna toko (varian warna, status loading dengan spinner, ikon opsional).
// Sepadan dengan Button di CMS agar tampilan tombol seragam di seluruh aplikasi.
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            onClick,
            type = "button",
            disabled = false,
            loading = false,
            variant = "primary",
            className = "",
            icon,
            ...rest
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        const base =
            "px-7 py-3 rounded-md text-sm font-medium flex items-center justify-center focus:outline-none focus:ring-2 transition-all duration-150 gap-4";

        const variants = {
            primary: "text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-300",
            secondary: "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-200",
            danger: "text-white bg-red-500 hover:bg-red-600 focus:ring-red-300",
            success: "text-white bg-green-500 hover:bg-green-600 focus:ring-green-300",
            warning: "text-white bg-amber-500 hover:bg-amber-600 focus:ring-amber-300",
            info: "text-white bg-teal-500 hover:bg-teal-600 focus:ring-teal-300",
            link: "text-blue-500 underline bg-transparent hover:text-blue-600 focus:ring-transparent",
            ghost: "text-gray-800 bg-transparent border border-gray-300 hover:bg-gray-100 focus:ring-gray-200",
        };

        const disabledStyle = "opacity-50 cursor-not-allowed";

        return (
            <button
                ref={ref}
                type={type}
                onClick={onClick}
                className={`${base} ${variants[variant]} ${isDisabled ? disabledStyle : ""} ${className}`}
                disabled={isDisabled}
                {...rest}
            >
                {loading && (
                    <span className="mr-2">
                        <FaSpinner className="animate-spin" />
                    </span>
                )}
                {icon && !loading && <span className="mr-2">{icon}</span>}
                {loading
                    ? typeof children === "string"
                        ? `${children}...`
                        : children
                    : children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
