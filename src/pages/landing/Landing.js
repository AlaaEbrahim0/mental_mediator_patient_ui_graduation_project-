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
import { Orb3D, OrbitRings, Tilt3D } from "./Depth";
import { CommunityFeed } from "./CommunityFeed";
import { BookingDemo } from "./BookingDemo";
import { RoomsShowcase } from "./RoomsShowcase";
import { COMMUNITY_STATS } from "./landingData";
import { AnatomyFigure, CommunityMotif, FeaturesMotif, HeroFigure } from "../../components/figures/Figures";

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
    { href: "#booking", label: "Booking" },
    { href: "#rooms", label: "Rooms" },
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
                        <Orb3D className="-left-24 -top-24" size={460} hue="primary" duration={16} />
                        <Orb3D className="-right-32 top-32" size={400} hue="teal" duration={20} delay={2} />
                        <Orb3D className="bottom-0 left-1/3" size={300} hue="rose" duration={24} delay={1} />
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
                            <OrbitRings className="-left-10 -top-10 hidden lg:block" size={340} />
                            <Tilt3D className="relative rounded-[2rem]" intensity={8} lift={12}>
                                <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-gradient-to-br from-primary-50 via-base-100 to-primary-100/60 p-6 shadow-2xl shadow-primary-900/10">
                                    <HeroFigure className="mx-auto h-auto w-full max-w-sm" />
                                </div>
                            </Tilt3D>

                            {/* Floating stat cards */}
                            <motion.div
                                initial={{ opacity: 0, x: -20, y: 10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="absolute -left-3 bottom-8 hidden rounded-2xl border border-neutral-200 bg-base-100 px-4 py-3 shadow-xl sm:block"
                            >
                                <p className="text-xs font-medium text-neutral-600">Live threads</p>
                                <p className="text-lg font-bold text-neutral-900">{COMMUNITY_STATS[0].value}</p>
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
                        <Reveal className="flex max-w-4xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                            <div className="max-w-2xl">
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
                            </div>
                            <FeaturesMotif className="hidden w-32 shrink-0 sm:block" />
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

                {/* ---------------- Live numbers ---------------- */}
                <section className="border-y border-neutral-200 bg-canvas py-10">
                    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4">
                        {COMMUNITY_STATS.map((stat, index) => (
                            <Reveal key={stat.label} delay={index * 0.08}>
                                <div>
                                    <p className="text-3xl font-bold tracking-tight text-primary-800 sm:text-4xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-neutral-900">{stat.label}</p>
                                    <p className="text-xs text-neutral-500">{stat.hint}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ---------------- Booking ---------------- */}
                <section id="booking" className="scroll-mt-20 border-t border-neutral-200 bg-base-100 py-20">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <Reveal className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                                Booking
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Try the booking flow, right here
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                                Pick a clinician and the days below are the ones they actually have open —
                                pulled from the same availability the app uses. No mock calendar.
                            </p>
                        </Reveal>

                        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                            <Reveal>
                                <BookingDemo />
                            </Reveal>
                            <Reveal delay={0.12} className="lg:pt-4">
                                <h3 className="text-lg font-bold text-neutral-900">Why it works this way</h3>
                                <ul className="mt-4 space-y-4">
                                    {[
                                        {
                                            title: "Availability is owned by the server",
                                            body: "Weekly hours, time off, session length and existing bookings are combined server-side. The page never invents a slot.",
                                        },
                                        {
                                            title: "The price you see is the price you pay",
                                            body: "Session length and fee come from the clinician's profile, so the summary cannot drift from what gets charged.",
                                        },
                                        {
                                            title: "Double-booking is locked out",
                                            body: "Confirmation revalidates availability under a per-clinician lock, so two people cannot take the same slot.",
                                        },
                                    ].map((item) => (
                                        <li key={item.title} className="flex gap-3">
                                            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-primary-800">
                                                <FiCheck aria-hidden="true" className="text-xs" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-neutral-900">{item.title}</p>
                                                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                                                    {item.body}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ---------------- Rooms ---------------- */}
                <section id="rooms" className="scroll-mt-20 border-t border-neutral-200 py-20">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                                Group rooms
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Rooms that fit the kind of day you are having
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                                These are the rooms that exist in Nexus today — public peer support,
                                focused topics, and private spaces you need a key for.
                            </p>
                        </Reveal>

                        <div className="mt-12">
                            <RoomsShowcase />
                        </div>
                    </div>
                </section>

                {/* ---------------- Community band ---------------- */}
                <section id="community" className="relative scroll-mt-20 overflow-hidden bg-[#0f172a] py-20 text-white">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                        <CommunityMotif className="absolute -bottom-28 -left-28 w-[440px] opacity-25" />
                        <CommunityMotif className="absolute -right-32 -top-32 w-[380px] opacity-15" />
                    </div>
                    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
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

                        {/* Live community feed — real posts from the API */}
                        <Reveal delay={0.15}>
                            <CommunityFeed />
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

                        <Reveal delay={0.08}>
                            <AnatomyFigure className="mx-auto mt-12 w-full max-w-4xl" />
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
