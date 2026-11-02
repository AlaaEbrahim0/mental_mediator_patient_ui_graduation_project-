import { ResetPasswordForm } from "../components/form/ResetPasswordForm";
import { AuthLayout } from "../components/layout/AuthLayout";

export const ResetPassword = () => (
    <AuthLayout
        eyebrow="A fresh start"
        title="Create a new password"
        subtitle="Choose a password you have not used before. It must be at least 8 characters long."
    >
        <ResetPasswordForm />
    </AuthLayout>
);
