import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, error, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [isWiping, setIsWiping] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>('');

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
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading, auth.isAuthenticated, navigate]);

    useEffect(() => {
        if (auth.isAuthenticated) {
            loadFiles();
        }
    }, [auth.isAuthenticated]);

    const handleDelete = async () => {
        setIsWiping(true);
        setStatusMessage('Deleting files and clearing database...');
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
            await loadFiles();
        } catch (err: any) {
            setStatusMessage(`Error wiping data: ${err?.message || err}`);
        } finally {
            setIsWiping(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-600">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <main className="p-8 max-w-2xl mx-auto flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Wipe App Data</h1>
            <p className="text-gray-600">
                Authenticated as: <span className="font-semibold text-gray-800">{auth.user?.username || 'Unknown'}</span>
            </p>

            {statusMessage && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                    {statusMessage}
                </div>
            )}

            <div>
                <h2 className="text-xl font-semibold mb-2">Existing Files in App Storage:</h2>
                {files.length === 0 ? (
                    <p className="text-gray-400 italic">No files found.</p>
                ) : (
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto border p-4 rounded-xl">
                        {files.map((file) => (
                            <div key={file.id || file.path} className="flex flex-row justify-between text-sm py-1 border-b last:border-b-0">
                                <span className="truncate">{file.name}</span>
                                <span className="text-gray-400 text-xs">{file.path}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <button
                    disabled={isWiping}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                    onClick={handleDelete}
                >
                    {isWiping ? 'Wiping...' : 'Wipe All App Data'}
                </button>
            </div>
        </main>
    );
};

export default WipeApp;
