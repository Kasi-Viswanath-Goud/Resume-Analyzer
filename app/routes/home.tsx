import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Only redirect if Puter has finished loading and user is not authenticated
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate('/auth?next=/');
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  // Load resumes when authenticated
  useEffect(() => {
    let isMounted = true;

    const loadResumes = async () => {
      if (!auth.isAuthenticated) {
        if (isMounted) setLoadingResumes(false);
        return;
      }

      setLoadingResumes(true);
      try {
        const items = (await kv.list('resume:*', true)) as KVItem[] | undefined;
        if (!items || !Array.isArray(items)) {
          if (isMounted) {
            setResumes([]);
            setLoadingResumes(false);
          }
          return;
        }

        const parsedResumes = items
          .map((item) => {
            try {
              return typeof item.value === 'string'
                ? (JSON.parse(item.value) as Resume)
                : (item.value as Resume);
            } catch (e) {
              console.error('Failed to parse resume item:', e);
              return null;
            }
          })
          .filter((r): r is Resume => Boolean(r && r.id));

        if (isMounted) {
          setResumes(parsedResumes);
        }
      } catch (err) {
        console.error('Failed to load resumes:', err);
      } finally {
        if (isMounted) setLoadingResumes(false);
      }
    };

    if (auth.isAuthenticated) {
      loadResumes();
    } else if (!isLoading) {
      setLoadingResumes(false);
    }

    return () => {
      isMounted = false;
    };
  }, [auth.isAuthenticated, isLoading, kv]);

  const showLoading = isLoading || (auth.isAuthenticated && loadingResumes);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!showLoading && resumes.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {showLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src="/images/resume-scan-2.gif"
              className="w-[200px]"
              alt="Loading resumes..."
            />
            <p className="text-gray-500 mt-4 text-lg">Loading your resumes...</p>
          </div>
        )}

        {!showLoading && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!showLoading && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-6 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold px-8 py-3"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
