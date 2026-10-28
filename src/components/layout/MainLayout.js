import { Sidebar } from "./Sidebar";
import { CustomToast } from "../ui/CustomToast";
import { TopBar } from "./TopBar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

const getTitle = (path) => {
    const normalizedPath = path.toLowerCase();
    // The chat rooms live under /community/rooms, so the prefix rule has to
    // cover them too. The /forums prefix is kept for the forum detail page.
    if (normalizedPath.startsWith("/community") || normalizedPath.startsWith("/forums")) return "Community";
    if (normalizedPath.startsWith("/doctors")) return "Find a doctor";
    if (normalizedPath.startsWith("/appointments")) return "My appointments";
    switch (normalizedPath) {
        case "/forums":
            return "Forums";
        case "/profile":
            return "Profile";
        case "/notifications":
            return "Notifications";
        case "/":
        default:
            return "Overview";
    }
};

export function MainLayout() {
    const location = useLocation();
    const title = getTitle(location.pathname);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <CustomToast />
            <div className="flex min-h-screen min-w-0 flex-col bg-canvas lg:flex-row">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
                <div
                    className="relative min-w-0 w-full flex-1 transition-all duration-300"
                >
                    <TopBar
                        // className="sticky"
                        title={title}
                        sidebarOpen={isSidebarOpen}
                        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    />
                    <main className="w-full min-w-0 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}
