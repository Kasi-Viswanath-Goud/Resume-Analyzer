import { type FormEvent, useState, useEffect } from 'react';
import Navbar from '~/components/Navbar';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../../constants';

function parseFeedbackJson(rawText: string): Feedback {
    let clean = rawText.trim();
    if (clean.includes('```')) {
        const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            clean = match[1].trim();
        }
    }

    try {
        return JSON.parse(clean);
    } catch {
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonSubstring = clean.substring(firstBrace, lastBrace + 1);
            return JSON.parse(jsonSubstring);
        }
        throw new Error('Unable to parse AI response as JSON');
    }
}

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { label: 'Upload', description: 'Select your resume PDF' },
        { label: 'Analyze', description: 'AI processes your resume' },
        { label: 'Complete', description: 'View your results' },
    ];

    const processingSteps = [
        { key: 'upload', label: 'Uploading resume...', icon: 'upload' },
        { key: 'convert', label: 'Generating preview...', icon: 'convert' },
        { key: 'prepare', label: 'Preparing analysis...', icon: 'prepare' },
        { key: 'analyze', label: 'AI analyzing content...', icon: 'analyze' },
        { key: 'save', label: 'Saving results...', icon: 'save' },
    ];

    // Auth guard
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate('/auth?next=/upload');
        }
    }, [isLoading, auth.isAuthenticated, navigate]);

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
        if (selectedFile) setErrorMessage('');
    };

    const handleAnalyze = async ({
        companyName,
        jobTitle,
        jobDescription,
        file,
    }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        setIsProcessing(true);
        setErrorMessage('');
        setCurrentStep(0);

        try {
            // Step 1: Upload
            setStatusText('Uploading resume to secure storage...');
            setCurrentStep(0);
            await new Promise(r => setTimeout(r, 500));
            const uploadedFile = await fs.upload([file]);
            const resumePath = Array.isArray(uploadedFile)
                ? uploadedFile[0]?.path
                : (uploadedFile as any)?.path;

            if (!resumePath) {
                throw new Error('Failed to upload resume file.');
            }

            // Step 2: Convert
            setStatusText('Generating resume preview...');
            setCurrentStep(1);
            await new Promise(r => setTimeout(r, 300));
            const imageResult = await convertPdfToImage(file);
            if (!imageResult.file) {
                throw new Error(imageResult.error || 'Failed to convert PDF to preview image.');
            }

            // Step 3: Upload image
            setStatusText('Uploading preview image...');
            setCurrentStep(2);
            await new Promise(r => setTimeout(r, 300));
            const uploadedImage = await fs.upload([imageResult.file]);
            const imagePath = Array.isArray(uploadedImage)
                ? uploadedImage[0]?.path
                : (uploadedImage as any)?.path;

            if (!imagePath) {
                throw new Error('Failed to upload preview image.');
            }

            // Step 4: Prepare
            setStatusText('Preparing analysis data...');
            setCurrentStep(3);
            await new Promise(r => setTimeout(r, 200));
            const uuid = generateUUID();
            const data: any = {
                id: uuid,
                resumePath,
                imagePath,
                companyName: companyName.trim(),
                jobTitle: jobTitle.trim(),
                jobDescription: jobDescription.trim(),
                feedback: null,
            };
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            // Step 5: Analyze
            setStatusText('AI analyzing your resume against the job description...');
            setCurrentStep(4);
            const feedbackResponse = await ai.feedback(
                resumePath,
                prepareInstructions({ jobTitle, jobDescription })
            );

            if (!feedbackResponse) {
                throw new Error('Failed to get feedback from AI.');
            }

            let feedbackRaw = '';
            if (typeof feedbackResponse === 'string') {
                feedbackRaw = feedbackResponse;
            } else if (typeof feedbackResponse === 'object') {
                const messageObj = (feedbackResponse as any).message;
                if (messageObj && messageObj.content) {
                    if (typeof messageObj.content === 'string') {
                        feedbackRaw = messageObj.content;
                    } else if (Array.isArray(messageObj.content) && messageObj.content.length > 0) {
                        feedbackRaw = messageObj.content[0]?.text || messageObj.content[0] || '';
                    }
                } else if ('text' in feedbackResponse && typeof (feedbackResponse as any).text === 'string') {
                    feedbackRaw = (feedbackResponse as any).text;
                } else {
                    feedbackRaw = JSON.stringify(feedbackResponse);
                }
            }

            const parsedFeedback = parseFeedbackJson(feedbackRaw);
            data.feedback = parsedFeedback;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analysis complete! Redirecting to results...');
            setCurrentStep(5);
            await new Promise(r => setTimeout(r, 800));
            navigate(`/resume/${uuid}`);
        } catch (err: any) {
            console.error('Error during resume analysis:', err);
            setErrorMessage(err?.message || 'Failed to complete resume analysis. Please try again.');
            setIsProcessing(false);
            setStatusText('');
            setCurrentStep(0);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        const companyName = (formData.get('company-name') as string) || '';
        const jobTitle = (formData.get('job-title') as string) || '';
        const jobDescription = (formData.get('job-description') as string) || '';

        if (!file) {
            setErrorMessage('Please upload a PDF resume before analyzing.');
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    const ProgressStep = ({ step, index, active, completed }: { step: typeof processingSteps[0]; index: number; active: boolean; completed: boolean }) => (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    completed ? 'bg-[var(--color-accent-500)] text-white' :
                    active ? 'bg-[var(--color-brand-500)] text-white ring-4 ring-[var(--color-brand-100)]' :
                    'bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]'
                }`}>
                    {completed ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                    ) : (
                        <span className="font-bold text-sm">{index + 1}</span>
                    )}
                </div>
                <span className={`text-xs font-medium mt-2 text-center w-24 ${active ? 'text-[var(--color-brand-600)]' : 'text-[var(--color-neutral-500)]'}`}>
                    {step.label}
                </span>
            </div>
            {index < processingSteps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded transition-colors duration-300 ${
                    completed ? 'bg-[var(--color-accent-500)]' : 'bg-[var(--color-neutral-200)]'
                }`}></div>
            )}
        </div>
    );

    return (
        <main className="min-h-screen bg-[var(--color-bg-secondary)]">
            <Navbar />

            <div className="pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-sm font-medium mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            AI-Powered ATS Analysis
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-text-primary)] mb-4">
                            Scan Your Resume Against Any Job
                        </h1>
                        <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
                            Upload your resume and paste a job description. Our AI simulates real ATS scans
                            and gives you a detailed roadmap to optimize for every application.
                        </p>
                    </div>

                    {/* Progress indicator during processing */}
                    {isProcessing && (
                        <div className="card-elevated p-6 mb-8 animate-slide-up" role="status" aria-live="polite">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-600)] flex items-center justify-center animate-pulse-soft">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--color-text-primary)]">Analyzing your resume</p>
                                    <p className="text-sm text-[var(--color-text-tertiary)]">{statusText}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                {processingSteps.map((step, index) => (
                                    <ProgressStep
                                        key={step.key}
                                        step={step}
                                        index={index}
                                        active={index === currentStep && currentStep < processingSteps.length}
                                        completed={index < currentStep}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Form / Results */}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="card-elevated p-6 md:p-8 animate-fade-in" noValidate>
                            {errorMessage && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-error-50)] border border-[var(--color-error-200)] mb-6 animate-slide-down" role="alert">
                                    <svg className="w-5 h-5 text-[var(--color-error-500)] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="text-[var(--color-error-700)] font-medium">{errorMessage}</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Company Name */}
                                <div className="form-group">
                                    <label htmlFor="company-name" className="form-label">
                                        Company Name <span className="text-[var(--color-error-500)]" aria-hidden="true">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="company-name"
                                        id="company-name"
                                        placeholder="e.g., Google, Stripe, Airbnb"
                                        required
                                        className="form-input"
                                        autoComplete="organization"
                                    />
                                    <p className="form-hint">Helps us tailor feedback to the company's culture and keywords</p>
                                </div>

                                {/* Job Title */}
                                <div className="form-group">
                                    <label htmlFor="job-title" className="form-label">
                                        Job Title <span className="text-[var(--color-error-500)]" aria-hidden="true">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="job-title"
                                        id="job-title"
                                        placeholder="e.g., Senior Frontend Developer"
                                        required
                                        className="form-input"
                                        autoComplete="job-title"
                                    />
                                    <p className="form-hint">The exact title from the job posting</p>
                                </div>

                                {/* Job Description */}
                                <div className="form-group">
                                    <label htmlFor="job-description" className="form-label">
                                        Job Description <span className="text-[var(--color-error-500)]" aria-hidden="true">*</span>
                                    </label>
                                    <textarea
                                        rows={6}
                                        name="job-description"
                                        id="job-description"
                                        placeholder="Paste the full job description here. Include requirements, responsibilities, required skills, and preferred qualifications..."
                                        required
                                        className="form-textarea"
                                    />
                                    <p className="form-hint">More detail = better keyword analysis. Paste the entire posting for best results.</p>
                                </div>

                                {/* File Upload */}
                                <div className="form-group">
                                    <label htmlFor="uploader" className="form-label">
                                        Upload Resume (PDF) <span className="text-[var(--color-error-500)]" aria-hidden="true">*</span>
                                    </label>
                                    <FileUploader onFileSelect={handleFileSelect} />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!file}
                                    className="btn-primary btn-lg w-full justify-center gap-2"
                                >
                                    {file ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            Analyze Resume
                                        </>
                                    ) : (
                                        'Upload a PDF to enable analysis'
                                    )}
                                </button>
                            </div>

                            {/* Trust indicators */}
                            <div className="pt-6 border-t border-[var(--color-border-light)]">
                                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--color-text-tertiary)]">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[var(--color-accent-500)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                        <span>PDF only, max 20MB</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[var(--color-accent-500)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                        <span>Results in ~30 seconds</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[var(--color-accent-500)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                        <span>Your data stays private</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Features preview when no file uploaded */}
                    {!isProcessing && !file && (
                        <div className="mt-10 grid md:grid-cols-3 gap-6 animate-fade-in stagger-4">
                            {[
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    ),
                                    title: "ATS Score",
                                    desc: "See how your resume ranks against real ATS criteria",
                                },
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                        </svg>
                                    ),
                                    title: "Keyword Gaps",
                                    desc: "Find missing keywords from the job description",
                                },
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                        </svg>
                                    ),
                                    title: "Actionable Fixes",
                                    desc: "Get specific, prioritized improvements with explanations",
                                },
                            ].map((feature, index) => (
                                <div key={index} className="card p-6 text-center group">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-600)] flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-brand-600)] group-hover:text-white transition-all duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">{feature.title}</h3>
                                    <p className="text-sm text-[var(--color-text-tertiary)]">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Upload;