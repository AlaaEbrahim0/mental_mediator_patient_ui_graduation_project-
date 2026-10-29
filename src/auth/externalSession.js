import axios from "axios";
import { API_BASE_URL } from "../api/client";
import { saveSession } from "./session";

// Google returns the user to this app as a top-level browser navigation
// (/?temporaryToken=…), while the tab still has no session. This module owns
// that handoff: read the URL, exchange the one-time token, and persist a
// session only when the account is actually a patient.
//
// It deliberately does NOT use apiClient. apiClient's response interceptor
// converts any 401 into an "auth:expired" window event, and authProvider answers
// that event by clearing the stored session — so an expired handoff token would
// wipe the session this exchange has just written. `skipAuth` only silences the
// request interceptor, not that handler, so the handoff gets its own client.

const handoffClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Accept: "application/json" },
    timeout: 15000,
});

const GOOGLE_SIGN_IN_PATH = "/api/auth/external-login";
const EXCHANGE_TOKEN_PATH = "/api/auth/exchange-token";

// Mirrors the codes the API is allowed to put in a redirect
// (api/Infrastructure/Utilities/AuthHandoff.cs). Unknown values collapse to the
// generic message, so a hand-crafted ?authError= can only select known copy and
// never reflects attacker text into the page.
const AUTH_ERROR_MESSAGES = {
    role_unsupported: "This Google account is registered as a clinician or administrator. Sign in with your password instead.",
    email_unverified: "Google could not confirm this email address, so we could not sign you in.",
    profile_unavailable: "Google did not return the account details we need. Please try again.",
    account_incomplete: "This account is missing details needed to sign in. Please use your email and password.",
    identity_taken: "An account already exists for this email address. Sign in with your password first.",
    remote_error: "Google closed the sign-in before finishing it. Please try again.",
};

const GENERIC_AUTH_ERROR = "Google sign-in did not complete. Please try again.";
const EXPIRED_HANDOFF = "That sign-in link has expired. Please try again.";
const NOT_A_PATIENT = "This Google account is not registered as a patient.";

export const googleSignInUrl = () => `${API_BASE_URL}${GOOGLE_SIGN_IN_PATH}`;

// Own copy rather than importing routes/ProtectedRoute: that module pulls in
// react-router and the auth context, and keeping this file free of them means
// the whole handoff is testable as plain logic. Both compare the same way — a
// case-insensitive "user" — and the server's own rule is in AuthHandoff.
const isPatientRole = (roles) =>
    Array.isArray(roles) &&
    roles.some((role) => typeof role === "string" && role.toLowerCase() === "user");

export const readHandoff = (search) => {
    const query = search ?? (typeof window === "undefined" ? "" : window.location.search);
    const params = new URLSearchParams(query || "");
    return {
        temporaryToken: params.get("temporaryToken") || null,
        authErrorCode: params.get("authError") || null,
    };
};

export const authErrorMessage = (code) => {
    if (code === "expired") return EXPIRED_HANDOFF;
    if (code === "not_a_patient") return NOT_A_PATIENT;
    return AUTH_ERROR_MESSAGES[code] || GENERIC_AUTH_ERROR;
};

// Removes the handoff parameters from the address bar without a reload, so a
// refresh or a browser-history entry never replays a single-use token.
export const clearHandoffParams = () => {
    if (typeof window === "undefined" || !window.history?.replaceState) return;
    window.history.replaceState({}, window.document.title, window.location.pathname);
};

// Exchanges a one-time token for a session.
//
// Resolves to { ok: true, session } or { ok: false, code }. Storage is written
// only on the success path: a refused or failed handoff must leave whatever
// session was already in storage untouched.
export const exchangeTemporaryToken = async (temporaryToken) => {
    if (!temporaryToken) return { ok: false, code: "expired" };

    let payload;
    try {
        const response = await handoffClient.get(EXCHANGE_TOKEN_PATH, {
            params: { temporaryToken },
        });
        payload = response.data;
    } catch {
        // The API answers the same opaque text for "unknown" and "expired"; do
        // not turn a probe into a distinguishing signal here either.
        return { ok: false, code: "expired" };
    }

    if (!payload?.token) return { ok: false, code: "expired" };

    // Second line of defence. The API refuses clinician accounts on this path,
    // but a session that opens clinical notifications inside the patient shell
    // is worth refusing twice.
    if (!isPatientRole(payload.roles)) return { ok: false, code: "not_a_patient" };

    const session = {
        token: payload.token,
        userId: payload.userId || null,
        roles: Array.isArray(payload.roles) ? payload.roles : [],
        expiresOn: payload.expiresOn || null,
    };

    saveSession(session);
    return { ok: true, session };
};
