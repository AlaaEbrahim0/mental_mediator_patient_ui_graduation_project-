import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiCheck, FiClock, FiMapPin, FiStar, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { AVAILABILITY, CLINICIANS } from "./landingData";

const EASE = [0.22, 1, 0.36, 1];

const shortDate = (iso) => {
    const date = new Date(`${iso}T00:00:00Z`);
    return {
        weekday: date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }),
        day: date.toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" }),
        month: date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
    };
};

const fullDate = (iso) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
    });

/**
 * Interactive booking walkthrough.
 *
 * This mirrors the real flow — pick a clinician, pick one of *their* bookable
 * days, pick a slot — using availability read from the API rather than a
 * mocked calendar. Nothing is submitted: the final step hands off to the real
 * sign-in page, because booking requires an account.
 */
export const BookingDemo = () => {
    const reduceMotion = useReducedMotion();
    const clinicians = useMemo(() => CLINICIANS.filter((doctor) => doctor.available), []);
    const [doctorId, setDoctorId] = useState(clinicians[0]?.id ?? null);
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);

    const doctor = clinicians.find((item) => item.id === doctorId) || null;
    const schedule = doctorId ? AVAILABILITY[doctorId] : null;
    const days = schedule?.days ?? [];
    const activeDay = days.find((item) => item.date === date) || null;

    /** Switching clinician invalidates the date and slot below it. */
    const pickDoctor = (id) => {
        setDoctorId(id);
        setDate(null);
        setTime(null);
    };

    const pickDate = (value) => {
        setDate(value);
        setTime(null);
    };

    const step = time ? 3 : date ? 2 : 1;

    return (
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-base-100 shadow-xl shadow-slate-900/5">
            {/* Step rail */}
            <div className="flex items-center gap-1 border-b border-neutral-200 bg-canvas px-4 py-3 sm:px-6">
                {["Clinician", "Day", "Time"].map((label, index) => {
                    const number = index + 1;
                    const done = step > number;
                    const current = step === number;
                    return (
                        <div key={label} className="flex flex-1 items-center gap-2">
                            <span
                                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors ${
                                    done
                                        ? "bg-success-600 text-white"
                                        : current
                                        ? "bg-primary-700 text-white"
                                        : "bg-neutral-200 text-neutral-500"
                                }`}
                            >
                                {done ? <FiCheck aria-hidden="true" className="text-xs" /> : number}
                            </span>
                            <span
                                className={`hidden text-xs font-semibold sm:block ${
                                    current ? "text-neutral-900" : "text-neutral-500"
                                }`}
                            >
                                {label}
                            </span>
                            {index < 2 && <span className="ml-1 h-px flex-1 bg-neutral-200" aria-hidden="true" />}
                        </div>
                    );
                })}
            </div>

            <div className="p-4 sm:p-6">
                {/* Step 1 — clinician */}
                <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        1 · Choose a clinician
                    </legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {clinicians.map((item) => {
                            const selected = item.id === doctorId;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => pickDoctor(item.id)}
                                    aria-pressed={selected}
                                    className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                                        selected
                                            ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600"
                                            : "border-neutral-200 bg-base-100 hover:border-primary-300 hover:bg-primary-50/40"
                                    }`}
                                >
                                    <img
                                        src={item.photo}
                                        alt=""
                                        loading="lazy"
                                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-bold text-neutral-900">
                                            {item.name}
                                        </span>
                                        <span className="block truncate text-[11px] text-neutral-600">
                                            {item.speciality}
                                            {item.ratingCount > 0 && (
                                                <span className="ml-1.5 inline-flex items-center gap-0.5 font-semibold text-neutral-700">
                                                    <FiStar aria-hidden="true" className="fill-amber-400 text-amber-500" />
                                                    {item.rating.toFixed(1)}
                                                    <span className="font-normal text-neutral-500">({item.ratingCount})</span>
                                                </span>
                                            )}
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-xs font-semibold text-neutral-700">
                                        {item.fee} EGP
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                {/* Step 2 — day, only for the chosen clinician's real availability */}
                <fieldset className="mt-5">
                    <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        2 · Pick an open day
                    </legend>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {days.map((item) => {
                            const selected = item.date === date;
                            const { weekday, day, month } = shortDate(item.date);
                            return (
                                <button
                                    key={item.date}
                                    type="button"
                                    onClick={() => pickDate(item.date)}
                                    aria-pressed={selected}
                                    className={`min-w-[4.25rem] shrink-0 rounded-xl border px-2 py-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                                        selected
                                            ? "border-primary-600 bg-primary-700 text-white"
                                            : "border-neutral-200 bg-base-100 text-neutral-700 hover:border-primary-300 hover:bg-primary-50"
                                    }`}
                                >
                                    <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-70">
                                        {weekday}
                                    </span>
                                    <span className="block text-lg font-bold leading-tight">{day}</span>
                                    <span className="block text-[10px] opacity-70">{month}</span>
                                </button>
                            );
                        })}
                        {!days.length && (
                            <p className="text-sm text-neutral-500">
                                This clinician has no open days in the demo window.
                            </p>
                        )}
                    </div>
                </fieldset>

                {/* Step 3 — time */}
                <fieldset className="mt-5">
                    <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        3 · Choose a time
                    </legend>
                    {activeDay ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {activeDay.times.map((slot) => {
                                const selected = slot === time;
                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setTime(slot)}
                                        aria-pressed={selected}
                                        className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                                            selected
                                                ? "border-primary-600 bg-primary-700 text-white"
                                                : "border-neutral-200 bg-base-100 text-neutral-700 hover:border-primary-300 hover:bg-primary-50"
                                        }`}
                                    >
                                        {slot}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-neutral-500">Pick a day to see the open times.</p>
                    )}
                </fieldset>

                {/* Summary */}
                <div className="mt-5 rounded-2xl border border-neutral-200 bg-canvas p-4">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`${doctorId}-${date}-${time}`}
                            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                            transition={{ duration: 0.25, ease: EASE }}
                        >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                                Your session
                            </p>
                            <div className="mt-2 space-y-1.5 text-sm text-neutral-800">
                                <p className="flex items-center gap-2">
                                    <FiCalendar aria-hidden="true" className="shrink-0 text-primary-700" />
                                    <span>
                                        {date ? fullDate(date) : "Choose a day"}
                                        {time ? ` at ${time} UTC` : ""}
                                    </span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <FiClock aria-hidden="true" className="shrink-0 text-primary-700" />
                                    <span>
                                        {schedule ? `${schedule.duration} minute session` : "—"}
                                        {doctor ? ` · ${doctor.fee} EGP` : ""}
                                    </span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <FiMapPin aria-hidden="true" className="shrink-0 text-primary-700" />
                                    <span>{doctor ? doctor.city : "—"}</span>
                                </p>
                            </div>
                            <div className="mt-4">
                                <Link
                                    to="/login"
                                    className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                                        time
                                            ? "bg-primary-700 text-white hover:bg-primary-800"
                                            : "pointer-events-none bg-neutral-200 text-neutral-500"
                                    }`}
                                    aria-disabled={!time}
                                    tabIndex={time ? 0 : -1}
                                >
                                    {time ? "Sign in to confirm this slot" : "Select a time to continue"}
                                    <FiArrowRight
                                        aria-hidden="true"
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                    Availability shown is real data from the Nexus API for the demo clinicians. Times are
                    UTC; the live app converts them to your own zone at checkout.
                </p>
            </div>
        </div>
    );
};

export default BookingDemo;
