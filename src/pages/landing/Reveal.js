import { motion, useReducedMotion } from "framer-motion";

/**
 * Shared entrance animation for landing sections.
 *
 * Every reveal on the page routes through here so the motion language stays
 * consistent and, more importantly, so `prefers-reduced-motion` is honoured in
 * one place. When the user asks for reduced motion the element renders with no
 * transform and no transition at all rather than a faster animation.
 *
 * Kept local to the landing page rather than pushed into shared-ui: this is a
 * portal-only marketing surface and shared-ui is vendored from a pinned commit
 * (see scripts/shared-ui-sync.mjs), so editing it there would fail the drift check.
 */
const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({
    children,
    delay = 0,
    y = 24,
    className = "",
    as = "div",
    once = true,
    amount = 0.25,
}) => {
    const reduceMotion = useReducedMotion();
    const MotionTag = motion[as] || motion.div;

    if (reduceMotion) {
        const Tag = as;
        return <Tag className={className}>{children}</Tag>;
    }

    return (
        <MotionTag
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, amount }}
            transition={{ duration: 0.6, delay, ease: EASE }}
        >
            {children}
        </MotionTag>
    );
};

export const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Reduced-motion variants: identical structure, zero movement.
 * Components that animate a list spread these instead of the pair above so the
 * cards never sit at opacity 0 when the OS asks for reduced motion.
 */
export const staticContainer = { hidden: {}, show: {} };
export const staticItem = { hidden: { opacity: 1 }, show: { opacity: 1 } };

/** Pick the variant pair that matches the user's motion preference. */
export const useStaggerVariants = (reduceMotion) =>
    reduceMotion
        ? { container: staticContainer, item: staticItem }
        : { container: staggerContainer, item: staggerItem };

export default Reveal;
