import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiLock, FiUsers, FiShield, FiKey, FiUnlock, FiMessageSquare } from "react-icons/fi";
import { BsChatDotsFill } from "react-icons/bs";
import { ROOMS } from "./landingData";
import { Tilt3D } from "./Depth";
import { useStaggerVariants } from "./Reveal";

/** Room capability chips, derived from each room's real flags. */
const capabilities = (room) => {
    const list = [
        {
            icon: room.visibility === "Public" ? FiUnlock : FiLock,
            label: room.visibility,
            tone: room.visibility === "Public" ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50",
        },
        {
            icon: FiUsers,
            label: `${room.members} member${room.members === 1 ? "" : "s"}`,
            tone: "text-primary-700 bg-primary-50",
        },
    ];
    if (room.password) list.push({ icon: FiKey, label: "Password", tone: "text-neutral-700 bg-neutral-100" });
    if (room.ownerIsDoctor)
        list.push({ icon: FiShield, label: "Clinician-led", tone: "text-sky-700 bg-sky-50" });
    return list;
};

/**
 * Group rooms, using the three rooms that exist in the API right now.
 *
 * Cards tilt in 3D on pointer move so the section reads as a set of objects
 * rather than a flat list; the tilt is skipped under reduced motion.
 */
export const RoomsShowcase = () => {
    const reduceMotion = useReducedMotion();
    const variants = useStaggerVariants(reduceMotion);
    const [active, setActive] = useState(ROOMS[1]?.id ?? ROOMS[0]?.id ?? null);
    const activeRoom = ROOMS.find((room) => room.id === active) || ROOMS[0];

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
            {/* Room list — min-w-0 keeps grid children from inflating past the
                viewport via their automatic minimum size on narrow phones */}
            <motion.ul
                variants={variants.container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="min-w-0 space-y-3"
            >
                {ROOMS.map((room) => {
                    const selected = room.id === active;
                    return (
                        <motion.li key={room.id} variants={variants.item}>
                            <button
                                type="button"
                                onClick={() => setActive(room.id)}
                                aria-pressed={selected}
                                className={`w-full rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                                    selected
                                        ? "border-primary-600 bg-primary-50 shadow-lg shadow-primary-900/5"
                                        : "border-neutral-200 bg-base-100 hover:border-primary-300 hover:bg-primary-50/40"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-2.5">
                                        {room.cover && (
                                            <img
                                                src={room.cover}
                                                alt=""
                                                loading="lazy"
                                                className="mt-0.5 h-9 w-12 shrink-0 rounded-lg object-cover"
                                            />
                                        )}
                                        <h3 className="text-sm font-bold text-neutral-900">{room.name}</h3>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                            room.visibility === "Public"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-amber-100 text-amber-800"
                                        }`}
                                    >
                                        {room.visibility}
                                    </span>
                                </div>
                                {room.description ? (
                                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                                        {room.description}
                                    </p>
                                ) : (
                                    <p className="mt-1.5 text-xs italic text-neutral-500">
                                        Invite-only room with no public description.
                                    </p>
                                )}
                                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                    {capabilities(room).map(({ icon: Icon, label, tone }) => (
                                        <span
                                            key={label}
                                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}
                                        >
                                            <Icon aria-hidden="true" />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        </motion.li>
                    );
                })}
            </motion.ul>

            {/* Selected room preview — a tilted 3D chat surface */}
            <Tilt3D className="min-w-0 rounded-3xl" intensity={7}>
                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-base-100 shadow-2xl shadow-slate-900/10">
                    {activeRoom?.cover && (
                        <img
                            src={activeRoom.cover}
                            alt=""
                            className="h-28 w-full object-cover"
                            loading="lazy"
                        />
                    )}
                    <div className="flex items-center gap-3 border-b border-neutral-200 bg-canvas px-4 py-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-700 text-white">
                            <BsChatDotsFill aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-neutral-900">{activeRoom?.name}</p>
                            <p className="truncate text-[11px] text-neutral-600">
                                {activeRoom?.members} members · led by {activeRoom?.owner}
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Live
                        </span>
                    </div>

                    <div className="space-y-2.5 bg-gradient-to-b from-base-100 to-canvas p-4">
                        {[
                            { name: activeRoom?.owner || "Room lead", text: "Welcome. Take your time — no one here is in a hurry.", mine: false },
                            { name: "Member", text: "The 4am wake-ups stopped once I moved my phone out of the bedroom.", mine: false },
                            { name: "You", text: "That is such a small change for such a big difference.", mine: true },
                        ].map((message, index) => (
                            <motion.div
                                key={index}
                                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: reduceMotion ? 0 : 0.1 + index * 0.12, duration: 0.4 }}
                                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                    message.mine
                                        ? "ml-auto bg-primary-700 text-white"
                                        : "bg-neutral-100 text-neutral-800"
                                }`}
                            >
                                <p
                                    className={`mb-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                        message.mine ? "text-primary-100" : "text-neutral-500"
                                    }`}
                                >
                                    {message.name}
                                </p>
                                {message.text}
                            </motion.div>
                        ))}

                        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-base-100 px-3 py-2 text-xs text-neutral-500">
                            <FiMessageSquare aria-hidden="true" />
                            Message the room…
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                <FiShield aria-hidden="true" /> Screened
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-neutral-200 border-t border-neutral-200 bg-base-100 text-center">
                        {[
                            { label: "Visibility", value: activeRoom?.visibility },
                            { label: "Members", value: activeRoom?.members },
                            { label: "Access", value: activeRoom?.password ? "Password" : "Open" },
                        ].map((item) => (
                            <div key={item.label} className="px-2 py-2.5">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                                    {item.label}
                                </p>
                                <p className="text-xs font-bold text-neutral-900">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Tilt3D>
        </div>
    );
};

export default RoomsShowcase;
