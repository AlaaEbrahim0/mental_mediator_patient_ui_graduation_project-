/**
 * Nexus brand mark: rounded-square navy-to-teal gradient tile with a white
 * heart outline pierced by an ECG line ending in two nodes. Inline SVG so it
 * stays crisp at any size and inherits text color for the optional wordmark.
 */
export const BrandLogo = ({ size = 36, wordmark = false, className = "" }) => (
    <span className={`inline-flex shrink-0 items-center gap-2.5 ${className}`}>
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <defs>
                <linearGradient id="nexusLogoGrad" x1="4" y1="44" x2="44" y2="4" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00163b" />
                    <stop offset="1" stopColor="#00747f" />
                </linearGradient>
            </defs>
            <rect width="48" height="48" rx="13" fill="url(#nexusLogoGrad)" />
            <path
                d="M24 35.5C16.5 29.8 12.5 25.4 12.5 20.6 12.5 16.6 15.5 14 18.8 14c2 0 3.9 1 5.2 2.8C25.3 15 27.2 14 29.2 14c3.3 0 6.3 2.6 6.3 6.6 0 4.8-4 9.2-11.5 14.9Z"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinejoin="round"
            />
            <path
                d="M8.5 24.5h6.2l2.4-6.4 3.6 10.2 2.6-6 1.9 2.2h8.2"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="8.5" cy="24.5" r="1.9" fill="#7dd3fc" />
            <circle cx="39.6" cy="24.5" r="1.9" fill="#7dd3fc" />
        </svg>
        {wordmark && <span className="text-lg font-bold tracking-tight">Nexus</span>}
    </span>
);

export default BrandLogo;
