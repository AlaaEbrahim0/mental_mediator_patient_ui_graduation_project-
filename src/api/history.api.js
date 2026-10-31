import apiClient from "./client";

export const getMyHistory = async (pageNumber = 1, pageSize = 20) => {
    const { data } = await apiClient.get("/api/history/me", {
        params: { pageNumber, pageSize },
    });
    return data;
};
