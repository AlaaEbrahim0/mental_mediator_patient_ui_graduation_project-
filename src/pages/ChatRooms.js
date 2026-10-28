import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiHash, FiMessageCircle, FiSearch, FiUsers } from "react-icons/fi";
import { Badge, Button, Card, EmptyState, ErrorState, Input, Skeleton } from "../components/ui";
import { useChatRooms } from "../api/chat.api";
import { formatChatTimestamp } from "../utils/chat";

/**
 * Filter the loaded rooms by name or description.
 *
 * The filter is client side on purpose: the API exposes no text search, and
 * the room list of a graduation-scale community fits in a few pages.
 */
const filterRooms = (rooms, query) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rooms;

    return rooms.filter((room) => (
        room.name?.toLowerCase().includes(needle) ||
        room.description?.toLowerCase().includes(needle)
    ));
};

const roleBadgeVariant = (room) => {
    if (room.myRole === "Owner") return "primary";
    if (room.myRole === "Moderator") return "info";
    if (room.myRole === "Member") return "success";

    return "neutral";
};

export const ChatRooms = () => {
    const { rooms, hasMore, isLoading, error, load, loadMore } = useChatRooms();
    const [query, setQuery] = useState("");

    useEffect(() => {
        load().catch(() => undefined);
    }, [load]);

    const visibleRooms = useMemo(() => filterRooms(rooms, query), [rooms, query]);


    return (
        <div className="w-full">
            <section className="mb-5 rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900">Chat rooms</h1>
                        <p className="mt-1 text-sm text-neutral-600">
                            Join live, moderated conversations with professionals and other members.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-4" aria-label="Search chat rooms">
                <label className="relative block">
                    <span className="sr-only">Search rooms by name or description</span>
                    <FiSearch
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    />
                    <Input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search rooms by name or description"
                        className="pl-10"
                    />
                </label>
            </section>

            {error && (
                <ErrorState
                    title="We couldn’t load the chat rooms"
                    message={error.response?.data?.detail || error.message}
                    onRetry={() => load().catch(() => undefined)}
                />
            )}

            {!error && isLoading && rooms.length === 0 && (
                <div className="space-y-3" aria-label="Loading chat rooms">
                    {[0, 1, 2].map((index) => (
                        <Card key={index}>
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="mt-3 h-4 w-2/3" />
                            <Skeleton className="mt-3 h-3 w-1/4" />
                        </Card>
                    ))}
                </div>
            )}

            {!error && !isLoading && rooms.length === 0 && (
                <EmptyState
                    icon={<FiHash aria-hidden="true" />}
                    title="No chat rooms yet"
                    description="Rooms are created by doctors. Check back soon."
                />
            )}

            {!error && rooms.length > 0 && visibleRooms.length === 0 && (
                <EmptyState
                    icon={<FiSearch aria-hidden="true" />}
                    title="No rooms match your search"
                    description={`Nothing matches “${query.trim()}”. Try a different name or description.`}
                    action={(
                        <Button variant="outline" onClick={() => setQuery("")}>
                            Clear search
                        </Button>
                    )}
                />
            )}

            {visibleRooms.length > 0 && (
                <ul className="space-y-3">
                    {visibleRooms.map((room) => (
                        <li key={room.id}>
                            <Card hover>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                to={`/Community/rooms/${room.id}`}
                                                className="truncate text-base font-bold text-neutral-900 hover:text-primary-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
                                            >
                                                {room.name}
                                            </Link>
                                            {room.myRole && (
                                                <Badge variant={roleBadgeVariant(room)} size="sm">
                                                    {room.myRole}
                                                </Badge>
                                            )}
                                            {room.isArchived && (
                                                <Badge variant="warning" size="sm">
                                                    Archived
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                                            {room.description || "No description."}
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                                            <span className="inline-flex items-center gap-1">
                                                <FiUsers aria-hidden="true" />
                                                {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
                                            </span>
                                            {room.lastMessageAtUtc && (
                                                <span className="inline-flex items-center gap-1">
                                                    <FiMessageCircle aria-hidden="true" />
                                                    Last activity {formatChatTimestamp(room.lastMessageAtUtc)}
                                                </span>
                                            )}
                                        </div>
                                        {room.lastMessagePreview && (
                                            <p className="mt-2 line-clamp-1 rounded-lg bg-neutral-50 px-3 py-1.5 text-xs text-neutral-600">
                                                {room.lastMessagePreview}
                                            </p>
                                        )}
                                    </div>
                                    <Link
                                        to={`/Community/rooms/${room.id}`}
                                        className="shrink-0 self-start rounded-xl border border-neutral-300 bg-base-100 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
                                    >
                                        {room.isMember ? "Open" : "View"}
                                    </Link>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}

            {hasMore && (
                <div className="mt-4 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => loadMore().catch(() => undefined)}
                        loading={isLoading}
                    >
                        Load more
                    </Button>
                </div>
            )}

        </div>
    );
};
