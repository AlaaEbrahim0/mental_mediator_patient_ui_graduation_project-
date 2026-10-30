import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "./client";
import { MODERATION_REQUEST_TIMEOUT_MS } from "../utils/moderationState";

// The API runs the content-safety model over every post, comment and reply
// before it saves anything, and that model lives on a service that goes idle.
// These writes therefore need the longer budget; reads keep the client default.
const moderation = { timeout: MODERATION_REQUEST_TIMEOUT_MS };

const unwrap = (request) => request.then((response) => response.data).catch((error) => { throw error.response?.data || error; });

export const getPosts = (pageNumber = 1, pageSize = 20, filters = {}) => unwrap(apiClient.get("/api/posts", {
    params: {
        pageNumber,
        pageSize,
        title: filters.title,
        content: filters.content,
        username: filters.username,
        startTime: filters.from || "0001-01-01",
        endTime: filters.to || "0001-01-01",
        confessionsOnly: filters.showConfessions,
    },
}));
export const getPostById = (id) => unwrap(apiClient.get(`/api/posts/${id}`));
const buildPostFormData = (payload = {}) => {
    const {
        title,
        content,
        category,
        tags,
        media,
        visibility,
        targetGroupId,
        isAnonymous,
        isDraft,
    } = payload;

    const formData = new FormData();
    formData.append("title", title ?? "");
    formData.append("content", content ?? "");
    if (category !== undefined && category !== null) {
        formData.append("category", category);
    }
    if (tags !== undefined) {
        formData.append("tags", Array.isArray(tags) ? tags.join(",") : tags ?? "");
    }
    if (media !== undefined) {
        formData.append("media", JSON.stringify(media || []));
    }
    if (visibility !== undefined && visibility !== null) {
        formData.append("visibility", visibility);
    }
    if (targetGroupId !== undefined) {
        formData.append(
            "targetGroupId",
            targetGroupId === null || targetGroupId === "" ? "" : String(targetGroupId)
        );
    }
    if (isAnonymous !== undefined) {
        formData.append("isAnonymous", String(Boolean(isAnonymous)));
    }
    if (isDraft !== undefined) {
        formData.append("isDraft", String(Boolean(isDraft)));
    }
    return formData;
};

export const createPost = (payload = {}, { draft = false } = {}) =>
    unwrap(
        apiClient.post(
            "/api/posts",
            buildPostFormData({ ...payload, isDraft: draft }),
            moderation
        )
    );

export const savePostDraft = (payload = {}, draftId = null) => {
    const formData = buildPostFormData({ ...payload, isDraft: true });
    return draftId
        ? unwrap(apiClient.put(`/api/posts/${draftId}`, formData, moderation))
        : unwrap(apiClient.post("/api/posts", formData, moderation));
};

export const getLatestDraft = () =>
    apiClient
        .get("/api/posts/drafts/latest")
        .then((response) => response.data || null)
        .catch((error) => {
            if (error.response?.status === 204) return null;
            throw error.response?.data || error;
        });

export const updatePost = (id, payload = {}) =>
    unwrap(
        apiClient.put(`/api/posts/${id}`, buildPostFormData(payload), moderation)
    );

export const deletePostMedia = (url) =>
    unwrap(apiClient.delete("/api/posts/media", { params: { url } }));
export const uploadPostMedia = (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return unwrap(apiClient.post("/api/posts/media", formData, {
        // Videos can be up to 20 MB, which outlives the default request budget.
        timeout: 120000,
        onUploadProgress: (event) => {
            const percent = event.total
                ? Math.round((event.loaded * 100) / event.total)
                : Math.round((event.progress || 0) * 100);
            onUploadProgress?.(percent);
        },
    }));
};
export const deletePost = (id) => unwrap(apiClient.delete(`/api/posts/${id}`));
export const setPostLike = (id, liked) => unwrap(liked ? apiClient.put(`/api/posts/${id}/like`) : apiClient.delete(`/api/posts/${id}/like`));
export const getComments = (postId) => unwrap(apiClient.get(`/api/posts/${postId}/comments`));
export const createComment = (postId, content) => unwrap(apiClient.post(`/api/posts/${postId}/comments`, { content }, moderation));
export const updateComment = (postId, commentId, content) => unwrap(apiClient.put(`/api/posts/${postId}/comments/${commentId}`, { content }, moderation));
export const deleteComment = (postId, commentId) => unwrap(apiClient.delete(`/api/posts/${postId}/comments/${commentId}`));
export const getReplies = (postId, commentId) => unwrap(apiClient.get(`/api/posts/${postId}/comments/${commentId}/replies`));
export const createReply = (postId, commentId, content) => unwrap(apiClient.post(`/api/posts/${postId}/comments/${commentId}/replies`, { content }, moderation));
export const updateReply = (postId, commentId, replyId, content) => unwrap(apiClient.put(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}`, { content }, moderation));
export const deleteReply = (postId, commentId, replyId) => unwrap(apiClient.delete(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}`));
export const getNewsArticles = () => unwrap(apiClient.get("/api/articles"));

function useRequest({ initialData = null, appendPages = false, onSuccess } = {}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(initialData);
    const execute = useCallback(async (request, ...args) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await request(...args);
            setData((previous) => appendPages ? (args[0] === 1 ? result : [...(previous || []), ...result]) : result);
            onSuccess?.(result);
            return result;
        } catch (requestError) {
            setError(requestError);
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, [appendPages, onSuccess]);
    return { isLoading, error, data, setData, execute };
}

export function useGetPosts() {
    const { execute: run, setData, ...requestState } = useRequest({ initialData: [], appendPages: true });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const execute = useCallback(async (pageNumber = 1, pageSize = 20, filters = {}) => {
        const posts = await run(getPosts, pageNumber, pageSize, filters);
        setPage(pageNumber);
        setHasMore(posts.length === pageSize);
        return posts;
    }, [run]);
    const reset = useCallback(() => { setData([]); setPage(1); setHasMore(true); }, [setData]);
    return { ...requestState, setData, page, hasMore, execute, reset };
}

function useEndpoint(request, initialData) {
    const { execute: run, ...requestState } = useRequest({ initialData });
    const execute = useCallback((...args) => run(request, ...args), [run, request]);
    return { ...requestState, execute };
}

export function useGetPostById() {
    return useEndpoint(getPostById, []);
}

export function useCreatePost() {
    return useEndpoint(createPost);
}

export function useGetLatestDraft() {
    return useEndpoint(getLatestDraft, null);
}

export function useSavePostDraft() {
    return useEndpoint(savePostDraft);
}

export function useUpdatePost() {
    return useEndpoint(updatePost);
}

export function useDeletePost() {
    return useEndpoint(deletePost);
}

export function useGetComments() {
    return useEndpoint(getComments, []);
}

export function useCreateComment() {
    return useEndpoint(createComment);
}

export function useUpdateComment() {
    return useEndpoint(updateComment);
}

export function useDeleteComment() {
    const { execute: run, ...requestState } = useRequest();
    const execute = useCallback(async (...args) => {
        const result = await run(deleteComment, ...args);
        toast.success("Comment has been deleted successfully");
        return result;
    }, [run]);
    return { ...requestState, execute };
}

export function useGetReplies() {
    return useEndpoint(getReplies, []);
}

export function useCreateReply() {
    return useEndpoint(createReply);
}

export function useUpdateReply() {
    return useEndpoint(updateReply);
}

export function useDeleteReply() {
    return useEndpoint(deleteReply, []);
}

export function useGetNews() {
    const { execute: run, data: news, ...requestState } = useRequest();
    const execute = useCallback(async () => run(getNewsArticles), [run]);
    return { ...requestState, news, execute };
}
