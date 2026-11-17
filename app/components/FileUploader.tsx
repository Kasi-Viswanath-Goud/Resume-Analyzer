import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '../lib/utils';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: any[]) => {
            setError(null);
            if (fileRejections.length > 0) {
                const rejection = fileRejections[0];
                if (rejection.errors?.[0]?.code === 'file-too-large') {
                    setError(`File exceeds maximum size of ${formatSize(maxFileSize)}`);
                } else {
                    setError('Please upload a valid PDF document');
                }
                return;
            }

            const selected = acceptedFiles[0] || null;
            setFile(selected);
            onFileSelect?.(selected);
        },
        [onFileSelect, maxFileSize]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
    });

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setFile(null);
        setError(null);
        onFileSelect?.(null);
    };

    return (
        <div className="w-full">
            <div className="gradient-border w-full">
                <div {...getRootProps()} className="uploader-drag-area">
                    <input {...getInputProps()} />

                    <div className="space-y-4 cursor-pointer">
                        {file ? (
                            <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                                <img src="/images/pdf.png" alt="pdf" className="size-10" />
                                <div className="flex items-center space-x-3 flex-1 min-w-0 text-left">
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="p-2 cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
                                    onClick={handleRemove}
                                    title="Remove file"
                                >
                                    <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                    <img src="/icons/info.svg" alt="upload" className="size-20" />
                                </div>
                                <p className="text-lg text-gray-500">
                                    <span className="font-semibold text-gray-800">
                                        {isDragActive ? 'Drop your PDF here' : 'Click to upload'}
                                    </span>{' '}
                                    {!isDragActive && 'or drag and drop'}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">PDF (max {formatSize(maxFileSize)})</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-2 px-1 font-medium">{error}</p>
            )}
        </div>
    );
};

export default FileUploader;
