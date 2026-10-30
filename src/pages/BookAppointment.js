import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiClock, FiMapPin, FiRefreshCw } from "react-icons/fi";
import { getDoctor, getDoctorSlots } from "../api/doctors.api";
import { createAppointment } from "../api/appointments.api";
import { getApiErrorMessage } from "../api/client";
import { Avatar, StatusBadge } from "../components/booking/shared";
import { Alert, Button, Card, EmptyState, ErrorState, Skeleton, Textarea } from "../components/ui";
import {
    addDaysToKey,
    dateFromKey,
    formatDuration,
    formatFee,
    formatLongDate,
    formatSpecialization,
    formatTime,
    fullName,
    getLocalTimeZone,
    localDateKey,
    parseUtc,
} from "../utils/format";

// The server accepts at most 62 days per availability request.
const WINDOW_DAYS = 28;
const MAX_WINDOWS = 4;

// Booking failures that mean "that slot is gone" rather than "something broke".
const SLOT_TAKEN_CODES = new Set([
    "Scheduling.AppointmentConflict",
    "Scheduling.TimeOffConflict",
    "Scheduling.OutsideWorkingHours",
    "Appointments.StartInPast",
]);

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: "short" });

const DAY_PARTS = [
    { id: "morning", label: "Morning", matches: (hour) => hour < 12 },
    { id: "afternoon", label: "Afternoon", matches: (hour) => hour >= 12 && hour < 17 },
    { id: "evening", label: "Evening", matches: (hour) => hour >= 17 },
];

const Summary = ({ doctor, slot, duration, location, fee }) => (
    <Card className="h-fit lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
            <Avatar src={doctor.photoUrl} name={fullName(doctor)} size="h-12 w-12" />
            <div className="min-w-0">
                <p className="truncate font-bold text-neutral-900">Dr. {fullName(doctor)}</p>
                <p className="truncate text-sm text-primary-800">{formatSpecialization(doctor.specialization)}</p>
            </div>
        </div>
        <dl className="mt-5 space-y-3 border-t border-neutral-200 pt-5 text-sm">
            <div className="flex gap-3">
                <FiCalendar aria-hidden="true" className="mt-0.5 shrink-0 text-primary-700" />
                <div>
                    <dt className="sr-only">Date</dt>
                    <dd className="font-semibold text-neutral-900">{slot ? formatLongDate(slot.startTime) : "Choose a date"}</dd>
                </div>
            </div>
            <div className="flex gap-3">
                <FiClock aria-hidden="true" className="mt-0.5 shrink-0 text-primary-700" />
                <div>
                    <dt className="sr-only">Time</dt>
                    <dd className="font-semibold text-neutral-900">
                        {slot ? `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}` : "Choose a time"}
                        {duration ? <span className="ml-2 font-normal text-neutral-600">({formatDuration(duration)})</span> : null}
                    </dd>
                </div>
            </div>
            {location && (
                <div className="flex gap-3">
                    <FiMapPin aria-hidden="true" className="mt-0.5 shrink-0 text-primary-700" />
                    <div>
                        <dt className="sr-only">Location</dt>
                        <dd className="text-neutral-800">{location}</dd>
                    </div>
                </div>
            )}
        </dl>
        <div className="mt-5 flex items-center justify-between border-t border-neutral-200 pt-5">
            <span className="text-sm text-neutral-600">Session fee</span>
            <span className="text-base font-bold text-neutral-900">{formatFee(fee)}</span>
        </div>
    </Card>
);

export const BookAppointment = () => {
    const { doctorId } = useParams();

    const [doctor, setDoctor] = useState(null);
    const [doctorError, setDoctorError] = useState("");
    const [isDoctorLoading, setIsDoctorLoading] = useState(true);

    // Every slot the server has returned so far, keyed by its UTC start.
    const [slotMap, setSlotMap] = useState(() => new Map());
    const [meta, setMeta] = useState({ timeZoneId: "", durationMinutes: 0 });
    const [isSlotsLoading, setIsSlotsLoading] = useState(true);
    const [slotsError, setSlotsError] = useState("");
    const [windows, setWindows] = useState(1);
    const windowEnd = useRef(null);
    const slotsRequest = useRef(0);

    const [selectedDateKey, setSelectedDateKey] = useState(null);
    const [selectedStart, setSelectedStart] = useState(null);
    const [step, setStep] = useState("choose"); // choose | review | done
    const [notice, setNotice] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [booked, setBooked] = useState(null);

    const loadDoctor = useCallback(async () => {
        setIsDoctorLoading(true);
        setDoctorError("");
        try {
            setDoctor(await getDoctor(doctorId));
        } catch (error) {
            setDoctorError(
                error.response?.status === 404
                    ? "We could not find this doctor."
                    : getApiErrorMessage(error, "We could not load this doctor.")
            );
        } finally {
            setIsDoctorLoading(false);
        }
    }, [doctorId]);

    /**
     * Ask the server for open slots. A fresh load replaces everything; "append"
     * extends the window further into the future. Nothing is computed locally.
     */
    const loadSlots = useCallback(
        async ({ append = false } = {}) => {
            const id = ++slotsRequest.current;
            setIsSlotsLoading(true);
            setSlotsError("");
            // Start a day early so patients east/west of the doctor never lose a day to time-zone shifts.
            const from = append ? addDaysToKey(windowEnd.current, 1) : addDaysToKey(localDateKey(new Date()), -1);
            const to = addDaysToKey(from, WINDOW_DAYS - 1);
            try {
                const result = await getDoctorSlots(doctorId, from, to);
                if (id !== slotsRequest.current) return;
                windowEnd.current = to;
                setMeta({
                    timeZoneId: result.timeZoneId || "",
                    durationMinutes: result.consultationDurationMinutes || 0,
                });
                setSlotMap((previous) => {
                    const next = append ? new Map(previous) : new Map();
                    (result.days || []).forEach((day) =>
                        (day.slots || []).forEach((slot) => next.set(slot.startTime, slot))
                    );
                    return next;
                });
                setWindows((count) => (append ? count + 1 : 1));
            } catch (error) {
                if (id !== slotsRequest.current) return;
                setSlotsError(getApiErrorMessage(error, "We could not load available times."));
            } finally {
                if (id === slotsRequest.current) setIsSlotsLoading(false);
            }
        },
        [doctorId]
    );

    useEffect(() => {
        loadDoctor();
        loadSlots();
    }, [loadDoctor, loadSlots]);

    // Regroup the server's slots by the patient's own calendar day.
    const days = useMemo(() => {
        const now = Date.now();
        const grouped = new Map();
        slotMap.forEach((slot) => {
            const start = parseUtc(slot.startTime);
            if (!start || start.getTime() <= now) return;
            const key = localDateKey(start);
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push({ ...slot, start });
        });
        return [...grouped.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, slots]) => ({ key, slots: slots.sort((a, b) => a.start - b.start) }));
    }, [slotMap]);

    // Keep the selected date valid as availability changes.
    useEffect(() => {
        if (days.length === 0) {
            setSelectedDateKey(null);
        } else if (!days.some((day) => day.key === selectedDateKey)) {
            setSelectedDateKey(days[0].key);
        }
    }, [days, selectedDateKey]);

    // A slot that has disappeared from the latest availability is no longer selected.
    const selectedSlot = selectedStart ? slotMap.get(selectedStart) || null : null;
    const selectedDay = days.find((day) => day.key === selectedDateKey);

    const location = doctor ? doctor.location || doctor.city || "To be confirmed with the doctor" : "";
    const patientZone = getLocalTimeZone();
    const zonesDiffer = meta.timeZoneId && meta.timeZoneId !== patientZone;

    const refreshAvailability = async () => {
        await loadSlots();
    };

    const handleSubmit = async () => {
        if (!selectedSlot || isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError("");
        try {
            // Only the start instant is sent; the server owns duration, fee and validity.
            const appointment = await createAppointment(doctorId, {
                startTime: selectedSlot.startTime,
                location,
                reason,
            });
            setBooked(appointment);
            setStep("done");
        } catch (error) {
            const code = error.response?.data?.errors?.[0]?.code;
            if (code === "Scheduling.DoctorUnavailable") {
                // Not a slot problem: the doctor has stopped taking requests, so
                // reloading the grid would keep offering times that can never be
                // booked. Say so at the form and leave the choice of doctor to them.
                setSubmitError(getApiErrorMessage(error, "This doctor is not accepting new appointment requests right now."));
            } else if (error.response?.status === 409 || SLOT_TAKEN_CODES.has(code)) {
                // The slot was taken (or the schedule changed) after we loaded it.
                setNotice("That time is no longer available. Someone may have just booked it. Please choose another time.");
                setSelectedStart(null);
                setStep("choose");
                loadSlots();
            } else {
                setSubmitError(getApiErrorMessage(error, "We could not book this appointment. Please try again."));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const backLink = (
        <Link to={doctor ? `/doctors/${doctor.id}` : "/doctors"} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800 hover:underline">
            <FiArrowLeft aria-hidden="true" /> {doctor ? `Dr. ${fullName(doctor)}’s profile` : "All doctors"}
        </Link>
    );

    if (isDoctorLoading) {
        return (
            <div className="space-y-6" aria-busy="true" aria-label="Loading booking page">
                {backLink}
                <Skeleton className="h-10 w-1/3" />
                <div className="grid gap-6 lg:grid-cols-3"><Skeleton className="h-96 lg:col-span-2" /><Skeleton className="h-64" /></div>
            </div>
        );
    }

    if (doctorError || !doctor) {
        return (
            <div className="space-y-6">
                {backLink}
                <ErrorState title="We can’t book this doctor" message={doctorError} onRetry={doctorError.includes("could not find") ? undefined : loadDoctor} />
            </div>
        );
    }

    // ---- Confirmation -----------------------------------------------------
    if (step === "done" && booked) {
        return (
            <div className="mx-auto max-w-2xl space-y-6">
                <Card className="text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-100 text-3xl text-success-800">
                        <FiCheckCircle aria-hidden="true" />
                    </span>
                    <h1 className="mt-4 text-2xl font-bold text-neutral-900">Appointment requested</h1>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
                        Dr. {fullName(doctor)} will review your request. You will get a notification and an email as soon as it is confirmed.
                    </p>
                    <dl className="mx-auto mt-6 max-w-sm divide-y divide-neutral-200 rounded-xl border border-neutral-200 text-left text-sm">
                        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-neutral-600">Status</dt><dd><StatusBadge status={booked.status || "Pending"} /></dd></div>
                        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-neutral-600">Date</dt><dd className="text-right font-semibold">{formatLongDate(booked.startTime)}</dd></div>
                        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-neutral-600">Time</dt><dd className="font-semibold">{formatTime(booked.startTime)}</dd></div>
                        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-neutral-600">Length</dt><dd className="font-semibold">{formatDuration(booked.duration)}</dd></div>
                        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-neutral-600">Location</dt><dd className="text-right font-semibold">{booked.location}</dd></div>
                        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-neutral-600">Fee</dt><dd className="font-semibold">{formatFee(booked.fees)}</dd></div>
                    </dl>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button as={Link} to="/appointments">View my appointments</Button>
                        <Button as={Link} to="/doctors" variant="outline">Back to doctors</Button>
                    </div>
                </Card>
            </div>
        );
    }

    // ---- Choose / review ----------------------------------------------------
    return (
        <div className="space-y-6">
            {backLink}
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                    {step === "review" ? "Review your appointment" : "Book an appointment"}
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                    {step === "review"
                        ? "Check the details below, then confirm your request."
                        : `Choose a date and time with Dr. ${fullName(doctor)}.`}
                </p>
            </header>

            {doctor.isAvailable === false && (
                <Alert variant="warning">This doctor has marked themselves as not accepting new patients right now. Your request may not be accepted.</Alert>
            )}
            {notice && step === "choose" && (
                <Alert variant="warning" title="Please pick another time" action={<Button size="sm" variant="ghost" onClick={() => setNotice("")}>Dismiss</Button>}>{notice}</Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="min-w-0 space-y-6">
                    {step === "choose" ? (
                        <Card>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900">Select a date</h2>
                                    <p className="mt-0.5 text-xs text-neutral-500">
                                        Times are shown in your time zone ({patientZone}).
                                        {zonesDiffer && ` The doctor practises in ${meta.timeZoneId}.`}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={refreshAvailability} disabled={isSlotsLoading} aria-label="Refresh times">
                                    <FiRefreshCw aria-hidden="true" className={isSlotsLoading ? "animate-spin" : ""} />
                                    <span className="hidden sm:inline">Refresh times</span>
                                </Button>
                            </div>

                            {isSlotsLoading && days.length === 0 ? (
                                <div className="mt-5 space-y-4" aria-busy="true" aria-label="Loading available times">
                                    <div className="flex gap-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-16 shrink-0" />)}</div>
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            ) : slotsError && days.length === 0 ? (
                                <ErrorState className="mt-5" title="Available times could not be loaded" message={slotsError} onRetry={refreshAvailability} />
                            ) : days.length === 0 ? (
                                <EmptyState
                                    className="mt-5"
                                    icon={<FiCalendar aria-hidden="true" />}
                                    title="No open times right now"
                                    description="This doctor has no open times in the coming weeks. Check back soon, or look further ahead."
                                    action={windows < MAX_WINDOWS && <Button variant="outline" onClick={() => loadSlots({ append: true })} loading={isSlotsLoading}>Look further ahead</Button>}
                                />
                            ) : (
                                <>
                                    {slotsError && <Alert variant="error" className="mt-4">{slotsError}</Alert>}
                                    <div role="group" aria-label="Available dates" className="mt-5 flex min-w-0 gap-1.5 overflow-x-auto pb-2">
                                        {days.map((day) => {
                                            const date = dateFromKey(day.key);
                                            const active = day.key === selectedDateKey;
                                            return (
                                                <button
                                                    key={day.key}
                                                    type="button"
                                                    aria-pressed={active}
                                                    onClick={() => setSelectedDateKey(day.key)}
                                                    className={`flex w-16 shrink-0 flex-col items-center rounded-xl border px-1.5 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 ${
                                                        active ? "border-primary-700 bg-primary-700 text-white shadow-md" : "border-neutral-300 bg-base-100 text-neutral-800 hover:border-primary-400"
                                                    }`}
                                                >
                                                    <span className="text-xs font-medium uppercase">{weekdayFormat.format(date)}</span>
                                                    <span className="text-xl font-bold leading-tight">{date.getDate()}</span>
                                                    <span className="text-xs">{monthFormat.format(date)}</span>
                                                    <span className={`mt-1 text-[0.6875rem] font-semibold ${active ? "text-primary-100" : "text-primary-800"}`}>{day.slots.length} open</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {windows < MAX_WINDOWS && (
                                        <Button variant="link" size="sm" className="mt-2" onClick={() => loadSlots({ append: true })} loading={isSlotsLoading} loadingText="Loading…">
                                            Look further ahead
                                        </Button>
                                    )}

                                    {selectedDay && (
                                        <div className="mt-6">
                                            <h3 className="text-base font-bold text-neutral-900">{formatLongDate(selectedDay.slots[0].startTime)}</h3>
                                            <div className="mt-3 space-y-4" role="radiogroup" aria-label="Available times">
                                                {DAY_PARTS.map((part) => {
                                                    const slots = selectedDay.slots.filter((slot) => part.matches(slot.start.getHours()));
                                                    if (!slots.length) return null;
                                                    return (
                                                        <div key={part.id}>
                                                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">{part.label}</p>
                                                            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2 lg:grid-cols-6">
                                                                {slots.map((slot) => {
                                                                    const active = slot.startTime === selectedStart;
                                                                    return (
                                                                        <button
                                                                            key={slot.startTime}
                                                                            type="button"
                                                                            role="radio"
                                                                            aria-checked={active}
                                                                            onClick={() => setSelectedStart(slot.startTime)}
                                                                            className={`h-11 rounded-xl border text-[0.8125rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 sm:text-sm ${
                                                                                active ? "border-primary-700 bg-primary-700 text-white shadow-md" : "border-neutral-300 bg-base-100 text-neutral-800 hover:border-primary-500 hover:bg-primary-50"
                                                                            }`}
                                                                        >
                                                                            {formatTime(slot.startTime)}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </Card>
                    ) : (
                        <Card>
                            <h2 className="text-lg font-bold text-neutral-900">Anything the doctor should know?</h2>
                            <p className="mt-1 text-sm text-neutral-600">Optional. Share what you would like to talk about so your doctor can prepare.</p>
                            <Textarea
                                id="booking-reason"
                                className="mt-4"
                                rows={5}
                                maxLength={1000}
                                placeholder="For example: I have been feeling anxious at work and would like to discuss coping strategies."
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                hint={`${reason.length}/1000`}
                            />
                            <Alert variant="info" className="mt-5">
                                Your request goes to Dr. {fullName(doctor)} for confirmation. We check that the time is still free when you submit.
                            </Alert>
                            {submitError && <Alert variant="error" className="mt-4">{submitError}</Alert>}
                        </Card>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        {step === "review" ? (
                            <>
                                <Button variant="outline" onClick={() => { setSubmitError(""); setStep("choose"); }} disabled={isSubmitting}>Back</Button>
                                <Button size="lg" onClick={handleSubmit} loading={isSubmitting} loadingText="Booking…">Confirm booking</Button>
                            </>
                        ) : (
                            <Button size="lg" disabled={!selectedSlot} onClick={() => { setNotice(""); setStep("review"); }}>Continue</Button>
                        )}
                    </div>
                </div>

                <Summary
                    doctor={doctor}
                    slot={selectedSlot}
                    duration={meta.durationMinutes}
                    location={location}
                    fee={doctor.sessionFees}
                />
            </div>
        </div>
    );
};
