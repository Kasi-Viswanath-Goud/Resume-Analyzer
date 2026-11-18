import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useStorage } from "~/lib/storage";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Navbar from "~/components/Navbar";

export const meta = () => [
    { title: 'ResuScore | Resume Analysis Results' },
    { name: 'description', content: 'Detailed overview of your resume analysis with ATS score, keyword matching, and improvement recommendations.' },
];

const Resume = () => {
    const { fs, kv } = useStorage();
    const { id } = useParams();
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
                <div className="max-w-4xl mx-auto">
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
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
                    {/* Score Summary Bar */}
                    <div className="card-elevated p-4 md:p-6 mb-8 animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--color-text-primary)]">
                                        Resume Analysis
                                    </h1>
                                    <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">
                                        Your resume scored <strong className="text-[var(--color-text-primary)]">{overallScore}/100</strong> overall
                                        {resumeData?.companyName && (
                                            <> for <strong className="text-[var(--color-brand-600)]">{resumeData.companyName}</strong> - {resumeData.jobTitle || 'this role'}</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center md:justify-end gap-4 flex-wrap">
                                <div className="text-center">
                                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">Overall Score</p>
                                    <p className={`font-display font-bold text-3xl ${getScoreColor(overallScore) === 'accent' ? 'text-[var(--color-accent-600)]' : getScoreColor(overallScore) === 'warning' ? 'text-[var(--color-warning-600)]' : 'text-[var(--color-error-600)]'}`}>
                                        {overallScore}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">ATS Score</p>
                                    <p className="font-display font-bold text-3xl text-[var(--color-brand-600)]">{atsScore}</p>
                                </div>
                                <span className={`badge badge-${getScoreColor(overallScore)} text-base px-4 py-2 self-center`}>
                                    {getScoreLabel(overallScore)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section - Category Scores */}
                    <Summary feedback={feedback} />

                    {/* ATS Section - Key Recommendations */}
                    <ATS
                        score={feedback.ATS?.score ?? 0}
                        suggestions={feedback.ATS?.tips ?? []}
                    />

                    {/* Detailed Categories - What to Add/Remove/Change */}
                    <Details feedback={feedback} />

                    {/* Actions */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-4">
                        <Link to="/upload" className="btn-primary btn-lg w-full sm:w-auto justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                            Scan Another Resume
                        </Link>
                        <Link to="/" className="btn-outline btn-lg w-full sm:w-auto justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Back to Home
                        </Link>
                    </div>
                </div>
            ) : null}
        </main>
    );
};

export default Resume;