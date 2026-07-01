import React, { useRef } from "react";
import Image from "next/image";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

type FormFileUploadProps = {
    label: string;
    file: File | null;
    setFile: (file: File | null) => void;
    disabled?: boolean;
    maxSize?: number;
    required?: boolean;
    url?: string;
    onRemoveUrl?: () => void;
};

export default function FormFileUpload({
    label,
    file,
    setFile,
    disabled = false,
    maxSize = 200_000,
    required = false,
    url,
    onRemoveUrl,
}: FormFileUploadProps) {
    const inputFileRef = useRef<HTMLInputElement>(null);

    const imagePreview = file
        ? URL.createObjectURL(file)
        : url
            ? url
            : undefined;

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 pl-1 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div
                onDrop={(e) => {
                    if (disabled) return;
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                        if (file.size > maxSize) {
                            toast.error(`File size must be less than ${maxSize / 1000}KB.`);
                            return;
                        }
                        setFile(file);
                    }
                }}
                onDragOver={(e) => {
                    if (disabled) return;
                    e.preventDefault();
                }}
                onClick={() => {
                    if (disabled) return;
                    inputFileRef.current?.click();
                }}
                aria-disabled={disabled}
                className={
                    `border-4 border-dashed border-gray-300 rounded-lg p-8 mb-4 flex items-center justify-center text-gray-500 transition-all duration-300 relative h-48
                    ${disabled ? "cursor-not-allowed pointer-events-none bg-gray-200" : "hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"}`
                }
            >
                {imagePreview ? (
                    <div className="absolute inset-0 flex justify-center items-center">
                        <Image
                            src={imagePreview}
                            alt="Uploaded"
                            width={128}
                            height={128}
                            className="object-cover rounded-lg"
                            unoptimized
                            onLoad={() => {
                                if (file) URL.revokeObjectURL(imagePreview);
                            }}
                        />
                        {(file || url) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (file) {
                                        setFile(null);
                                    } else if (url && onRemoveUrl) {
                                        onRemoveUrl();
                                    }
                                }}
                                className="absolute top-2 right-2 bg-transparent text-red-500 hover:text-red-700 p-1 rounded-full z-10"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                            Drag and drop an image file here, or click to select a file.
                        </p>
                        <p className="text-xs text-gray-400">
                            No image selected. A default image will be used if no file is uploaded.
                        </p>
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={inputFileRef}
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        if (file.size > maxSize) {
                            toast.error(`File size must be less than ${maxSize / 1000}KB.`);
                            return;
                        }
                        setFile(file);
                    }
                }}
                className="hidden"
                disabled={disabled}
                required={required}
            />
        </div>
    );
}