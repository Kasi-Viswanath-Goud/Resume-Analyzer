import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { cn } from "~/lib/utils";

const ResumeCard = ({
    resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
    resume: Resume;
}) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        let isMounted = true;
        let createdUrl = '';

        const loadResume = async () => {
            if (!imagePath) return;

            if (
                imagePath.startsWith('/') ||
                imagePath.startsWith('http') ||
                imagePath.startsWith('data:')
            ) {
                if (isMounted) setResumeUrl(imagePath);
                return;
            }

            try {
                const blob = await fs.read(imagePath);
                if (!blob || !isMounted) return;
                createdUrl = URL.createObjectURL(blob);
                if (isMounted) setResumeUrl(createdUrl);
            } catch (err) {
                console.error("Failed to load resume image:", err);
            }
        };

        loadResume();

        return () => {
            isMounted = false;
            if (createdUrl) URL.revokeObjectURL(createdUrl);
        };
    }, [imagePath, fs]);

    // Safely extract overallScore whether feedback is an object, JSON string, or null
    let parsedFeedback: Feedback | null = null;
    if (typeof feedback === 'string' && feedback) {
        try {
            parsedFeedback = JSON.parse(feedback);
        } catch {
            parsedFeedback = null;
        }
    } else if (typeof feedback === 'object' && feedback !== null) {
        parsedFeedback = feedback;
    }

    const overallScore = parsedFeedback?.overallScore ?? 0;

    return (
        <Link
            to={`/resume/${id}`}
            className="card-interactive group p-0 overflow-hidden animate-fade-in"
        >
            {/* Preview Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-neutral-100)]">
                {resumeUrl ? (
                    <img
                        src={resumeUrl}
                        alt={`${companyName || 'Resume'} preview`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <img src="/icons/info.svg" alt="Resume preview" className="w-12 h-12 opacity-30" />
                    </div>
                )}
                {/* Score overlay */}
                <div className="absolute top-3 right-3">
                    <ScoreCircle score={overallScore} size="sm" showLabel={false} />
                </div>
            </div>

            {/* Card Content */}
            <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        {companyName && (
                            <h3 className="font-semibold text-[var(--color-text-primary)] truncate">{companyName}</h3>
                        )}
                        {jobTitle && (
                            <p className="text-sm text-[var(--color-text-tertiary)] truncate mt-0.5">{jobTitle}</p>
                        )}
                        {!companyName && !jobTitle && (
                            <h3 className="font-semibold text-[var(--color-text-primary)]">Resume</h3>
                        )}
                    </div>
                    <span className={cn(
                        "badge px-2 py-1 text-xs shrink-0",
                        overallScore >= 70 && "badge-success",
                        overallScore >= 50 && overallScore < 70 && "badge-warning",
                        overallScore < 50 && "badge-error",
                    )}>
                        {overallScore}/100
                    </span>
                </div>

                {/* Quick stats */}
                {parsedFeedback && (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--color-border-light)]">
                        <div className="text-center">
                            <p className="text-2xl font-display font-bold text-[var(--color-brand-600)]">{parsedFeedback.ATS?.score ?? 0}</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">ATS</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-display font-bold text-[var(--color-brand-600)]">{parsedFeedback.content?.score ?? 0}</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">Content</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-display font-bold text-[var(--color-brand-600)]">{parsedFeedback.structure?.score ?? 0}</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">Structure</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-display font-bold text-[var(--color-brand-600)]">{parsedFeedback.skills?.score ?? 0}</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">Skills</p>
                        </div>
                    </div>
                )}

                {/* Action hint */}
                <div className="flex items-center justify-center gap-1.5 text-sm text-[var(--color-brand-600)] font-medium pt-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                    View Details
                </div>
            </div>
        </Link>
    );
};

export default ResumeCard;