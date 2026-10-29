import apiClient from "./client";
import { getChatErrorCode, getChatErrorMessage, joinChatRoom } from "./chat.api";

// The patient portal has no React Testing Library, so this file deliberately
// covers only the pure request/error contracts that room cards and the join
// modal depend on. Rendering is covered by the shared-ui and doctor-ui suites.
jest.mock("./client", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
    },
    getApiErrorMessage: (error, fallback) => error?.message || fallback,
}));

afterEach(() => {
    jest.clearAllMocks();
});

const chatError = (code, status = 400) => ({
    response: {
        status,
        data: {
            title: "Chat request failed",
            detail: "server detail",
            errors: [{ code, message: "server message" }],
        },
    },
});

describe("chat error mapping", () => {
    it("reads the machine readable code out of the problem body", () => {
        expect(getChatErrorCode(chatError("Chat.RoomLocked"))).toBe("Chat.RoomLocked");
        expect(getChatErrorCode(new Error("network"))).toBeNull();
    });

    it("keeps the join modal copy identical to the doctor portal", () => {
        expect(getChatErrorMessage(chatError("Chat.RoomPassphraseIncorrect", 403)))
            .toBe("Incorrect room password. Try again.");
        expect(getChatErrorMessage(chatError("Chat.RoomPassphraseRequired", 403)))
            .toBe("This room needs a password to join.");
        expect(getChatErrorMessage(chatError("Chat.RoomLocked", 409))).toMatch(/paused/i);
        expect(getChatErrorMessage(chatError("Chat.RoomArchived", 409))).toMatch(/archived/i);
        expect(getChatErrorMessage(chatError("Chat.CreateRoomForbidden", 403)))
            .toMatch(/cannot create rooms/i);
    });

    it("falls back to the generic message for unknown codes and honours a custom fallback", () => {
        expect(getChatErrorMessage(chatError("Chat.SomethingNew")))
            .toBe("Something went wrong. Please try again.");
        expect(getChatErrorMessage(chatError("Chat.SomethingNew"), "Custom fallback"))
            .toBe("Custom fallback");
    });

    it("maps a bare rate limit to its dedicated copy", () => {
        expect(getChatErrorMessage({ response: { status: 429, data: {} } }))
            .toMatch(/rate limit/i);
    });
});

describe("joinChatRoom", () => {
    it("posts no body when no passphrase was collected", async () => {
        apiClient.post.mockResolvedValueOnce({ data: { id: 12 } });

        await joinChatRoom(12, null);

        expect(apiClient.post).toHaveBeenCalledWith("/api/chat/rooms/12/join", undefined);
    });

    it("sends the passphrase in the documented body shape", async () => {
        apiClient.post.mockResolvedValueOnce({ data: { id: 12 } });

        await joinChatRoom(12, "correct horse battery");

        expect(apiClient.post).toHaveBeenCalledWith("/api/chat/rooms/12/join", {
            passphrase: "correct horse battery",
        });
    });

    it("attaches the mapped copy so the shared join modal does not leak the raw detail", async () => {
        const failure = chatError("Chat.RoomPassphraseIncorrect", 403);
        apiClient.post.mockRejectedValueOnce(failure);

        await expect(joinChatRoom(12, "nope")).rejects.toBe(failure);
        expect(failure.friendlyMessage).toBe("Incorrect room password. Try again.");
    });
});
