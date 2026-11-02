import { Link } from "react-router-dom";
import { CustomToast } from "../ui/CustomToast";
import { AuthFigure } from "../figures/Figures";
import BrandLogo from "./BrandLogo";

/** Shared split layout for sign in, registration and password pages. */
export const AuthLayout = ({ eyebrow, title, subtitle, children, footer }) => (
    <>
        <CustomToast />
        <main className="min-h-screen bg-canvas lg:grid lg:grid-cols-2">
            <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-navy via-slate-900 to-primary-900 px-10 py-10 text-white lg:flex xl:px-16">
                <div className="absolute -right-28 top-24 h-96 w-96 rounded-full border border-white/10" />
                <div className="absolute -right-12 top-40 h-64 w-64 rounded-full border border-white/10" />
                <Link to="/login" className="relative z-10" aria-label="Nexus home">
                    <BrandLogo size={44} wordmark />
                </Link>
                <div className="relative z-10 mx-auto w-full max-w-xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Care, connected</p>
                    <h1 className="max-w-lg text-4xl font-bold leading-tight xl:text-5xl">Support is one conversation away.</h1>
                    <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-200">
                        Find a mental health professional you trust, book a session in a few taps, and stay connected to a supportive community.
                    </p>
                    <AuthFigure className="mx-auto mt-8 w-64 xl:w-72" />
                </div>
                <p className="relative z-10 text-sm text-slate-300">Nexus · Patient portal</p>
            </section>

            <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-8">
                <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-base-100 p-6 shadow-xl shadow-slate-900/5 sm:p-9">
                    <div className="mb-6 lg:hidden">
                        <BrandLogo size={44} wordmark />
                    </div>
                    <div className="mb-7">
                        {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
                        <h2 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">{title}</h2>
                        {subtitle && <p className="mt-2 text-base leading-relaxed text-neutral-600">{subtitle}</p>}
                    </div>
                    {children}
                    {footer && <div className="mt-6 text-center text-sm text-neutral-600">{footer}</div>}
                </div>
            </section>
        </main>
    </>
);
