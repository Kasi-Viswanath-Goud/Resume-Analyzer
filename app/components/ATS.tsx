interface Suggestion {
    type: "good" | "improve";
    tip: string;
}

interface ATSProps {
    score?: number;
    suggestions?: Suggestion[];
}

const ATS = ({ score = 0, suggestions = [] }: ATSProps) => {
    const safeScore = Math.min(Math.max(Math.round(score || 0), 0), 100);

    const getScoreVariant = (score: number) => {
        if (score >= 70) return { color: 'accent', label: 'Excellent', icon: 'good', bg: 'bg-[var(--color-accent-50)]', border: 'border-[var(--color-accent-200)]', text: 'text-[var(--color-accent-700)]' };
        if (score >= 50) return { color: 'warning', label: 'Good Start', icon: 'warning', bg: 'bg-[var(--color-warning-50)]', border: 'border-[var(--color-warning-200)]', text: 'text-[var(--color-warning-700)]' };
        return { color: 'error', label: 'Needs Improvement', icon: 'bad', bg: 'bg-[var(--color-error-50)]', border: 'border-[var(--color-error-200)]', text: 'text-[var(--color-error-700)]' };
    };

    const variant = getScoreVariant(safeScore);
    const iconMap: Record<string, string> = {
        good: '/icons/ats-good.svg',
        warning: '/icons/ats-warning.svg',
        bad: '/icons/ats-bad.svg',
    };

    return (
        <section className={`card-elevated p-6 md:p-8 ${variant.bg} border ${variant.border}`} aria-labelledby="ats-heading">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: variant.bg, borderColor: variant.border.replace('border-', '') }}>
                    <img src={iconMap[variant.icon]} alt="" className="w-8 h-8" />
                </div>
                <div className="flex-1">
                    <h2 id="ats-heading" className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
                        ATS Compatibility Score
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className={`text-3xl font-display font-bold ${variant.text}`}>{safeScore}/100</span>
                        <span className={`badge badge-${variant.color}`}>{variant.label}</span>
                    </div>
                    <p className="text-[var(--color-text-secondary)] mt-2 text-sm max-w-xl">
                        This score reflects how well your resume will perform in Applicant Tracking Systems used by employers.
                        Scores above 70 typically pass initial screening.
                    </p>
                </div>
            </div>

            {/* Score breakdown visualization */}
            <div className="mb-6 p-4 bg-white/50 rounded-xl border border-[var(--color-border-light)]">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Score Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Keyword Match', weight: '40%' },
                        { label: 'Format & Parse', weight: '25%' },
                        { label: 'Section Headers', weight: '20%' },
                        { label: 'File Compatibility', weight: '15%' },
                    ].map((item) => (
                        <div key={item.label} className="text-center">
                            <p className="text-2xl font-display font-bold text-[var(--color-brand-600)]">{item.weight}</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Suggestions */}
            <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--color-brand-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Key Recommendations
                </h3>

                {suggestions.length > 0 ? (
                    <ul className="space-y-3" role="list">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3 p-4 rounded-xl bg-white/50 border border-[var(--color-border-light)] transition-all hover:border-[var(--color-border-medium)]">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${suggestion.type === "good" ? "bg-[var(--color-accent-100)] text-[var(--color-accent-600)]" : "bg-[var(--color-warning-100)] text-[var(--color-warning-600)]"}`}>
                                    {suggestion.type === "good" ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                    )}
                                </div>
                                <p className={`text-[var(--color-text-secondary)] flex-1 ${suggestion.type === "good" ? "text-[var(--color-accent-700)]" : "text-[var(--color-warning-700)]"}`}>
                                    {suggestion.tip}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-6 text-center bg-white/50 rounded-xl border border-[var(--color-border-light)]">
                        <svg className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p className="text-[var(--color-text-tertiary)]">No specific ATS tips available for this resume.</p>
                    </div>
                )}

                {/* Encouragement */}
                <p className="mt-6 text-center text-sm text-[var(--color-text-tertiary)] italic">
                    Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
                </p>
            </div>
        </section>
    );
};

export default ATS;