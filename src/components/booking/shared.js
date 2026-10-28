import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { Badge, Button, Card } from "../ui";
import { formatFee, formatSpecialization, fullName, initialsOf } from "../../utils/format";

/** Round avatar that falls back to initials when there is no photo. */
export const Avatar = ({ src, name, size = "h-14 w-14", textSize = "text-base" }) =>
    src ? (
        <img src={src} alt="" className={`${size} shrink-0 rounded-full border border-neutral-200 object-cover`} />
    ) : (
        <span
            aria-hidden="true"
            className={`${size} ${textSize} grid shrink-0 place-items-center rounded-full bg-primary-50 font-bold text-primary-800`}
        >
            {initialsOf(name)}
        </span>
    );

const STATUS_STYLES = {
    Pending: { variant: "warning", label: "Awaiting confirmation" },
    Confirmed: { variant: "success", label: "Confirmed" },
    Completed: { variant: "info", label: "Completed" },
    Cancelled: { variant: "neutral", label: "Cancelled" },
    Rejected: { variant: "danger", label: "Declined" },
};

export const StatusBadge = ({ status, size = "md" }) => {
    const style = STATUS_STYLES[status] || { variant: "neutral", label: status || "Unknown" };
    return <Badge variant={style.variant} size={size}>{style.label}</Badge>;
};

/** Card used in the doctor directory and on the dashboard. */
export const DoctorCard = ({ doctor }) => {
    const name = `Dr. ${fullName(doctor)}`;
    return (
        <Card hover className="relative flex h-full flex-col">
            <div className="flex items-start gap-4">
                <Avatar src={doctor.photoUrl} name={fullName(doctor)} size="h-16 w-16" textSize="text-lg" />
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-neutral-900">
                        <Link to={`/doctors/${doctor.id}`} className="after:absolute after:inset-0 hover:underline focus-visible:outline-none">
                            {name}
                        </Link>
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-primary-800">{formatSpecialization(doctor.specialization)}</p>
                    {(doctor.city || doctor.location) && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
                            <FiMapPin aria-hidden="true" className="shrink-0" />
                            <span className="truncate">{doctor.city || doctor.location}</span>
                        </p>
                    )}
                </div>
            </div>
            {doctor.biography && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-neutral-700">{doctor.biography}</p>
            )}
            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Session fee</p>
                    <p className="text-sm font-bold text-neutral-900">{formatFee(doctor.sessionFees)}</p>
                </div>
                {doctor.isAvailable === false ? (
                    <Badge variant="neutral">Not accepting new patients</Badge>
                ) : (
                    <Button
                        as={Link}
                        to={`/doctors/${doctor.id}/book`}
                        size="sm"
                        className="relative z-10"
                    >
                        Book
                    </Button>
                )}
            </div>
        </Card>
    );
};
