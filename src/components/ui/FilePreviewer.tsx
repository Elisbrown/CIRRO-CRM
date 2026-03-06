"use client";

import { X, Download, FileText, ImageIcon, File as FileIcon, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface FilePreviewerProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
    mimeType: string;
}

export function FilePreviewer({ isOpen, onClose, fileUrl, fileName, mimeType }: FilePreviewerProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setIsMounted(false), 300);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isMounted && !isOpen) return null;

    const isImage = mimeType.startsWith("image/") ||
        /\.(png|jpg|jpeg|svg|gif|webp|avif|heif|heic)$/i.test(fileName);
    const isPDF = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
    const isVideo = mimeType.startsWith("video/") || /\.(mp4|webm|ogg)$/i.test(fileName);
    const isAudio = mimeType.startsWith("audio/") || /\.(mp3|wav|ogg)$/i.test(fileName);
    const isText = mimeType.startsWith("text/") || /\.(txt|md|json|log)$/i.test(fileName);
    const isWord = mimeType.includes("wordprocessingml.document") ||
        mimeType.includes("msword") ||
        /\.(docx?|doc)$/i.test(fileName);

    const [hasError, setHasError] = useState(false);
    const [textContent, setTextContent] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && isText) {
            fetch(fileUrl)
                .then(res => res.text())
                .then(text => setTextContent(text))
                .catch(err => console.error("Failed to load text content:", err));
        } else if (!isOpen) {
            setTextContent(null);
            setHasError(false);
        }
    }, [isOpen, isText, fileUrl]);

    const handleDownload = () => {
        try {
            const link = document.createElement("a");
            link.href = fileUrl;
            link.setAttribute("download", fileName);
            link.setAttribute("target", "_blank");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Download failed:", err);
            window.open(fileUrl, "_blank");
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                onClick={onClose}
            />

            {/* Content Container */}
            <div className={`relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ${isOpen ? "scale-100" : "scale-95"
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-white rounded-lg border border-gray-200">
                            {isImage ? (
                                <ImageIcon className="w-5 h-5 text-blue-500" />
                            ) : isPDF ? (
                                <FileText className="w-5 h-5 text-red-500" />
                            ) : (
                                <FileIcon className="w-5 h-5 text-gray-500" />
                            )}
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{fileName}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Viewer Body */}
                <div className="flex-1 bg-gray-100/50 overflow-auto flex items-center justify-center p-8 min-h-[400px]">
                    {isImage && !hasError ? (
                        <img
                            src={fileUrl}
                            alt={fileName}
                            onError={() => setHasError(true)}
                            className="max-w-full max-h-full object-contain rounded shadow-lg bg-white animate-in fade-in duration-500"
                        />
                    ) : isPDF ? (
                        <iframe
                            src={`${fileUrl}#toolbar=0`}
                            className="w-full h-full border-0 rounded bg-white shadow-inner min-h-[600px]"
                            title={fileName}
                        />
                    ) : isVideo ? (
                        <video controls className="max-w-full max-h-full rounded shadow-xl bg-black">
                            <source src={fileUrl} type={mimeType} />
                            Your browser does not support the video tag.
                        </video>
                    ) : isAudio ? (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Activity className="w-10 h-10 text-blue-500" />
                            </div>
                            <h4 className="text-xl font-bold mb-4">{fileName}</h4>
                            <audio controls className="w-full max-w-md mx-auto">
                                <source src={fileUrl} type={mimeType} />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    ) : isText && textContent ? (
                        <div className="w-full h-full bg-white rounded border border-gray-200 p-6 overflow-auto shadow-inner">
                            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {textContent}
                            </pre>
                        </div>
                    ) : (hasError && isImage) || isWord || !isImage ? (
                        <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-200 max-w-md animate-in fade-in zoom-in duration-300">
                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 relative ${isWord ? "bg-blue-50" : "bg-gray-50"
                                }`}>
                                {isWord ? (
                                    <FileText className="w-10 h-10 text-blue-500" />
                                ) : (
                                    <FileIcon className="w-10 h-10 text-gray-400" />
                                )}
                                <div className={`absolute -bottom-1 -right-1 bg-white p-1 rounded-full border shadow-sm ${isWord ? "border-blue-100" : "border-gray-100"
                                    }`}>
                                    <div className={`w-4 h-4 rounded-full ${isWord ? "bg-blue-500" : "bg-gray-300"}`} />
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2 font-display">
                                {isWord ? "Word Document" : hasError ? "Unable to Load Image" : "No Preview Available"}
                            </h4>
                            <p className="text-gray-500 mb-8 px-4">
                                {isWord
                                    ? "Microsoft Word files cannot be previewed directly in the browser."
                                    : hasError
                                        ? "The image could not be loaded. This might be due to a server error or an invalid file path."
                                        : `This file type (${mimeType || 'unknown'}) cannot be previewed directly.`}
                                {" "}Please download it to view the content.
                            </p>
                            <button
                                onClick={handleDownload}
                                className={`w-full justify-center flex items-center gap-2 px-6 py-4 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] group ${isWord ? "bg-blue-600 hover:bg-blue-700" : "bg-black hover:bg-gray-800"
                                    }`}
                            >
                                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                                Download File
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
