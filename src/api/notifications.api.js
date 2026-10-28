import apiClient from "./client";

export const getUserNotifications = async (pageNumber = 1, pageSize = 20) => {
    const { data } = await apiClient.get("/api/notifications/users/me", { params: { pageNumber, pageSize } });
    return data;
};

export const markAllNotificationsRead = async () => {
    const { data } = await apiClient.put("/api/notifications/users/me/read");
    return data;
};

export const markNotificationRead = async (id) => {
    const { data } = await apiClient.put(`/api/notifications/${id}/read`);
    return data;
};
