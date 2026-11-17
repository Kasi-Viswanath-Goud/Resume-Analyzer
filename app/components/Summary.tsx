import { cn } from "~/lib/utils";

interface ScoreBadgeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
}

const ScoreBadge = ({ score = 0, size = 'md' }: ScoreBadgeProps) => {
    const safeScore = Math.min(Math.max(Math.round(score || 0), 0), 100);
    const color = safeScore > 69 ? 'success' : safeScore > 39 ? 'warning' : 'error';

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-3 py-1 text-sm gap-1.5',
        lg: 'px-4 py-1.5 text-base gap-2',
    };

    const iconColors = {
        success: 'text-[var(--color-accent-500)]',
        warning: 'text-[var(--color-warning-500)]',
        error: 'text-[var(--color-error-500)]',
    };

    return (
        <span className={cn(
            "inline-flex items-center font-semibold rounded-full",
            sizeClasses[size],
            color === 'success' && "bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-text)] border border-[var(--color-badge-success-border)]",
            color === 'warning' && "bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-text)] border border-[var(--color-badge-warning-border)]",
            color === 'error' && "bg-[var(--color-badge-error-bg)] text-[var(--color-badge-error-text)] border border-[var(--color-badge-error-border)]",
        )}>
            <svg className={cn("shrink-0", iconColors[color], size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                {color === 'success' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                ) : color === 'warning' ? (
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                )}
            </svg>
            <span>{safeScore}/100</span>
        </span>
    );
};

interface CategoryProps {
    title: string;
    score: number;
    icon?: React.ReactNode;
}

const Category = ({ title, score = 0, icon }: CategoryProps) => {
    const safeScore = Math.min(Math.max(Math.round(score || 0), 0), 100);
    const color = safeScore > 69 ? 'success' : safeScore > 39 ? 'warning' : 'error';

    const gradientMap = {
        success: 'from-[var(--color-accent-500)] to-[var(--color-accent-400)]',
        warning: 'from-[var(--color-warning-500)] to-[var(--color-warning-400)]',
        error: 'from-[var(--color-error-500)] to-[var(--color-error-400)]',
    };

    return (
        <div className="card p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold text-[var(--color-text-primary)]">{title}</h4>
                        <p className="text-xs text-[var(--color-text-tertiary)]">Category Score</p>
                    </div>
                </div>
                <ScoreBadge score={safeScore} size="md" />
            </div>
            <div className="progress-bar">
                <div
                    className="progress-fill rounded-full"
                    style={{
                        width: `${safeScore}%`,
                        background: gradientMap[color],
                    }}
                ></div>
            </div>
        </div>
    );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
    const categories = [
        {
            key: 'toneAndStyle',
            title: 'Tone & Style',
            score: feedback?.toneAndStyle?.score ?? 0,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
            ),
        },
        {
            key: 'content',
            title: 'Content',
            score: feedback?.content?.score ?? 0,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
            ),
        },
        {
            key: 'structure',
            title: 'Structure',
            score: feedback?.structure?.score ?? 0,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                </svg>
            ),
        },
        {
            key: 'skills',
            title: 'Skills',
            score: feedback?.skills?.score ?? 0,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
            ),
        },
    ];

    return (
        <section className="card-elevated p-6 md:p-8 animate-fade-in" aria-labelledby="summary-heading">
            <div className="flex items-start justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h2 id="summary-heading" className="text-2xl font-display font-bold text-[var(--color-text-primary)]">
                            Resume Score Overview
                        </h2>
                        <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
                            Your resume scored <strong>{feedback?.overallScore ?? 0}/100</strong> overall
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <Category key={cat.key} title={cat.title} score={cat.score} icon={cat.icon} />
                ))}
            </div>
        </section>
    );
};

export default Summary;