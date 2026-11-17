import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router";

export const meta = () => [
    { title: 'Resumind | Sign In' },
    { name: 'description', content: 'Sign in to Resumind to access your resume analysis dashboard and ATS optimization tools.' },
];

const Auth = () => {
    const { isLoading, auth, error } = usePuterStore();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next') || '/';

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate(next, { replace: true });
        }
    }, [auth.isAuthenticated, next, navigate]);

    return (
        <main className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                {/* Back link */}
                <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-600)] transition-colors mb-8">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back to Resumind
                </Link>

                <div className="card-elevated p-8 md:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-brand-700)]" aria-label="Resumind Home">
                            <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <rect width="32" height="32" rx="8" fill="currentColor"/>
                                <path d="M8 12h16M8 16h12M8 20h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                            <span className="font-display font-bold text-2xl">Resumind</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-[var(--color-text-secondary)]">
                            Sign in to continue optimizing your resume for ATS
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-error-50)] border border-[var(--color-error-200)] mb-6 animate-slide-down" role="alert">
                            <svg className="w-5 h-5 text-[var(--color-error-500)] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            <p className="text-[var(--color-error-700)] font-medium">{error}</p>
                        </div>
                    )}

                    {/* Auth button */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <button className="btn-primary btn-lg w-full justify-center gap-2 animate-pulse cursor-not-allowed opacity-80" disabled>
                                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                                <span>Checking authentication...</span>
                            </button>
                        ) : auth.isAuthenticated ? (
                            <button
                                onClick={auth.signOut}
                                className="btn-secondary btn-lg w-full justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                Log Out
                            </button>
                        ) : (
                            <button
                                onClick={auth.signIn}
                                className="btn-primary btn-xl w-full justify-center gap-3"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <rect width="32" height="32" rx="8" fill="#4F46E5"/>
                                    <path d="M8 12h16M8 16h12M8 20h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                                </svg>
                                <span>Sign In with Puter</span>
                            </button>
                        )}

                        {/* Benefits */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border-light)]">
                            {[
                                { icon: 'shield', label: 'Secure' },
                                { icon: 'lock', label: 'Private' },
                                { icon: 'zap', label: 'Fast' },
                            ].map((item, index) => (
                                <div key={index} className="flex flex-col items-center gap-1.5 text-center">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center">
                                        {item.icon === 'shield' && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                        )}
                                        {item.icon === 'lock' && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                            </svg>
                                        )}
                                        {item.icon === 'zap' && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-[var(--color-text-tertiary)]">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-[var(--color-text-tertiary)]">
                        By continuing, you agree to our{' '}
                        <Link to="#" className="text-[var(--color-brand-600)] hover:underline">Terms of Service</Link>{' '}
                        and{' '}
                        <Link to="#" className="text-[var(--color-brand-600)] hover:underline">Privacy Policy</Link>
                    </p>
                </div>

                {/* Trust badge */}
                <div className="text-center mt-6 text-sm text-[var(--color-text-muted)]">
                    <p>Trusted by job seekers at Google, Microsoft, Amazon, Apple, Meta, Netflix</p>
                </div>
            </div>
        </main>
    );
};

export default Auth;