import apiClient from "./client";
import { parseUtc } from "../utils/format";

export const APPOINTMENT_PAGE_SIZE = 20;

/** The signed-in patient's appointments. Ownership is enforced server-side. */
export const getMyAppointments = async (filters = {}) => {
    const params = {
        pageNumber: filters.pageNumber || 1,
        pageSize: filters.pageSize || APPOINTMENT_PAGE_SIZE,
    };
    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.doctorName?.trim()) params.doctorName = filters.doctorName.trim();
    const { data } = await apiClient.get("/api/appointments/clients/me", { params });
    return Array.isArray(data) ? data : [];
};

export const getAppointment = async (id) => {
    const { data } = await apiClient.get(`/api/appointments/${id}`);
    return data;
};

/**
 * Request a booking. Only the start instant, the clinic location and an
 * optional reason are sent: the server owns duration and fee, and
 * revalidates availability under a per-doctor lock.
 */
export const createAppointment = async (doctorId, { startTime, location, reason }) => {
    const { data } = await apiClient.post(
        "/api/appointments",
        { startTime, location, reason: reason?.trim() || null },
        { params: { doctorId } }
    );
    return data;
};

export const cancelAppointment = async (id, cancellationReason) => {
    const { data } = await apiClient.put(
        `/api/appointments/${id}/cancel`,
        JSON.stringify(cancellationReason?.trim() || "Cancelled by patient"),
        { headers: { "Content-Type": "application/json" } }
    );
    return data;
};

const UPCOMING_PAGE_SIZE = 50;
const UPCOMING_MAX_PAGES = 5;

/**
 * Every appointment that starts from now onwards, soonest first.
 *
 * The API paginates newest-first, so the soonest appointment can sit on the
 * last page. Read the pages (bounded) and sort here so "next appointment" is
 * always correct.
 */
export const getUpcomingAppointments = async ({ status } = {}) => {
    const startDate = new Date().toISOString();
    const all = [];
    for (let pageNumber = 1; pageNumber <= UPCOMING_MAX_PAGES; pageNumber += 1) {
        const page = await getMyAppointments({ startDate, status, pageNumber, pageSize: UPCOMING_PAGE_SIZE });
        all.push(...page);
        if (page.length < UPCOMING_PAGE_SIZE) break;
    }
    return all.sort((a, b) => parseUtc(a.startTime) - parseUtc(b.startTime));
};
