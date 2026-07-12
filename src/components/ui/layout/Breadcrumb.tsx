import React from "react";
import Link from "next/link";
import { BiChevronRight } from "react-icons/bi";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbsProps = {
    items: BreadcrumbItem[];
};

// Breadcrumb (jejak navigasi), mis. "Beranda / Produk / Nama Produk", agar user tahu
// posisinya dan bisa mundur ke halaman sebelumnya.
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="text-sm font-extrabold text-gray-600 mb-5">
            <ol className="flex items-center space-x-2 min-w-0">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li
                            key={index}
                            className={`flex items-center ${isLast ? "min-w-0" : "shrink-0"}`}
                        >
                            {item.href ? (
                                <Link href={item.href} className="hover:text-green-700 whitespace-nowrap">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={`text-gray-400 ${isLast ? "truncate" : "whitespace-nowrap"}`}>
                                    {item.label}
                                </span>
                            )}
                            {index < items.length - 1 && <BiChevronRight className="mx-2 w-4 h-4 shrink-0" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
