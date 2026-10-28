import { useEffect, useRef } from "react";

/**
 * Run `refresh` when the window regains focus or the tab becomes visible.
 *
 * A user can leave a room from another tab or device. The server removes the
 * leaver's connections before broadcasting MemberLeft, so this tab never
 * receives that event. Refetching on focus is a partial mitigation: it cannot
 * help two tabs that are visible at the same time, and it is not a substitute
 * for a server-targeted membership event.
 *
 * The callback is kept in a ref so a new inline function on every render does
 * not tear down and rebuild the listeners. The throttle collapses the
 * focus + visibilitychange pair that browsers emit when a tab is restored and
 * prevents a refetch storm from rapid alt-tabbing.
 */
export const useRefreshOnFocus = (
    refresh,
    { enabled = true, throttleMs = 1000 } = {}
) => {
    const refreshRef = useRef(refresh);
    refreshRef.current = refresh;

    useEffect(() => {
        if (!enabled) return undefined;

        let lastRunAt = 0;

        const run = () => {
            const now = Date.now();
            if (now - lastRunAt < throttleMs) return;

            lastRunAt = now;
            refreshRef.current?.();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") run();
        };

        window.addEventListener("focus", run);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", run);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enabled, throttleMs]);
};
