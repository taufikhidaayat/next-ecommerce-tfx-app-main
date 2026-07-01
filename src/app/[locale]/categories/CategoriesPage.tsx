'use client';

import Breadcrumbs from "@/components/ui/layout/Breadcrumb";
import { CategoryListSkeleton } from "@/components/skeletons/dashboard/CategoryListSkeleton";
import { useCategories } from "@/satelite/services/categoryService";
import { Category } from "@/types/category/category";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

export default function Categories() {
    const t = useTranslations("categories");
    const { data: categories, isPending: isPendingCategories } = useCategories({
        page: 1,
        limit: 100,
    });

    const groupedCategories = useMemo(() => {
        if (!categories?.data?.data) return {};
        return categories.data.data.reduce((groups, category) => {
            const firstLetter = category.name[0].toUpperCase();
            if (!groups[firstLetter]) groups[firstLetter] = [];
            groups[firstLetter].push(category);
            return groups;
        }, {} as Record<string, Category[]>);
    }, [categories]);

    const sortedLetters = useMemo(() => Object.keys(groupedCategories).sort(), [groupedCategories]);

    return (
        <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8 mb-12">
            <div className="container w-full px-2 sm:px-4 pt-3 pb-5 mx-auto">
                <Breadcrumbs
                    items={[
                        { label: t("breadcrumb.dashboard"), href: "/" },
                        { label: t("breadcrumb.categories") }
                    ]}
                />

                <h2 className="text-2xl md:text-4xl font-extrabold text-green-800 mb-1 md:mb-2">
                    {t("title")}
                </h2>
                <p className="text-base md:text-lg text-gray-600 mb-5 md:mb-8">
                    {t("subtitle")}
                </p>

                <div className="space-y-7 md:space-y-12">
                    {isPendingCategories ? (
                        <CategoryListSkeleton />
                    ) : (
                        sortedLetters.map(letter => (
                            <div
                                key={letter}
                                className="grid grid-cols-[55px_1fr] md:grid-cols-[80px_1fr] gap-3 md:gap-6 items-start"
                            >
                                {/* Artistic Capital Letter */}
                                <div className="relative">
                                    <div className="sticky top-24">
                                        <span className="text-3xl md:text-5xl font-extrabold text-gray-300 block leading-[1]">
                                            {letter}
                                        </span>
                                        <div className="w-6 h-1 bg-green-300 mt-2 rounded-full" />
                                    </div>
                                </div>

                                {/* Category List */}
                                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                                    {groupedCategories[letter].map(category => (
                                        <li
                                            key={category.name.toLowerCase()}
                                            className="relative group p-2 md:p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-green-300 transition"
                                        >
                                            <Link
                                                href={{
                                                    pathname: "/products",
                                                    query: { category: category.name.toLowerCase() },
                                                }}
                                                className="block text-sm md:text-base font-medium text-gray-700 hover:text-green-600"
                                            >
                                                {category.name}
                                            </Link>
                                            {/* Tooltip */}
                                            {category.description && (
                                                <div className="absolute z-20 hidden group-hover:block w-48 md:w-64 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm bg-white border border-gray-200 rounded-md shadow-md bottom-full mb-3 left-1/2 -translate-x-1/2 space-y-2">
                                                    <p className="text-gray-600">{category.description}</p>
                                                    <p className="text-xs text-gray-400 italic">{t("tooltip")}</p>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}