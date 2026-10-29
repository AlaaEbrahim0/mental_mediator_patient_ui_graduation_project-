import { useEffect, useState } from "react";
import { Alert, Button, Spinner } from "../components/ui";
import { useAuth } from "./authProvider";
import {
    authErrorMessage,
    clearHandoffParams,
    exchangeTemporaryToken,
    readHandoff,
} from "./externalSession";

// A token is single-use: the API removes it from the cache on the first
// exchange. React StrictMode mounts, unmounts and re-mounts the effect in
// development, and the unmounted copy suppresses its own result — so both
// copies must await the SAME exchange instead of making a second call that
// would 401. Module scope, because the remount re-runs the component but not
// the module.
const handoffs = new Map();

const exchangeOnce = (temporaryToken) => {
    if (!handoffs.has(temporaryToken)) {
        handoffs.set(temporaryToken, exchangeTemporaryToken(temporaryToken));
    }
    return handoffs.get(temporaryToken);
};

const Idle = () => (
    <div className="flex min-h-screen items-center justify-center bg-base-200" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-neutral-600">
            <Spinner size="lg" className="text-primary-700" />
            <p className="text-sm font-semibold">Completing sign-in…</p>
        </div>
    </div>
);

const Notice = ({ message }) => (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <Alert variant="error" title="Google sign-in did not finish">
                {message}
            </Alert>
            <Button
                className="mt-5 w-full"
                onClick={() => window.location.assign("/login")}
            >
                Continue to sign in
            </Button>
        </div>
    </div>
);

// Gates the app on a Google sign-in handoff.
//
// This must be a *parent* of <Routes />, not a sibling: patient-ui builds one
// data router at module scope and renders it through <RouterProvider />, so a
// sibling of it sits outside the router and cannot navigate. It also has to
// decide before the router's first render — the handoff lands on "/", which
// ProtectedRoute would immediately rewrite to "/login", destroying the query
// string the token is in. Rendering the splash instead of <Routes /> keeps the
// URL intact until the exchange has finished and the address is clean.
export const ExternalLoginGate = ({ children }) => {
    const { setToken, setUserId, setRoles, setExpiresOn } = useAuth();

    // Read once, synchronously, before anything can rewrite the address.
    const [handoff] = useState(() => readHandoff());
    const [failedCode, setFailedCode] = useState(handoff.authErrorCode || null);
    const [pending, setPending] = useState(Boolean(handoff.temporaryToken));

    useEffect(() => {
        if (!handoff.temporaryToken && handoff.authErrorCode) {
            // The code is already in React state, so the address can be cleaned
            // now: a refresh or a history entry must not re-show a stale error.
            clearHandoffParams();
            return undefined;
        }

        const { temporaryToken } = handoff;
        if (!temporaryToken) return undefined;

        let active = true;

        exchangeOnce(temporaryToken).then((result) => {
            if (!active) return;

            clearHandoffParams();

            if (!result.ok) {
                setPending(false);
                setFailedCode(result.code);
                return;
            }

            // Storage is already written by the exchange; these setters put the
            // session into React so the guards pass on the router's first render.
            setToken(result.session.token);
            setUserId(result.session.userId);
            setRoles(result.session.roles);
            setExpiresOn(result.session.expiresOn);
            setPending(false);
        });

        return () => {
            active = false;
        };
    }, [handoff, setExpiresOn, setRoles, setToken, setUserId]);

    if (pending) return <Idle />;
    if (failedCode) return <Notice message={authErrorMessage(failedCode)} />;
    return children;
};
