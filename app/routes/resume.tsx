import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => [
    { title: 'Resumind | Review' },
    { name: 'description', content: 'Detailed overview of your resume' },
];

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    // Redirect to auth if not authenticated after loading finishes
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate(`/auth?next=/resume/${id}`);
        }
    }, [isLoading, auth.isAuthenticated, id, navigate]);

    // Load resume data once user is authenticated
    useEffect(() => {
        if (!auth.isAuthenticated || !id) {
            if (!isLoading && !auth.isAuthenticated) {
                setLoadingData(false);
            }
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
                        setErrorMessage('Resume not found. It may have been deleted.');
                        setLoadingData(false);
                    }
                    return;
                }

                const data = typeof resumeDataStr === 'string'
                    ? JSON.parse(resumeDataStr)
                    : resumeDataStr;

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
                                createdImageUrl = URL.createObjectURL(imageBlob);
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
    }, [id, auth.isAuthenticated, isLoading, kv, fs]);

    const showLoading = isLoading || loadingData;

    return (
        <main className="!pt-0 min-h-screen">
            <nav className="resume-nav">
                <Link to="/" className="back-button hover:bg-gray-50 transition-colors">
                    <img src="/icons/back.svg" alt="Back" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            {errorMessage ? (
                <div className="flex flex-col items-center justify-center p-12 gap-4">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center font-medium max-w-md">
                        {errorMessage}
                    </div>
                    <Link to="/" className="primary-button w-fit px-6 py-2">
                        Return to Homepage
                    </Link>
                </div>
            ) : (
                <div className="flex flex-row w-full max-lg:flex-col-reverse">
                    {/* Left preview section */}
                    <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover min-h-[500px] lg:h-[100vh] lg:sticky lg:top-0 items-center justify-center">
                        {imageUrl ? (
                            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 max-h-[85%] w-fit">
                                {resumeUrl ? (
                                    <a
                                        href={resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Click to open full PDF in new tab"
                                        className="block cursor-pointer"
                                    >
                                        <img
                                            src={imageUrl}
                                            className="w-full h-full max-h-[80vh] object-contain rounded-2xl shadow-sm hover:opacity-95 transition-opacity"
                                            alt="Resume preview"
                                        />
                                    </a>
                                ) : (
                                    <img
                                        src={imageUrl}
                                        className="w-full h-full max-h-[80vh] object-contain rounded-2xl shadow-sm"
                                        alt="Resume preview"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 p-8">
                                <img src="/icons/info.svg" alt="Info" className="size-16 opacity-30 mb-2" />
                                <p>Loading resume preview...</p>
                            </div>
                        )}
                    </section>

                    {/* Right details section */}
                    <section className="feedback-section">
                        <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                        {showLoading && !feedback ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <img
                                    src="/images/resume-scan-2.gif"
                                    className="w-full max-w-xs"
                                    alt="Analyzing resume"
                                />
                                <p className="text-gray-500 mt-4 text-lg">Retrieving analysis...</p>
                            </div>
                        ) : feedback ? (
                            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                                <Summary feedback={feedback} />
                                <ATS
                                    score={feedback.ATS?.score ?? 0}
                                    suggestions={feedback.ATS?.tips ?? []}
                                />
                                <Details feedback={feedback} />
                            </div>
                        ) : null}
                    </section>
                </div>
            )}
        </main>
    );
};

export default Resume;
