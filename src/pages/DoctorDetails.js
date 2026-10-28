import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiAward, FiClock, FiMapPin } from "react-icons/fi";
import { getDoctor, getDoctorSchedule } from "../api/doctors.api";
import { getApiErrorMessage } from "../api/client";
import { Avatar } from "../components/booking/shared";
import { Alert, Badge, Button, Card, ErrorState, Skeleton, SkeletonText } from "../components/ui";
import { formatDuration, formatFee, formatSpecialization, fullName } from "../utils/format";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** "09:00:00" -> "9:00 AM" in the viewer's locale (display only, no zone maths). */
const formatClock = (timeSpan) => {
    const [hours, minutes] = String(timeSpan || "").split(":").map(Number);
    if (!Number.isFinite(hours)) return "—";
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(
        new Date(2000, 0, 1, hours, minutes || 0)
    );
};

const Detail = ({ icon, label, children }) => (
    <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-800">{icon}</span>
        <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-neutral-900">{children}</dd>
        </div>
    </div>
);

export const DoctorDetails = () => {
    const { doctorId } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            // The weekly schedule is a nice-to-have; the profile is not.
            const [profile, scheduleResult] = await Promise.all([
                getDoctor(doctorId),
                getDoctorSchedule(doctorId).catch(() => null),
            ]);
            setDoctor(profile);
            setSchedule(scheduleResult);
        } catch (requestError) {
            setError(
                requestError.response?.status === 404
                    ? "We could not find this doctor."
                    : getApiErrorMessage(requestError, "We could not load this doctor.")
            );
        } finally {
            setIsLoading(false);
        }
    }, [doctorId]);

    useEffect(() => {
        load();
    }, [load]);

    const backLink = (
        <Link to="/doctors" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800 hover:underline">
            <FiArrowLeft aria-hidden="true" /> All doctors
        </Link>
    );

    if (isLoading) {
        return (
            <div className="space-y-6" aria-busy="true" aria-label="Loading doctor">
                {backLink}
                <Card>
                    <div className="flex items-center gap-5">
                        <Skeleton className="h-24 w-24" rounded="rounded-full" />
                        <div className="flex-1 space-y-3"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-1/4" /></div>
                    </div>
                    <SkeletonText lines={4} className="mt-6" />
                </Card>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="space-y-6">
                {backLink}
                <ErrorState title="Doctor unavailable" message={error} onRetry={error.includes("could not find") ? undefined : load} />
            </div>
        );
    }

    const name = fullName(doctor);
    const periodsByDay = WEEKDAYS.map((day) => ({
        day,
        periods: (schedule?.periods || [])
            .filter((period) => period.dayOfWeek === day)
            .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
    })).filter((entry) => entry.periods.length > 0);

    return (
        <div className="space-y-6">
            {backLink}

            <Card className="relative overflow-hidden">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <Avatar src={doctor.photoUrl} name={name} size="h-24 w-24" textSize="text-3xl" />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Dr. {name}</h1>
                            {doctor.isAvailable === false && <Badge variant="neutral">Not accepting new patients</Badge>}
                        </div>
                        <p className="mt-1 text-base font-medium text-primary-800">{formatSpecialization(doctor.specialization)}</p>
                    </div>
                    <Button as={Link} to={`/doctors/${doctor.id}/book`} size="lg" className="w-full sm:w-auto">
                        Book an appointment
                    </Button>
                </div>
                {doctor.isAvailable === false && (
                    <Alert variant="warning" className="mt-5">
                        This doctor has marked themselves as not accepting new patients right now. You can still check their open times.
                    </Alert>
                )}
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <h2 className="text-lg font-bold text-neutral-900">About</h2>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-700">
                            {doctor.biography || "This doctor has not added a biography yet."}
                        </p>
                        {doctor.qualifications && (
                            <>
                                <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-neutral-500">Qualifications</h3>
                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-neutral-700">{doctor.qualifications}</p>
                            </>
                        )}
                    </Card>

                    <Card>
                        <h2 className="text-lg font-bold text-neutral-900">Weekly availability</h2>
                        {periodsByDay.length === 0 ? (
                            <p className="mt-3 text-sm text-neutral-600">
                                {schedule ? "No regular working hours have been published." : "Working hours are not available right now."}
                            </p>
                        ) : (
                            <>
                                <dl className="mt-4 divide-y divide-neutral-200">
                                    {periodsByDay.map(({ day, periods }) => (
                                        <div key={day} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                                            <dt className="font-semibold text-neutral-800">{day}</dt>
                                            <dd className="text-right text-neutral-700">
                                                {periods.map((period) => `${formatClock(period.startTime)} – ${formatClock(period.endTime)}`).join(", ")}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                                {schedule?.timeZoneId && (
                                    <p className="mt-3 text-xs text-neutral-500">Working hours are in the doctor’s time zone ({schedule.timeZoneId}). Open times are shown in your own time zone when you book.</p>
                                )}
                            </>
                        )}
                    </Card>
                </div>

                <Card className="h-fit">
                    <h2 className="text-lg font-bold text-neutral-900">Session details</h2>
                    <dl className="mt-4 space-y-4">
                        <Detail icon={<FiAward aria-hidden="true" />} label="Session fee">{formatFee(doctor.sessionFees)}</Detail>
                        <Detail icon={<FiClock aria-hidden="true" />} label="Session length">
                            {schedule?.consultationDurationMinutes ? formatDuration(schedule.consultationDurationMinutes) : "Shown when you book"}
                        </Detail>
                        {(doctor.location || doctor.city) && (
                            <Detail icon={<FiMapPin aria-hidden="true" />} label="Location">
                                {[doctor.location, doctor.city].filter(Boolean).join(", ")}
                            </Detail>
                        )}
                    </dl>
                    <Button as={Link} to={`/doctors/${doctor.id}/book`} fullWidth className="mt-6">
                        See available times
                    </Button>
                </Card>
            </div>
        </div>
    );
};
