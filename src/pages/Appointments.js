import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { APPOINTMENT_PAGE_SIZE, cancelAppointment, getMyAppointments, getUpcomingAppointments } from "../api/appointments.api";
import { getApiErrorMessage } from "../api/client";
import { Avatar, StatusBadge } from "../components/booking/shared";
import { Alert, Button, Card, EmptyState, ErrorState, Modal, Select, Skeleton, Textarea } from "../components/ui";
import { appointmentEnd, formatDateTime, formatDuration, formatFee } from "../utils/format";

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled", "Rejected"];

const canCancel = (appointment) => {
    if (!["Pending", "Confirmed"].includes(appointment.status)) return false;
    const end = appointmentEnd(appointment);
    return !end || end.getTime() > Date.now();
};

const nextAction = (appointment) => {
    const doctor = `Dr. ${appointment.doctorName}`;
    switch (appointment.status) {
        case "Pending":
            return `Waiting for ${doctor} to confirm your request.`;
        case "Confirmed":
            return canCancel(appointment)
                ? "Confirmed. Please be ready a few minutes before your session."
                : "Your doctor will mark this session as completed.";
        case "Completed":
            return "Session completed. Book a follow-up whenever you are ready.";
        case "Cancelled":
            return "You cancelled this appointment.";
        case "Rejected":
            return `${doctor} could not accept this request. You can choose another time.`;
        default:
            return "";
    }
};

const AppointmentCard = ({ appointment, onOpen, onCancel }) => (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
            <Avatar src={appointment.doctorPhotoUrl} name={appointment.doctorName} />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-bold text-neutral-900">Dr. {appointment.doctorName}</h3>
                    <StatusBadge status={appointment.status} size="sm" />
                </div>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-neutral-800">
                    <FiCalendar aria-hidden="true" className="shrink-0 text-primary-700" /> {formatDateTime(appointment.startTime)}
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-sm text-neutral-600">
                    <FiClock aria-hidden="true" className="shrink-0" /> {formatDuration(appointment.duration)}
                    {appointment.location && <><FiMapPin aria-hidden="true" className="ml-2 shrink-0" /> <span className="truncate">{appointment.location}</span></>}
                </p>
                <p className="mt-2 text-sm text-neutral-600">{nextAction(appointment)}</p>
            </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col">
            <Button size="sm" variant="outline" onClick={() => onOpen(appointment)}>Details</Button>
            {canCancel(appointment) && <Button size="sm" variant="ghost" onClick={() => onCancel(appointment)}>Cancel</Button>}
            {["Completed", "Cancelled", "Rejected"].includes(appointment.status) && (
                <Button as={Link} size="sm" to={`/doctors/${appointment.doctorId}/book`}>Book again</Button>
            )}
        </div>
    </Card>
);

export const Appointments = () => {
    const [tab, setTab] = useState("upcoming");
    const [status, setStatus] = useState("");
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [details, setDetails] = useState(null);
    const [toCancel, setToCancel] = useState(null);
    const [reason, setReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const requestId = useRef(0);

    const load = useCallback(async (pageNumber = 1) => {
        const id = ++requestId.current;
        const first = pageNumber === 1;
        first ? setIsLoading(true) : setIsLoadingMore(true);
        setError("");
        try {
            if (tab === "upcoming") {
                const result = await getUpcomingAppointments({ status: status || undefined });
                if (id !== requestId.current) return;
                setItems(result);
                setHasMore(false);
            } else {
                const result = await getMyAppointments({
                    endDate: new Date().toISOString(),
                    status: status || undefined,
                    pageNumber,
                });
                if (id !== requestId.current) return;
                setItems((previous) => (first ? result : [...previous, ...result]));
                setHasMore(result.length === APPOINTMENT_PAGE_SIZE);
                setPage(pageNumber);
            }
        } catch (requestError) {
            if (id !== requestId.current) return;
            setError(getApiErrorMessage(requestError, "We could not load your appointments."));
        } finally {
            if (id === requestId.current) {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        }
    }, [tab, status]);

    useEffect(() => {
        load(1);
    }, [load]);

    const openCancel = (appointment) => {
        setDetails(null);
        setReason("");
        setCancelError("");
        setToCancel(appointment);
    };

    const confirmCancel = async () => {
        setIsCancelling(true);
        setCancelError("");
        try {
            const updated = await cancelAppointment(toCancel.id, reason);
            setItems((previous) => previous.map((item) => (item.id === toCancel.id ? { ...item, ...updated } : item)));
            toast.success("Appointment cancelled");
            setToCancel(null);
        } catch (requestError) {
            setCancelError(getApiErrorMessage(requestError, "We could not cancel this appointment."));
            // The state may have changed (for example the doctor just declined it).
            if (requestError.response?.status === 409) load(1);
        } finally {
            setIsCancelling(false);
        }
    };

    const tabClass = (active) =>
        `rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 ${
            active ? "bg-primary-700 text-white" : "text-neutral-700 hover:bg-neutral-100"
        }`;

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">My appointments</h1>
                    <p className="mt-1 text-sm text-neutral-600">Track your requests and upcoming sessions.</p>
                </div>
                <Button as={Link} to="/doctors">Book a new appointment</Button>
            </header>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div role="tablist" aria-label="Appointment period" className="inline-flex gap-1 rounded-xl border border-neutral-200 bg-base-100 p-1">
                    {["upcoming", "past"].map((value) => (
                        <button key={value} type="button" role="tab" aria-selected={tab === value} className={tabClass(tab === value)} onClick={() => setTab(value)}>
                            {value === "upcoming" ? "Upcoming" : "Past"}
                        </button>
                    ))}
                </div>
                <div className="w-full sm:w-56">
                    <Select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="">All statuses</option>
                        {STATUSES.map((value) => <option key={value} value={value}>{value === "Rejected" ? "Declined" : value}</option>)}
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4" aria-busy="true" aria-label="Loading appointments">
                    {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" rounded="rounded-2xl" />)}
                </div>
            ) : error && items.length === 0 ? (
                <ErrorState title="Appointments could not be loaded" message={error} onRetry={() => load(1)} />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={<FiCalendar aria-hidden="true" />}
                    title={tab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
                    description={tab === "upcoming" ? "When you book a session it will show up here." : "Your completed and cancelled sessions will appear here."}
                    action={tab === "upcoming" && <Button as={Link} to="/doctors">Find a doctor</Button>}
                />
            ) : (
                <>
                    <ul className="space-y-4">
                        {items.map((appointment) => (
                            <li key={appointment.id} className="list-none">
                                <AppointmentCard appointment={appointment} onOpen={setDetails} onCancel={openCancel} />
                            </li>
                        ))}
                    </ul>
                    {hasMore && (
                        <div className="flex justify-center">
                            <Button variant="outline" loading={isLoadingMore} loadingText="Loading…" onClick={() => load(page + 1)}>Show more</Button>
                        </div>
                    )}
                </>
            )}

            <Modal
                isOpen={Boolean(details)}
                onClose={() => setDetails(null)}
                title="Appointment details"
                footer={details && (
                    <>
                        <Button variant="outline" onClick={() => setDetails(null)}>Close</Button>
                        {canCancel(details) && <Button variant="danger" onClick={() => openCancel(details)}>Cancel appointment</Button>}
                    </>
                )}
            >
                {details && (
                    <dl className="divide-y divide-neutral-200 text-sm">
                        {[
                            ["Doctor", `Dr. ${details.doctorName}`],
                            ["When", formatDateTime(details.startTime)],
                            ["Length", formatDuration(details.duration)],
                            ["Location", details.location || "—"],
                            ["Fee", formatFee(details.fees)],
                            details.reason && ["Your note", details.reason],
                            details.cancellationReason && ["Cancellation reason", details.cancellationReason],
                            details.rejectionReason && ["Doctor’s reason", details.rejectionReason],
                        ].filter(Boolean).map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-4 py-2.5"><dt className="text-neutral-600">{label}</dt><dd className="text-right font-semibold text-neutral-900">{value}</dd></div>
                        ))}
                        <div className="flex justify-between gap-4 py-2.5"><dt className="text-neutral-600">Status</dt><dd><StatusBadge status={details.status} /></dd></div>
                    </dl>
                )}
            </Modal>

            <Modal
                isOpen={Boolean(toCancel)}
                onClose={() => !isCancelling && setToCancel(null)}
                title="Cancel this appointment?"
                description={toCancel ? `${formatDateTime(toCancel.startTime)} with Dr. ${toCancel.doctorName}` : undefined}
                footer={(
                    <>
                        <Button variant="outline" onClick={() => setToCancel(null)} disabled={isCancelling}>Keep appointment</Button>
                        <Button variant="danger" onClick={confirmCancel} loading={isCancelling} loadingText="Cancelling…">Cancel appointment</Button>
                    </>
                )}
            >
                {cancelError && <Alert variant="error" className="mb-4">{cancelError}</Alert>}
                <Textarea label="Reason (optional)" rows={3} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} />
            </Modal>
        </div>
    );
};
