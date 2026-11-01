import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Pointer-reactive 3D card.
 *
 * Uses CSS `preserve-3d` and a rotate transform driven by the pointer position
 * rather than a WebGL scene: it costs no extra bundle weight, renders on the
 * first paint, works without WebGL support, and stays readable to assistive
 * tech because the content is ordinary DOM.
 *
 * The transform is skipped entirely when the OS asks for reduced motion — the
 * card still renders, it just does not move.
 */
export const Tilt3D = ({
    children,
    className = "",
    intensity = 10,
    glare = true,
    lift = 8,
    style,
}) => {
    const reduceMotion = useReducedMotion();
    const ref = useRef(null);
    const [transform, setTransform] = useState("");
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
    const [active, setActive] = useState(false);

    const handleMove = (event) => {
        if (reduceMotion || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        // -0.5..0.5 across the card, so the centre is a flat card.
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        setTransform(
            `perspective(900px) rotateY(${px * intensity}deg) rotateX(${-py * intensity}deg) translateZ(${lift}px)`
        );
        setGlarePos({ x: (px + 0.5) * 100, y: (py + 0.5) * 100 });
    };

    const reset = () => {
        setTransform("");
        setActive(false);
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseEnter={() => setActive(true)}
            onMouseLeave={reset}
            onBlur={reset}
            className={`relative [transform-style:preserve-3d] transition-transform duration-200 ease-out will-change-transform ${className}`}
            style={{ transform: reduceMotion ? undefined : transform, ...style }}
        >
            {children}
            {glare && !reduceMotion && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
                    style={{
                        opacity: active ? 0.55 : 0,
                        background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.5), transparent 55%)`,
                    }}
                />
            )}
        </div>
    );
};

/**
 * A slowly drifting orb. Depth is faked with layered gradients and a blur so it
 * reads as a solid object behind the content instead of a flat circle.
 */
export const Orb3D = ({
    className = "",
    size = 320,
    hue = "primary",
    duration = 18,
    delay = 0,
}) => {
    const reduceMotion = useReducedMotion();
    const palette = {
        primary: ["rgba(99,102,241,0.55)", "rgba(59,130,246,0.25)"],
        teal: ["rgba(20,184,166,0.5)", "rgba(16,185,129,0.22)"],
        rose: ["rgba(244,114,182,0.45)", "rgba(168,85,247,0.22)"],
        amber: ["rgba(251,191,36,0.42)", "rgba(244,63,94,0.2)"],
    }[hue] || ["rgba(99,102,241,0.5)", "rgba(59,130,246,0.2)"];

    return (
        <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute rounded-full ${className}`}
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 32% 28%, ${palette[0]}, ${palette[1]} 55%, transparent 72%)`,
                filter: "blur(28px)",
            }}
            animate={
                reduceMotion
                    ? undefined
                    : {
                          x: [0, 18, -12, 0],
                          y: [0, -22, 14, 0],
                          scale: [1, 1.08, 0.96, 1],
                      }
            }
            transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        />
    );
};

/**
 * Rotating wireframe ring — the "3D figure" in the hero.
 *
 * Three rings on different axes read as a sphere in perspective. Pure CSS
 * transforms, so it is cheap and degrades to a static ring under reduced motion.
 */
export const OrbitRings = ({ className = "", size = 300 }) => {
    const reduceMotion = useReducedMotion();
    const rings = [
        { rotate: "rotateX(72deg)", duration: 22 },
        { rotate: "rotateY(70deg)", duration: 30 },
        { rotate: "rotateX(72deg) rotateY(52deg)", duration: 38 },
    ];

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute ${className}`}
            style={{ width: size, height: size, perspective: "800px" }}
        >
            {rings.map((ring, index) => (
                <motion.span
                    key={index}
                    className="absolute inset-0 rounded-full border border-primary-300/45"
                    style={{
                        transform: ring.rotate,
                        transformStyle: "preserve-3d",
                        borderTopColor: "rgba(129,140,248,0.75)",
                    }}
                    animate={reduceMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
                />
            ))}
            <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500 shadow-[0_0_18px_4px_rgba(99,102,241,0.45)]" />
        </div>
    );
};

export default Tilt3D;
