import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiKey } from "react-icons/fi";
import { signIn, resendConfirmationEmail } from "../api/auth.api";
import { getApiErrorMessage } from "../api/client";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Alert, Button, Input } from "../components/ui";
import { hasPatientRole } from "../routes/ProtectedRoute";
import { useAuth } from "./authProvider";
import { saveSession } from "./session";

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

/**
 * Recruiter demo account. Mirrors the doctor portal's demo block so reviewers
 * can step through the same flow on either surface. These are seeded demo
 * credentials on the public API, not secrets.
 */
const DEMO_ACCOUNT = { email: "user@example.com", password: "Password1!" };

const isUnconfirmedEmailError = (error) =>
    error?.response?.data?.errors?.some?.((entry) => entry?.code === "Users.EmailNotConfirmed");

export const Login = () => {
    const { setToken, setUserId, setRoles, setExpiresOn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [values, setValues] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [needsConfirmation, setNeedsConfirmation] = useState(false);
    const [resendState, setResendState] = useState("idle");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const change = (field) => (event) => {
        setValues((previous) => ({ ...previous, [field]: event.target.value }));
        setErrors((previous) => ({ ...previous, [field]: undefined }));
        setSubmitError("");
    };

    const validate = () => {
        const next = {};
        if (!values.email.trim()) next.email = "Enter your email address.";
        else if (!EMAIL_PATTERN.test(values.email)) next.email = "Enter a valid email address.";
        if (!values.password) next.password = "Enter your password.";
        else if (values.password.length < 8) next.password = "Passwords have at least 8 characters.";
        return next;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        setIsSubmitting(true);
        setSubmitError("");
        setNeedsConfirmation(false);
        setResendState("idle");
        try {
            const data = await signIn({ email: values.email.trim(), password: values.password });
            if (!hasPatientRole(data?.roles)) {
                setSubmitError("This portal is for patients. If you are a doctor, please use the doctor portal.");
                return;
            }
            const session = {
                token: data.token,
                userId: data.userId,
                roles: data.roles || [],
                expiresOn: data.expiresOn || null,
            };
            // Persist first so the very first request after navigation already carries the token.
            saveSession(session);
            setToken(session.token);
            setUserId(session.userId);
            setRoles(session.roles);
            setExpiresOn(session.expiresOn);
            navigate(location.state?.from && location.state.from !== "/login" ? location.state.from : "/", { replace: true });
        } catch (error) {
            setNeedsConfirmation(isUnconfirmedEmailError(error));
            setSubmitError(getApiErrorMessage(error, "We could not sign you in. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resend = async () => {
        setResendState("sending");
        try {
            await resendConfirmationEmail(values.email.trim());
            setResendState("sent");
        } catch (error) {
            setResendState("idle");
            setSubmitError(getApiErrorMessage(error, "Could not send the confirmation email."));
        }
    };

    /** Prefill the demo credentials without submitting, so the reviewer can inspect the form first. */
    const fillDemoAccount = () => {
        setValues({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password });
        setErrors({});
        setSubmitError("");
        setNeedsConfirmation(false);
    };

    return (
        <AuthLayout
            eyebrow="Welcome back"
            title="Sign in to your account"
            subtitle="Book appointments, manage your sessions, and join the community."
            footer={<>New to Nexus? <Link to="/register" className="font-semibold text-primary-700 hover:underline">Create an account</Link></>}
        >
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {submitError && (
                    <Alert variant="error" title="We could not sign you in">
                        {submitError}
                        {needsConfirmation && (
                            <div className="mt-3">
                                {resendState === "sent" ? (
                                    <span className="font-semibold">A new confirmation email is on its way.</span>
                                ) : (
                                    <Button type="button" size="sm" variant="outline" onClick={resend} loading={resendState === "sending"} loadingText="Sending…">
                                        Resend confirmation email
                                    </Button>
                                )}
                            </div>
                        )}
                    </Alert>
                )}
                <aside
                    className="rounded-xl border border-primary-200 bg-primary-50/70 p-3.5 sm:p-4"
                    role="note"
                    aria-label="Recruiter demo account"
                >
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-base-100 text-primary-800 shadow-sm">
                            <FiKey aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-neutral-900">Recruiter demo access</h3>
                            <p className="mt-0.5 text-xs leading-5 text-neutral-700">
                                Use this demo account to explore the patient portal.
                            </p>
                        </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-xs sm:text-sm">
                        <dt className="font-semibold text-neutral-600">Email</dt>
                        <dd className="min-w-0 break-all font-mono font-medium text-neutral-900">{DEMO_ACCOUNT.email}</dd>
                        <dt className="font-semibold text-neutral-600">Password</dt>
                        <dd className="min-w-0 break-all font-mono font-medium text-neutral-900">{DEMO_ACCOUNT.password}</dd>
                    </dl>
                    <button
                        type="button"
                        onClick={fillDemoAccount}
                        className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg border border-primary-700/20 bg-base-100 px-3 text-xs font-semibold text-primary-900 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 sm:text-sm"
                    >
                        Fill sign-in details
                    </button>
                </aside>
                <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    value={values.email}
                    onChange={change("email")}
                    error={errors.email}
                />
                <Input
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={values.password}
                    onChange={change("password")}
                    error={errors.password}
                />
                <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm font-semibold text-primary-700 hover:underline">Forgot your password?</Link>
                </div>
                <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingText="Signing in…">Sign in</Button>
            </form>
        </AuthLayout>
    );
};
