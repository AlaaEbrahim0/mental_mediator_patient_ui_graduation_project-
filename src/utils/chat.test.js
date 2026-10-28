import {
    canDeleteChatMessage,
    canManageChatMemberRole,
    canModerateRoom,
    canReportChatMessage,
    chatDayKey,
    formatChatTimestamp,
    isOwnChatMessage,
    isRoomOwner,
    markRoomMemberLeft,
    mergeChatMessages,
    mergeRoomArchiveEvent,
    mergeRoomMemberEvent,
} from "./chat";

const room = (overrides = {}) => ({
    isMember: true,
    myMemberId: 7,
    myRole: "Member",
    ...overrides,
});

const message = (overrides = {}) => ({
    id: 1,
    senderMemberId: 7,
    isDeleted: false,
    ...overrides,
});

describe("chat permissions", () => {
    it("lets a member delete their own message but not someone else's", () => {
        const member = room();
        expect(canDeleteChatMessage(message({ senderMemberId: 7 }), member)).toBe(true);
        expect(canDeleteChatMessage(message({ senderMemberId: 8 }), member)).toBe(false);
    });

    it("lets a moderator delete any message, and only while still a member", () => {
        expect(canDeleteChatMessage(message({ senderMemberId: 8 }), room({ myRole: "Moderator" }))).toBe(true);
        expect(canDeleteChatMessage(message({ senderMemberId: 8 }), room({ myRole: "Moderator", isMember: false }))).toBe(false);
    });

    it("never exposes delete or report on an already deleted message", () => {
        const deleted = message({ isDeleted: true });
        expect(canDeleteChatMessage(deleted, room())).toBe(false);
        expect(canReportChatMessage(deleted, room())).toBe(false);
    });

    it("reports other people's messages but never your own", () => {
        expect(canReportChatMessage(message({ senderMemberId: 8 }), room())).toBe(true);
        expect(canReportChatMessage(message({ senderMemberId: 7 }), room())).toBe(false);
        expect(canReportChatMessage(message({ senderMemberId: 8 }), room({ isMember: false }))).toBe(false);
    });

    it("treats a message without a matching member id as not yours", () => {
        // A room that has not resolved your own membership must not light up
        // "own message" affordances for arbitrary senders.
        expect(isOwnChatMessage(message({ senderMemberId: 7 }), room({ myMemberId: null }))).toBe(false);
        expect(isOwnChatMessage(null, room())).toBe(false);
    });

    it("restricts role management to the owner, to doctors, and never to a co-owner", () => {
        const owner = room({ myRole: "Owner" });
        expect(canManageChatMemberRole(owner, { role: "Member", isDoctor: true })).toBe(true);
        expect(canManageChatMemberRole(owner, { role: "Owner", isDoctor: true })).toBe(false);
        expect(canManageChatMemberRole(owner, { role: "Member", isDoctor: false })).toBe(false);
        expect(canManageChatMemberRole(room({ myRole: "Moderator" }), { role: "Member", isDoctor: true })).toBe(false);
        expect(canManageChatMemberRole(owner, null)).toBe(false);
    });

    it("separates ownership from moderation rights", () => {
        expect(isRoomOwner(room({ myRole: "Owner" }))).toBe(true);
        expect(isRoomOwner(room({ myRole: "Moderator" }))).toBe(false);
        expect(canModerateRoom(room({ myRole: "Moderator" }))).toBe(true);
        expect(canModerateRoom(room({ myRole: "Member" }))).toBe(false);
        expect(isRoomOwner(undefined)).toBe(false);
    });
});

describe("mergeChatMessages", () => {
    it("drops the optimistic copy once the server confirms the same client id", () => {
        const merged = mergeChatMessages(
            [{ id: -1, clientMessageId: "abc", sentAtUtc: "2026-01-01T10:00:00Z" }],
            [{ id: 42, clientMessageId: "abc", sentAtUtc: "2026-01-01T10:00:05Z" }]
        );

        expect(merged).toHaveLength(1);
        expect(merged[0].id).toBe(42);
    });

    it("keeps a confirmed message and ignores a late optimistic duplicate of it", () => {
        const merged = mergeChatMessages(
            [{ id: 42, clientMessageId: "abc" }],
            [{ id: -1, clientMessageId: "abc", sentAtUtc: "2026-01-01T10:00:00Z" }]
        );

        expect(merged.map((item) => item.id)).toEqual([42]);
    });

    it("sorts confirmed messages by id and leaves pending ones last, newest order by time", () => {
        const merged = mergeChatMessages(
            [
                { id: 3, sentAtUtc: "2026-01-01T10:03:00Z" },
                { id: 1, sentAtUtc: "2026-01-01T10:01:00Z" },
                { id: -1, clientMessageId: "p2", sentAtUtc: "2026-01-01T10:05:00Z" },
                { id: -1, clientMessageId: "p1", sentAtUtc: "2026-01-01T10:04:00Z" },
            ],
            []
        );

        expect(merged.map((item) => item.id)).toEqual([1, 3, -1, -1]);
        expect(merged.slice(2).map((item) => item.clientMessageId)).toEqual(["p1", "p2"]);
    });

    it("de-duplicates the same server id arriving twice and ignores empty entries", () => {
        const merged = mergeChatMessages(
            [{ id: 9, body: "first" }, null],
            [{ id: 9, body: "second" }]
        );

        expect(merged).toHaveLength(1);
        expect(merged[0].body).toBe("second");
    });
});

describe("room membership events", () => {
    it("applies a promotion delivered for the current user only", () => {
        const promoted = mergeRoomMemberEvent(room(), { memberId: 7, role: "Moderator" });
        expect(promoted.myRole).toBe("Moderator");
        expect(promoted.isMember).toBe(true);

        expect(mergeRoomMemberEvent(room(), { memberId: 8, role: "Owner" }).myRole).toBe("Member");
    });

    it("does not resurrect membership when the local user has no member id", () => {
        const outsider = room({ myMemberId: null });
        expect(mergeRoomMemberEvent(outsider, { memberId: 7, role: "Owner" })).toBe(outsider);
    });

    it("clears role and message preview when the current user leaves", () => {
        const previewed = room({ lastMessagePreview: "private content" });
        const left = markRoomMemberLeft(previewed, 7);
        expect(left.isMember).toBe(false);
        expect(left.myRole).toBeNull();
        expect(left.lastMessagePreview).toBeNull();

        expect(markRoomMemberLeft(previewed, 8)).toBe(previewed);
    });

    it("never copies ownership fields or message content from an archive broadcast", () => {
        // RoomArchived is broadcast to everyone, but the payload is built from the
        // archiving owner's snapshot, so myRole/myMemberId/isMember/preview must
        // survive from the local room untouched.
        const local = room({
            myRole: "Member",
            myMemberId: 7,
            isMember: true,
            lastMessagePreview: "mine",
            name: "Old name",
        });

        const merged = mergeRoomArchiveEvent(local, {
            name: "Renamed room",
            isArchived: true,
            myRole: "Owner",
            myMemberId: 999,
            isMember: false,
            lastMessagePreview: "leaked preview",
        });

        expect(merged.name).toBe("Renamed room");
        expect(merged.isArchived).toBe(true);
        expect(merged.myRole).toBe("Member");
        expect(merged.myMemberId).toBe(7);
        expect(merged.isMember).toBe(true);
        expect(merged.lastMessagePreview).toBe("mine");
    });
});

describe("chat timestamps", () => {
    it("returns an empty string instead of Invalid Date for unusable input", () => {
        expect(formatChatTimestamp(null)).toBe("");
        expect(formatChatTimestamp("not-a-date")).toBe("");
        expect(chatDayKey(undefined)).toBe("");
    });

    it("groups messages by local calendar day, not by UTC day", () => {
        const key = chatDayKey("2026-01-05T23:30:00Z");
        expect(key.split("-")).toHaveLength(3);
        expect(formatChatTimestamp("2026-01-05T23:30:00Z")).not.toBe("");
    });
});
