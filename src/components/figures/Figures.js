/**
 * Hand-drawn SVG artwork for the landing page and auth shell. Static by
 * construction (no framer-motion, no CSS keyframes) so prefers-reduced-motion
 * is satisfied without extra plumbing, and palette-locked to the brand:
 * navy #00163b + cyan accents.
 */

const NAVY = "#00163b";
const CYAN = "#0ea5e9";
const CYAN_LIGHT = "#7dd3fc";

export const HeroFigure = ({ className }) => (
    <svg
        viewBox="0 0 400 500"
        className={className}
        role="img"
        aria-label="A person on their phone connecting with a clinician on a video card"
        fill="none"
    >
        {/* clinician card */}
        <rect x="150" y="60" width="220" height="170" rx="18" fill="#ffffff" stroke={NAVY} strokeWidth="3" />
        <circle cx="205" cy="120" r="22" stroke={NAVY} strokeWidth="3" />
        <path d="M183 168c4-14 12-20 22-20s18 6 22 20" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
        <path
            d="M250 128h14l6-14 10 26 8-18 6 6h20"
            stroke={CYAN}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <rect x="168" y="192" width="90" height="10" rx="5" fill={CYAN_LIGHT} opacity="0.7" />
        <rect x="168" y="192" width="56" height="10" rx="5" fill={CYAN} opacity="0.85" />

        {/* connection curve with glow + nodes */}
        <path
            d="M168 214C150 260 150 300 172 332"
            stroke={CYAN}
            strokeWidth="12"
            opacity="0.15"
            strokeLinecap="round"
        />
        <path
            d="M168 214C150 260 150 300 172 332"
            stroke={CYAN}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 10"
        />
        <circle cx="160" cy="252" r="4" fill={CYAN} />
        <circle cx="156" cy="290" r="4" fill={NAVY} />

        {/* person seated with phone */}
        <circle cx="120" cy="352" r="30" stroke={NAVY} strokeWidth="3" />
        <path d="M70 470c0-52 22-84 50-84s50 32 50 84" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
        <rect x="158" y="330" width="26" height="44" rx="8" stroke={CYAN} strokeWidth="3" />
        <path d="M166 362h10" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
        <path d="M96 396c14 12 34 12 46 0" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />

        {/* ambient accents */}
        <circle cx="352" cy="296" r="6" fill={CYAN_LIGHT} />
        <circle cx="330" cy="330" r="3" fill={NAVY} opacity="0.5" />
        <circle cx="64" cy="180" r="5" fill={CYAN} opacity="0.6" />
        <circle cx="46" cy="212" r="3" fill={NAVY} opacity="0.4" />
        <path d="M312 402c22-8 40-4 54 12" stroke={CYAN_LIGHT} strokeWidth="3" strokeLinecap="round" />
    </svg>
);

export const AuthFigure = ({ className }) => (
    <svg viewBox="0 0 360 540" className={className} aria-hidden="true" fill="none">
        {/* head */}
        <circle cx="180" cy="215" r="96" stroke="#a5f3fc" strokeWidth="2.5" />
        {/* brain: rounded mass with fold lines */}
        <ellipse cx="180" cy="188" rx="54" ry="44" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="2" />
        <path d="M180 144v88" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
        <path
            d="M150 162c8 6 8 14 0 20m60-20c-8 6-8 14 0 20m-46 18c6 4 6 10 0 14m46-14c-6 4-6 10 0 14"
            stroke="#ffffff"
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeLinecap="round"
        />
        {/* brainstem */}
        <path d="M180 232v40" stroke="#a5f3fc" strokeWidth="2.5" strokeLinecap="round" />
        {/* dendrites radiating from the head, each ending in a node */}
        <path d="M104 148C76 124 56 118 38 124" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M256 148c28-24 48-30 66-24" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M84 215H34" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M276 215h50" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M118 288c-18 22-24 42-22 62" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M242 288c18 22 24 42 22 62" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M180 272c0 30 6 52 20 70" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        {[
            [38, 124],
            [322, 124],
            [34, 215],
            [326, 215],
            [96, 350],
            [264, 350],
            [200, 342],
        ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3.5} fill="#a5f3fc" opacity="0.85" />
        ))}
        {/* pulse line below */}
        <path
            d="M60 470h70l14-26 20 44 14-26 14 8h108"
            stroke="#7dd3fc"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
        />
    </svg>
);

export const FeaturesMotif = ({ className }) => (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true" fill="none">
        {/* dashed triangle links */}
        <path
            d="M120 62c-40 6-60 30-70 66m70 4c36 4 58 26 62 58m-132-58c4 32 26 54 62 58"
            stroke={CYAN}
            strokeWidth="2"
            strokeDasharray="2 8"
            strokeLinecap="round"
        />
        {/* calendar */}
        <rect x="92" y="28" width="56" height="48" rx="10" fill="#ffffff" stroke={NAVY} strokeWidth="3" />
        <path d="M92 46h56M108 28v-8m24 8v-8" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
        <circle cx="120" cy="60" r="4" fill={CYAN} />
        {/* chat bubble */}
        <path
            d="M30 148a12 12 0 0 1 12-12h44a12 12 0 0 1 12 12v24a12 12 0 0 1-12 12h-8l-16 14v-14h-20a12 12 0 0 1-12-12Z"
            fill="#ffffff"
            stroke={NAVY}
            strokeWidth="3"
        />
        <path d="M48 160h28m-28 10h20" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
        {/* heart with pulse */}
        <path
            d="M160 200c-10-10-28-24-28-40a14 14 0 0 1 28-6 14 14 0 0 1 28 6c0 16-18 30-28 40Z"
            fill="#ffffff"
            stroke={NAVY}
            strokeWidth="3"
            strokeLinejoin="round"
        />
        <path d="M142 166h10l6-8 8 16 5-8h13" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CommunityMotif = ({ className }) => {
    const nodes = [
        [160, 40],
        [263, 100],
        [263, 220],
        [160, 280],
        [57, 220],
        [57, 100],
    ];
    return (
        <svg viewBox="0 0 320 320" className={className} aria-hidden="true" fill="none">
            {/* embrace arcs between neighbours, bowed toward centre */}
            {nodes.map(([x1, y1], i) => {
                const [x2, y2] = nodes[(i + 1) % nodes.length];
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                const cx = mx + (160 - mx) * 0.45;
                const cy = my + (160 - my) * 0.45;
                return (
                    <path
                        key={`arc-${i}`}
                        d={`M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`}
                        stroke="#7dd3fc"
                        strokeWidth="2.5"
                        opacity="0.45"
                    />
                );
            })}
            {nodes.map(([x, y], i) => (
                <g key={`node-${i}`}>
                    <circle cx={x} cy={y - 10} r="9" stroke="#a5f3fc" strokeWidth="2.5" />
                    <path d={`M${x - 13} ${y + 12}c0-8 6-13 13-13s13 5 13 13`} stroke="#a5f3fc" strokeWidth="2.5" strokeLinecap="round" />
                </g>
            ))}
            <circle cx="160" cy="160" r="5" fill="#7dd3fc" opacity="0.7" />
        </svg>
    );
};

export const AnatomyFigure = ({ className }) => (
    <svg
        viewBox="0 0 960 280"
        className={className}
        role="img"
        aria-label="Line-art diagram of a brain connected through the spinal cord to the body's nervous system"
        fill="none"
    >
        {/* brain */}
        <path
            d="M480 30c-34 0-52 20-52 44 0 14 6 24 16 32-12 8-18 20-18 34 0 26 23 44 54 44s54-18 54-44c0-14-6-26-18-34 10-8 16-18 16-32 0-24-18-44-52-44Z"
            stroke={NAVY}
            strokeWidth="3.5"
        />
        <path d="M480 30v154" stroke={NAVY} strokeWidth="2.5" opacity="0.7" />
        <path d="M456 62c-10 6-12 16-8 26m48 22c8 6 10 16 4 24m-52 4c-8 6-8 16-2 22" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" />
        {/* spinal cord */}
        <path d="M480 184v62" stroke={NAVY} strokeWidth="3.5" strokeLinecap="round" />
        {/* symmetric nerve branches */}
        {[
            "M480 196c-36 4-60 20-80 48",
            "M480 196c36 4 60 20 80 48",
            "M480 212c-28 8-46 24-58 50",
            "M480 212c28 8 46 24 58 50",
        ].map((d, i) => (
            <path key={i} d={d} stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
        ))}
        {[
            "M400 244c-40-14-76-10-112 12",
            "M560 244c40-14 76-10 112 12",
        ].map((d, i) => (
            <path key={`p-${i}`} d={d} stroke={CYAN} strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
        ))}
        {/* heart terminal (left) */}
        <path
            d="M238 258c-8-8-22-20-22-32a12 12 0 0 1 22-5 12 12 0 0 1 22 5c0 12-14 24-22 32Z"
            stroke={NAVY}
            strokeWidth="3"
            strokeLinejoin="round"
        />
        <path d="M222 232h8l4-6 6 12 4-6h10" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* node cluster terminal (right) */}
        {[
            [690, 226],
            [722, 240],
            [696, 258],
        ].map(([x, y], i) => (
            <g key={`c-${i}`}>
                <circle cx={x} cy={y} r="8" stroke={NAVY} strokeWidth="2.5" />
                <path d={`M${x - 26} 244h${i === 1 ? 22 : 12}`} stroke={CYAN} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </g>
        ))}
        <path d="M698 232l18 8m-10 14l8-12" stroke={NAVY} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        {/* peripheral dots */}
        {[
            [150, 210],
            [190, 176],
            [790, 210],
            [750, 176],
            [480, 268],
        ].map(([x, y], i) => (
            <circle key={`d-${i}`} cx={x} cy={y} r="4" fill={CYAN} opacity="0.7" />
        ))}
    </svg>
);
