import { Link, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { FiBell, FiLogOut, FiSearch, FiUser } from "react-icons/fi";
import { useNotifications } from "../../context/notificationsContext";
import { useUserProfile } from "../../context/profileContext";
import { Notification } from "../ui/Notification";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export const TopBar = ({ title = "Nexus", toggleSidebar, sidebarOpen = false }) => {
    const location = useLocation();
    const { notifications = [], count = 0, loading, markAllAsRead } = useNotifications();
    const { userProfileData } = useUserProfile();
    const displayName = [userProfileData?.firstName, userProfileData?.lastName]
        .filter(Boolean)
        .join(" ") || "Your profile";
    // The chat rooms live under /community/rooms. The "Create post" button
    // belongs to the forums page only, so it is hidden across the whole
    // community section.
    const isCommunityView = location.pathname.toLowerCase().startsWith("/community") || location.pathname.toLowerCase().startsWith("/forums");

    const isDoctorsView = location.pathname.toLowerCase().startsWith("/doctors");

    return (
        <header className="sticky top-0 z-sticky flex min-h-16 min-w-0 items-center gap-2 border-b border-neutral-200 bg-base-100/95 px-3 shadow-sm backdrop-blur sm:gap-4 sm:px-5">
            <button
                id="sidebar-toggle"
                type="button"
                className="shrink-0 rounded-lg p-2 text-xl text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 lg:hidden"
                onClick={toggleSidebar}
                aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
                aria-controls="primary-navigation"
                aria-expanded={sidebarOpen}
            >
                <FaBars aria-hidden="true" />
            </button>

            <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Nexus home">
                <img src={`${imagesDir}/logo-no-background.png`} alt="Nexus" className="h-9 w-12 object-contain sm:w-14" />
            </Link>
            <span className="hidden h-6 border-l border-neutral-200 lg:block" aria-hidden="true" />
            <h1 className="hidden min-w-0 truncate text-base font-semibold text-neutral-800 lg:block">{title}</h1>

            {!isCommunityView && !isDoctorsView && <Link to="/doctors" className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-700 p-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 sm:px-3 sm:py-2">
                <FiSearch aria-hidden="true" /> <span className="hidden md:inline">Find a doctor</span>
            </Link>}

            <Link
                to="/notifications"
                className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 md:hidden ${(isCommunityView || isDoctorsView) ? "ml-auto" : ""}`}
                aria-label={`View notifications${count ? `, ${count} unread` : ""}`}
            >
                <FiBell aria-hidden="true" className="text-xl" />
                {count > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">{count > 99 ? "99+" : count}</span>}
            </Link>
            <div className={`dropdown dropdown-end hidden shrink-0 md:block ${(isCommunityView || isDoctorsView) ? "ml-auto" : ""}`}>
                <button type="button" tabIndex={0} className="relative rounded-xl p-2.5 text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700" aria-label={`Notifications${count ? `, ${count} unread` : ""}`}>
                    <FiBell aria-hidden="true" className="text-xl" />
                    {count > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">{count > 99 ? "99+" : count}</span>}
                </button>
                <section tabIndex={0} className="dropdown-content z-[60] mt-3 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-neutral-200 bg-base-100 p-0 shadow-xl" aria-label="Notifications">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                        <div><h2 className="font-semibold text-neutral-900">Notifications</h2><p className="text-xs text-neutral-600">{count ? `${count} unread` : "You’re all caught up"}</p></div>
                        {count > 0 && <button type="button" onClick={markAllAsRead} className="text-xs font-semibold text-primary-800 hover:underline">Mark all read</button>}
                    </div>
                    <div className="max-h-[min(24rem,65vh)] overflow-y-auto p-2">
                        {loading ? <div className="space-y-2 p-2" aria-label="Loading notifications"><div className="h-14 animate-pulse rounded-xl bg-neutral-100" /><div className="h-14 animate-pulse rounded-xl bg-neutral-100" /></div> : notifications.length ? notifications.slice(0, 10).map((notification) => <Notification key={notification.id} {...notification} />) : <p className="px-4 py-8 text-center text-sm text-neutral-600">No notifications yet</p>}
                    </div>
                    <div className="border-t border-neutral-200 p-2">
                        <Link to="/notifications" className="flex min-h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold text-primary-800 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700">
                            View all notifications
                        </Link>
                    </div>
                </section>
            </div>

            <div className="dropdown dropdown-end shrink-0">
                <button type="button" tabIndex={0} className="flex max-w-40 items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 sm:max-w-52" aria-label={`Profile menu for ${displayName}`}>
                    <img src={userProfileData?.photoUrl || `${imagesDir}/profile.webp`} alt="" className="h-8 w-8 shrink-0 rounded-full border border-neutral-200 object-cover" />
                    <span className="hidden min-w-0 sm:block"><span className="block truncate text-sm font-semibold text-neutral-900">{displayName}</span><span className="block text-xs text-neutral-600">Patient</span></span>
                </button>
                <ul tabIndex={0} className="dropdown-content z-[60] mt-3 w-52 rounded-xl border border-neutral-200 bg-base-100 p-2 shadow-xl">
                    <li><Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100"><FiUser aria-hidden="true" /> Profile</Link></li>
                    <li><Link to="/logout" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100"><FiLogOut aria-hidden="true" /> Sign out</Link></li>
                </ul>
            </div>
        </header>
    );
};
