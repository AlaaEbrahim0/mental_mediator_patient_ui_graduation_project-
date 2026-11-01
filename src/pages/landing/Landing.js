import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import {
    BsHeartPulseFill,
    BsShieldCheck,
    BsChatDots,
    BsCalendarCheck,
    BsPeople,
    BsLock,
    BsLightningCharge,
} from "react-icons/bs";
import { FiArrowRight, FiCheck, FiMenu, FiX } from "react-icons/fi";
import { Button } from "../../components/ui";
import { Reveal, useStaggerVariants } from "./Reveal";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL || "/images";

/**
 * Hero entrance props. Under reduced motion the element starts in its final
 * state instead of animating, so nothing is ever briefly invisible.
 */
const heroFade = (reduceMotion, delay = 0) =>
    reduceMotion
        ? { initial: false, animate: { opacity: 1, y: 0 } }
        : {
              initial: { opacity: 0, y: 18 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.65, delay },
          };

const NAV_LINKS = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it works" },
    { href: "#community", label: "Community" },
    { href: "#trust", label: "Safety" },
];

const FEATURES = [
    {
        icon: BsCalendarCheck,
        title: "Book in a few taps",
        body: "Browse verified professionals, compare availability and confirm a session without a phone call or a waiting room.",
    },
    {
        icon: BsChatDots,
        title: "Talk when it matters",
        body: "Message your care team and join moderated group rooms, with real-time delivery and a clear record of the conversation.",
    },
    {
        icon: BsPeople,
        title: "A community that gets it",
        body: "Share in moderated forums, follow threads that help you, and stay connected between sessions.",
    },
    {
        icon: BsShieldCheck,
        title: "Moderated by default",
        body: "Every post and message is screened before it lands. Harmful content is stopped, not flagged after the fact.",
    },
];

const STEPS = [
    {
        step: "01",
        title: "Create your account",
        body: "Sign up with email or Google. Choose the patient portal and you are in — no card required.",
    },
    {
        step: "02",
        title: "Find the right professional",
        body: "Filter by speciality, session length and availability, then read profiles before you commit.",
    },
    {
        step: "03",
        title: "Start the conversation",
        body: "Book your first session, message your care team, and settle into a community that supports you.",
    },
];

const TRUST_POINTS = [
    { icon: BsLock, label: "Role-separated portals", body: "Patients and clinicians never share a surface. Access is enforced server-side on every request." },
    { icon: BsShieldCheck, label: "Fail-closed moderation", body: "If screening cannot run, the content does not publish. The safe path is the default." },
    { icon: BsLightningCharge, label: "Built for low friction", body: "Sessions persist, drafts survive, and the interface stays out of the way of the conversation." },
];

/** Smooth scroll that respects reduced-motion and the sticky header offset. */
const scrollToId = (id, reduceMotion) => {
    const el = document.querySelector(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
};

export const Landing = () => {
    const reduceMotion = useReducedMotion();
    const featureVariants = useStaggerVariants(reduceMotion);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef(null);

    // Reading progress bar — a thin brand line across the top.
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

    // Parallax drift for the hero artwork.
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 600], [0, reduceMotion ? 0 : 60]);
    const heroOpacity = useTransform(scrollY, [0, 500], [1, reduceMotion ? 1 : 0.35]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close the mobile menu on Escape.
    useEffect(() => {
        if (!menuOpen) return undefined;
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    const handleNav = (event, href) => {
        event.preventDefault();
        setMenuOpen(false);
        scrollToId(href, reduceMotion);
    };

    return (
        <div className="min-h-screen bg-canvas text-neutral-900">
            {/* Reading progress */}
            <motion.div
                aria-hidden="true"
                style={{ scaleX: progress }}
                className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary-500"
            />

            <header
                className={`sticky top-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? "border-b border-neutral-200/80 bg-base-100/85 backdrop-blur-xl"
                        : "border-b border-transparent bg-transparent"
                }`}
            >
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Nexus home">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-700 text-lg text-white shadow-sm">
                            <BsHeartPulseFill aria-hidden="true" />
                        </span>
                        <span className="text-lg font-bold tracking-tight">Nexus</span>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex" aria-label="Landing sections">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNav(e, link.href)}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        <Button as={Link} to="/login" variant="ghost" size="sm">
                            Sign in
                        </Button>
                        <Button as={Link} to="/register" size="sm">
                            Get started
                        </Button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 text-neutral-700 md:hidden"
                        aria-expanded={menuOpen}
                        aria-controls="landing-mobile-menu"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
                    </button>
                </div>

                {menuOpen && (
                    <div
                        id="landing-mobile-menu"
                        className="border-t border-neutral-200 bg-base-100 px-4 pb-4 pt-2 md:hidden"
                    >
                        <nav className="flex flex-col" aria-label="Landing sections">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => handleNav(e, link.href)}
                                    className="rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                        <div className="mt-3 flex flex-col gap-2">
                            <Button as={Link} to="/login" variant="outline" fullWidth>
                                Sign in
                            </Button>
                            <Button as={Link} to="/register" fullWidth>
                                Get started
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* ---------------- Hero ---------------- */}
                <section ref={heroRef} className="relative overflow-hidden">
                    {/* Ambient brand glow — decorative only */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-primary-200/40 blur-3xl"
                            animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.45, 0.65, 0.45] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute -right-32 top-32 h-[24rem] w-[24rem] rounded-full bg-primary-400/25 blur-3xl"
                            animate={reduceMotion ? undefined : { scale: [1.1, 1, 1.1], opacity: [0.35, 0.55, 0.35] }}
                            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
                        <motion.div style={{ opacity: heroOpacity }}>
                            <motion.p
                                {...heroFade(reduceMotion, 0)}
                                className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-800"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                                Care, connected
                            </motion.p>

                            <motion.h1
                                {...heroFade(reduceMotion, 0.08)}
                                className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl"
                            >
                                Support is one{" "}
                                <span className="relative mx-2 inline-block">
                                    <span className="relative z-10 text-primary-700">conversation</span>
                                    <motion.span
                                        aria-hidden="true"
                                        {...(reduceMotion
                                            ? { initial: false, animate: { scaleX: 1 } }
                                            : { initial: { scaleX: 0 }, animate: { scaleX: 1 }, transition: { duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] } })}
                                        className="absolute inset-x-0 bottom-1 z-0 h-3 origin-left rounded-sm bg-primary-200/70"
                                    />
                                </span>
                                away.
                            </motion.h1>

                            <motion.p
                                {...heroFade(reduceMotion, 0.16)}
                                className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600"
                            >
                                Find a mental health professional you trust, book a session in a few
                                taps, and stay connected to a community that understands — all in one
                                calm, private place.
                            </motion.p>

                            <motion.div
                                {...heroFade(reduceMotion, 0.24)}
                                className="mt-8 flex flex-col gap-3 sm:flex-row"
                            >
                                <Button as={Link} to="/register" size="lg" className="group">
                                    Start for free
                                    <FiArrowRight
                                        aria-hidden="true"
                                        className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </Button>
                                <Button as={Link} to="/login" variant="outline" size="lg">
                                    I already have an account
                                </Button>
                            </motion.div>

                            <motion.ul
                                {...(reduceMotion
                                    ? { initial: false, animate: { opacity: 1 } }
                                    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6, delay: 0.4 } })}
                                className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600"
                            >
                                {["No card required", "Moderated community", "Private by design"].map((item) => (
                                    <li key={item} className="inline-flex items-center gap-1.5">
                                        <FiCheck aria-hidden="true" className="text-primary-600" />
                                        {item}
                                    </li>
                                ))}
                            </motion.ul>
                        </motion.div>

                        {/* Hero artwork */}
                        <motion.div
                            style={{ y: heroY }}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="relative mx-auto w-full max-w-md lg:max-w-none"
                        >
                            <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-gradient-to-br from-primary-50 via-base-100 to-primary-100/60 p-2 shadow-2xl shadow-primary-900/10">
                                <img
                                    src={`${imagesDir}/loginPhoto.png`}
                                    alt=""
                                    className="h-full w-full rounded-[1.6rem] object-contain"
                                    loading="eager"
                                />
                            </div>

                            {/* Floating stat cards */}
                            <motion.div
                                initial={{ opacity: 0, x: -20, y: 10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="absolute -left-3 bottom-8 hidden rounded-2xl border border-neutral-200 bg-base-100 px-4 py-3 shadow-xl sm:block"
                            >
                                <p className="text-xs font-medium text-neutral-600">Sessions booked</p>
                                <p className="text-lg font-bold text-neutral-900">2,400+</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20, y: -10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.72 }}
                                className="absolute -right-2 top-8 hidden items-center gap-2 rounded-2xl border border-neutral-200 bg-base-100 px-4 py-3 shadow-xl sm:flex"
                            >
                                <span className="grid h-8 w-8 place-items-center rounded-full bg-success-100 text-success-700">
                                    <BsShieldCheck aria-hidden="true" />
                                </span>
                                <div>
                                    <p className="text-xs font-medium text-neutral-600">Moderation</p>
                                    <p className="text-sm font-bold text-neutral-900">Always on</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* ---------------- Features ---------------- */}
                <section id="features" className="scroll-mt-20 border-t border-neutral-200 bg-base-100 py-20">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <Reveal className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                                What you get
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Everything for your care, in one place
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                                Booking, messaging and community were built together rather than
                                bolted on, so nothing feels like an afterthought.
                            </p>
                        </Reveal>

                        <motion.div
                            variants={featureVariants.container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.2 }}
                            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                        >
                            {FEATURES.map(({ icon: Icon, title, body }) => (
                                <motion.article
                                    key={title}
                                    variants={featureVariants.item}
                                    whileHover={reduceMotion ? undefined : { y: -6 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                                    className="group rounded-2xl border border-neutral-200 bg-base-100 p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary-900/5"
                                >
                                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-xl text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                                        <Icon aria-hidden="true" />
                                    </span>
                                    <h3 className="mt-4 text-base font-bold text-neutral-900">{title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</p>
                                </motion.article>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ---------------- How it works ---------------- */}
                <section id="how" className="scroll-mt-20 py-20">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                                How it works
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Three steps to feeling supported
                            </h2>
                        </Reveal>

                        <div className="relative mt-14">
                            {/* Connecting line on large screens */}
                            <div
                                aria-hidden="true"
                                className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent lg:block"
                            />
                            <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
                                {STEPS.map((item, index) => (
                                    <Reveal key={item.step} delay={index * 0.12} className="relative">
                                        <div className="flex flex-col items-start lg:items-center lg:text-center">
                                            <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border-2 border-primary-200 bg-base-100 text-sm font-bold text-primary-700 shadow-sm">
                                                {item.step}
                                            </span>
                                            <h3 className="mt-5 text-lg font-bold text-neutral-900">{item.title}</h3>
                                            <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-600">
                                                {item.body}
                                            </p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------------- Community band ---------------- */}
                <section id="community" className="scroll-mt-20 bg-[#0f172a] py-20 text-white">
                    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
                        <Reveal>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-300">
                                Community
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                You are not doing this alone
                            </h2>
                            <p className="mt-4 max-w-lg text-lg leading-relaxed text-[#cbd5e1]">
                                Join moderated forums and group rooms where people share what actually
                                helps. Every contribution is screened, so the space stays kind.
                            </p>
                            <ul className="mt-8 space-y-3">
                                {[
                                    "Moderated forums and live group rooms",
                                    "Threads you can follow without the noise",
                                    "Notifications that respect your attention",
                                ].map((line) => (
                                    <li key={line} className="flex items-start gap-3 text-sm text-[#e2e8f0]">
                                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-500/20 text-primary-300">
                                            <FiCheck aria-hidden="true" className="text-xs" />
                                        </span>
                                        {line}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-9">
                                <Button as={Link} to="/register" size="lg" className="group">
                                    Join the community
                                    <FiArrowRight
                                        aria-hidden="true"
                                        className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </Button>
                            </div>
                        </Reveal>

                        {/* Stylised conversation preview */}
                        <Reveal delay={0.15}>
                            <div className="relative mx-auto w-full max-w-md">
                                <div className="absolute -inset-4 rounded-[2rem] bg-primary-500/10 blur-2xl" aria-hidden="true" />
                                <div className="relative space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                                    {[
                                        { name: "Layla", text: "First session today. Nervous but glad I booked.", mine: false },
                                        { name: "Nadia, therapist", text: "That is a big step. I will meet you where you are.", mine: false },
                                        { name: "You", text: "Thank you both — this already feels less heavy.", mine: true },
                                    ].map((msg) => (
                                        <div
                                            key={msg.text}
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                                msg.mine
                                                    ? "ml-auto bg-primary-600 text-white"
                                                    : "bg-white/10 text-[#f1f5f9]"
                                            }`}
                                        >
                                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
                                                {msg.name}
                                            </p>
                                            {msg.text}
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 pt-1 text-xs text-[#94a3b8]">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-400" />
                                        Moderated in real time
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ---------------- Trust ---------------- */}
                <section id="trust" className="scroll-mt-20 border-t border-neutral-200 bg-base-100 py-20">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                                Safety
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Privacy is not a setting here
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                                Health conversations deserve real boundaries. These are enforced in the
                                product, not just promised on a page.
                            </p>
                        </Reveal>

                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            {TRUST_POINTS.map(({ icon: Icon, label, body }, index) => (
                                <Reveal key={label} delay={index * 0.1}>
                                    <div className="h-full rounded-2xl border border-neutral-200 bg-canvas p-6">
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-base-100 text-lg text-primary-700 shadow-sm">
                                            <Icon aria-hidden="true" />
                                        </span>
                                        <h3 className="mt-4 text-base font-bold text-neutral-900">{label}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ---------------- Final CTA ---------------- */}
                <section className="px-4 pb-20 sm:px-6">
                    <Reveal className="mx-auto w-full max-w-6xl">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-neutral-900 px-6 py-14 text-center text-white sm:px-12">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10"
                            />
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full border border-white/10"
                            />
                            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
                                The first step is the hardest one
                            </h2>
                            <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-primary-50/90">
                                Create an account in under a minute and see what support feels like
                                when the tools get out of the way.
                            </p>
                            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button
                                    as={Link}
                                    to="/register"
                                    size="lg"
                                    className="!bg-white !text-primary-800 hover:!bg-primary-50"
                                >
                                    Create your free account
                                </Button>
                                <Button
                                    as={Link}
                                    to="/login"
                                    size="lg"
                                    variant="ghost"
                                    className="!text-white hover:!bg-white/10"
                                >
                                    Sign in instead
                                </Button>
                            </div>
                        </div>
                    </Reveal>
                </section>
            </main>

            <footer className="border-t border-neutral-200 bg-base-100 py-10">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-700 text-sm text-white">
                            <BsHeartPulseFill aria-hidden="true" />
                        </span>
                        <span className="text-sm font-bold text-neutral-900">Nexus</span>
                    </div>
                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-600" aria-label="Footer">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNav(e, link.href)}
                                className="hover:text-neutral-900"
                            >
                                {link.label}
                            </a>
                        ))}
                        <Link to="/login" className="hover:text-neutral-900">
                            Sign in
                        </Link>
                    </nav>
                    <p className="text-xs text-neutral-600">© {new Date().getFullYear()} Nexus. Care, connected.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
