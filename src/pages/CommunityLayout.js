import { NavLink, Outlet } from "react-router-dom";

/**
 * The Community shell.
 *
 * The forums page keeps its own width and behaviour, so this layout only adds
 * a tab bar above the routed content. It deliberately does not impose a
 * max-width container: wrapping the forums page in one would reflow it.
 */
export const CommunityLayout = () => {
    const tabClass = ({ isActive }) =>
        `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 ${
            isActive
                ? "bg-primary-700 text-white shadow-sm"
                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
        }`;

    return (
        <div className="w-full">
            <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
                <nav aria-label="Community sections" className="flex flex-wrap items-center gap-2">
                    <NavLink to="/Community" end className={tabClass}>
                        Discussions
                    </NavLink>
                    <NavLink to="/Community/rooms" className={tabClass}>
                        Chat rooms
                    </NavLink>
                </nav>
            </div>
            <Outlet />
        </div>
    );
};
