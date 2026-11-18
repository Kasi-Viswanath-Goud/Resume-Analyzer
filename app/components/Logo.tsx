import { useId } from "react";
import { cn } from "~/lib/utils";

interface LogoMarkProps {
    className?: string;
    /** subtle looping pulse, mirrors the brand animation */
    animated?: boolean;
}

/**
 * ResuScore mark: an open book being inspected with a magnifying glass.
 */
export const LogoMark = ({ className, animated = true }: LogoMarkProps) => {
    const rawId = useId().replace(/:/g, "");
    const gradId = `rs-grad-${rawId}`;

    return (
        <span className={cn("relative inline-flex shrink-0", animated && "logo-pulse-group", className)}>
            {animated && (
                <span
                    aria-hidden="true"
                    className="logo-halo pointer-events-none absolute inset-0 rounded-[26%] bg-[var(--color-brand-400)] blur-lg"
                />
            )}
            <svg
                viewBox="0 0 64 64"
                className="relative h-full w-full"
                role="img"
                aria-label="ResuScore"
            >
                <defs>
                    <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="64" y2="64">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#4338CA" />
                    </linearGradient>
                </defs>

                <rect width="64" height="64" rx="16" fill={`url(#${gradId})`} />

                {/* open book */}
                <g fill="#FFFFFF">
                    <rect x="12.6" y="23.4" width="2.2" height="15.4" rx="1.1" opacity="0.95" />
                    <rect x="49.2" y="23.4" width="2.2" height="15.4" rx="1.1" opacity="0.95" />
                    <path d="M32 25.6C27.5 21.6 21.6 20.2 16.6 20.8C15 21 13.8 22.3 13.8 23.9V37.2C13.8 38.6 15.1 39.6 16.5 39.5C20.6 39.2 25.2 40 29.4 42.4L32 43.9Z" />
                    <path d="M32 25.6C36.5 21.6 42.4 20.2 47.4 20.8C49 21 50.2 22.3 50.2 23.9V37.2C50.2 38.6 48.9 39.6 47.5 39.5C43.4 39.2 38.8 40 34.6 42.4L32 43.9Z" />
                </g>

                {/* page stack lines */}
                <path
                    d="M14.4 42.1C18.9 41.8 23.7 42.5 28.4 44.9M49.6 42.1C45.1 41.8 40.3 42.5 35.6 44.9"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.9"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                />

                {/* spine fold */}
                <path
                    d="M32 36.8V43.2"
                    stroke={`url(#${gradId})`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />

                {/* magnifying glass */}
                <circle
                    cx="33.4"
                    cy="27.4"
                    r="11.1"
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth="1.2"
                    strokeOpacity="0.7"
                />
                <circle
                    cx="33.4"
                    cy="27.4"
                    r="9.5"
                    fill={`url(#${gradId})`}
                    stroke="#FFFFFF"
                    strokeWidth="3.2"
                />
                <path
                    d="M40.3 34.3 46.6 40.6"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeLinecap="round"
                />


            </svg>
        </span>
    );
};

interface LogoProps {
    /** tile size classes, e.g. "h-10 w-10" */
    markClassName?: string;
    wordmarkClassName?: string;
    className?: string;
    showWordmark?: boolean;
    animated?: boolean;
}

/**
 * Full brand lockup: mark + RESUSCORE wordmark (stacked, like the brand animation).
 */
const Logo = ({
    markClassName,
    wordmarkClassName,
    className,
    showWordmark = true,
    animated = true,
}: LogoProps) => (
    <span className={cn("inline-flex flex-col items-center gap-3", className)}>
        <LogoMark className={cn("h-16 w-16", markClassName)} animated={animated} />
        {showWordmark && (
            <span
                className={cn(
                    "font-display font-black uppercase tracking-[0.22em] text-[var(--color-text-primary)] text-lg leading-none",
                    animated && "logo-pulse-text",
                    wordmarkClassName
                )}
            >
                ResuScore
            </span>
        )}
    </span>
);

export default Logo;
