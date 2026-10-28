import { ResetPasswordForm } from "../components/form/ResetPasswordForm";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL || "/images";

export const ResetPassword = () => (
    <main className="flex min-h-screen justify-center bg-canvas">
        <div className="relative hidden flex-1 overflow-hidden bg-slate-900 p-16 md:flex md:items-center md:justify-center">
            <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-20 -right-16 h-96 w-96 rounded-full border border-white/10" />
            <div className="relative z-10 max-w-lg text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
                    Nexus
                </p>
                <h1 className="mt-4 text-4xl font-bold leading-tight">
                    A fresh start for your account.
                </h1>
                <img
                    src={`${imagesDir}/loginPhoto.png`}
                    className="mt-8 max-h-[min(38vh,360px)] w-full object-contain drop-shadow-2xl"
                    alt="Illustration of connected healthcare"
                />
            </div>
        </div>
        <div className="flex w-full max-w-xl flex-col justify-center p-6 sm:p-10">
            <div className="py-8">
                <h2 className="text-3xl font-bold text-neutral-900">
                    Create a new password
                </h2>
                <p className="mt-2 text-base leading-7 text-neutral-600">
                    Choose a password you have not used before. It must be at
                    least 8 characters long.
                </p>
            </div>
            <ResetPasswordForm />
        </div>
    </main>
);
