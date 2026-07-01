"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import CloseButton from "../ui/button/CloseButton";
import { useScrollLock } from "@/hooks/useScrollLock";

type ModalBoxProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    withoutCloseButton?: boolean;
    maxWidth?: string;
    modalHeight?: string;
};

function ModalBox({
    isOpen,
    onClose,
    children,
    withoutCloseButton,
    maxWidth = "max-w-lg",
    modalHeight = "max-h-screen",
}: ModalBoxProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useScrollLock(isOpen);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div
                className={`bg-white w-full ${maxWidth} mx-2 sm:mx-auto p-3 sm:p-7 rounded-2xl shadow-xl relative overflow-y-auto ${modalHeight}`}
            >
                {!withoutCloseButton && (
                    <CloseButton onClick={onClose} className="absolute top-3 sm:top-4 right-3 sm:right-4" />
                )}
                {children}
            </div>
        </div>,
        document.body
    );
}

type SectionProps = {
    children: ReactNode,
    className?: string;
};

function ModalHeader({ children }: SectionProps) {
    return (
        <div className="text-lg sm:text-xl font-extrabold mb-3 sm:mb-4 border-b pb-2 sm:pb-3 px-1 text-gray-800 text-center">
            {children}
        </div>
    );
}
ModalHeader.displayName = "ModalBox.Header";

function ModalBody({ children, className = "" }: SectionProps) {
    return (
        <div className={`space-y-4 sm:space-y-5 max-h-[60vh] overflow-y-auto px-1 my-4 sm:my-6 ${className}`}>
            {children}
        </div>
    );
}
ModalBody.displayName = "ModalBox.Body";

function ModalFooter({ children }: SectionProps) {
    const childCount = React.Children.count(children);
    return (
        <div
            className={`grid ${childCount > 1 ? "grid-cols-2" : "grid-cols-1"} gap-3 sm:gap-4 my-3 sm:my-4 px-1`}
        >
            {children}
        </div>
    );
}
ModalFooter.displayName = "ModalBox.Footer";

ModalBox.Header = ModalHeader;
ModalBox.Body = ModalBody;
ModalBox.Footer = ModalFooter;

export default ModalBox;