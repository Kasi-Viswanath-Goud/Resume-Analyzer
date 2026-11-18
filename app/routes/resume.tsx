import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useStorage } from "~/lib/storage";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Navbar from "~/components/Navbar";

export const meta = () => [
    { title: 'Resumind | Resume Analysis Results' },
    { name: 'description', content: 'Detailed overview of your resume analysis with ATS score, keyword matching, and improvement recommendations.' },
];

const Resume = () => {
    const { fs, kv } = useStorage();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resumeData, setResumeData] = useState<{ companyName?: string; jobTitle?: string } | null>(null);
    const navigate = useNavigate();

    // Load resume data
    useEffect(() => {
        if (!id) {
            setErrorMessage('Invalid resume ID.');
            setLoadingData(false);
            return;
        }

        let isMounted = true;
        let createdPdfUrl = '';
        let createdImageUrl = '';

        const loadResume = async () => {
            setLoadingData(true);
            setErrorMessage(null);

            try {
                const resumeDataStr = await kv.get(`resume:${id}`);
                if (!resumeDataStr) {
                    if (isMounted) {
                        setErrorMessage('Resume not found. It may have been deleted or expired.');
                        setLoadingData(false);
                    }
                    return;
                }

                const data = typeof resumeDataStr === 'string'
                    ? JSON.parse(resumeDataStr)
                    : resumeDataStr;

                if (isMounted) {
                    setResumeData({ companyName: data.companyName, jobTitle: data.jobTitle });
                }

                if (data.feedback && isMounted) {
                    const parsedFeedback = typeof data.feedback === 'string'
                        ? JSON.parse(data.feedback)
                        : data.feedback;
                    setFeedback(parsedFeedback);
                }

                // Load resume PDF
                if (data.resumePath) {
                    try {
                        if (
                            data.resumePath.startsWith('/') ||
                            data.resumePath.startsWith('http')
                        ) {
                            if (isMounted) setResumeUrl(data.resumePath);
                        } else {
                            const resumeBlob = await fs.read(data.resumePath);
                            if (resumeBlob && isMounted) {
                                const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                                createdPdfUrl = URL.createObjectURL(pdfBlob);
                                setResumeUrl(createdPdfUrl);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to read resume PDF:', err);
                    }
                }

                // Load preview image
                if (data.imagePath) {
                    try {
                        if (
                            data.imagePath.startsWith('/') ||
                            data.imagePath.startsWith('http')
                        ) {
                            if (isMounted) setImageUrl(data.imagePath);
                        } else {
                            const imageBlob = await fs.read(data.imagePath);
                            if (imageBlob && isMounted) {
                                createdImageUrl = URL.createObjectURL(new Blob([imageBlob], { type: 'image/png' }));
                                setImageUrl(createdImageUrl);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to read resume image:', err);
                    }
                }
            } catch (err: any) {
                console.error('Failed to load resume details:', err);
                if (isMounted) {
                    setErrorMessage(err?.message || 'Failed to load resume details.');
                }
            } finally {
                if (isMounted) setLoadingData(false);
            }
        };

        loadResume();

        return () => {
            isMounted = false;
            if (createdPdfUrl) URL.revokeObjectURL(createdPdfUrl);
            if (createdImageUrl) URL.revokeObjectURL(createdImageUrl);
        };
    }, [id, kv, fs]);

    const showLoading = loadingData;
    const overallScore = feedback?.overallScore ?? 0;
    const atsScore = feedback?.ATS?.score ?? 0;

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'accent';
        if (score >= 50) return 'warning';
        return 'error';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 85) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Needs Work';
        return 'Critical';
    };

    const ScoreRing = ({ score, size = 120, strokeWidth = 10, showLabel = true }: { score: number; size?: number; strokeWidth?: number; showLabel?: boolean }) => {
        const safeScore = Math.min(Math.max(Math.round(score || 0), 0), 100);
        const color = getScoreColor(safeScore);
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const progress = safeScore / 100;
        const strokeDashoffset = circumference * (1 - progress);

        return (
            <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90" style={{ width: size, height: size }}>
                    <defs>
                        <linearGradient id={`scoreRingGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color === 'accent' ? '#10b981' : color === 'warning' ? '#f59e0b' : '#ef4444'} />
                            <stop offset="100%" stopColor={color === 'accent' ? '#34d399' : color === 'warning' ? '#fbbf24' : '#f87171'} />
                        </linearGradient>
                    </defs>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--color-neutral-200)"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#scoreRingGrad-${color})`}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold" style={{ fontSize: size * 0.28 }}>
                        {safeScore}
                    </span>
                    {showLabel && <span className="text-xs font-medium text-[var(--color-text-tertiary)]">/100</span>}
                </div>
            </div>
        );
    };

    if (errorMessage) {
        return (
            <main className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center p-4">
                <Navbar />
                <div className="card-elevated p-8 max-w-md w-full text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-error-50)] text-[var(--color-error-500)] flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">Unable to Load Results</h2>
                    <p className="text-[var(--color-text-secondary)] mb-6">{errorMessage}</p>
                    <Link to="/upload" className="btn-primary w-full justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        Scan a New Resume
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--color-bg-secondary)]">
            <Navbar />

            <nav className="bg-white border-b border-[var(--color-border-light)] px-4 md:px-8" aria-label="Breadcrumb">
                <div className="max-w-7xl mx-auto">
                    <ol className="flex items-center gap-2 py-3 text-sm" role="list">
                        <li>
                            <Link to="/" className="flex items-center gap-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-600)] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                                </svg>
                                Home
                            </Link>
                        </li>
                        <li aria-hidden="true">
                            <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                        </li>
                        <li>
                            {resumeData?.companyName && (
                                <span className="text-[var(--color-text-primary)] font-medium truncate max-w-xs block">
                                    {resumeData.companyName} - {resumeData.jobTitle || 'Resume'}
                                </span>
                            )}
                            {!resumeData?.companyName && (
                                <span className="text-[var(--color-text-primary)] font-medium">Resume Analysis</span>
                            )}
                        </li>
                    </ol>
                </div>
            </nav>

            {showLoading && !feedback ? (
                <div className="flex items-center justify-center min-h-[50vh] px-4">
                    <div className="card-elevated p-12 text-center max-w-md w-full animate-fade-in">
                        <img src="/images/resume-scan-2.gif" className="w-full max-w-xs mx-auto mb-6" alt="Analyzing resume" />
                        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Retrieving Analysis</h3>
                        <p className="text-[var(--color-text-secondary)]">Loading your detailed resume feedback...</p>
                    </div>
                </div>
            ) : feedback ? (
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Left Column - Resume Preview & Score */}
                        <aside className="lg:col-span-5 space-y-6 animate-fade-in stagger-1">
                            {/* Resume Preview Card */}
                            <div className="card-elevated overflow-hidden sticky top-24">
                                <div className="p-4 border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-[var(--color-text-primary)]">Resume Preview</h3>
                                        {resumeUrl && (
                                            <a
                                                href={resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-ghost btn-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                                </svg>
                                                Open PDF
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="relative bg-[var(--color-neutral-100)] min-h-[500px]">
                                    {imageUrl ? (
                                        <div className="p-4">
                                            {resumeUrl ? (
                                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="block">
                                                    <img
                                                        src={imageUrl}
                                                        className="w-full max-w-full h-auto object-contain rounded-lg shadow-sm hover:opacity-95 transition-opacity"
                                                        alt={`${resumeData?.companyName || 'Resume'} preview`}
                                                        style={{ maxHeight: '70vh' }}
                                                    />
                                                </a>
                                            ) : (
                                                <img
                                                    src={imageUrl}
                                                    className="w-full max-w-full h-auto object-contain rounded-lg shadow-sm"
                                                    alt={`${resumeData?.companyName || 'Resume'} preview`}
                                                    style={{ maxHeight: '70vh' }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-tertiary)] p-8">
                                            <img src="/icons/info.svg" alt="" className="w-12 h-12 opacity-30 mb-3" />
                                            <p>Preview not available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Overall Score Card */}
                            <div className="card-elevated p-6">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Overall Score</h3>
                                        <p className="text-[var(--color-text-tertiary)] text-sm mt-0.5">Combined across all categories</p>
                                    </div>
                                    <ScoreRing score={overallScore} size={80} strokeWidth={8} showLabel={false} />
                                </div>
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <span className={`badge badge-${getScoreColor(overallScore)} text-sm px-3 py-1.5`}>
                                        {getScoreLabel(overallScore)}
                                    </span>
                                    <span className="text-sm text-[var(--color-text-tertiary)]">
                                        Top 15% of applicants
                                    </span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="card p-4 space-y-3">
                                <Link to="/upload" className="btn-outline w-full justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                    </svg>
                                    Scan Another Resume
                                </Link>
                                <Link to="/" className="btn-ghost w-full justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                                    </svg>
                                    Back to Home
                                </Link>
                            </div>
                        </aside>

                        {/* Right Column - Detailed Analysis */}
                        <div className="lg:col-span-7 space-y-6 animate-fade-in stagger-2">
                            {/* Header */}
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--color-text-primary)]">
                                        {resumeData?.companyName || 'Resume'} Analysis
                                    </h1>
                                    {resumeData?.jobTitle && (
                                        <p className="text-[var(--color-brand-600)] font-medium mt-1">{resumeData.jobTitle}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-[var(--color-text-tertiary)]">ATS Score</p>
                                        <p className="font-display font-bold text-2xl text-[var(--color-brand-600)]">{atsScore}/100</p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Section */}
                            <Summary feedback={feedback} />

                            {/* ATS Section */}
                            <ATS
                                score={feedback.ATS?.score ?? 0}
                                suggestions={feedback.ATS?.tips ?? []}
                            />

                            {/* Detailed Categories */}
                            <Details feedback={feedback} />
                        </div>
                    </div>
                </div>
            ) : null}
        </main>
    );
};

export default Resume;
