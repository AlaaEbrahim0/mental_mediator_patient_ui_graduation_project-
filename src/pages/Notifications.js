import { FiBell, FiCheckCircle, FiInbox } from "react-icons/fi";
import { useNotifications } from "../context/notificationsContext";
import { Notification } from "../components/ui/Notification";

export function Notifications() {
    const { notifications = [], count = 0, loading, markAllAsRead, fetchNotifications } = useNotifications();

    return (
        <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">
            <header className="flex flex-col gap-4 border-b border-base-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-xl text-primary"><FiBell aria-hidden="true" /></span>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Notifications</h1>
                        <p className="mt-0.5 text-sm text-slate-600">{count ? `${count} unread notification${count === 1 ? "" : "s"}` : "You’re all caught up"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button type="button" onClick={() => fetchNotifications()} disabled={loading} className="btn btn-sm btn-ghost text-slate-700">Refresh</button>
                    <button type="button" onClick={markAllAsRead} disabled={!count || loading} className="btn btn-sm btn-outline border-slate-300 bg-base-100 text-slate-700">
                        <FiCheckCircle aria-hidden="true" /> Mark all read
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="space-y-3 p-4 sm:p-6" aria-label="Loading notifications">
                    {Array.from({ length: 5 }, (_, index) => <div key={index} className="flex gap-3 rounded-xl border border-base-200 p-4"><div className="skeleton h-10 w-10 shrink-0 rounded-full" /><div className="min-w-0 flex-1 space-y-2"><div className="skeleton h-3 w-32" /><div className="skeleton h-4 w-full" /><div className="skeleton h-3 w-24" /></div></div>)}
                </div>
            ) : notifications.length ? (
                <ul className="divide-y divide-base-200 px-3 py-2 sm:px-5">
                    {notifications.map((notification) => (
                        <li key={notification.id} className="py-2">
                            <Notification {...notification} />
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-base-200 text-2xl text-slate-500"><FiInbox aria-hidden="true" /></span>
                    <h2 className="mt-4 font-semibold text-slate-900">No notifications yet</h2>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">Appointment reminders and community updates will show here.</p>
                </div>
            )}
        </section>
    );
}
