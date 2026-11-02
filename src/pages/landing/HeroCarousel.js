import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCalendar, FiCheck, FiHeart, FiLock, FiMessageCircle, FiShield, FiUsers } from "react-icons/fi";

const EASE = [0.22, 1, 0.36, 1];

/**
 * The hero shows the breadth of the platform: four real product surfaces
 * cycle in one window frame. Auto-advances, pauses on hover, and the dots
 * let visitors jump straight to the feature they care about.
 */

const CommunityFace = () => (
    <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                Confession
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
                <FiLock aria-hidden="true" /> Anonymous
            </span>
        </div>
        <h4 className="mt-3 text-base font-bold leading-snug text-neutral-900">
            The letter I wrote and never sent
        </h4>
        <img
            src="https://res.cloudinary.com/dlt0e09e7/image/upload/v1793654627/posts/b3bfa1cd2e8249239c0132711bb0458d.jpg.jpg"
            alt=""
            className="mt-3 h-32 w-full flex-1 rounded-xl object-cover"
        />
        <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1"><FiHeart aria-hidden="true" className="text-rose-500" /> 12</span>
            <span className="inline-flex items-center gap-1"><FiMessageCircle aria-hidden="true" /> 4</span>
            <span className="ml-auto text-[10px] font-semibold text-primary-700">Screened before it landed</span>
        </div>
    </div>
);

const RoomFace = () => (
    <div className="flex h-full flex-col">
        <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-primary-700"><FiUsers aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-neutral-900">Sleep and burnout</p>
                <p className="text-[10px] text-neutral-500">6 members · 2 online</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
            </span>
        </div>
        <div className="mt-3 flex-1 space-y-2">
            <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-neutral-100 px-3 py-2 text-xs leading-relaxed text-neutral-700">
                Finished the night shift. Who is still awake?
            </p>
            <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary-700 px-3 py-2 text-xs leading-relaxed text-white">
                Me. Tea, not coffee this time.
            </p>
            <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-sm bg-neutral-100 px-3 py-2.5">
                {[0, 1, 2].map((dot) => (
                    <motion.span
                        key={dot}
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-neutral-400"
                        animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.18, ease: "easeInOut" }}
                    />
                ))}
            </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-neutral-200 bg-base-100 px-3 py-2 text-[11px] text-neutral-400">
            Message the room…
            <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold uppercase text-amber-600"><FiLock aria-hidden="true" /> Passphrase</span>
        </div>
    </div>
);

const AppointmentFace = () => (
    <div className="flex h-full flex-col">
        <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-900">
                <FiCalendar aria-hidden="true" className="text-primary-700" /> Your session
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                <FiCheck aria-hidden="true" /> Confirmed
            </span>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-base-100 p-3">
            <img
                src="https://res.cloudinary.com/dlt0e09e7/image/upload/v1793541815/nexus-demo/nexus-avatar-n6aee4.png"
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-2 ring-primary-100"
            />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-neutral-900">Dr. Nadia Rahman</p>
                <p className="truncate text-xs text-neutral-500">Counselling psychology · 4.5 ★</p>
            </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[["Tue, Nov 3", "12:15 PM"], ["45 minutes", "150 EGP"]].map(([first, second]) => (
                <div key={first} className="rounded-xl bg-canvas px-3 py-2.5 ring-1 ring-neutral-200/70">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{first}</dt>
                    <dd className="mt-0.5 font-bold text-neutral-900">{second}</dd>
                </div>
            ))}
        </dl>
        <p className="mt-auto inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
            <FiShield aria-hidden="true" className="text-primary-600" />
            Double-booking is locked out server-side, not politely asked.
        </p>
    </div>
);

const ScreeningFace = () => (
    <div className="flex h-full flex-col items-center text-center">
        <div className="relative mt-1 grid h-28 w-28 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-neutral-100" />
                <motion.circle
                    cx="50" cy="50" r="42" fill="none" strokeWidth="9" strokeLinecap="round"
                    className="stroke-primary-600"
                    strokeDasharray={2 * Math.PI * 42}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * 0.35 }}
                    transition={{ duration: 1.1, ease: EASE }}
                />
            </svg>
            <div>
                <p className="text-2xl font-bold text-neutral-900">65%</p>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-neutral-400">this week</p>
            </div>
        </div>
        <p className="mt-3 text-sm font-bold text-neutral-900">Check-in complete</p>
        <p className="mt-1 max-w-[24ch] text-xs leading-relaxed text-neutral-500">
            Mild symptoms trended down for the second week in a row.
        </p>
        <div className="mt-4 flex items-end gap-1.5" aria-hidden="true">
            {[38, 52, 47, 61, 55, 65].map((height, index) => (
                <motion.span
                    key={index}
                    className="w-3 rounded-t bg-primary-100"
                    initial={{ height: 6 }}
                    animate={{ height: `${height * 0.6}px` }}
                    transition={{ delay: 0.2 + index * 0.08, duration: 0.5, ease: EASE }}
                >
                    <span className="block h-full w-full rounded-t bg-gradient-to-t from-primary-300 to-primary-500" />
                </motion.span>
            ))}
        </div>
        <p className="mt-auto inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
            <FiShield aria-hidden="true" className="text-primary-600" /> Private between you and your clinician
        </p>
    </div>
);

const FACES = [
    { key: "community", label: "Community", title: "Where people actually talk", Face: CommunityFace },
    { key: "rooms", label: "Live rooms", title: "Support that answers back", Face: RoomFace },
    { key: "appointments", label: "Appointments", title: "Booked in seconds, held by design", Face: AppointmentFace },
    { key: "screening", label: "Check-ins", title: "Understand how you feel", Face: ScreeningFace },
];

export const HeroCarousel = () => {
    const reduceMotion = useReducedMotion();
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (reduceMotion || paused) return undefined;
        const timer = setInterval(() => {
            setDirection(1);
            setIndex((current) => (current + 1) % FACES.length);
        }, 4600);
        return () => clearInterval(timer);
    }, [reduceMotion, paused]);

    const goTo = (next) => {
        if (next === index) return;
        setDirection(next > index ? 1 : -1);
        setIndex(next);
    };

    const face = FACES[index];

    return (
        <div
            className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-base-100 shadow-2xl shadow-primary-900/15"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="flex items-center gap-2.5 border-b border-neutral-200 bg-canvas px-4 py-3">
                <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </span>
                <p className="ml-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Nexus · {face.label}
                </p>
            </div>

            <div className="px-5 pb-4 pt-5 sm:px-6">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={face.key}
                        initial={reduceMotion ? false : { opacity: 0, x: 28 * direction }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, x: -28 * direction }}
                        transition={{ duration: 0.45, ease: EASE }}
                    >
                        <h3 className="text-[15px] font-bold tracking-tight text-neutral-900">{face.title}</h3>
                        <div className="mt-3 h-[288px]">
                            <face.Face />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-neutral-200 bg-canvas px-4 py-3" role="tablist" aria-label="Product tour">
                {FACES.map((item, dot) => (
                    <button
                        key={item.key}
                        type="button"
                        role="tab"
                        aria-selected={dot === index}
                        aria-label={`Show ${item.label}`}
                        onClick={() => goTo(dot)}
                        className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                            dot === index ? "w-7 bg-primary-600" : "w-2 bg-neutral-300 hover:bg-neutral-400"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
