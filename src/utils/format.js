// Date/time and display helpers shared across the patient portal.
//
// The API stores instants in UTC. Some payloads (EF projections) serialise
// them without a zone designator, so a bare string is treated as UTC rather
// than silently being interpreted in the browser's local zone.

const HAS_ZONE = /([zZ]|[+-]\d{2}:?\d{2})$/;

export const parseUtc = (value) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const text = String(value);
    const date = new Date(HAS_ZONE.test(text) ? text : `${text}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const getLocalTimeZone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
        return "UTC";
    }
};

const pad = (number) => String(number).padStart(2, "0");

/** yyyy-mm-dd of a Date in the browser's local zone (no UTC shift). */
export const localDateKey = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Parse a yyyy-mm-dd key as a local calendar date (noon avoids DST edges). */
export const dateFromKey = (key) => new Date(`${key}T12:00:00`);

export const addDaysToKey = (key, amount) => {
    const date = dateFromKey(key);
    date.setDate(date.getDate() + amount);
    return localDateKey(date);
};

const dateFormat = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
});
const longDateFormat = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
});

export const formatDate = (value) => {
    const date = parseUtc(value);
    return date ? dateFormat.format(date) : "—";
};
export const formatLongDate = (value) => {
    const date = parseUtc(value);
    return date ? longDateFormat.format(date) : "—";
};
export const formatTime = (value) => {
    const date = parseUtc(value);
    return date ? timeFormat.format(date) : "—";
};
export const formatDateTime = (value) => {
    const date = parseUtc(value);
    return date ? `${dateFormat.format(date)} · ${timeFormat.format(date)}` : "—";
};

/** Minutes from a number or a .NET TimeSpan string such as "00:30:00". */
export const durationToMinutes = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const match = value.match(/^(?:(\d+)\.)?(\d{1,2}):(\d{2}):(\d{2})/);
        if (match) return Number(match[1] || 0) * 1440 + Number(match[2]) * 60 + Number(match[3]);
        return Number(value);
    }
    return NaN;
};

export const formatDuration = (value) => {
    const minutes = durationToMinutes(value);
    if (!Number.isFinite(minutes) || minutes <= 0) return "—";
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) return `${rest} min`;
    return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
};

/** End instant of an appointment (start + duration), or null if unknown. */
export const appointmentEnd = (appointment) => {
    const start = parseUtc(appointment?.startTime);
    const minutes = durationToMinutes(appointment?.duration);
    if (!start) return null;
    return new Date(start.getTime() + (Number.isFinite(minutes) ? minutes : 0) * 60000);
};

export const formatFee = (fees) =>
    fees === null || fees === undefined ? "—" : `${Number(fees).toLocaleString()} EGP`;

/** "ClinicalPsychology" -> "Clinical Psychology" */
export const formatSpecialization = (value) =>
    value ? String(value).replace(/([a-z])([A-Z])/g, "$1 $2") : "";

export const fullName = (person) =>
    [person?.firstName, person?.lastName].filter(Boolean).join(" ");

export const initialsOf = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "?";

export const SPECIALIZATIONS = [
    "ClinicalPsychology",
    "CounselingPsychology",
    "HealthPsychology",
    "NeuroPsychology",
    "ForensicPsychology",
    "SchoolPsychology",
    "SocialPsychology",
];
