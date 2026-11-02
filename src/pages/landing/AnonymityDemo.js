import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiEyeOff, FiHeart, FiMessageCircle, FiUser } from "react-icons/fi";
import { Reveal } from "./Reveal";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Interactive anonymity demo: the same post, two identities. The copy is
 * honest — anonymity is decided server-side per post, this widget only shows
 * the two shapes it takes.
 */
export const AnonymityDemo = () => {
    const reduceMotion = useReducedMotion();
    const [anonymous, setAnonymous] = useState(true);

    return (
        <section id="anonymity" className="scroll-mt-20 border-t border-neutral-200 bg-canvas py-20">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Reveal className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                        Anonymity
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                        Say it with your name — or don&apos;t
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                        Every post carries its own choice. Flip the switch and watch the author
                        disappear — the confession stays, the identity does not.
                    </p>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={anonymous}
                        onClick={() => setAnonymous((value) => !value)}
                        className={`mt-7 inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                            anonymous
                                ? "border-primary-600 bg-primary-700 text-white"
                                : "border-neutral-300 bg-base-100 text-neutral-800"
                        }`}
                    >
                        <span
                            aria-hidden="true"
                            className={`relative grid h-6 w-11 place-items-center rounded-full ${
                                anonymous ? "bg-white/25" : "bg-neutral-200"
                            }`}
                        >
                            <motion.span
                                className="absolute h-5 w-5 rounded-full bg-white shadow"
                                initial={false}
                                animate={{ x: anonymous ? 10 : -10 }}
                                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
                            />
                        </span>
                        {anonymous ? "Posting anonymously" : "Posting as Amira"}
                    </button>
                </Reveal>

                <Reveal delay={0.12} className="min-w-0">
                    <article className="rounded-3xl border border-neutral-200 bg-base-100 p-6 shadow-xl shadow-primary-900/5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                                Confession
                            </span>
                            <span className="text-[11px] text-neutral-400">just now</span>
                        </div>
                        <h3 className="mt-3 text-lg font-bold leading-snug text-neutral-900">
                            Two years of saying &ldquo;I&apos;m fine&rdquo;
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                            I keep everything inside until it leaks out as insomnia. Writing it
                            here is the first time I have said it anywhere at all.
                        </p>
                        <div className="mt-5 flex items-center justify-between border-t border-neutral-200 pt-4">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={anonymous ? "anon" : "named"}
                                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                                    transition={{ duration: 0.3, ease: EASE }}
                                    className="flex items-center gap-2.5"
                                >
                                    <span
                                        className={`grid h-9 w-9 place-items-center rounded-full ${
                                            anonymous ? "bg-neutral-200 text-neutral-500" : "bg-primary-100 text-primary-700"
                                        }`}
                                    >
                                        {anonymous ? <FiEyeOff aria-hidden="true" /> : <FiUser aria-hidden="true" />}
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-800">
                                        {anonymous ? "Anonymous" : "Amira K."}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                                <span className="inline-flex items-center gap-1"><FiHeart aria-hidden="true" /> 8</span>
                                <span className="inline-flex items-center gap-1"><FiMessageCircle aria-hidden="true" /> 3</span>
                            </div>
                        </div>
                    </article>
                    <p className="mt-4 text-xs leading-relaxed text-neutral-500">
                        Anonymity is decided by the server per post — not by the browser, and never
                        after the fact. Moderation still screens the words; it just does not get
                        told who wrote them.
                    </p>
                </Reveal>
            </div>
        </section>
    );
};

export default AnonymityDemo;
