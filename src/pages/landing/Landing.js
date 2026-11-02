import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import {
    BsShieldCheck,
    BsLock,
    BsLightningCharge,
} from "react-icons/bs";
import { FiArrowRight, FiCheck, FiMenu, FiStar, FiX } from "react-icons/fi";
import BrandLogo from "../../components/layout/BrandLogo";
import { Button } from "../../components/ui";
import { Reveal, useStaggerVariants } from "./Reveal";
import { Orb3D, OrbitRings, Tilt3D } from "./Depth";
import { CommunityFeed } from "./CommunityFeed";
import { BookingDemo } from "./BookingDemo";
import { RoomsShowcase } from "./RoomsShowcase";
import HeroCarousel from "./HeroCarousel";
import FeatureMarquee from "./FeatureMarquee";
import AnonymityDemo from "./AnonymityDemo";
import { FEATURES, FeatureCard } from "./FeatureCards";
import { CLINICIANS, COMMUNITY_STATS } from "./landingData";
import { AnatomyFigure, CommunityMotif, FeaturesMotif } from "../../components/figures/Figures";

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

const SLOGANS = [
    "For the 3am thoughts.",
    "For the first session.",
    "For the walk before the hard call.",
    "For the days you need all of the above.",
];

const MOOD_CHIPS = [
    { label: "I need support", href: "#community" },
    { label: "Find a clinician", href: "#booking" },
    { label: "Join a room", href: "#rooms" },
    { label: "Privacy matters", href: "#trust" },
];

const CTA_PHOTO = "https://res.cloudinary.com/dlt0e09e7/image/upload/v1793654614/posts/9eddac69429847aa808645ad38878d17.jpg.jpg";

const RATING_TOTAL = CLINICIANS.reduce((sum, c) => sum + (c.ratingCount || 0), 0);
const RATING_AVERAGE = RATING_TOTAL
    ? CLINICIANS.reduce((sum, c) => sum + c.rating * c.ratingCount, 0) / RATING_TOTAL
    : 0;

/**
 * Counts a stat up from zero when it scrolls into view. Values without a
 * leading integer ("24/7") render as-is, and reduced motion skips the
 * animation entirely.
 */
const CountUp = ({ value }) => {
    const reduceMotion = useReducedMotion();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const match = useMemo(() => /^(\d+)(.*)$/.exec(value), [value]);
    const [current, setCurrent] = useState(null);

    useEffect(() => {
        if (!match || reduceMotion || !inView) return;
        const target = parseInt(match[1], 10);
        let frame;
        let start;
        const step = (t) => {
            if (start === undefined) start = t;
            const p = Math.min((t - start) / 900, 1);
            setCurrent(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [inView, reduceMotion, match]);

    return <span ref={ref}>{current === null ? value : `${current}${match ? match[2] : ""}`}</span>;
};

const RotatingSlogan = () => {
    const reduceMotion = useReducedMotion();
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (reduceMotion) return undefined;
        const timer = setInterval(() => setIndex((value) => (value + 1) % SLOGANS.length), 3400);
        return () => clearInterval(timer);
    }, [reduceMotion]);
    return (
        <div className="mt-4 h-8 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
                <motion.p
                    key={index}
                    initial={reduceMotion ? false : { y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduceMotion ? undefined : { y: -20, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="text-lg font-semibold text-primary-700"
                >
                    {SLOGANS[index]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
};

const NAV_LINKS = [
    { href: "#features", label: "Features" },
    { href: "#booking", label: "Booking" },
    { href: "#rooms", label: "Rooms" },
    { href: "#community", label: "Community" },
    { href: "#trust", label: "Safety" },
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

    const highlightSection = (href) => {
        scrollToId(href, reduceMotion);
        const el = document.querySelector(href);
        if (!el) return;
        el.style.outline = "3px solid rgba(125,211,252,0.65)";
        el.style.outlineOffset = "-3px";
        window.setTimeout(() => {
            el.style.outline = "";
            el.style.outlineOffset = "";
        }, 1400);
    };

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
                    <Link to="/" className="flex shrink-0 items-center" aria-label="Nexus home">
                        <BrandLogo size={36} wordmark />
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

                    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pb-28 lg:pt-20">
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

                            <RotatingSlogan />

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

                            <motion.div
                                {...heroFade(reduceMotion, 0.3)}
                                className="mt-7 flex flex-wrap items-center gap-4 border-t border-neutral-200/80 pt-6"
                            >
                                <div className="flex -space-x-3" aria-hidden="true">
                                    {CLINICIANS.slice(0, 5).map((doctor) => (
                                        <img
                                            key={doctor.id}
                                            src={doctor.photo}
                                            alt=""
                                            loading="lazy"
                                            className="h-9 w-9 rounded-full border-2 border-base-100 object-cover shadow-sm"
                                        />
                                    ))}
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm font-bold text-neutral-900">
                                        <span className="flex items-center gap-0.5" aria-hidden="true">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <FiStar
                                                    key={n}
                                                    className={`h-3.5 w-3.5 ${n <= Math.round(RATING_AVERAGE) ? "fill-amber-400 text-amber-500" : "text-neutral-300"}`}
                                                />
                                            ))}
                                        </span>
                                        {RATING_AVERAGE.toFixed(1)} average
                                    </p>
                                    <p className="mt-0.5 text-xs text-neutral-500">
                                        from {RATING_TOTAL} patient ratings across {CLINICIANS.length} verified clinicians
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                {...heroFade(reduceMotion, 0.38)}
                                className="mt-7"
                            >
                                <p className="text-sm font-semibold text-neutral-900">What brings you here today?</p>
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {MOOD_CHIPS.map((chip) => (
                                        <button
                                            key={chip.label}
                                            type="button"
                                            onClick={() => highlightSection(chip.href)}
                                            className="rounded-full border border-primary-200 bg-base-100 px-3.5 py-1.5 text-xs font-semibold text-primary-800 transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Hero artwork */}
                        <motion.div
                            style={{ y: heroY }}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="relative mx-auto w-full min-w-0 max-w-md lg:max-w-none"
                        >
                            <OrbitRings className="-left-10 -top-10 hidden lg:block" size={340} />
                            <Tilt3D className="relative rounded-[2rem]" intensity={8} lift={12}>
                                <HeroCarousel />
                            </Tilt3D>

                            
                        </motion.div>
                    </div>
                </section>

                <FeatureMarquee />

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
                            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {FEATURES.map((item) => (
                                <FeatureCard key={item.title} item={item} variants={featureVariants} />
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
                                        <CountUp value={stat.value} />
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-neutral-900">{stat.label}</p>
                                    <p className="text-xs text-neutral-500">{stat.hint}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <section className="border-t border-neutral-200 bg-base-100 py-16" aria-label="Our promise">
                    <Reveal className="mx-auto max-w-3xl px-6 text-center">
                        <p className="text-2xl font-bold leading-snug tracking-tight text-neutral-900 sm:text-3xl">
                            &ldquo;Care should feel like a conversation, not a form.&rdquo;
                        </p>
                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
                            The Nexus principle
                        </p>
                    </Reveal>
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

                        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
                            <Reveal className="min-w-0">
                                <BookingDemo />
                            </Reveal>
                            <Reveal delay={0.12} className="min-w-0 lg:pt-4">
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
                        <Reveal className="min-w-0">
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
                        <Reveal delay={0.15} className="min-w-0">
                            <CommunityFeed />
                        </Reveal>
                    </div>
                </section>

                <AnonymityDemo />

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
                            <img
                                src={CTA_PHOTO}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 rounded-l-3xl object-cover opacity-20 sm:block"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 bg-gradient-to-l from-neutral-900/70 to-transparent sm:block" aria-hidden="true" />
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
                    <div className="flex items-center">
                        <BrandLogo size={30} wordmark />
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
