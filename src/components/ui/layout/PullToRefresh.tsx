"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const THRESHOLD = 72; // px the user must pull before a release triggers refresh
const MAX_PULL = 110; // hard cap on how far the indicator travels
const DAMPING = 0.5; // resistance — finger moves further than the indicator
const HOLD = 52; // indicator resting position while refreshing
const MIN_SPIN_MS = 650; // keep the spinner visible at least this long
const GREEN = "#00AA5B"; // Tokopedia-style green

type Status = "idle" | "pulling" | "ready" | "refreshing";

const CIRC = 2 * Math.PI * 10;

function Spinner({ progress, refreshing }: { progress: number; refreshing: boolean }) {
    return (
        <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            className={refreshing ? "animate-spin" : ""}
            style={refreshing ? undefined : { transform: `rotate(${progress * 270}deg)` }}
        >
            <circle cx={12} cy={12} r={10} fill="none" stroke="#e6e8eb" strokeWidth={2.6} />
            <circle
                cx={12}
                cy={12}
                r={10}
                fill="none"
                stroke={GREEN}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeDasharray={refreshing ? `${CIRC * 0.28} ${CIRC}` : CIRC}
                strokeDashoffset={refreshing ? 0 : CIRC * (1 - progress)}
                transform="rotate(-90 12 12)"
            />
        </svg>
    );
}

export default function PullToRefresh({
    children,
    topOffset = 0,
    onRefresh,
}: {
    children: React.ReactNode;
    /** Where the indicator rests (px from top) — usually under the header. */
    topOffset?: number;
    /** Custom refresh action. Defaults to window.location.reload(). */
    onRefresh?: () => Promise<void> | void;
}) {
    const [pull, setPull] = useState(0);
    const [status, setStatus] = useState<Status>("idle");

    const pullRef = useRef(0);
    const statusRef = useRef<Status>("idle");
    const startYRef = useRef(0);
    const startXRef = useRef(0);
    const engagedRef = useRef(false);
    const lockedRef = useRef(false); // committed to a vertical pull this gesture

    const setPullState = (v: number) => {
        pullRef.current = v;
        setPull(v);
    };
    const setStatusState = (s: Status) => {
        statusRef.current = s;
        setStatus(s);
    };

    const runRefresh = useCallback(async () => {
        setStatusState("refreshing");
        setPullState(HOLD);
        if (onRefresh) {
            const started = Date.now();
            try {
                await onRefresh();
            } finally {
                const elapsed = Date.now() - started;
                if (elapsed < MIN_SPIN_MS) await new Promise((r) => setTimeout(r, MIN_SPIN_MS - elapsed));
                setStatusState("idle");
                setPullState(0);
            }
        } else {
            // Hard reload — paling reliable di mobile browser nyata
            await new Promise((r) => setTimeout(r, MIN_SPIN_MS));
            window.location.reload();
        }
    }, [onRefresh]);

    useEffect(() => {
        // Touch devices only — pull-to-refresh is meaningless with a mouse.
        if (typeof window === "undefined" || !window.matchMedia("(pointer: coarse)").matches) {
            return;
        }

        // Collapse any in-progress pull back to rest. Safe to call anytime.
        const resetPull = () => {
            engagedRef.current = false;
            lockedRef.current = false;
            if (pullRef.current !== 0 || statusRef.current !== "idle") {
                setStatusState("idle");
                setPullState(0);
            }
        };

        const onTouchStart = (e: TouchEvent) => {
            if (statusRef.current === "refreshing") return;
            // Ignore multi-touch (pinch-zoom etc.) and modal-locked scroll.
            if (e.touches.length > 1) {
                engagedRef.current = false;
                return;
            }
            // useScrollLock mengunci scroll dengan position:fixed (bukan
            // overflow:hidden), jadi cek keduanya — kalau tidak, PTR aktif saat
            // modal terbuka dan spinner muncul ketika sheet di-drag turun.
            if (
                document.body.style.position === "fixed" ||
                document.body.style.overflow === "hidden"
            )
                return;
            if (window.scrollY > 0) {
                engagedRef.current = false;
                return;
            }
            startYRef.current = e.touches[0].clientY;
            startXRef.current = e.touches[0].clientX;
            engagedRef.current = true;
            lockedRef.current = false;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (statusRef.current === "refreshing") return;
            // A second finger landed mid-pull — bail out cleanly.
            if (e.touches.length > 1) {
                resetPull();
                return;
            }
            if (!engagedRef.current) return;
            const dy = e.touches[0].clientY - startYRef.current;
            const dx = e.touches[0].clientX - startXRef.current;

            // Before committing: only a clear downward, mostly-vertical swipe from
            // the very top engages a pull. Anything else (upward, horizontal, or a
            // scrolled page) is left to the browser.
            if (!lockedRef.current) {
                if (window.scrollY > 0 || dy <= 0) return;
                if (Math.abs(dx) > dy) {
                    engagedRef.current = false; // horizontal — carousel/chips
                    return;
                }
                if (dy < 6) return; // wait for clear vertical intent
                lockedRef.current = true;
            }

            // Locked: this gesture belongs to the pull for its whole lifetime, so
            // you can play it up and down freely. The indicator just tracks the
            // finger (clamped to 0..MAX) until you lift — then release decides.
            e.preventDefault();
            const dist = Math.min(MAX_PULL, Math.max(0, dy * DAMPING));
            setPullState(dist);
            setStatusState(dist >= THRESHOLD ? "ready" : "pulling");
        };

        // Always resolve on release, even if the gesture was disengaged mid-way
        // (horizontal bow-out, multi-touch) — otherwise the badge can freeze
        // half-pulled.
        const onTouchEnd = () => {
            if (statusRef.current === "refreshing") return;
            const shouldRefresh = pullRef.current >= THRESHOLD;
            engagedRef.current = false;
            lockedRef.current = false;
            if (shouldRefresh) {
                runRefresh();
            } else {
                resetPull();
            }
        };

        // Safety net: the badge is position:fixed, so a stuck one would float
        // over the page while scrolling. The moment the page scrolls away from
        // the top, clear any leftover pull (unless an actual refresh is running).
        const onScroll = () => {
            if (statusRef.current !== "refreshing" && pullRef.current !== 0 && window.scrollY > 0) {
                resetPull();
            }
        };

        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd, { passive: true });
        window.addEventListener("touchcancel", onTouchEnd, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchEnd);
            window.removeEventListener("scroll", onScroll);
        };
    }, [runRefresh]);

    const progress = Math.min(1, pull / THRESHOLD);
    const refreshing = status === "refreshing";
    const dragging = status === "pulling" || status === "ready";
    // Slide the badge down from behind the header as the user pulls.
    const translateY = pull - 44;
    const scale = refreshing ? 1 : 0.55 + 0.45 * progress;

    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none fixed left-1/2 z-[60] flex items-center justify-center"
                style={{
                    top: topOffset,
                    transform: `translate(-50%, ${translateY}px) scale(${scale})`,
                    opacity: pull <= 1 ? 0 : Math.min(1, progress + 0.2),
                    transition: dragging
                        ? "none"
                        : "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease",
                }}
            >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_-2px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
                    <Spinner progress={progress} refreshing={refreshing} />
                </div>
            </div>
            {children}
        </>
    );
}
