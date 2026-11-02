import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiMessageCircle, FiHeart, FiWifi, FiWifiOff } from "react-icons/fi";
import { COMMUNITY_POSTS, POST_CATEGORIES } from "./landingData";
import { useStaggerVariants } from "./Reveal";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "https://nexus-api.runasp.net").replace(/\/$/, "");

/** Category accents, so a glance tells you what kind of thread it is. */
const CATEGORY_STYLES = {
    Support: "bg-primary-500/15 text-primary-200 ring-primary-400/30",
    Journey: "bg-teal-500/15 text-teal-200 ring-teal-400/30",
    Guidance: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
    Questions: "bg-sky-500/15 text-sky-200 ring-sky-400/30",
    Coping: "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/30",
};

const FALLBACK_STYLE = "bg-white/10 text-slate-200 ring-white/20";

/**
 * Normalises a post from the API or from the pinned snapshot into one shape,
 * so the rest of the component does not care which source it came from.
 */
const normalise = (post) => ({
    id: post.id,
    title: post.title,
    category: post.category || "Support",
    author: post.author ?? post.username ?? "Community member",
    tags: Array.isArray(post.tags)
        ? post.tags
        : String(post.tags || "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
    likes: post.likes ?? post.likesCount ?? 0,
    comments: post.comments ?? post.commentsCount ?? 0,
    ago: post.ago || "",
    media:
        Array.isArray(post.media) && post.media.length
            ? post.media.filter((item) => item && item.url)
            : post.postPhotoUrl
                ? [{ url: post.postPhotoUrl, type: "image" }]
                : [],
});

/**
 * Live community feed.
 *
 * `/api/posts` is readable without a session, so this actually refreshes in the
 * visitor's browser. If the request fails (offline, CORS, API asleep) it falls
 * back to the snapshot captured from the same endpoint, and the badge in the
 * header tells the truth about which one you are looking at.
 */
export const CommunityFeed = () => {
    const reduceMotion = useReducedMotion();
    const variants = useStaggerVariants(reduceMotion);
    const [posts, setPosts] = useState(() => COMMUNITY_POSTS.map(normalise));
    const [source, setSource] = useState("snapshot");
    const [category, setCategory] = useState("All");

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        const load = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/posts?pageNumber=1&pageSize=12`, {
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                const list = Array.isArray(data) ? data : data?.posts || [];
                if (cancelled || !list.length) return;
                setPosts(list.map(normalise));
                setSource("live");
            } catch (error) {
                if (error.name !== "AbortError" && !cancelled) setSource("snapshot");
            }
        };

        load();
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, []);

    const filtered = useMemo(
        () => (category === "All" ? posts : posts.filter((post) => post.category === category)),
        [posts, category]
    );
    // The band is a showcase, not the forum: five threads is plenty.
    const visible = useMemo(() => filtered.slice(0, 5), [filtered]);

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ring-1 ${
                        source === "live"
                            ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30"
                            : "bg-white/5 text-slate-300 ring-white/15"
                    }`}
                >
                    {source === "live" ? (
                        <FiWifi aria-hidden="true" />
                    ) : (
                        <FiWifiOff aria-hidden="true" />
                    )}
                    {source === "live" ? "Live from the community" : "Recent activity"}
                </span>
                <span className="text-xs text-slate-400">{filtered.length} threads</span>
            </div>

            {/* Category filters — real categories from the data, not invented ones. */}
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter posts by category">
                {POST_CATEGORIES.map((name) => {
                    const selected = category === name;
                    return (
                        <button
                            key={name}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            onClick={() => setCategory(name)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                                selected
                                    ? "bg-primary-500 text-white shadow-lg shadow-primary-900/30"
                                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {name}
                        </button>
                    );
                })}
            </div>

            <motion.ul
                key={category}
                variants={variants.container}
                initial="hidden"
                animate="show"
                className="mt-5 space-y-3"
            >
                {visible.map((post) => (
                    <motion.li key={post.id} variants={variants.item}>
                        <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-primary-400/40 hover:bg-white/[0.07]">
                            <div className="flex items-start justify-between gap-3">
                                <span
                                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                                        CATEGORY_STYLES[post.category] || FALLBACK_STYLE
                                    }`}
                                >
                                    {post.category}
                                </span>
                                {post.ago && <span className="text-[11px] text-slate-400">{post.ago}</span>}
                            </div>
                            <div className="mt-2 flex items-start gap-3">
                                <h3 className="flex-1 text-sm font-semibold leading-snug text-white">{post.title}</h3>
                                {post.media.some((item) => item.type === "image") && (
                                    <img
                                        src={post.media.find((item) => item.type === "image").url}
                                        alt=""
                                        loading="lazy"
                                        className="h-16 w-20 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
                                    />
                                )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                                <span className="truncate">{post.author}</span>
                                <span className="inline-flex items-center gap-1">
                                    <FiHeart aria-hidden="true" /> {post.likes}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <FiMessageCircle aria-hidden="true" /> {post.comments}
                                </span>
                            </div>
                            {post.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {post.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </article>
                    </motion.li>
                ))}
                {!visible.length && (
                    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
                        No threads in this category yet.
                    </li>
                )}
            </motion.ul>
        </div>
    );
};

export default CommunityFeed;
