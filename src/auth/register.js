import { useState } from "react";
import { Link } from "react-router-dom";
import { registerPatient, resendConfirmationEmail } from "../api/auth.api";
import { getApiErrorMessages } from "../api/client";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Alert, Button, Input, Select } from "../components/ui";
import { localDateKey } from "../utils/format";

const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const initialValues = { firstName: "", lastName: "", email: "", password: "", birthDate: "", gender: "" };

const validate = (values) => {
    const errors = {};
    if (values.firstName.trim().length < 2 || values.firstName.trim().length > 64) errors.firstName = "First name must be 2–64 characters.";
    if (values.lastName.trim().length < 2 || values.lastName.trim().length > 64) errors.lastName = "Last name must be 2–64 characters.";
    if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid email address.";
    if (values.password.length < 8 || values.password.length > 128) errors.password = "Password must be 8–128 characters.";
    if (!values.birthDate) errors.birthDate = "Enter your date of birth.";
    else if (values.birthDate >= localDateKey(new Date())) errors.birthDate = "Date of birth must be in the past.";
    if (!values.gender) errors.gender = "Select an option.";
    return errors;
};

export const Register = () => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [serverErrors, setServerErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [resendState, setResendState] = useState("idle");

    const change = (field) => (event) => {
        setValues((previous) => ({ ...previous, [field]: event.target.value }));
        setErrors((previous) => ({ ...previous, [field]: undefined }));
        setServerErrors([]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validate(values);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        setIsSubmitting(true);
        setServerErrors([]);
        try {
            await registerPatient({
                ...values,
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim(),
            });
            setRegisteredEmail(values.email.trim());
        } catch (error) {
            const messages = getApiErrorMessages(error);
            setServerErrors(messages.length ? messages : ["We could not create your account. Please try again."]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resend = async () => {
        setResendState("sending");
        try {
            await resendConfirmationEmail(registeredEmail);
            setResendState("sent");
        } catch {
            setResendState("failed");
        }
    };

    if (registeredEmail) {
        return (
            <AuthLayout
                eyebrow="Almost there"
                title="Check your email"
                subtitle={`We sent a confirmation link to ${registeredEmail}. Confirm your address, then sign in.`}
            >
                <div className="space-y-4">
                    {resendState === "sent" && <Alert variant="success">A new confirmation email has been sent.</Alert>}
                    {resendState === "failed" && <Alert variant="error">We could not resend the email. Please try again in a moment.</Alert>}
                    <Button as={Link} to="/login" size="lg" fullWidth>Go to sign in</Button>
                    <Button type="button" variant="outline" fullWidth onClick={resend} loading={resendState === "sending"} loadingText="Sending…">
                        Resend confirmation email
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            eyebrow="Get started"
            title="Create your account"
            subtitle="It only takes a minute to start booking sessions."
            footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary-700 hover:underline">Sign in</Link></>}
        >
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {serverErrors.length > 0 && (
                    <Alert variant="error" title="We could not create your account">
                        <ul className="list-disc space-y-1 pl-4">
                            {serverErrors.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}
                        </ul>
                    </Alert>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="First name" autoComplete="given-name" required value={values.firstName} onChange={change("firstName")} error={errors.firstName} />
                    <Input label="Last name" autoComplete="family-name" required value={values.lastName} onChange={change("lastName")} error={errors.lastName} />
                </div>
                <Input label="Email" type="email" autoComplete="email" required value={values.email} onChange={change("email")} error={errors.email} />
                <Input label="Password" type="password" autoComplete="new-password" required value={values.password} onChange={change("password")} error={errors.password} hint="Use 8–128 characters." />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Date of birth" type="date" max={localDateKey(new Date())} autoComplete="bday" required value={values.birthDate} onChange={change("birthDate")} error={errors.birthDate} />
                    <Select label="Gender" required value={values.gender} onChange={change("gender")} error={errors.gender}>
                        <option value="">Select…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </Select>
                </div>
                <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingText="Creating account…">Create account</Button>
            </form>
        </AuthLayout>
    );
};
