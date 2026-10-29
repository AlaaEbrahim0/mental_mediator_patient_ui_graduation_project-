import { useEffect, useMemo, useState } from "react";
import { FiHash, FiPlus, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import {
    Button,
    Card,
    EmptyState,
    ErrorState,
    Input,
    Select,
    Skeleton,
} from "../components/ui";
import {
    CHAT_ROOM_SORTS,
    CHAT_ROOM_TABS,
    JoinRoomModal,
    RoomCard,
    filterRooms,
} from "../components/ui/community";
import { CreateRoomModal } from "../components/chat/CreateRoomModal";
import { getChatErrorMessage, useChatRooms, useJoinChatRoom } from "../api/chat.api";

const SKELETON_KEYS = [0, 1, 2, 3, 4, 5];

/**
 * The room directory.
 *
 * The loaded pages are filtered in the browser with the shared rule set
 * (tabs, search, sort), so the patient portal and the doctor portal agree on
 * what "Active" or "Patient-created" means. Patients can create their own
 * consultation rooms; the create modal collects the visibility, an optional
 * password, a start time and a cover.
 */
export const ChatRooms = () => {
    const { rooms, hasMore, isLoading, error, load, loadMore } = useChatRooms();
    const { execute: joinRoom } = useJoinChatRoom();

    const [query, setQuery] = useState("");
    const [tab, setTab] = useState("All");
    const [sort, setSort] = useState("Recent");
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [joinTarget, setJoinTarget] = useState(null);

    useEffect(() => {
        load().catch(() => undefined);
    }, [load]);

    const visibleRooms = useMemo(
        () => filterRooms(rooms, { query, tab, sort }),
        [rooms, query, tab, sort]
    );

    const hasFilters = Boolean(query.trim()) || tab !== "All";

    const handleCreated = async () => {
        toast.success("Room created.");
        await load().catch(() => undefined);
    };

    const handleJoin = async (room, passphrase) => {
        await joinRoom(room.id, passphrase);
        toast.success(`You joined ${room.name}.`);
        await load().catch(() => undefined);
    };

    return (
        <div className="w-full">
            <section className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-neutral-900">Chat rooms</h1>
                    <p className="mt-1 max-w-2xl text-sm text-neutral-600">
                        Join live conversations, or open your own room for a
                        consultation follow-up.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="shrink-0">
                    <FiPlus aria-hidden="true" />
                    Create room
                </Button>
            </section>

            <section
                className="mb-5 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-base-100 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4"
                aria-label="Search and filter rooms"
            >
                <div
                    className="flex flex-wrap gap-1.5"
                    role="group"
                    aria-label="Filter rooms by category"
                >
                    {CHAT_ROOM_TABS.map((label) => {
                        const isActive = label === tab;

                        return (
                            <button
                                key={label}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setTab(label)}
                                className={`inline-flex min-h-9 shrink-0 items-center rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 ${
                                    isActive
                                        ? "bg-primary-700 text-white shadow-sm"
                                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="relative block sm:w-56">
                        <span className="sr-only">Search rooms</span>
                        <FiSearch
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-neutral-400"
                        />
                        <Input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search rooms"
                            className="pl-10"
                        />
                    </label>

                    <div className="sm:w-36">
                        <Select
                            id="patient-rooms-sort"
                            aria-label="Sort rooms"
                            value={sort}
                            onChange={(event) => setSort(event.target.value)}
                        >
                            {CHAT_ROOM_SORTS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </Select>
                    </div>
                </div>
            </section>

            {error && rooms.length === 0 && (
                <ErrorState
                    title="We couldn’t load the chat rooms"
                    message={getChatErrorMessage(error, "Please try again.")}
                    onRetry={() => load().catch(() => undefined)}
                />
            )}

            {!error && isLoading && rooms.length === 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading chat rooms">
                    {SKELETON_KEYS.map((key) => (
                        <Card key={key} padded={false} className="overflow-hidden">
                            <Skeleton rounded="rounded-none" className="h-36 w-full" />
                            <div className="p-4 sm:p-5">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="mt-3 h-4 w-full" />
                                <Skeleton className="mt-2 h-4 w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {!error && !isLoading && rooms.length === 0 && (
                <EmptyState
                    icon={<FiHash aria-hidden="true" />}
                    title="No chat rooms yet"
                    description="Rooms are where the care community talks. Create one for yourself or join a doctor's room when it appears."
                    action={(
                        <Button onClick={() => setCreateOpen(true)}>
                            <FiPlus aria-hidden="true" />
                            Create room
                        </Button>
                    )}
                />
            )}

            {!error && rooms.length > 0 && visibleRooms.length === 0 && (
                <EmptyState
                    icon={<FiSearch aria-hidden="true" />}
                    title="No rooms match these filters"
                    description="Try another category or clear the search."
                    action={(
                        <Button
                            variant="outline"
                            onClick={() => {
                                setQuery("");
                                setTab("All");
                            }}
                        >
                            Clear filters
                        </Button>
                    )}
                />
            )}

            {visibleRooms.length > 0 && (
                <>
                    {hasFilters && (
                        <p className="mb-3 text-xs font-medium text-neutral-500" role="status">
                            {visibleRooms.length} {visibleRooms.length === 1 ? "room" : "rooms"} match your filters
                        </p>
                    )}
                    <section
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                        aria-label="Chat rooms"
                    >
                        {visibleRooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                to={`/community/rooms/${room.id}`}
                                onJoin={setJoinTarget}
                            />
                        ))}
                    </section>
                </>
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

            <CreateRoomModal
                isOpen={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={handleCreated}
            />

            <JoinRoomModal
                isOpen={Boolean(joinTarget)}
                room={joinTarget}
                onClose={() => setJoinTarget(null)}
                onJoined={() => setJoinTarget(null)}
                onSubmit={(passphrase) => handleJoin(joinTarget, passphrase)}
            />
        </div>
    );
};
