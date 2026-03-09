"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [resumeResult, setResumeResult] = useState("");
  const [tab, setTab] = useState("summarize");

  const summarizeText = async () => {
    const res = await fetch("/api", {
      method: "POST",
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setSummary(data.summary);
  };

  const analyzeResume = async (e:any) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch("/api/resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResumeResult(data.analysis);
  };

  return (
    <main className="min-h-screen bg-black text-white p-10 flex flex-col items-center">

      <h1 className="text-5xl font-bold mb-2">Briefly AI</h1>

      <p className="text-gray-300 mb-10">
        Summarize text and analyze resumes instantly with AI
      </p>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("summarize")}
          className={`px-4 py-2 rounded ${
            tab === "summarize" ? "bg-white text-black" : "bg-gray-800"
          }`}
        >
          Text Summarizer
        </button>

        <button
          onClick={() => setTab("resume")}
          className={`px-4 py-2 rounded ${
            tab === "resume" ? "bg-white text-black" : "bg-gray-800"
          }`}
        >
          Resume Analyzer
        </button>
      </div>

      {/* TEXT SUMMARIZER */}
      {tab === "summarize" && (
        <div className="bg-gray-900 p-6 rounded-xl shadow-md w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-4">Text Summarizer</h2>

          <textarea
            className="w-full border border-gray-700 bg-black text-white p-3 rounded mb-4"
            rows={6}
            placeholder="Paste text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={summarizeText}
            className="bg-white text-black px-4 py-2 rounded"
          >
            Summarize
          </button>

          {summary && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-gray-200">{summary}</p>
            </div>
          )}
        </div>
      )}

      {/* RESUME ANALYZER */}
      {tab === "resume" && (
        <div className="bg-gray-900 p-6 rounded-xl shadow-md w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-4">Resume Analyzer</h2>

          <input
            type="file"
            accept=".pdf"
            onChange={analyzeResume}
            className="mb-4"
          />

          {resumeResult && (
            <div className="mt-6 text-gray-200 whitespace-pre-line">
              {resumeResult}
            </div>
          )}
        </div>
      )}
    </main>
  );
}