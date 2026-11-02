import { motion, useReducedMotion } from "framer-motion";

const ROW_A = [
    "Anonymous posting",
    "Live chat rooms",
    "Passphrase-protected rooms",
    "ML content moderation",
    "Server-owned availability",
    "Double-booking locks",
];

const ROW_B = [
    "Private check-ins",
    "Patient ratings",
    "Photo & video posts",
    "Real-time notifications",
    "Doctor-only threads",
    "Per-post anonymity",
];

const Row = ({ items, reverse, reduceMotion }) => {
    const chips = [...items, ...items];
    const inner = (
        <div className="flex shrink-0 items-center gap-3 pr-3">
            {chips.map((label, index) => (
                <span
                    key={`${label}-${index}`}
                    className="whitespace-nowrap rounded-full border border-primary-200/70 bg-primary-50/60 px-4 py-1.5 text-sm font-semibold text-primary-900"
                >
                    {label}
                </span>
            ))}
        </div>
    );
    if (reduceMotion) {
        return <div className="flex flex-wrap justify-center gap-3">{items.map((label) => <span key={label} className="rounded-full border border-primary-200/70 bg-primary-50/60 px-4 py-1.5 text-sm font-semibold text-primary-900">{label}</span>)}</div>;
    }
    return (
        <div className="flex w-max" aria-hidden="true">
            <motion.div
                className="flex"
                animate={{ x: reverse ? "-50%" : "0%" }}
                initial={{ x: reverse ? "0%" : "-50%" }}
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            >
                {inner}
            </motion.div>
        </div>
    );
};

/** Infinite two-row feature ticker — the platform's breadth in one glance. */
export const FeatureMarquee = () => {
    const reduceMotion = useReducedMotion();
    return (
        <section className="overflow-hidden border-t border-neutral-200 bg-base-100 py-10" aria-label="Platform capabilities">
            <p className="mx-auto mb-6 max-w-2xl px-6 text-center text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                Everything under one calm roof
            </p>
            <div className="space-y-3">
                <Row items={ROW_A} reduceMotion={reduceMotion} />
                <Row items={ROW_B} reverse reduceMotion={reduceMotion} />
            </div>
        </section>
    );
};

export default FeatureMarquee;
