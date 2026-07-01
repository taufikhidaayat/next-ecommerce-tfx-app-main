import { sanitizeQueryParam } from "@/utils/sanitizeQueryParam";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";

type UseQueryParamManagerProps<T = string> = {
    key: string;
    validValues?: T[];
    initialValue: T;
    isReady?: boolean;
    normalize?: (val: string) => T;
};

export function useQueryParamManager<T = string>({
    key,
    validValues = [],
    initialValue,
    isReady = true,
    normalize = (v) => v as unknown as T,
}: UseQueryParamManagerProps<T>) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const paramValue = searchParams.get(key);
    const safeParamValue = paramValue ? sanitizeQueryParam(paramValue) : undefined;
    const normalizedParam = safeParamValue?.toLowerCase();

    let isValid = true;
    if (validValues.length > 0) {
        isValid = validValues
            .map((v) => v?.toString().toLowerCase())
            .includes(normalizedParam || "");
    }

    const value: T = isValid && safeParamValue ? normalize(safeParamValue) : initialValue;

    useEffect(() => {
        if (!isReady) return;

        const params = new URLSearchParams(searchParams.toString());

        if (validValues.length > 0 && !isValid && paramValue) {
            params.delete(key);
            router.replace(`?${params.toString()}`, { scroll: false });
        }

        if (safeParamValue && paramValue && safeParamValue !== paramValue) {
            params.set(key, safeParamValue);
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [isReady, isValid, key, paramValue, safeParamValue, searchParams, router, validValues.length]);

    const setValue = useCallback(
        (newValue: T | "") => {
            const params = new URLSearchParams(searchParams.toString());

            if (!newValue) {
                params.delete(key);
            } else {
                if (
                    validValues.length === 0 ||
                    validValues.includes(newValue)
                ) {
                    params.set(key, sanitizeQueryParam(newValue.toString()));
                } else {
                    params.delete(key);
                }
            }

            router.replace(`?${params.toString()}`, { scroll: false });
        },
        [key, searchParams, router, validValues]
    );

    return { value, setValue };
}
