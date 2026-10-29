import {
    authErrorMessage,
    clearHandoffParams,
    exchangeTemporaryToken,
    googleSignInUrl,
    readHandoff,
} from "./externalSession";
import { saveSession } from "./session";

jest.mock("axios", () => ({
    create: () => ({ get: (...args) => mockGet(...args) }),
}));

jest.mock("../api/client", () => ({ API_BASE_URL: "https://api.test" }));
jest.mock("./session", () => ({ saveSession: jest.fn() }));

const mockGet = jest.fn();

const patientPayload = {
    token: "jwt-value",
    userId: "user-1",
    roles: ["User"],
    expiresOn: "2026-01-01T00:00:00Z",
};

describe("googleSignInUrl", () => {
    it("points at the API, not at a router path", () => {
        expect(googleSignInUrl()).toBe("https://api.test/api/auth/external-login");
    });
});

describe("readHandoff", () => {
    it("reads the one-time token out of the query string", () => {
        expect(readHandoff("?temporaryToken=abc123")).toEqual({
            temporaryToken: "abc123",
            authErrorCode: null,
        });
    });

    it("reads a failure code", () => {
        expect(readHandoff("?authError=role_unsupported").authErrorCode).toBe("role_unsupported");
    });

    it("treats an empty parameter as absent", () => {
        expect(readHandoff("?temporaryToken=&authError=")).toEqual({
            temporaryToken: null,
            authErrorCode: null,
        });
        expect(readHandoff("")).toEqual({ temporaryToken: null, authErrorCode: null });
    });
});

describe("authErrorMessage", () => {
    it("sends a clinician away rather than signing them into this portal", () => {
        expect(authErrorMessage("role_unsupported")).toMatch(/clinician/i);
    });

    it("has owned copy for every code the API can redirect with", () => {
        const codes = [
            "role_unsupported",
            "email_unverified",
            "profile_unavailable",
            "account_incomplete",
            "identity_taken",
            "remote_error",
            "expired",
            "not_a_patient",
        ];
        codes.forEach((code) => {
            expect(authErrorMessage(code)).toBeTruthy();
        });
    });

    it("collapses an unknown code to generic copy without reflecting it", () => {
        const message = authErrorMessage("<script>alert(1)</script>");

        expect(message).toBe("Google sign-in did not complete. Please try again.");
    });
});

describe("exchangeTemporaryToken", () => {
    beforeEach(() => {
        mockGet.mockReset();
        saveSession.mockReset();
    });

    it("saves a normalised session for a patient account", async () => {
        mockGet.mockResolvedValue({ data: patientPayload });

        const result = await exchangeTemporaryToken("abc123");

        expect(result).toEqual({ ok: true, session: patientPayload });
        expect(saveSession).toHaveBeenCalledWith(patientPayload);
    });

    it("requests the token from the exchange endpoint", async () => {
        mockGet.mockResolvedValue({ data: patientPayload });

        await exchangeTemporaryToken("abc123");

        expect(mockGet).toHaveBeenCalledWith(
            "/api/auth/exchange-token",
            { params: { temporaryToken: "abc123" } },
        );
    });

    it("refuses a clinician payload and writes nothing to storage", async () => {
        mockGet.mockResolvedValue({ data: { ...patientPayload, roles: ["Doctor"] } });

        const result = await exchangeTemporaryToken("abc123");

        expect(result).toEqual({ ok: false, code: "not_a_patient" });
        expect(saveSession).not.toHaveBeenCalled();
    });

    it("refuses a payload with no usable roles", async () => {
        mockGet.mockResolvedValue({ data: { ...patientPayload, roles: [] } });

        await expect(exchangeTemporaryToken("abc123")).resolves.toEqual({
            ok: false,
            code: "not_a_patient",
        });
        expect(saveSession).not.toHaveBeenCalled();
    });

    it("reports a rejected exchange as expired without touching storage", async () => {
        mockGet.mockRejectedValue({ response: { status: 401 } });

        await expect(exchangeTemporaryToken("replayed")).resolves.toEqual({
            ok: false,
            code: "expired",
        });
        expect(saveSession).not.toHaveBeenCalled();
    });

    it("treats a body without a token as expired", async () => {
        mockGet.mockResolvedValue({ data: { roles: ["User"] } });

        await expect(exchangeTemporaryToken("abc123")).resolves.toEqual({
            ok: false,
            code: "expired",
        });
        expect(saveSession).not.toHaveBeenCalled();
    });

    it("never calls the API without a token", async () => {
        await expect(exchangeTemporaryToken("")).resolves.toEqual({ ok: false, code: "expired" });
        await expect(exchangeTemporaryToken(null)).resolves.toEqual({ ok: false, code: "expired" });

        expect(mockGet).not.toHaveBeenCalled();
        expect(saveSession).not.toHaveBeenCalled();
    });

    it("keeps the server's opaque shape rather than a distinguishing message", async () => {
        mockGet.mockRejectedValue({
            response: { status: 401, data: "Invalid or expired token." },
        });

        const result = await exchangeTemporaryToken("guess");

        expect(result).toEqual({ ok: false, code: "expired" });
        expect(authErrorMessage(result.code)).toBe("That sign-in link has expired. Please try again.");
    });
});

describe("clearHandoffParams", () => {
    it("removes the query string without leaving the page", () => {
        window.history.replaceState({}, "", "/?temporaryToken=abc123");

        clearHandoffParams();

        expect(window.location.search).toBe("");
        expect(window.location.pathname).toBe("/");
    });
});
