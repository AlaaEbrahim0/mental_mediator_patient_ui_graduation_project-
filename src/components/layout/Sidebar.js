import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FiCalendar, FiSearch, FiSettings, FiBell, FiClock } from "react-icons/fi";
import { HiOutlineLogin } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import { useUserProfile } from "../../context/profileContext";
import { motion } from "framer-motion";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export function Sidebar({ isOpen, setIsOpen }) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
    const sidebarRef = useRef(null);
    const iconStyles = "inline shrink-0 text-2xl";

    const { userProfileData, isLoading } = useUserProfile();

    const menuItems = useMemo(
        () => [
            {
                name: "Overview",
                icon: <MdOutlineSpaceDashboard className={iconStyles} />,
                link: "/",
            },
            {
                name: "Find a doctor",
                icon: <FiSearch className={iconStyles} />,
                link: "/doctors",
            },
            {
                name: "My appointments",
                icon: <FiCalendar className={iconStyles} />,
                link: "/appointments",
            },
            {
                name: "History",
                icon: <FiClock className={iconStyles} />,
                link: "/history",
            },
            {
                name: "Notifications",
                icon: <FiBell className={iconStyles} />,
                link: "/notifications",
            },
            {
                name: "Community",
                icon: <BiMessageSquareDetail className={iconStyles} />,
                link: "/community",
            },
            {
                name: "Profile",
                icon: <FiSettings className={iconStyles} />,
                link: "/profile",
            },
        ],
        []
    );

    const handleMenuItemClick = () => {
        closeSidebar();
    };

    const closeSidebar = useCallback(() => {
        if (window.innerWidth < 1024) {
            document.getElementById("sidebar-toggle")?.focus();
        }
        setIsOpen(false);
    }, [setIsOpen]);

    useEffect(() => {
        const updateViewport = () => {
            const mobileViewport = window.innerWidth < 1024;
            if (mobileViewport && sidebarRef.current?.contains(document.activeElement)) {
                document.getElementById("sidebar-toggle")?.focus();
                setIsOpen(false);
            }
            setIsMobile(mobileViewport);
        };
        window.addEventListener("resize", updateViewport);
        return () => window.removeEventListener("resize", updateViewport);
    }, [setIsOpen]);

    useEffect(() => {
        if (!isOpen || !isMobile) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const closeOnEscape = (event) => {
            if (event.key === "Escape") closeSidebar();
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [isOpen, isMobile, closeSidebar]);

    useEffect(() => {
        sidebarRef.current?.toggleAttribute("inert", isMobile && !isOpen);
    }, [isMobile, isOpen]);

    return (
        <>
        {isOpen && (
            <button
                type="button"
                aria-label="Close navigation menu"
                className="fixed inset-0 z-30 bg-slate-950/55 lg:hidden"
                onClick={closeSidebar}
            />
        )}
        <aside
            ref={sidebarRef}
            id="primary-navigation"
            aria-label="Primary navigation"
            aria-hidden={isMobile && !isOpen}
            className={`fixed left-0 top-0 z-40 flex h-screen h-[100dvh] w-60 shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-base-100 text-neutral-800 shadow-xl transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:w-60 lg:shadow-none ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
            style={{ maxHeight: "100dvh" }}
        >
            <div className="flex shrink-0 items-center gap-3 border-b border-neutral-200 px-4 py-4">
                <div className="min-w-0"><p className="text-base font-extrabold tracking-[0.12em] text-neutral-900">NEXUS</p></div>
            </div>

            {isLoading ? (
                <div className="mx-3 my-4 flex shrink-0 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="skeleton h-11 w-11 shrink-0 rounded-full bg-neutral-200" />
                    <div className="flex-1"><div className="skeleton h-4 w-3/4 bg-neutral-200" /><div className="skeleton mt-2 h-3 w-1/2 bg-neutral-200" /></div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-3 my-4 flex shrink-0 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                >
                    <span className="relative shrink-0">
                        <img
                            className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
                            src={userProfileData?.photoUrl || `${imagesDir}/profile.webp`}
                            alt=""
                        />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-neutral-50 bg-emerald-500" aria-label="Online" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-neutral-900">{userProfileData?.firstName || "Nexus"} {userProfileData?.lastName || ""}</p>
                        <p className="mt-0.5 truncate text-xs font-medium text-neutral-600">Patient</p>
                    </div>
                </motion.div>
            )}

            <p className="mb-2 px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Menu</p>
            <nav className="min-h-0 flex-1 overflow-y-auto px-2" aria-label="Main menu">
                <ul className="flex flex-col gap-1">
                    {menuItems.map((item) => (
                        <li key={item.link} className="list-none">
                            <NavLink
                                to={item.link}
                                end={item.link === "/"}
                                onClick={handleMenuItemClick}
                                tabIndex={isMobile && !isOpen ? -1 : undefined}
                                className={({ isActive }) => `group relative flex min-h-11 items-center gap-3 rounded-xl px-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 ${isActive ? "bg-primary-50 font-semibold text-primary-900" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"}`}
                            >
                                {({ isActive }) => <>
                                    {isActive && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary-700" aria-hidden="true" />}
                                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors ${isActive ? "text-primary-800" : "text-neutral-600 group-hover:text-neutral-900"}`}>{item.icon}</span>
                                    <span className="truncate text-sm">{item.name}</span>
                                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-700" aria-hidden="true" />}
                                </>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="mt-auto shrink-0 border-t border-neutral-200 p-2">
                <NavLink
                    to="/logout"
                    onClick={handleMenuItemClick}
                    tabIndex={isMobile && !isOpen ? -1 : undefined}
                    className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 ${isActive ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"}`}
                >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"><HiOutlineLogin className="text-2xl" /></span>
                    <span>Sign out</span>
                </NavLink>
            </div>
            <button
                type="button"
                aria-label="Close navigation menu"
                className="absolute right-3 top-3 rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100 lg:hidden"
                onClick={closeSidebar}
                tabIndex={isMobile && !isOpen ? -1 : undefined}
            >
                <IoIosClose className="text-3xl" />
            </button>
        </aside>
        </>
    );
}
