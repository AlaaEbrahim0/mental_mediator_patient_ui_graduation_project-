import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { resetPassword } from "../../api/auth.api";
import { getApiErrorMessage } from "../../api/client";
import { Alert, Button, Input } from "../ui";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const validate = (password, confirmPassword) => {
    const errors = {};

    if (!password) {
        errors.password = "Enter a new password.";
    } else if (
        password.length < MIN_PASSWORD_LENGTH ||
        password.length > MAX_PASSWORD_LENGTH
    ) {
        errors.password = `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`;
    }

    if (!confirmPassword) {
        errors.confirmPassword = "Confirm your new password.";
    } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
};

export const ResetPasswordForm = () => {
    const location = useLocation();
    const { email, token } = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        return {
            email: (searchParams.get("email") || "").trim(),
            token: searchParams.get("token") || "",
        };
    }, [location.search]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const hasResetContext = Boolean(email && token);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError("");

        const nextErrors = validate(password, confirmPassword);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            await resetPassword({ email, token, newPassword: password });
            setIsSuccess(true);
        } catch (error) {
            setSubmitError(
                getApiErrorMessage(
                    error,
                    "We could not reset your password. The link may have expired, so request a new one."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!hasResetContext) {
        return (
            <Alert variant="warning" role="alert" className="p-5">
                <h2 className="text-lg font-bold">
                    This reset link is incomplete
                </h2>
                <p className="mt-2 text-sm leading-6">
                    Open the most recent link from your reset email. If it has
                    expired, request a new one from the sign-in page.
                </p>
                <Button as={Link} to="/login" size="sm" className="mt-4">
                    Back to sign in
                </Button>
            </Alert>
        );
    }

    if (isSuccess) {
        return (
            <Alert variant="success" role="status" className="p-5">
                <h2 className="text-lg font-bold">Password updated</h2>
                <p className="mt-2 text-sm leading-6">
                    Your password has been reset. You can now sign in with your
                    new password.
                </p>
                <Button as={Link} to="/login" size="sm" className="mt-4">
                    Continue to sign in
                </Button>
            </Alert>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {submitError && <Alert variant="error">{submitError}</Alert>}

            <Input
                id="new-password"
                label="New password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                maxLength={MAX_PASSWORD_LENGTH}
                value={password}
                onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((previous) => ({
                        ...previous,
                        password: undefined,
                    }));
                    setSubmitError("");
                }}
                error={errors.password}
                hint={`Use ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters.`}
            />

            <Input
                id="confirm-password"
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setErrors((previous) => ({
                        ...previous,
                        confirmPassword: undefined,
                    }));
                    setSubmitError("");
                }}
                error={errors.confirmPassword}
                placeholder="Repeat your new password"
            />

            <Button
                type="submit"
                size="lg"
                fullWidth
                loading={isSubmitting}
                loadingText="Resetting password"
            >
                Reset password
            </Button>
        </form>
    );
};
