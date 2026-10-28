import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth.api";
import { getApiErrorMessage } from "../api/client";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Alert, Button, Input } from "../components/ui";

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Enter a valid email address.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            await requestPasswordReset(email.trim());
            setSent(true);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "We could not send the reset link."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            eyebrow="Account recovery"
            title="Reset your password"
            subtitle="Enter the email you registered with and we will send you a reset link."
            footer={<Link to="/login" className="font-semibold text-primary-700 hover:underline">Back to sign in</Link>}
        >
            {sent ? (
                <Alert variant="success" title="Check your inbox">
                    If an account exists for {email}, a reset link is on its way. Follow the link in the email to choose a new password.
                </Alert>
            ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} error={error} />
                    <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingText="Sending…">Send reset link</Button>
                </form>
            )}
        </AuthLayout>
    );
};
