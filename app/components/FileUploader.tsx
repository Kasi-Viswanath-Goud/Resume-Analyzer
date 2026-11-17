import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '../lib/utils';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
    maxSize?: number;
}

const FileUploader = ({ onFileSelect, maxSize = 20 * 1024 * 1024 }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: any[]) => {
            setError(null);
            setDragActive(false);

            if (fileRejections.length > 0) {
                const rejection = fileRejections[0];
                if (rejection.errors?.[0]?.code === 'file-too-large') {
                    setError(`File exceeds maximum size of ${formatSize(maxSize)}`);
                } else {
                    setError('Please upload a valid PDF document');
                }
                return;
            }

            const selected = acceptedFiles[0] || null;
            setFile(selected);
            onFileSelect?.(selected);
        },
        [onFileSelect, maxSize]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize,
        onDragEnter: () => setDragActive(true),
        onDragLeave: () => setDragActive(false),
    });

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setFile(null);
        setError(null);
        onFileSelect?.(null);
    };

    const handleClick = () => {
        // Trigger file input click when clicking the dropzone (but not on the remove button)
    };

    if (file) {
        return (
            <div className="w-full">
                <div className="card p-4">
                    <div className="flex items-center gap-4 p-3 bg-[var(--color-bg-secondary)] rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-600)] flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--color-text-primary)] truncate">{file.name}</p>
                            <p className="text-sm text-[var(--color-text-tertiary)]">{formatSize(file.size)} • PDF</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-2 rounded-lg hover:bg-[var(--color-neutral-200)] text-[var(--color-text-tertiary)] hover:text-[var(--color-error-500)] transition-colors"
                            aria-label="Remove file"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
                {error && (
                    <p className="text-sm text-[var(--color-error-600)] mt-2 flex items-center gap-1" role="alert">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
                    dropzone relative p-8 md:p-10 text-center cursor-pointer
                    ${isDragActive ? 'dropzone-active' : ''}
                    ${error ? 'dropzone-error' : ''}
                `}
                role="button"
                tabIndex={0}
                aria-label="Upload resume PDF"
            >
                <input {...getInputProps()} />
                <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200"
                        style={{
                            background: isDragActive ? 'var(--color-brand-100)' : 'var(--color-neutral-100)',
                            color: isDragActive ? 'var(--color-brand-600)' : 'var(--color-neutral-400)',
                        }}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-lg font-medium text-[var(--color-text-primary)]">
                            {isDragActive ? 'Drop your PDF here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                            PDF format only • Max {formatSize(maxSize)}
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border-light)]">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            Secure & private
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            Instant analysis
                        </span>
                    </div>
                </div>
            </div>
            {error && (
                <p className="text-sm text-[var(--color-error-600)] mt-2 flex items-center justify-center gap-1" role="alert">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default FileUploader;