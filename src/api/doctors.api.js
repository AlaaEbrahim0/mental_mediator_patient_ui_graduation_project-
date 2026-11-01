import apiClient from "./client";

/**
 * Doctor discovery and availability.
 *
 * The server owns availability: weekly periods, time off, consultation
 * duration and existing appointments are combined there. The portal only
 * renders what /slots returns and never derives bookable times itself.
 */

export const PAGE_SIZE = 12;

export const getDoctors = async (filters = {}, pageNumber = 1, pageSize = PAGE_SIZE) => {
    const params = { pageNumber, pageSize };
    if (filters.name?.trim()) params.name = filters.name.trim();
    if (filters.specialization) params.specialization = filters.specialization;
    if (filters.gender) params.gender = filters.gender;
    if (filters.city?.trim()) params.city = filters.city.trim();
    if (filters.minFees !== "" && filters.minFees != null) params.minFees = filters.minFees;
    if (filters.maxFees !== "" && filters.maxFees != null) params.maxFees = filters.maxFees;
    if (filters.isAvailable === true || filters.isAvailable === false) {
        params.isAvailable = filters.isAvailable;
    }
    const response = await apiClient.get("/api/doctors", { params });
    const items = Array.isArray(response.data) ? response.data : [];
    const total = Number(response.headers?.["x-total-count"]);
    return { items, total: Number.isFinite(total) ? total : undefined };
};

export const getDoctor = async (doctorId) => {
    const { data } = await apiClient.get(`/api/doctors/${doctorId}`);
    return data;
};

/** Weekly periods, time zone and consultation duration of one doctor. */
export const getDoctorSchedule = async (doctorId) => {
    const { data } = await apiClient.get(`/api/doctors/${doctorId}/schedule`);
    return data;
};

/**
 * Bookable slots for a doctor-local date range (max 62 days per request).
 * Returns { doctorId, timeZoneId, consultationDurationMinutes, days: [{ date, slots: [...] }] }.
 */
export const getDoctorSlots = async (doctorId, from, to) => {
    const { data } = await apiClient.get(`/api/doctors/${doctorId}/slots`, {
        params: { from, to },
    });
    return data;
};
