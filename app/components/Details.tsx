import { cn } from "~/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";

interface Tip {
    type: "good" | "improve";
    tip: string;
    explanation?: string;
}

interface CategoryHeaderProps {
    title: string;
    categoryScore: number;
    icon?: React.ReactNode;
}

const CategoryHeader = ({ title, categoryScore = 0, icon }: CategoryHeaderProps) => {
    const safeScore = Math.min(Math.max(Math.round(categoryScore || 0), 0), 100);
    const color = safeScore > 69 ? 'success' : safeScore > 39 ? 'warning' : 'error';

    return (
        <div className="flex flex-row gap-4 items-center py-2">
            {icon && (
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center shrink-0">
                    {icon}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-[var(--color-text-primary)] truncate">{title}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Category Score</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-16 h-3 bg-[var(--color-neutral-200)] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${safeScore}%`,
                            background: color === 'success'
                                ? 'linear-gradient(90deg, var(--color-accent-500), var(--color-accent-400))'
                                : color === 'warning'
                                ? 'linear-gradient(90deg, var(--color-warning-500), var(--color-warning-400))'
                                : 'linear-gradient(90deg, var(--color-error-500), var(--color-error-400))',
                        }}
                    ></div>
                </div>
                <span
                    className={cn(
                        "text-sm font-bold",
                        color === 'success' && "text-[var(--color-accent-600)]",
                        color === 'warning' && "text-[var(--color-warning-600)]",
                        color === 'error' && "text-[var(--color-error-600)]",
                    )}
                >
                    {safeScore}/100
                </span>
            </div>
        </div>
    );
};

const CategoryContent = ({ tips = [] }: { tips?: Tip[] }) => {
    if (!tips || tips.length === 0) {
        return (
            <div className="p-4 text-center text-[var(--color-text-tertiary)] italic">
                No specific tips available for this section.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tips.map((tip, index) => (
                <div
                    key={`${tip.tip}-${index}`}
                    className={cn(
                        "rounded-xl p-4 border transition-all",
                        tip.type === "good"
                            ? "bg-[var(--color-accent-50)] border-[var(--color-accent-200)] text-[var(--color-accent-800)]"
                            : "bg-[var(--color-warning-50)] border-[var(--color-warning-200)] text-[var(--color-warning-800)]",
                    )}
                >
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            tip.type === "good" ? "bg-[var(--color-accent-100)] text-[var(--color-accent-600)]" : "bg-[var(--color-warning-100)] text-[var(--color-warning-600)]"
                        )}>
                            {tip.type === "good" ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[var(--color-text-primary)]">{tip.tip}</p>
                            {tip.explanation && (
                                <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">{tip.explanation}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
    const categories = [
        {
            id: 'tone-style',
            title: 'Tone & Style',
            score: feedback?.toneAndStyle?.score ?? 0,
            tips: feedback?.toneAndStyle?.tips || [],
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
            ),
        },
        {
            id: 'content',
            title: 'Content',
            score: feedback?.content?.score ?? 0,
            tips: feedback?.content?.tips || [],
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
            ),
        },
        {
            id: 'structure',
            title: 'Structure',
            score: feedback?.structure?.score ?? 0,
            tips: feedback?.structure?.tips || [],
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                </svg>
            ),
        },
        {
            id: 'skills',
            title: 'Skills',
            score: feedback?.skills?.score ?? 0,
            tips: feedback?.skills?.tips || [],
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
            ),
        },
    ];

    return (
        <section className="card-elevated overflow-hidden animate-fade-in" aria-labelledby="details-heading">
            <div className="p-6 border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                <h2 id="details-heading" className="text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-brand-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Detailed Analysis
                </h2>
                <p className="text-[var(--color-text-tertiary)] text-sm mt-1">Expand each section to see specific feedback and recommendations</p>
            </div>

            <Accordion defaultOpen="tone-style" allowMultiple>
                {categories.map((category) => (
                    <AccordionItem key={category.id} id={category.id}>
                        <AccordionHeader itemId={category.id} className="px-6 py-4 hover:bg-[var(--color-bg-secondary)]">
                            <CategoryHeader
                                title={category.title}
                                categoryScore={category.score}
                                icon={category.icon}
                            />
                        </AccordionHeader>
                        <AccordionContent itemId={category.id} className="px-6 pb-6">
                            <CategoryContent tips={category.tips} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
};

export default Details;