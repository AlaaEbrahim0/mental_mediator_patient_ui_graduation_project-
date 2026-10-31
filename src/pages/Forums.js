import React, { useEffect, useCallback, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    createPost,
    deletePost,
    deletePostMedia,
    getLatestDraft,
    updatePost,
    uploadPostMedia,
    useDeletePost,
    useGetPosts,
} from "../api/community.api";
import { getMyChatRooms } from "../api/chat.api";
import { getApiErrorMessage } from "../api/client";
import toast from "react-hot-toast";
import { PostSkeleton } from "../components/ui/PostSkeleton";
import { useNavigate } from "react-router-dom";
import { Post } from "../components/ui/Post";
import { CreatePostModal } from "../components/ui/CreatePostModal";
import { useAuth } from "../auth/authProvider";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiMessageCircle, FiPlus, FiTrendingUp, FiUsers } from "react-icons/fi";
import { FilterationComponent } from "../components/ui/FilterationComponent";

export const Forums = () => {
    const { isLoading, error, data, setData, page, hasMore, execute, reset } =
        useGetPosts();
    const { isLoadingDelete, execute: executeDelete } = useDeletePost();
    const navigate = useNavigate();
    const { userId, roles } = useAuth();
    const canPostDoctorsOnly = (roles || []).some((role) => typeof role === "string" && ["doctor", "admin"].includes(role.toLowerCase()));
    const [groupOptions, setGroupOptions] = useState([]);
    const [isFilterVisible, setFilterVisible] = useState(false);
    const [feedSort, setFeedSort] = useState("recent");
    const [isComposerOpen, setComposerOpen] = useState(false);
    const [isCreatingPost, setCreatingPost] = useState(false);
    const [isDraftLoading, setDraftLoading] = useState(false);
    const [latestDraft, setLatestDraft] = useState(null);
    const sortedPosts = React.useMemo(() => [...(data || [])].sort((left, right) => {
        if (feedSort === "discussed") return (right.commentsCount || 0) - (left.commentsCount || 0);
        return new Date(right.postedOn || 0) - new Date(left.postedOn || 0);
    }), [data, feedSort]);
    const activeDiscussions = React.useMemo(
        () => [...(data || [])]
            .filter((post) => (post.commentsCount || 0) > 0)
            .sort((left, right) => (right.commentsCount || 0) - (left.commentsCount || 0))
            .slice(0, 4),
        [data]
    );
    // Counted over the loaded feed, and deliberately not the four-item sidebar list,
    // which is capped and would read as "4 active discussions" whenever four exist.
    const discussedCount = React.useMemo(
        () => (data || []).filter((post) => (post.commentsCount || 0) > 0).length,
        [data]
    );

    const [filters, setFilters] = useState({
        fullname: "",
        title: new URLSearchParams(window.location.search).get("search") || "",
        content: "",
        from: "",
        to: "",
        showConfessions: false,
    });

    useEffect(() => {
        const initialLoad = async () => {
            try {
                await execute(1, 20, filters);
            } catch (error) {
                console.error("Failed to load initial posts:", error);
                toast.error("Failed to load posts. Please try again.");
            }
        };
        initialLoad();
    }, [execute, filters]);

    const loadMore = useCallback(async () => {
        if (hasMore && !isLoading) {
            try {
                await execute(page + 1, 20, filters);
            } catch (error) {
                console.error("Failed to load more posts:", error);
                toast.error("Failed to load more posts. Please try again.");
            }
        }
    }, [execute, page, hasMore, isLoading, filters]);

    const handleDeletePost = async (id) => {
        try {
            await executeDelete(id);
            setData((prev) => prev.filter((post) => post.id !== id));
            toast.success("Post deleted successfully");
        } catch (e) {
            toast.error(getApiErrorMessage(e, "Could not delete this post. Please try again."), {
                duration: 4000,
                position: "top-center",
                className: "text-lg text-primary",
            });
        }
    };

    const toggleShowFilters = () => {
        setFilterVisible((prevState) => !prevState);
    };

    useEffect(() => {
        if (!userId) {
            setGroupOptions([]);
            return undefined;
        }

        let active = true;
        getMyChatRooms()
            .then((rooms) => {
                if (active) {
                    setGroupOptions(
                        rooms.map((room) => ({ id: room.id, label: room.name }))
                    );
                }
            })
            .catch(() => {
                if (active) setGroupOptions([]);
            });

        return () => {
            active = false;
        };
    }, [userId]);

    const refreshFeed = useCallback(async () => {
        reset();
        await execute(1, 20, filters);
    }, [execute, filters, reset]);

    const openComposer = useCallback(async () => {
        if (isDraftLoading) return;

        setDraftLoading(true);
        try {
            setLatestDraft(await getLatestDraft());
        } catch {
            setLatestDraft(null);
            toast.error(
                "Your saved draft could not be loaded. You can still write a new post."
            );
        } finally {
            setDraftLoading(false);
            setComposerOpen(true);
        }
    }, [isDraftLoading]);

    const handleCreatePost = async (payload, draftId) => {
        setCreatingPost(true);
        try {
            const created = draftId
                ? await updatePost(draftId, { ...payload, isDraft: false })
                : await createPost({ ...payload, isDraft: false });

            toast.success("Your post has been published.");
            setLatestDraft(null);
            refreshFeed().catch(() =>
                toast.error(
                    "Your post was published, but the feed could not refresh. Reload to see it."
                )
            );
            return created;
        } catch (requestError) {
            toast.error(
                getApiErrorMessage(
                    requestError,
                    "Could not publish your post. Please try again."
                )
            );
            throw requestError;
        } finally {
            setCreatingPost(false);
        }
    };

    const handleSaveDraft = async (payload, draftId) =>
        draftId
            ? updatePost(draftId, { ...payload, isDraft: true })
            : createPost({ ...payload, isDraft: true });

    const handleDiscardDraft = async (draftId) => {
        await deletePost(draftId);
        setLatestDraft(null);
    };

    const handleFilter = (appliedFilters) => {
        setFilters(appliedFilters);
        reset();
        execute(1, 20, appliedFilters);
    };

    if (error) {
        return <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900" role="alert">
            <h1 className="text-lg font-bold">We couldn’t load the community feed</h1>
            <p className="mt-1 text-sm">{error.message || "Please check your connection and try again."}</p>
            <button type="button" className="btn btn-sm mt-4 border-rose-300 bg-white text-rose-800 hover:bg-rose-100" onClick={() => execute(1, 20, filters)}>Try again</button>
        </div>;
    }

    return (
        <>
            <motion.div>
                <InfiniteScroll
                    dataLength={data.length}
                    next={loadMore}
                    hasMore={!isLoading && hasMore}
                    loader={
                        <div className="my-4">
                            <PostSkeleton />
                        </div>
                    }
                    scrollThreshold={0.7}
                    scrollableTarget="scrollableDiv"
                >
                    <section className="relative mb-5 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-base-100 to-base-200 p-5 shadow-sm sm:mb-6 sm:p-7 lg:p-8">
                        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
                        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                            <div className="max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary-900"><FiUsers aria-hidden="true" /> Nexus community</span>
                                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Good care grows through conversation.</h1>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">Share clinical perspectives, learn from peers, and join thoughtful conversations across the Nexus community.</p>
                                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
                                    <span className="inline-flex items-center gap-2"><FiMessageCircle className="text-primary-800" aria-hidden="true" /><strong className="text-slate-900">{data.length}</strong> discussions on your feed</span>
                                    <span className="inline-flex items-center gap-2"><FiTrendingUp className="text-primary-800" aria-hidden="true" /><strong className="text-slate-900">{discussedCount}</strong> with replies</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 items-start gap-5 overflow-x-hidden lg:grid-cols-12 lg:gap-6">
                        <section className="min-w-0 lg:col-span-8" aria-label="Community posts">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Community feed</h2>
                                    <p className="text-sm text-slate-600">Perspectives and updates from your peers</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    {userId && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={openComposer}
                                            disabled={isDraftLoading}
                                        >
                                            {isDraftLoading ? (
                                                <span className="loading loading-spinner loading-xs" aria-hidden="true" />
                                            ) : (
                                                <FiPlus aria-hidden="true" />
                                            )}
                                            New post
                                        </button>
                                    )}
                                    <div className="join rounded-xl border border-neutral-200 bg-base-100 p-1" aria-label="Sort community feed">
                                        <button type="button" className={`join-item btn btn-xs border-0 ${feedSort === "recent" ? "bg-primary/10 text-primary-900" : "btn-ghost text-slate-600"}`} aria-pressed={feedSort === "recent"} onClick={() => setFeedSort("recent")}>Recent</button>
                                        <button type="button" className={`join-item btn btn-xs border-0 ${feedSort === "discussed" ? "bg-primary/10 text-primary-900" : "btn-ghost text-slate-600"}`} aria-pressed={feedSort === "discussed"} onClick={() => setFeedSort("discussed")}>Discussed</button>
                                    </div>
                                    <button type="button" className="btn btn-sm btn-outline border-neutral-300 bg-base-100" onClick={toggleShowFilters}><FiFilter aria-hidden="true" /> <span className="hidden sm:inline">Filter</span></button>
                                </div>
                            </div>
                            {isFilterVisible && (
                                <div className="fixed inset-0 z-modal flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6">
                                    <FilterationComponent
                                        onClose={toggleShowFilters}
                                        onFilter={handleFilter}
                                        initialFilters={filters}
                                    />
                                </div>
                            )}
                            {!isLoading && data.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-neutral-300 bg-base-100 px-6 py-14 text-center shadow-sm">
                                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-2xl text-primary"><FiMessageCircle aria-hidden="true" /></span>
                                    <h3 className="mt-4 text-lg font-bold text-slate-900">No discussions yet</h3>
                                    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">Community discussions will appear here when they are published.</p>
                                </div>
                            )}
                            {sortedPosts.length > 0 && (
                                <AnimatePresence>
                                    {sortedPosts.map((post, index) => (
                                        <React.Fragment
                                            key={`post-${post.id}-${index}`}
                                        >
                                            <AnimatedPost
                                                post={post}
                                                index={index}
                                                handleDeletePost={
                                                    handleDeletePost
                                                }
                                                userId={userId}
                                                isLoadingDelete={
                                                    isLoadingDelete
                                                }
                                                onRefresh={refreshFeed}
                                                groups={groupOptions}
                                                canPostDoctorsOnly={canPostDoctorsOnly}
                                            />
                                            {isLoading &&
                                                index === data.length - 1 && (
                                                    <PostSkeleton />
                                                )}
                                        </React.Fragment>
                                    ))}
                                </AnimatePresence>
                            )}
                            {isLoading && page === 1 && (
                                <div className="lg:flex lg:flex-col lg:justify-center lg:w-full">
                                    <PostSkeleton />
                                    <PostSkeleton />
                                    <PostSkeleton />
                                </div>
                            )}
                            {!isLoading && hasMore && (
                                <div className="text-center my-4">
                                    <button
                                        className="btn btn-primary btn-outline"
                                        onClick={loadMore}
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </section>
                        <aside
                                id="community-sidebar-panel"
                                className="min-w-0 overflow-hidden lg:col-span-4"
                                aria-label="Community tools and news"
                            >
                                <section className="mb-5 rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm" aria-labelledby="active-discussions-title">
                                    <div className="mb-3 flex items-center gap-2 text-neutral-900">
                                        <FiMessageCircle aria-hidden="true" className="text-primary-800" />
                                        <h2 id="active-discussions-title" className="font-bold">Active discussions</h2>
                                    </div>
                                    {activeDiscussions.length ? <ul className="space-y-2">
                                        {activeDiscussions.map((post) => <li key={post.id}>
                                            <button type="button" onClick={() => navigate(`/forums/${post.id}`)} className="w-full rounded-xl p-3 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
                                                <span className="block line-clamp-2 text-sm font-semibold text-neutral-800">{post.title || "Untitled discussion"}</span>
                                                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-600"><FiMessageCircle aria-hidden="true" /> {post.commentsCount} comments</span>
                                            </button>
                                        </li>)}
                                    </ul> : <p className="text-sm text-neutral-600">Commented posts will appear here.</p>}
                                </section>
                        </aside>
                    </div>
                </InfiniteScroll>
                <CreatePostModal
                    isVisible={isComposerOpen}
                    onClose={() => setComposerOpen(false)}
                    onCreate={handleCreatePost}
                    loading={isCreatingPost}
                    onUploadMedia={uploadPostMedia}
                    onDeleteMedia={deletePostMedia}
                    onSaveDraft={handleSaveDraft}
                    onDiscardDraft={handleDiscardDraft}
                    groups={groupOptions}
                    initialDraft={latestDraft}
                    canPostDoctorsOnly={canPostDoctorsOnly}
                    currentUserId={userId}
                />
            </motion.div>
        </>
    );
};

const AnimatedPost = ({
    post,
    index,
    handleDeletePost,
    userId,
    isLoadingDelete,
    onRefresh,
    groups,
    canPostDoctorsOnly,
}) => {
    const [ref, isIntersecting] = useInView({ threshold: 0.1 });

    const variants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
        },
        exit: { scale: 0.9, opacity: 0 },
    };

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={isIntersecting ? "visible" : "exit"}
            exit="exit"
        >
            <Post
                id={post.id}
                authorName={post.username}
                authorId={post.appUserId}
                title={post.title}
                content={post.content}
                date={post.postedOn}
                image={post.photoUrl}
                postPhoto={post.postPhotoUrl}
                media={post.media}
                isOwnPost={post.isOwnPost}
                commentCount={post.commentsCount}
                likesCount={post.likesCount}
                isLikedByCurrentUser={post.isLikedByCurrentUser}
                setData={onRefresh}
                postData={post}
                groups={groups}
                canPostDoctorsOnly={canPostDoctorsOnly}
                currentUserId={userId}
                handleDelete={handleDeletePost}
                postDeletionLoading={isLoadingDelete}
            />
        </motion.div>
    );
};

export const useInView = (options) => {
    const [isIntersecting, setIntersecting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const target = ref.current;
        const observer = new IntersectionObserver(
            ([entry]) => setIntersecting(entry.isIntersecting),
            options
        );

        if (target) {
            observer.observe(target);
        }

        return () => {
            if (target) observer.unobserve(target);
        };
    }, [options]);

    return [ref, isIntersecting];
};
