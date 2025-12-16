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
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-8 text-slate-800">

      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
          StoryBook Magic
        </h1>
        <p className="text-lg text-slate-500">
          Turn your child into the star of the story. Upload a photo and watch the magic happen.
        </p>
      </div>

      {status === "idle" && (
        <div className="w-full animate-fade-in-up">
          <UploadArea onImageSelected={handleImageUpload} isLoading={false} />
        </div>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-64 h-64 bg-slate-200 rounded-xl mb-6 relative overflow-hidden shadow-xl border-4 border-white">
            {uploadedImage && (
              <img src={uploadedImage} className="w-full h-full object-cover opacity-50" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-700">Weaving magic...</h2>
          <p className="text-slate-500">This typically takes about 5-10 seconds.</p>
        </div>
      )}

      {status === "success" && (
        <div className="w-full max-w-5xl animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-400 mb-2 uppercase tracking-wider text-xs">Original Photo</h3>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 relative group">
                <img src={uploadedImage} className="w-full h-full object-cover" alt="Original" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xl border border-blue-100 ring-4 ring-blue-50/50">
              <h3 className="font-semibold text-blue-500 mb-2 uppercase tracking-wider text-xs flex items-center gap-2">
                ✨ Magic Illustration
              </h3>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 relative">
                <img src={resultUrl} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" alt="Generated" />
                <a
                  href={resultUrl}
                  download
                  target="_blank"
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-slate-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-white transition-all"
                >
                  Download HD
                </a>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={reset}
              className="bg-slate-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Make Another Magic Moment
            </button>
          </div>
        </div>
      )}
    </main>
  );
}