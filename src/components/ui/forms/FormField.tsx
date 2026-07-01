import React, { useState, ChangeEvent, ForwardedRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type FormFieldProps = {
    label?: React.ReactNode;
    id: string;
    name?: string;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: "text" | "number" | "textarea" | "email" | "tel" | "password" | "date";
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    min?: number;
    rows?: number;
    refProp?: ForwardedRef<HTMLInputElement>;
    prefix?: string;
    prefixDisabled?: boolean;
    pattern?: string;
    className?: string;
};

const inputBaseClass =
    "w-full px-3.5 py-3 sm:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-base text-emerald-700 placeholder:text-gray-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

export default function FormField({
    label,
    id,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    disabled = false,
    min,
    rows,
    refProp,
    prefix,
    prefixDisabled = true,
    pattern,
    className,
}: FormFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (type === "tel") {
            const cleaned = e.target.value.replace(/\D/g, "");
            if (cleaned !== e.target.value) {
                e.target.value = cleaned;
            }
        }
        onChange(e);
    };

    if (type === "password") {
        return (
            <div>
                {label && (
                    <label htmlFor={id} className="block text-xs sm:text-sm font-bold text-gray-700 pl-1">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="relative mt-2">
                    <input
                        type={showPassword ? "text" : "password"}
                        id={id}
                        name={name ?? id}
                        value={value}
                        onChange={onChange}
                        className={`${inputBaseClass} pr-11 ${className ?? ""}`}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        ref={refProp}
                        pattern={pattern}
                        min={min}
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-xs sm:text-sm font-bold text-gray-700 pl-1"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            {type === "textarea" ? (
                <textarea
                    id={id}
                    name={name ?? id}
                    value={value}
                    onChange={onChange}
                    className={`${inputBaseClass} mt-2 ${className ?? ""}`}
                    placeholder={placeholder}
                    rows={rows || 4}
                    required={required}
                    disabled={disabled}
                />
            ) : prefix ? (
                <div className="flex gap-2 mt-2 min-w-0">
                    <input
                        type="text"
                        value={prefix}
                        disabled={prefixDisabled}
                        className="max-w-[70px] w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-3 sm:py-3.5 text-base text-gray-700 cursor-not-allowed focus:outline-none"
                    />
                    <input
                        type={type}
                        id={id}
                        name={name ?? id}
                        value={value}
                        onChange={handleChange}
                        className={`flex-1 min-w-0 ${inputBaseClass} ${className ?? ""}`}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        pattern={pattern}
                        min={min}
                        ref={refProp}
                        inputMode={type === "tel" ? "numeric" : undefined}
                        onKeyDown={type === "tel" ? (e) => {
                            if (
                                e.key.length === 1 &&
                                !/[0-9]/.test(e.key) &&
                                !e.ctrlKey && !e.metaKey
                            ) {
                                e.preventDefault();
                            }
                        } : undefined}
                        onWheel={type === "number" ? (e) => e.currentTarget.blur() : undefined}
                    />
                </div>
            ) : (
                <input
                    type={type}
                    id={id}
                    name={name ?? id}
                    value={value}
                    onChange={handleChange}
                    className={`${inputBaseClass} mt-2 ${className ?? ""}`}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    pattern={pattern}
                    min={min}
                    ref={refProp}
                    inputMode={type === "tel" ? "numeric" : undefined}
                    onKeyDown={type === "tel" ? (e) => {
                        if (
                            e.key.length === 1 &&
                            !/[0-9]/.test(e.key) &&
                            !e.ctrlKey && !e.metaKey
                        ) {
                            e.preventDefault();
                        }
                    } : undefined}
                    onWheel={type === "number" ? (e) => e.currentTarget.blur() : undefined}
                />
            )}
        </div>
    );
}
