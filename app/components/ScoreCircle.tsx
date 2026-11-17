import { cn } from "~/lib/utils";

interface ScoreCircleProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const ScoreCircle = ({ score = 75, size = 'md', showLabel = true }: ScoreCircleProps) => {
    const safeScore = Math.min(Math.max(Math.round(score || 0), 0), 100);
    const color = safeScore > 69 ? 'success' : safeScore > 39 ? 'warning' : 'error';

    const sizeMap = {
        sm: { size: 60, stroke: 6, fontSize: 'text-xl' },
        md: { size: 80, stroke: 8, fontSize: 'text-2xl' },
        lg: { size: 100, stroke: 10, fontSize: 'text-3xl' },
    };

    const { size: ringSize, stroke, fontSize } = sizeMap[size];
    const radius = (ringSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = safeScore / 100;
    const strokeDashoffset = circumference * (1 - progress);

    const gradientColors = {
        success: 'from-[var(--color-accent-500)] to-[var(--color-accent-400)]',
        warning: 'from-[var(--color-warning-500)] to-[var(--color-warning-400)]',
        error: 'from-[var(--color-error-500)] to-[var(--color-error-400)]',
    };

    return (
        <div className={cn("relative flex-shrink-0", size === 'sm' && 'w-14 h-14', size === 'md' && 'w-18 h-18', size === 'lg' && 'w-24 h-24')} style={{ width: ringSize, height: ringSize }}>
            <svg viewBox={`0 0 ${ringSize} ${ringSize}`} className="w-full h-full transform -rotate-90" style={{ width: ringSize, height: ringSize }}>
                <defs>
                    <linearGradient id={`scoreCircleGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color === 'success' ? '#10b981' : color === 'warning' ? '#f59e0b' : '#ef4444'} />
                        <stop offset="100%" stopColor={color === 'success' ? '#34d399' : color === 'warning' ? '#fbbf24' : '#f87171'} />
                    </linearGradient>
                </defs>
                <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--color-neutral-200)"
                    strokeWidth={stroke}
                />
                <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#scoreCircleGrad-${color})`}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("font-display font-bold", fontSize)}>{safeScore}</span>
                {showLabel && <span className="text-xs font-medium text-[var(--color-text-tertiary)]">/100</span>}
            </div>
        </div>
    );
};

export default ScoreCircle;