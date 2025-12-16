"use client";
import { useState } from "react";
import UploadArea from "./components/Upload";

export default function Home() {
  const [status, setStatus] = useState("idle");
  const [resultUrl, setResultUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);


  const handleImageUpload = async (file) => {
    setStatus("loading");
    setUploadedImage(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setResultUrl(data.url);
      setStatus("success");

    } catch (error) {
      console.error(error);
      alert("Something went wrong! Is the backend running?");
      setStatus("idle");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResultUrl(null);
    setUploadedImage(null);
  };

  return (
    <main className="min-h-screen bg-[conic-gradient(at_top,var(--tw-gradient-stops))] from-indigo-200 via-purple-200 to-pink-200 flex flex-col items-center justify-center p-4 md:p-8 font-sans text-slate-800 selection:bg-purple-300">

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="text-center mb-10 max-w-2xl relative z-10">
        <span className="inline-block py-1 px-3 rounded-full bg-white/40 border border-white/50 backdrop-blur-md text-purple-700 text-xs font-bold tracking-wider mb-4 shadow-sm">
          ✨ AI STORYBOOK MAKER
        </span>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-linear-to-r from-violet-600 via-fuchsia-600 to-pink-600 drop-shadow-sm">
          Make it Magical.
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          Upload a photo and watch your child become the hero of the story.
        </p>
      </div>

      <div className="w-full max-w-5xl bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 md:p-12 relative overflow-hidden">

        {status === "idle" && (
          <div className="animate-fade-in-up">
            <UploadArea onImageSelected={handleImageUpload} isLoading={false} />
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 animate-pulse">
            <div className="relative">
              <div className="absolute -inset-1 bg-linear-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mt-8">Weaving the spell...</h2>
            <p className="text-slate-500 mt-2">Our AI artists are painting the scene.</p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-center">

              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Original</h3>
                <div className="aspect-3/4 rounded-2xl overflow-hidden shadow-inner bg-slate-100 border-4 border-white transform -rotate-2 transition-transform hover:rotate-0 duration-300">
                  <img src={uploadedImage} className="w-full h-full object-cover" alt="Original" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-purple-500 uppercase tracking-widest pl-2 flex items-center gap-1">
                  ✨ The Masterpiece
                </h3>
                <div className="aspect-3/4 rounded-2xl overflow-hidden shadow-2xl bg-slate-100 border-4 border-white/80 ring-4 ring-purple-200 transform -rotate-2 transition-transform hover:scale-[1.02] duration-500">
                  <img src={resultUrl} className="w-full h-full object-cover" alt="Generated" />
                </div>
              </div>

            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={reset}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Try Again
              </button>
              <a
                href={resultUrl}
                download="magic-story.jpg"
                target="_blank"
                className="px-8 py-3 rounded-xl font-bold text-white bg-linear-to-r from-violet-600 to-fuchsia-600 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 transition-all"
              >
                Download Art
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}