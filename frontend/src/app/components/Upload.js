"use client";
import { useState } from "react";

export default function UploadArea({ onImageSelected, isLoading }) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageSelected(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onImageSelected(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div
                className={`relative group flex flex-col items-center justify-center w-full h-80 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden
          ${dragActive
                        ? "bg-purple-50 border-2 border-purple-400 scale-[1.02] shadow-xl"
                        : "bg-white/50 border-2 border-dashed border-purple-200 hover:bg-white/80 hover:border-purple-300 hover:shadow-lg"
                    } 
          ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center p-6">

                    {/* Animated Icon */}
                    <div className={`w-20 h-20 mb-6 rounded-full bg-purple-100 flex items-center justify-center transition-transform duration-300 ${dragActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>

                    <p className="mb-2 text-xl font-bold text-slate-700">
                        Drop your photo here
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                        or click to browse from your device
                    </p>

                    <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wide group-hover:bg-purple-200 transition-colors">
                        Upload Image
                    </span>
                </div>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}