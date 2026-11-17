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
    // Strip markdown code fences e.g. ```json ... ``` or ``` ... ```
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

        try {
            setStatusText('Uploading resume to Puter...');
            const uploadedFile = await fs.upload([file]);
            const resumePath = Array.isArray(uploadedFile)
                ? uploadedFile[0]?.path
                : (uploadedFile as any)?.path;

            if (!resumePath) {
                throw new Error('Failed to upload resume file.');
            }

            setStatusText('Converting resume to preview image...');
            const imageResult = await convertPdfToImage(file);
            if (!imageResult.file) {
                throw new Error(imageResult.error || 'Failed to convert PDF to preview image.');
            }

            setStatusText('Uploading preview image...');
            const uploadedImage = await fs.upload([imageResult.file]);
            const imagePath = Array.isArray(uploadedImage)
                ? uploadedImage[0]?.path
                : (uploadedImage as any)?.path;

            if (!imagePath) {
                throw new Error('Failed to upload preview image.');
            }

            setStatusText('Preparing analysis data...');
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

            setStatusText('AI is analyzing your resume against the job description...');
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

            setStatusText('Analysis complete! Redirecting...');
            navigate(`/resume/${uuid}`);
        } catch (err: any) {
            console.error('Error during resume analysis:', err);
            setErrorMessage(err?.message || 'Failed to complete resume analysis. Please try again.');
            setIsProcessing(false);
            setStatusText('');
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

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <div className="flex flex-col items-center justify-center my-6">
                                <img
                                    src="/images/resume-scan.gif"
                                    alt="Analyzing resume"
                                    className="w-full max-w-md rounded-2xl"
                                />
                            </div>
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {!isProcessing && (
                        <form
                            id="upload-form"
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 mt-8 w-full max-w-2xl text-left"
                        >
                            {errorMessage && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium w-full text-center">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="form-div">
                                <label htmlFor="company-name" className="font-medium">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company-name"
                                    placeholder="e.g. Google, Stripe"
                                    id="company-name"
                                    required
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-title" className="font-medium">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    name="job-title"
                                    placeholder="e.g. Senior Frontend Developer"
                                    id="job-title"
                                    required
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-description" className="font-medium">
                                    Job Description
                                </label>
                                <textarea
                                    rows={5}
                                    name="job-description"
                                    placeholder="Paste the job description or key requirements here..."
                                    id="job-description"
                                    required
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader" className="font-medium">
                                    Upload Resume
                                </label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button text-lg font-semibold py-3 mt-4" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;
