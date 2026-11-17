import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
import { Link } from "react-router";

interface FSItem {
    id?: string;
    name: string;
    path: string;
}

const WipeApp = () => {
    const { fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [isWiping, setIsWiping] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');

    const loadFiles = async () => {
        try {
            const dirFiles = (await fs.readDir("./")) as FSItem[] | undefined;
            setFiles(Array.isArray(dirFiles) ? dirFiles : []);
        } catch (err) {
            console.error("Failed to read directory:", err);
            setFiles([]);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const handleDelete = async () => {
        setIsWiping(true);
        setStatusMessage('Deleting all stored data...');
        setStatusType('info');
        try {
            if (files.length > 0) {
                await Promise.all(
                    files.map(async (file) => {
                        try {
                            await fs.delete(file.path);
                        } catch (err) {
                            console.error(`Failed to delete ${file.path}:`, err);
                        }
                    })
                );
            }
            await kv.flush();
            setStatusMessage('All app data and files wiped successfully.');
            setStatusType('success');
            await loadFiles();
        } catch (err: any) {
            setStatusMessage(`Error wiping data: ${err?.message || err}`);
            setStatusType('error');
        } finally {
            setIsWiping(false);
        }
    };

    const getStatusStyles = () => {
        switch (statusType) {
            case 'success':
                return 'bg-[var(--color-accent-50)] border-[var(--color-accent-200)] text-[var(--color-accent-700)]';
            case 'error':
                return 'bg-[var(--color-error-50)] border-[var(--color-error-200)] text-[var(--color-error-700)]';
            default:
                return 'bg-[var(--color-brand-50)] border-[var(--color-brand-200)] text-[var(--color-brand-700)]';
        }
    };

    return (
        <main className="min-h-screen bg-[var(--color-bg-secondary)]">
            <Navbar />
            <div className="pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8 animate-fade-in">
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-text-primary)] mb-2">Clear Local Data</h1>
                        <p className="text-[var(--color-text-secondary)]">
                            Permanently delete all stored resumes, files, and analysis data from your browser's local storage.
                        </p>
                    </div>

                    {statusMessage && (
                        <div className={`p-4 rounded-xl border text-sm mb-6 animate-slide-down flex items-start gap-3 ${getStatusStyles()}`} role="alert">
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                {statusType === 'success' && (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                )}
                                {statusType === 'error' && (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                )}
                                {statusType === 'info' && (
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                )}
                            </svg>
                            <span>{statusMessage}</span>
                        </div>
                    )}

                    <div className="card animate-fade-in stagger-2">
                        <div className="p-4 border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Files in Local Storage</h2>
                        </div>
                        <div className="p-4">
                            {files.length === 0 ? (
                                <div className="text-center py-8">
                                    <img src="/icons/info.svg" alt="" className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                    <p className="text-[var(--color-text-tertiary)]">No files found in local storage.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {files.map((file) => (
                                        <div key={file.id || file.path} className="flex flex-row items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-[var(--color-bg-secondary)] border-b last:border-b-0 border-[var(--color-border-light)]">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-600)] flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-[var(--color-text-primary)] truncate">{file.name}</p>
                                                    <p className="text-xs text-[var(--color-text-tertiary)] truncate">{file.path}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 animate-fade-in stagger-3">
                        <div className="card p-4 bg-[var(--color-error-50)] border-[var(--color-error-200)]">
                            <div className="flex items-start gap-3 mb-4">
                                <svg className="w-5 h-5 text-[var(--color-error-500)] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-[var(--color-error-700)]">Danger Zone</h3>
                                    <p className="text-sm text-[var(--color-error-600)] mt-1">
                                        This action will permanently delete ALL your resume files, analysis data, and local storage entries.
                                        This cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <button
                                disabled={isWiping || files.length === 0}
                                onClick={handleDelete}
                                className="btn-error btn-lg w-full justify-center gap-2"
                            >
                                {isWiping ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                        </svg>
                                        Wiping...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v10m-5-10h10a2 2 0 012 2v2H3V9a2 2 0 012-2h2"/>
                                        </svg>
                                        Clear All Local Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center animate-fade-in stagger-4">
                        <Link to="/" className="btn-ghost">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default WipeApp;