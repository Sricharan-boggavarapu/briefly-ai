"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [resumeResult, setResumeResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("summarize");

  const summarizeText = async () => {
    if (!text.trim()) {
      setSummary("Please enter text to summarize.");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setSummary(data.summary || "No summary generated.");
    } catch (err) {
      console.error(err);
      setSummary("Something went wrong.");
    }

    setLoading(false);
  };

  const clearText = () => {
    setText("");
    setSummary("");
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  const analyzeResume = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setResumeResult("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResumeResult(data.analysis || "No feedback generated.");
    } catch (err) {
      console.error(err);
      setResumeResult("Error analyzing resume.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-10">

      {/* HEADER */}
      <h1 className="text-5xl font-bold mb-2">Briefly AI</h1>
      <p className="text-gray-400 mb-8">
        AI Text Summarizer & Resume Analyzer
      </p>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("summarize")}
          className={`px-5 py-2 rounded-lg transition ${
            tab === "summarize"
              ? "bg-white text-black"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          Text Summarizer
        </button>

        <button
          onClick={() => setTab("resume")}
          className={`px-5 py-2 rounded-lg transition ${
            tab === "resume"
              ? "bg-white text-black"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          Resume Analyzer
        </button>
      </div>

      {/* TEXT SUMMARIZER */}
      {tab === "summarize" && (
        <div className="bg-gray-900 p-6 rounded-xl w-full max-w-xl shadow-lg">

          <textarea
            className="w-full p-4 text-lg rounded bg-black border border-gray-700 text-white mb-4 resize-none"
            rows={10}
            placeholder="Paste text to summarize..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex gap-3 mb-4">
            <button
              onClick={summarizeText}
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              {loading ? "⚡ Generating..." : "Summarize"}
            </button>

            <button
              onClick={clearText}
              className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Clear
            </button>
          </div>

          {summary && (
            <div className="mt-4 bg-black p-4 rounded border border-gray-700">
              <h3 className="font-semibold mb-2">Summary</h3>

              <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-line mb-4">
                {summary}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(summary)}
                  className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition"
                >
                  Copy
                </button>

                <button
                  onClick={downloadSummary}
                  className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESUME ANALYZER */}
      {tab === "resume" && (
        <div className="bg-gray-900 p-6 rounded-xl w-full max-w-xl shadow-lg flex flex-col items-center">

          <label className="cursor-pointer bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition mb-4">
            Choose Resume
            <input
              type="file"
              accept=".pdf"
              onChange={analyzeResume}
              className="hidden"
            />
          </label>

          {loading && (
            <p className="text-gray-400 mb-4">⚡ Analyzing resume...</p>
          )}

          {resumeResult && (
            <div className="mt-4 bg-black p-4 rounded border border-gray-700 w-full">
              <h3 className="font-semibold mb-2">AI Resume Feedback</h3>
              <p className="text-gray-200 whitespace-pre-line">
                {resumeResult}
              </p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-16 text-sm text-gray-500">
        Developed by{" "}
        <span className="text-white font-medium">
          Sricharan Boggavarapu
        </span>
      </footer>

    </main>
  );
}