import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signIn, resendConfirmationEmail } from "../api/auth.api";
import { getApiErrorMessage } from "../api/client";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Alert, Button, Input } from "../components/ui";
import { hasPatientRole } from "../routes/ProtectedRoute";
import { useAuth } from "./authProvider";
import { saveSession } from "./session";

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

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
