import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

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

            // Direct or static asset path
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
            className="resume-card animate-in fade-in duration-1000 hover:shadow-lg transition-shadow"
        >
            <div className="resume-card-header">
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    {companyName && (
                        <h2 className="!text-black font-bold break-words truncate">
                            {companyName}
                        </h2>
                    )}
                    {jobTitle && (
                        <h3 className="text-lg break-words text-gray-500 truncate">
                            {jobTitle}
                        </h3>
                    )}
                    {!companyName && !jobTitle && (
                        <h2 className="!text-black font-bold">Resume</h2>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={overallScore} />
                </div>
            </div>
            <div className="gradient-border animate-in fade-in duration-1000 flex-1 flex items-center justify-center overflow-hidden">
                {resumeUrl ? (
                    <img
                        src={resumeUrl}
                        alt={`${companyName || 'Resume'} preview`}
                        className="w-full h-[350px] max-sm:h-[200px] object-cover object-top rounded-xl"
                    />
                ) : (
                    <div className="w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-50 rounded-xl">
                        <img src="/icons/info.svg" alt="Resume preview" className="size-12 opacity-30" />
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ResumeCard;
