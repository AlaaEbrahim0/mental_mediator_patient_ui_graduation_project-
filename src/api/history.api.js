import apiClient from "./client";

export const getMyHistory = async (pageNumber = 1, pageSize = 20, filters = {}) => {
    const { data } = await apiClient.get("/api/history/me", {
        params: {
            pageNumber,
            pageSize,
            category: filters.category || undefined,
            from: filters.from || undefined,
            to: filters.to || undefined,
        },
    });
    return data;
};
