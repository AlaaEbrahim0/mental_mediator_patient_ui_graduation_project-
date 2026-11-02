import { motion, useReducedMotion } from "framer-motion";
import {
    BsCalendarCheck,
    BsChatDots,
    BsPeople,
    BsShieldCheck,
    BsStarFill,
    BsThermometerHalf,
} from "react-icons/bs";

/**
 * Premium feature cards: a 1px gradient frame that lights on hover, a
 * cursor-following spotlight inside the surface, a glowing icon tile and a
 * trust badge naming the real mechanism behind each claim. Class strings are
 * complete literals so Tailwind's scanner keeps them.
 */
export const FEATURES = [
    {
        icon: BsCalendarCheck,
        title: "Book in a few taps",
        body: "Browse verified professionals, compare availability and confirm a session without a phone call or a waiting room.",
        badge: "Server-owned slots",
        glow: "from-primary-400/60 to-teal-300/40",
        tile: "from-primary-600 to-teal-500 shadow-primary-600/30",
        frame: "hover:from-primary-400 hover:via-teal-300 hover:to-primary-200",
    },
    {
        icon: BsChatDots,
        title: "Talk when it matters",
        body: "Message your care team and join moderated group rooms, with real-time delivery and a clear record of the conversation.",
        badge: "SignalR · live delivery",
        glow: "from-sky-400/60 to-cyan-300/40",
        tile: "from-sky-600 to-cyan-500 shadow-sky-600/30",
        frame: "hover:from-sky-400 hover:via-cyan-300 hover:to-sky-200",
    },
    {
        icon: BsPeople,
        title: "A community that gets it",
        body: "Share in moderated forums, follow threads that help you, and stay connected between sessions — with your name or without it.",
        badge: "Per-post anonymity",
        glow: "from-violet-400/60 to-fuchsia-300/40",
        tile: "from-violet-600 to-fuchsia-500 shadow-violet-600/30",
        frame: "hover:from-violet-400 hover:via-fuchsia-300 hover:to-violet-200",
    },
    {
        icon: BsShieldCheck,
        title: "Moderated by default",
        body: "Every post and message is screened before it lands. Harmful content is stopped, not flagged after the fact.",
        badge: "Fail-closed ML review",
        glow: "from-emerald-400/60 to-teal-300/40",
        tile: "from-emerald-600 to-teal-600 shadow-emerald-600/30",
        frame: "hover:from-emerald-400 hover:via-teal-300 hover:to-emerald-200",
    },
    {
        icon: BsThermometerHalf,
        title: "Check in with yourself",
        body: "Private questionnaires score your week and track the trend over time — visible only to you and your clinician.",
        badge: "Private by default",
        glow: "from-rose-400/60 to-orange-300/40",
        tile: "from-rose-600 to-orange-500 shadow-rose-600/30",
        frame: "hover:from-rose-400 hover:via-orange-300 hover:to-rose-200",
    },
    {
        icon: BsStarFill,
        title: "Rated by patients",
        body: "Verified patients score sessions one to five. Averages are computed server-side and shown on every profile.",
        badge: "One vote per patient",
        glow: "from-amber-400/60 to-yellow-300/40",
        tile: "from-amber-500 to-yellow-500 shadow-amber-500/30",
        frame: "hover:from-amber-400 hover:via-yellow-300 hover:to-amber-200",
    },
];

export const FeatureCard = ({ item, variants }) => {
    const reduceMotion = useReducedMotion();
    const Icon = item.icon;

    const spotlight = (event) => {
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--sx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--sy", `${event.clientY - rect.top}px`);
    };

    return (
        <motion.article variants={variants.item} whileHover={reduceMotion ? undefined : { y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
            <div
                onMouseMove={spotlight}
                className={`group relative h-full rounded-3xl bg-gradient-to-br from-neutral-200 via-neutral-200 to-neutral-200 p-px shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/10 ${item.frame}`}
            >
                <div className="relative h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-base-100 p-6">
                    {/* cursor spotlight */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                            background:
                                "radial-gradient(320px circle at var(--sx, 50%) var(--sy, 50%), rgba(13, 148, 136, 0.07), transparent 65%)",
                        }}
                    />
                    {/* corner bloom on hover */}
                    <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${item.glow}`}
                    />

                    <span className={`relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 ${item.tile}`}>
                        <Icon aria-hidden="true" />
                    </span>

                    <h3 className="relative mt-4 text-base font-bold text-neutral-900">{item.title}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-neutral-600">{item.body}</p>

                    <p className="relative mt-5 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-canvas px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-neutral-500 transition-colors duration-300 group-hover:border-primary-300 group-hover:text-primary-800">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                        {item.badge}
                    </p>
                </div>
            </div>
        </motion.article>
    );
};

export default FeatureCard;
