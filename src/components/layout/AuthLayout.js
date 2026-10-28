import { Link } from "react-router-dom";
import { BsHeartPulseFill } from "react-icons/bs";
import { CustomToast } from "../ui/CustomToast";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL || "/images";

/** Shared split layout for sign in, registration and password pages. */
export const AuthLayout = ({ eyebrow, title, subtitle, children, footer }) => (
    <>
        <CustomToast />
        <main className="min-h-screen bg-canvas lg:grid lg:grid-cols-2">
            <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-slate-900 px-10 py-10 text-white lg:flex xl:px-16">
                <div className="absolute -right-28 top-24 h-96 w-96 rounded-full border border-white/10" />
                <div className="absolute -right-12 top-40 h-64 w-64 rounded-full border border-white/10" />
                <Link to="/login" className="relative z-10 flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-xl ring-1 ring-white/20">
                        <BsHeartPulseFill aria-hidden="true" />
                    </span>
                    <span className="text-xl font-bold tracking-wide">Nexus</span>
                </Link>
                <div className="relative z-10 mx-auto w-full max-w-xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Care, connected</p>
                    <h1 className="max-w-lg text-4xl font-bold leading-tight xl:text-5xl">Support is one conversation away.</h1>
                    <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-200">
                        Find a mental health professional you trust, book a session in a few taps, and stay connected to a supportive community.
                    </p>
                    <img
                        src={`${imagesDir}/loginPhoto.png`}
                        className="mx-auto mt-8 max-h-[min(38vh,360px)] w-full max-w-md object-contain drop-shadow-2xl"
                        alt=""
                    />
                </div>
                <p className="relative z-10 text-sm text-slate-300">Nexus · Patient portal</p>
            </section>

            <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-8">
                <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-base-100 p-6 shadow-xl shadow-slate-900/5 sm:p-9">
                    <div className="mb-6 flex items-center gap-3 lg:hidden">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-xl text-white shadow-md shadow-primary/20">
                            <BsHeartPulseFill aria-hidden="true" />
                        </span>
                        <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Nexus</span>
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
