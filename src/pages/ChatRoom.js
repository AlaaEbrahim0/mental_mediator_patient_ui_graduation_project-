import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    FiArchive,
    FiArrowDown,
    FiChevronLeft,
    FiFlag,
    FiLogOut,
    FiPauseCircle,
    FiPlayCircle,
    FiShield,
    FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
    Alert,
    Badge,
    Button,
    Card,
    ConfirmDialog,
    ErrorState,
    Skeleton,
} from "../components/ui";
import { ChatComposer } from "../components/chat/ChatComposer";
import { ChatMessageItem } from "../components/chat/ChatMessageItem";
import { ReportMessageModal } from "../components/chat/ReportMessageModal";
import { RoomMembersPanel } from "../components/chat/RoomMembersPanel";
import { RoomReportsPanel } from "../components/chat/RoomReportsPanel";
import { JoinRoomModal } from "../components/ui/community";
import { useChatHub } from "../hooks/useChatHub";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import {
    getChatErrorMessage,
    markChatRoomRead,
    useArchiveChatRoom,
    useChatMembers,
    useChatMessages,
    useChatReports,
    useChatRoom,
    useDeleteChatMessage,
    useJoinChatRoom,
    useLeaveChatRoom,
    useLockChatRoom,
    useSendChatMessage,
    useUnlockChatRoom,
} from "../api/chat.api";
import {
    canModerateRoom,
    chatDayKey,
    formatChatDay,
    isRoomOwner,
    markRoomMemberLeft,
    mergeRoomArchiveEvent,
    mergeRoomMemberEvent,
    mergeRoomUpdateEvent,
    removeChatMember,
    upsertChatMember,
} from "../utils/chat";

// How close to the bottom the list has to be for the view to count as "at the
// bottom". Below this the client stops auto-scrolling and shows a button
// instead of yanking the viewport.
const BOTTOM_THRESHOLD_PX = 96;

const roleBadgeVariant = (role) => {
    if (role === "Owner") return "primary";
    if (role === "Moderator") return "info";
    if (role === "Member") return "success";

    return "neutral";
};

/**
 * Route wrapper.
 *
 * React Router reuses the same element when only the `:id` param changes.
 * Keying the view by room id remounts the room hooks, so a conversation,
 * member roster, report queue or SignalR connection from the previous room
 * cannot survive into the new one.
 */
export const ChatRoom = () => {
    const { id } = useParams();
    const roomId = Number(id);

    return <ChatRoomView key={id} roomId={roomId} />;
};

const ChatRoomView = ({ roomId }) => {
    const navigate = useNavigate();

    const { room, setRoom, isLoading: isLoadingRoom, error: roomError, execute: loadRoom } =
        useChatRoom(roomId);

    const isMember = Boolean(room?.isMember);
    const isArchived = Boolean(room?.isArchived);
    const isOwner = isRoomOwner(room);
    const canModerate = canModerateRoom(room);

    const {
        messages,
        isLoading: isLoadingMessages,
        isLoadingOlder,
        error: messagesError,
        hasMore: hasOlderMessages,
        loadLatest,
        loadOlder,
        recoverAfterLatest,
        addOptimistic,
        confirmMessage,
        upsertMessage,
        failMessage,
    } = useChatMessages(roomId, isMember);

    const { members, setMembers } = useChatMembers(roomId, isMember);
    const {
        reports,
        setReports,
        execute: loadReports,
    } = useChatReports(roomId, canModerate);

    const { execute: joinRoom } = useJoinChatRoom();
    const { execute: leaveRoom } = useLeaveChatRoom();
    const { execute: archiveRoom } = useArchiveChatRoom();
    const { execute: lockRoom } = useLockChatRoom();
    const { execute: unlockRoom } = useUnlockChatRoom();
    const { execute: deleteMessage } = useDeleteChatMessage();
    const { execute: sendMessage } = useSendChatMessage();

    const [reportTarget, setReportTarget] = useState(null);
    const [isArchiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [isLeaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);
    const [isLockBusy, setIsLockBusy] = useState(false);
    const [showReports, setShowReports] = useState(false);
    const [busyMessageId, setBusyMessageId] = useState(null);
    const [isSending, setIsSending] = useState(false);

    // The recovery pass is keyed on the subscription generation: it runs once
    // per successful SubscribeToRoom, and only after the history of the same
    // room is in place. historyReadyRoomId carries the room the history
    // belongs to, so a room switch cannot recover against the old room.
    const [subscriptionVersion, setSubscriptionVersion] = useState(0);
    const [historyReadyRoomId, setHistoryReadyRoomId] = useState(null);
    const lastRecoveryVersionRef = useRef(0);

    const scrollRef = useRef(null);
    const restoreRef = useRef(null);
    const stickToBottomRef = useRef(true);
    const lastReadMarkRef = useRef(0);
    const [newMessageCount, setNewMessageCount] = useState(0);

    const isValidRoomId = Number.isInteger(roomId) && roomId > 0;

    const markRoomRead = useCallback(() => {
        if (!isMember) return;

        // A busy room delivers messages in bursts; one write every few
        // seconds is enough for a badge that is only read on the way out.
        const now = Date.now();
        if (now - lastReadMarkRef.current < 5000) return;
        lastReadMarkRef.current = now;

        markChatRoomRead(roomId).catch(() => undefined);
    }, [isMember, roomId]);

    // A leave in another tab or on another device cannot reach this tab as a
    // MemberLeft event: the server removes the leaver's connections before it
    // broadcasts. Refetch the room when this tab regains focus so revoked
    // access cannot leave cached conversation content on screen. This is a
    // partial mitigation, not a replacement for a server-targeted event.
    useRefreshOnFocus(() => {
        if (isLoadingRoom) return;

        loadRoom().catch(() => undefined);
    }, { enabled: isValidRoomId && Boolean(room) });

    useEffect(() => {
        if (!isValidRoomId) return;

        loadRoom().catch(() => undefined);
    }, [isValidRoomId, loadRoom]);

    // Opening a room reads it; leaving marks anything seen while the tab was
    // open so the directory badge matches the conversation.
    useEffect(() => {
        if (!isMember) return undefined;

        lastReadMarkRef.current = 0;
        markRoomRead();

        return () => {
            markChatRoomRead(roomId).catch(() => undefined);
        };
    }, [isMember, roomId, markRoomRead]);

    // The history is only visible to active members. The endpoint answers 404
    // for everybody else, so it is never called for a non-member.
    useEffect(() => {
        if (!isMember) {
            setHistoryReadyRoomId(null);
            return;
        }

        let cancelled = false;

        loadLatest()
            .then(() => {
                if (!cancelled) setHistoryReadyRoomId(roomId);
            })
            .catch(() => {
                if (!cancelled) setHistoryReadyRoomId(roomId);
            });

        return () => {
            cancelled = true;
        };
    }, [isMember, roomId, loadLatest]);

    useEffect(() => {
        if (!canModerate) {
            setShowReports(false);
            return;
        }

        loadReports().catch(() => undefined);
    }, [canModerate, loadReports]);

    const handleSubscribed = useCallback((snapshot) => {
        // The subscribe handshake returns a snapshot that is scoped to the
        // current user, so it can replace the room wholesale.
        if (snapshot) setRoom(snapshot);

        setSubscriptionVersion((version) => version + 1);
    }, [setRoom]);

    const handleReconnected = useCallback(() => {
        // A reconnect restores the socket but not the group membership, and
        // the messages that arrived meanwhile are only in the history.
        setSubscriptionVersion((version) => version + 1);
    }, []);

    const { isConnected } = useChatHub(roomId, {
        enabled: isMember,
        onSubscribed: handleSubscribed,
        onReconnected: handleReconnected,
        onMessageCreated: (message) => {
            upsertMessage(message);
            markRoomRead();

            // Only a message from somebody else counts as "new" for the
            // affordance. The sender's own message is scrolled to.
            const isOwn = message?.senderMemberId != null &&
                message.senderMemberId === room?.myMemberId;

            if (!isOwn && !stickToBottomRef.current) {
                setNewMessageCount((count) => count + 1);
            }
        },
        onMessageDeleted: (message) => {
            upsertMessage(message);
        },
        onMemberUpdated: (member) => {
            setMembers((previous) => upsertChatMember(previous, member));

            // A role change can target the current user (for example, the
            // owner promotes this doctor in another session). The room
            // snapshot carries the permissions the UI uses, so update it too.
            setRoom((previous) => mergeRoomMemberEvent(previous, member));
        },
        onMemberLeft: (memberId) => {
            setMembers((previous) => removeChatMember(previous, memberId));

            // The current user may have left the room from another tab or
            // another device. The membership in the room snapshot is then
            // stale: the composer would still be enabled and every send
            // would fail with 404. Refetching the room re-reads isMember and
            // myRole from the server.
            if (room?.myMemberId != null && memberId === room.myMemberId) {
                // Clear the local permissions immediately; the refetch below
                // confirms the server state.
                setRoom((previous) => markRoomMemberLeft(previous, memberId));
                loadRoom().catch(() => undefined);
                toast.error("You are no longer a member of this room.");
            }
        },
        onRoomArchived: (event) => {
            // The broadcast payload is built from the archiving owner's
            // membership, so only the shared room fields may be merged.
            setRoom((previous) => mergeRoomArchiveEvent(previous, event));
            toast.success("This room has been archived.");
        },
        onRoomUpdated: (event) => {
            // Lock, privacy, schedule and cover changes made by any moderator.
            setRoom((previous) => mergeRoomUpdateEvent(previous, event));
        },
    });

    /**
     * Recover the messages that were missed while the client was offline.
     *
     * The recovery runs only when the client is subscribed and the initial
     * history of the same room is in place. The subscription version makes
     * each subscription or reconnect trigger exactly one recovery pass.
     */
    useEffect(() => {
        if (subscriptionVersion === 0) return;
        if (historyReadyRoomId !== roomId) return;
        if (subscriptionVersion <= lastRecoveryVersionRef.current) return;

        lastRecoveryVersionRef.current = subscriptionVersion;

        recoverAfterLatest().then(markRoomRead).catch(() => undefined);
    }, [subscriptionVersion, historyReadyRoomId, roomId, recoverAfterLatest, markRoomRead]);

    // Keep the viewport at the bottom while the doctor is reading it. When
    // older messages are prepended the scroll position is restored instead,
    // so the history does not jump.
    useLayoutEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        if (restoreRef.current) {
            const { height, top } = restoreRef.current;
            restoreRef.current = null;
            container.scrollTop = container.scrollHeight - height + top;
            return;
        }

        if (stickToBottomRef.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight;

        stickToBottomRef.current = distanceFromBottom <= BOTTOM_THRESHOLD_PX;

        if (stickToBottomRef.current) {
            setNewMessageCount(0);
        }
    };

    const scrollToBottom = () => {
        const container = scrollRef.current;
        if (!container) return;

        stickToBottomRef.current = true;
        container.scrollTop = container.scrollHeight;
        setNewMessageCount(0);
    };

    const handleLoadOlder = async () => {
        const container = scrollRef.current;
        if (container) {
            restoreRef.current = {
                height: container.scrollHeight,
                top: container.scrollTop,
            };
        }

        try {
            const page = await loadOlder();

            // Nothing was prepended, so there is no new content to compensate
            // for. The stored measurement has to be dropped, otherwise it
            // would be applied to the next unrelated render.
            if (!page || !(page.messages || []).length) {
                restoreRef.current = null;
                return;
            }
        } catch (error) {
            restoreRef.current = null;
            toast.error(getChatErrorMessage(error, "Older messages could not be loaded."));
        }
    };

    // The join modal owns its own error line, so its submit path rethrows
    // instead of toasting; the one-click path on an open room toasts.
    const submitJoin = async (passphrase) => {
        await joinRoom(roomId, passphrase);
        await loadRoom();
        toast.success("You joined the room.");
    };

    const handleJoin = async () => {
        if (room?.requiresPassword) {
            setJoinDialogOpen(true);
            return;
        }

        try {
            await submitJoin(null);
        } catch (error) {
            toast.error(getChatErrorMessage(error, "You could not join this room."));
        }
    };

    const handleToggleLock = async () => {
        const wasLocked = Boolean(room?.isLocked);
        setIsLockBusy(true);

        try {
            const updated = wasLocked ? await unlockRoom(roomId) : await lockRoom(roomId);
            if (updated) {
                setRoom((previous) => mergeRoomUpdateEvent(previous, updated));
            }
            toast.success(wasLocked ? "The room is active again." : "The room is paused.");
        } catch (error) {
            toast.error(getChatErrorMessage(error, "The room could not be updated."));
        } finally {
            setIsLockBusy(false);
        }
    };

    const handleLeave = async () => {
        try {
            await leaveRoom(roomId);
            setLeaveDialogOpen(false);
            toast.success("You left the room.");
            navigate("/Community/rooms");
        } catch (error) {
            setLeaveDialogOpen(false);
            toast.error(getChatErrorMessage(error, "You could not leave this room."));
        }
    };

    const handleArchive = async () => {
        try {
            const archived = await archiveRoom(roomId);
            if (archived) setRoom(archived);
            setArchiveDialogOpen(false);
            // The RoomArchived broadcast is the single success notification,
            // including for the owner who performed the action. Toasting here
            // as well would show the owner two messages for one action.
        } catch (error) {
            setArchiveDialogOpen(false);
            toast.error(getChatErrorMessage(error, "The room could not be archived."));
        }
    };

    const handleSend = async (content) => {
        const optimistic = addOptimistic(content, {
            memberId: room?.myMemberId,
            displayName: "You",
            isDoctor: false,
        });

        setIsSending(true);
        stickToBottomRef.current = true;

        try {
            const persisted = await sendMessage(roomId, {
                content,
                clientMessageId: optimistic.clientMessageId,
            });

            confirmMessage(persisted);
        } catch (error) {
            failMessage(optimistic.clientMessageId);
            toast.error(getChatErrorMessage(error, "Your message was not sent."));
            // Let the composer restore the draft so the user does not lose
            // what they typed.
            throw error;
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (message) => {
        setBusyMessageId(message.id);

        try {
            const deleted = await deleteMessage(message.id);
            upsertMessage(deleted);
            toast.success("The message was removed.");
        } catch (error) {
            toast.error(getChatErrorMessage(error, "The message could not be removed."));
        } finally {
            setBusyMessageId(null);
        }
    };

    const handleReported = () => {
        setReportTarget(null);

        // The report was accepted by the server, but the moderator list was
        // loaded when the room opened. Reload it so the new report is
        // actually visible in the panel. Only moderators may read this
        // endpoint; a regular member reporting a message must not trigger a
        // guaranteed 403.
        if (canModerate) {
            loadReports().catch(() => undefined);
        }

        toast.success("The message was reported to the room moderators.");
    };

    const handleMemberRoleChanged = (updated) => {
        setMembers((previous) => upsertChatMember(previous, updated));
        toast.success(`${updated.displayName} is now a ${updated.role.toLowerCase()}.`);
    };

    const handleReportStatusChanged = (updated) => {
        setReports((previous) => previous.map((report) => (
            report.id === updated.id ? updated : report
        )));
        toast.success(`The report is now ${updated.status.toLowerCase()}.`);
    };

    // Group the messages by calendar day so the list can show a date divider.
    const messageGroups = useMemo(() => {
        const groups = [];

        messages.forEach((message) => {
            const key = chatDayKey(message.sentAtUtc);
            const last = groups[groups.length - 1];

            if (last && last.key === key) {
                last.messages.push(message);
                return;
            }

            groups.push({ key, label: formatChatDay(message.sentAtUtc), messages: [message] });
        });

        return groups;
    }, [messages]);

    if (!isValidRoomId) {
        return (
            <ErrorState
                title="This room link is not valid"
                message="The room id in the address is not a valid room."
            />
        );
    }

    if (roomError && !room) {
        return (
            <ErrorState
                title="We couldn’t open this room"
                message={getChatErrorMessage(roomError, "The room is not available.")}
                onRetry={() => loadRoom().catch(() => undefined)}
            />
        );
    }

    if (isLoadingRoom && !room) {
        return (
            <div className="space-y-4" aria-label="Loading room">
                <Card>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="mt-3 h-4 w-2/3" />
                </Card>
                <Card>
                    <Skeleton className="h-40 w-full" />
                </Card>
            </div>
        );
    }

    if (!room) return null;

    return (
        <div className="w-full">
            <Link
                to="/Community/rooms"
                className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
            >
                <FiChevronLeft aria-hidden="true" />
                All chat rooms
            </Link>

            <Card className="mb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-bold text-neutral-900">{room.name}</h1>
                            {room.myRole && (
                                <Badge variant={roleBadgeVariant(room.myRole)} size="sm">
                                    {room.myRole}
                                </Badge>
                            )}
                            {isArchived && (
                                <Badge variant="warning" size="sm">
                                    Archived
                                </Badge>
                            )}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                            {room.description || "No description."}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-500">
                            <FiUsers aria-hidden="true" />
                            {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {isMember && !isOwner && (
                            <Button
                                variant="outline"
                                onClick={() => setLeaveDialogOpen(true)}
                            >
                                <FiLogOut aria-hidden="true" />
                                Leave room
                            </Button>
                        )}

                        {canModerate && !isArchived && (
                            <Button
                                variant="outline"
                                onClick={handleToggleLock}
                                loading={isLockBusy}
                            >
                                {room.isLocked ? (
                                    <FiPlayCircle aria-hidden="true" />
                                ) : (
                                    <FiPauseCircle aria-hidden="true" />
                                )}
                                {room.isLocked ? "Resume room" : "Pause room"}
                            </Button>
                        )}

                        {canModerate && (
                            <Button
                                variant="outline"
                                onClick={() => setArchiveDialogOpen(true)}
                                disabled={isArchived}
                            >
                                <FiArchive aria-hidden="true" />
                                Archive room
                            </Button>
                        )}

                        {!isMember && (
                            <Button
                                onClick={handleJoin}
                                disabled={isArchived || room.isLocked}
                                title={room.isLocked ? "This room is paused and is not accepting new members." : undefined}
                            >
                                Join room
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {isArchived && (
                <Alert variant="warning" title="This room is archived" className="mb-4">
                    Archived rooms are read-only. New messages are no longer accepted and
                    the room is hidden from the directory.
                </Alert>
            )}

            {!isArchived && room.isLocked && (
                <Alert variant="warning" title="This room is paused" className="mb-4">
                    A moderator paused this room. The conversation stays readable, but
                    nobody can post and no new members can join until it is resumed.
                </Alert>
            )}

            {!isMember && !isArchived && (
                <Alert variant="info" title="You are not a member of this room" className="mb-4">
                    The conversation is only visible to members. Join the room to read and
                    reply to the messages.
                </Alert>
            )}

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
                <section className="min-w-0 lg:col-span-8" aria-label="Room conversation">
                    <Card padded={false} className="overflow-hidden">
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="max-h-[60vh] min-h-[24rem] overflow-y-auto"
                        >
                            {isLoadingMessages && messages.length === 0 && (
                                <div className="space-y-4 p-4" aria-label="Loading messages">
                                    {[0, 1, 2].map((index) => (
                                        <div key={index} className="flex gap-3">
                                            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                                            <div className="min-w-0 flex-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="mt-2 h-4 w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {messagesError && messages.length === 0 && (
                                <div className="p-4">
                                    <ErrorState
                                        title="We couldn’t load the messages"
                                        message={getChatErrorMessage(messagesError)}
                                        onRetry={() => loadLatest().catch(() => undefined)}
                                    />
                                </div>
                            )}

                            {!isLoadingMessages && !messagesError && messages.length === 0 && (
                                isMember ? (
                                    <p className="px-4 py-10 text-center text-sm text-neutral-600">
                                        No messages yet. Start the conversation.
                                    </p>
                                ) : (
                                    // A non-member is not allowed to read the
                                    // conversation, so an empty list does not
                                    // mean the room is empty.
                                    <p className="px-4 py-10 text-center text-sm text-neutral-600">
                                        Join the room to see the conversation.
                                    </p>
                                )
                            )}

                            {messages.length > 0 && (
                                <div className="divide-y divide-neutral-100">
                                    {hasOlderMessages && (
                                        <div className="px-4 py-3 text-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleLoadOlder}
                                                loading={isLoadingOlder}
                                            >
                                                Load older messages
                                            </Button>
                                        </div>
                                    )}

                                    {messageGroups.map((group) => (
                                        <div key={group.key || "unknown-day"}>
                                            <div className="sticky top-0 z-10 bg-base-100/95 px-4 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500 backdrop-blur">
                                                {group.label}
                                            </div>
                                            {group.messages.map((message) => (
                                                <ChatMessageItem
                                                    key={message.clientMessageId || message.id}
                                                    message={message}
                                                    room={room}
                                                    isBusy={busyMessageId === message.id}
                                                    onDelete={handleDelete}
                                                    onReport={setReportTarget}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {newMessageCount > 0 && (
                            <div className="border-t border-neutral-200 px-4 py-2 text-center">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={scrollToBottom}
                                >
                                    <FiArrowDown aria-hidden="true" />
                                    {newMessageCount} new {newMessageCount === 1 ? "message" : "messages"}
                                </Button>
                            </div>
                        )}

                        {isMember && (
                            <ChatComposer
                                onSend={handleSend}
                                isSending={isSending}
                                disabled={isArchived || room.isLocked}
                                disabledReason={
                                    room.isLocked
                                        ? "This room is paused, so nobody can post right now."
                                        : "This room is archived, so it is read-only."
                                }
                            />
                        )}
                    </Card>
                </section>

                <aside className="min-w-0 space-y-4 lg:col-span-4" aria-label="Room details">
                    {isMember && (
                        <Card>
                            <RoomMembersPanel
                                room={room}
                                members={members}
                                onRoleChanged={handleMemberRoleChanged}
                            />
                        </Card>
                    )}

                    {canModerate && (
                        <Card>
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <h2 className="text-sm font-bold text-neutral-900">Moderation</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowReports((visible) => {
                                            // Opening the panel reloads the
                                            // queue, because reports can be
                                            // filed by other members while
                                            // the room is open.
                                            if (!visible) {
                                                loadReports().catch(() => undefined);
                                            }

                                            return !visible;
                                        });
                                    }}
                                >
                                    <FiFlag aria-hidden="true" />
                                    {showReports ? "Hide reports" : "Show reports"}
                                </Button>
                            </div>

                            {showReports ? (
                                <RoomReportsPanel
                                    roomId={room.id}
                                    reports={reports}
                                    onStatusChanged={handleReportStatusChanged}
                                />
                            ) : (
                                <p className="flex items-start gap-2 text-xs leading-5 text-neutral-600">
                                    <FiShield aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                                    <span>
                                        You can remove messages and review reports in this
                                        room. Only the owner can change roles or archive it.
                                    </span>
                                </p>
                            )}
                        </Card>
                    )}

                    <Card>
                        <h2 className="text-sm font-bold text-neutral-900">Connection</h2>
                        <p className="mt-1 text-xs leading-5 text-neutral-600">
                            {isMember
                                ? (isConnected
                                    ? "Live updates are on. Messages arrive as they are sent."
                                    : "Live updates are reconnecting. The conversation history still works.")
                                : "Join the room to receive live updates."}
                        </p>
                    </Card>
                </aside>
            </div>

            <ReportMessageModal
                isOpen={Boolean(reportTarget)}
                message={reportTarget}
                onClose={() => setReportTarget(null)}
                onReported={handleReported}
            />

            <ConfirmDialog
                isOpen={isLeaveDialogOpen}
                onClose={() => setLeaveDialogOpen(false)}
                onConfirm={handleLeave}
                title="Leave this room?"
                message="You will stop receiving messages from this room. You can rejoin at any time."
                confirmLabel="Leave room"
            />

            <ConfirmDialog
                isOpen={isArchiveDialogOpen}
                onClose={() => setArchiveDialogOpen(false)}
                onConfirm={handleArchive}
                title="Archive this room?"
                message="The room becomes read-only and is hidden from the directory. This cannot be undone."
                confirmLabel="Archive room"
            />

            <JoinRoomModal
                isOpen={isJoinDialogOpen}
                room={room}
                onClose={() => setJoinDialogOpen(false)}
                onJoined={() => setJoinDialogOpen(false)}
                onSubmit={submitJoin}
            />
        </div>
    );
};
