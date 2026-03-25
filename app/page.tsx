"use client";

import { useState, useRef } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface CategoryScore {
  score: number;
  maxScore: number;
  feedback: string;
}

interface ResumeAnalysis {
  overallScore: number;
  atsCompatibility: number;
  categories: {
    skills: CategoryScore;
    experience: CategoryScore;
    projects: CategoryScore;
    education: CategoryScore;
    impact: CategoryScore;
    formatting: CategoryScore;
  };
  strengths: string[];
  weaknesses: string[];
  topSuggestions: string[];
  missingKeywords: string[];
  detectedRole: string;
  experienceLevel: string;
  verdict: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getScoreColor(score: number, max: number) {
  const p = score / max;
  if (p >= 0.75) return "#2d6a4f";
  if (p >= 0.5) return "#b5835a";
  return "#9b2226";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Exceptional";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Average";
  if (score >= 40) return "Needs Work";
  return "Poor";
}

function getScoreBadgeStyle(score: number): React.CSSProperties {
  if (score >= 70) return { background: "#d8f3dc", color: "#1b4332", border: "1px solid #74c69d" };
  if (score >= 50) return { background: "#fef3c7", color: "#78350f", border: "1px solid #d97706" };
  return { background: "#fde8e8", color: "#7f1d1d", border: "1px solid #f87171" };
}

// ─── Score Ring ─────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#2d6a4f" : score >= 50 ? "#b5835a" : "#9b2226";

  return (
    <div style={{ position: "relative", width: 136, height: 136 }}>
      <svg width="136" height="136" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="68" cy="68" r={r} fill="none" stroke="#e8e0d0" strokeWidth="9" />
        <circle
          cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#a09080", letterSpacing: 2, marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Category Bar ────────────────────────────────────────────────────────────
function CategoryBar({ label, score, maxScore, feedback }: {
  label: string; score: number; maxScore: number; feedback: string;
}) {
  const [open, setOpen] = useState(false);
  const pct = Math.round((score / maxScore) * 100);
  const color = getScoreColor(score, maxScore);

  return (
    <div style={{ marginBottom: 14 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a7a6a", letterSpacing: 1.5, textTransform: "uppercase", minWidth: 84 }}>
            {label}
          </span>
          <div style={{ flex: 1, height: 6, background: "#e8e0d0", borderRadius: 99 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 1.1s cubic-bezier(.4,0,.2,1)" }} />
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color, fontWeight: 700, minWidth: 36, textAlign: "right" }}>
            {score}<span style={{ color: "#b0a090", fontWeight: 400 }}>/{maxScore}</span>
          </span>
          <span style={{ fontSize: 9, color: "#c0b0a0", marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div style={{ marginTop: 8, marginLeft: 94, paddingLeft: 14, borderLeft: `2px solid ${color}` }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: 13, color: "#6a5a4a", lineHeight: 1.8 }}>{feedback}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [resumeError, setResumeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"summarize" | "resume">("summarize");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const summarize = async () => {
    if (!text.trim()) return;
    setLoading(true); setSummary("");
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setSummary(data.summary || "No summary generated.");
    } catch { setSummary("Something went wrong."); }
    setLoading(false);
  };

  const analyzeResume = async (file: File) => {
    setLoading(true); setResumeAnalysis(null); setResumeError(""); setFileName(file.name);
    const fd = new FormData(); fd.append("resume", file);
    try {
      const res = await fetch("/api/resume", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) setResumeError(data.error);
      else setResumeAnalysis(data.analysis);
    } catch { setResumeError("Error analyzing resume."); }
    setLoading(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) analyzeResume(f);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === "application/pdf") analyzeResume(f);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f5f0e8;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
        }

        ::selection { background: #2d6a4f; color: #f5f0e8; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #ede8dc; }
        ::-webkit-scrollbar-thumb { background: #c0b090; border-radius: 3px; }

        textarea {
          font-family: 'Lora', serif !important;
          resize: vertical;
        }
        textarea:focus { outline: none; border-color: #8a7a5a !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .fade-up { animation: fadeUp 0.45s ease both; }
        .card-hover {
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .card-hover:hover {
          box-shadow: 0 6px 24px rgba(80,60,20,0.10);
          transform: translateY(-1px);
        }
        .btn-primary:hover { background: #1b4332 !important; }
        .btn-secondary:hover { background: #ede8dc !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "transparent", color: "#2c2010", fontFamily: "'Lora', serif" }}>

        {/* ── HEADER ── */}
        <header style={{
          background: "#2c2010",
          padding: "0 48px",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderBottom: "3px solid #8a6a2a",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "22px 0" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#f5f0e8", letterSpacing: 1, lineHeight: 1 }}>
              Briefly
            </h1>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a6a2a",
              letterSpacing: 3, textTransform: "uppercase", background: "#3d2e10",
              padding: "3px 8px", borderRadius: 2,
            }}>
              AI
            </span>
          </div>
        </header>

        {/* ── HERO STRIP ── */}
        <div style={{
          background: "#ede8dc",
          borderBottom: "1px solid #d8d0c0",
          padding: "28px 48px 0",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2c2010", lineHeight: 1.3 }}>
              {tab === "summarize"
                ? "Distill any text into its essence."
                : "Understand exactly where your resume stands."}
            </h2>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a7a6a", marginTop: 6, letterSpacing: 0.5 }}>
              {tab === "summarize"
                ? "Paste text → get a crisp, accurate summary."
                : "Upload a PDF → get a detailed, honest ATS analysis."}
            </p>
          </div>

          {/* BIG CENTERED TABS */}
          <div style={{ display: "flex", gap: 0, background: "#d8d0c0", borderRadius: "8px 8px 0 0", padding: 4, paddingBottom: 0 }}>
            {(["summarize", "resume"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
                padding: "14px 48px",
                background: tab === t ? "#fff9f0" : "transparent",
                color: tab === t ? "#2c2010" : "#8a7a6a",
                border: "none",
                borderRadius: tab === t ? "6px 6px 0 0" : "6px 6px 0 0",
                cursor: "pointer",
                fontWeight: tab === t ? 500 : 400,
                transition: "all 0.18s",
                boxShadow: tab === t ? "0 -2px 0 #8a6a2a inset" : "none",
              }}>
                {t === "summarize" ? "✦ Summarize" : "✦ Resume"}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <main style={{ maxWidth: 820, margin: "0 auto", padding: "44px 24px 80px" }}>

          {/* ══ SUMMARIZE TAB ══ */}
          {tab === "summarize" && (
            <div className="fade-up">
              <div style={{
                background: "#fff9f0",
                border: "1px solid #d8d0c0",
                borderRadius: 8,
                padding: "28px",
                boxShadow: "0 2px 12px rgba(80,60,20,0.06)",
              }}>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a7a6a", letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                  Your Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={11}
                  placeholder="Paste any article, report, email, or document here..."
                  style={{
                    width: "100%",
                    background: "#fdf8f0",
                    border: "1px solid #d8d0c0",
                    borderRadius: 5,
                    padding: "16px 18px",
                    fontSize: 14,
                    color: "#2c2010",
                    lineHeight: 1.85,
                  }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button
                    className="btn-primary"
                    onClick={summarize}
                    disabled={loading}
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
                      padding: "11px 26px",
                      background: "#2d6a4f", color: "#f5f0e8",
                      border: "none", borderRadius: 4, cursor: loading ? "wait" : "pointer",
                      transition: "background 0.18s",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? "Working…" : "Summarize →"}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => { setText(""); setSummary(""); }}
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
                      padding: "11px 20px",
                      background: "transparent", color: "#8a7a6a",
                      border: "1px solid #d8d0c0", borderRadius: 4, cursor: "pointer",
                      transition: "background 0.18s",
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {summary && (
                <div className="fade-up" style={{
                  marginTop: 20,
                  background: "#fff9f0",
                  border: "1px solid #d8d0c0",
                  borderRadius: 8,
                  padding: "24px 28px",
                  boxShadow: "0 2px 12px rgba(80,60,20,0.06)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a7a6a", letterSpacing: 2, textTransform: "uppercase" }}>
                      Summary
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[
                        { label: "Copy", action: () => navigator.clipboard.writeText(summary) },
                        { label: "Download", action: () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([summary], { type: "text/plain" })); a.download = "summary.txt"; a.click(); } },
                      ].map(({ label, action }) => (
                        <button key={label} onClick={action} className="btn-secondary" style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
                          padding: "6px 14px", background: "transparent", color: "#8a7a6a",
                          border: "1px solid #d8d0c0", borderRadius: 3, cursor: "pointer", transition: "background 0.15s",
                        }}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 15, color: "#3a2a10", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{summary}</p>
                </div>
              )}
            </div>
          )}

          {/* ══ RESUME TAB ══ */}
          {tab === "resume" && (
            <div className="fade-up">

              {/* Drop Zone */}
              {!loading && !resumeAnalysis && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragging ? "#2d6a4f" : "#c0b090"}`,
                    borderRadius: 10,
                    padding: "64px 40px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragging ? "#eef7f2" : "#fff9f0",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 42, marginBottom: 18 }}>📄</div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2c2010", marginBottom: 8 }}>
                    Drop your resume here
                  </p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#a09080", letterSpacing: 1 }}>
                    PDF only · click to browse
                  </p>
                  <input ref={fileRef} type="file" accept=".pdf" onChange={onFileChange} style={{ display: "none" }} />
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div style={{ textAlign: "center", padding: "72px 0" }}>
                  <div style={{
                    width: 36, height: 36, border: "3px solid #e8e0d0",
                    borderTop: "3px solid #2d6a4f", borderRadius: "50%",
                    animation: "spin 0.9s linear infinite",
                    margin: "0 auto 20px",
                  }} />
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a7a6a", letterSpacing: 2, textTransform: "uppercase", animation: "shimmer 1.6s infinite" }}>
                    Analyzing {fileName}…
                  </p>
                </div>
              )}

              {/* Error */}
              {resumeError && (
                <div style={{ padding: "16px 20px", background: "#fde8e8", border: "1px solid #f87171", borderRadius: 6, color: "#7f1d1d", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                  ✗ {resumeError}
                </div>
              )}

              {/* ── RESULTS ── */}
              {resumeAnalysis && !loading && (
                <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Row 1: Score + Meta */}
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16 }}>

                    {/* Score card */}
                    <div className="card-hover" style={{
                      background: "#fff9f0", border: "1px solid #d8d0c0", borderRadius: 8,
                      padding: "24px 16px", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 10,
                      boxShadow: "0 2px 10px rgba(80,60,20,0.06)",
                    }}>
                      <ScoreRing score={resumeAnalysis.overallScore} />
                      <span style={{ ...getScoreBadgeStyle(resumeAnalysis.overallScore), fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 12px", borderRadius: 99 }}>
                        {getScoreLabel(resumeAnalysis.overallScore)}
                      </span>
                    </div>

                    {/* Meta card */}
                    <div className="card-hover" style={{
                      background: "#fff9f0", border: "1px solid #d8d0c0", borderRadius: 8,
                      padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between",
                      boxShadow: "0 2px 10px rgba(80,60,20,0.06)",
                    }}>
                      <div>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#a09080", letterSpacing: 2, textTransform: "uppercase" }}>Detected Role</span>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2c2010", marginTop: 4, lineHeight: 1.3 }}>
                          {resumeAnalysis.detectedRole}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 28, marginTop: 14 }}>
                        <div>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#a09080", letterSpacing: 2, textTransform: "uppercase" }}>Level</span>
                          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#3a2a10", marginTop: 3 }}>{resumeAnalysis.experienceLevel}</p>
                        </div>
                        <div>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#a09080", letterSpacing: 2, textTransform: "uppercase" }}>ATS Score</span>
                          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, marginTop: 3, color: resumeAnalysis.atsCompatibility >= 70 ? "#2d6a4f" : resumeAnalysis.atsCompatibility >= 50 ? "#b5835a" : "#9b2226", fontWeight: 700 }}>
                            {resumeAnalysis.atsCompatibility}/100
                          </p>
                        </div>
                      </div>

                      <div style={{
                        marginTop: 14, padding: "12px 16px",
                        background: "#fdf3e3", border: "1px solid #e8d8b0",
                        borderRadius: 5, borderLeft: "3px solid #8a6a2a",
                      }}>
                        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 13, color: "#5a4020", lineHeight: 1.7 }}>
                          "{resumeAnalysis.verdict}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="card-hover" style={{ background: "#fff9f0", border: "1px solid #d8d0c0", borderRadius: 8, padding: "24px 28px", boxShadow: "0 2px 10px rgba(80,60,20,0.06)" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#a09080", letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 18 }}>
                      Score Breakdown — tap to expand
                    </span>
                    {Object.entries(resumeAnalysis.categories).map(([key, val]) => (
                      <CategoryBar key={key} label={key} score={val.score} maxScore={val.maxScore} feedback={val.feedback} />
                    ))}
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                      { title: "Strengths", items: resumeAnalysis.strengths, accent: "#2d6a4f", bg: "#eef7f2", border: "#74c69d" },
                      { title: "Weaknesses", items: resumeAnalysis.weaknesses, accent: "#9b2226", bg: "#fef2f2", border: "#fca5a5" },
                    ].map(({ title, items, accent, bg, border }) => (
                      <div key={title} className="card-hover" style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "22px 24px", boxShadow: "0 2px 10px rgba(80,60,20,0.04)" }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: accent, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 14 }}>
                          {title}
                        </span>
                        {items.map((item, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                            <span style={{ color: accent, fontSize: 13, lineHeight: 1.8, flexShrink: 0 }}>›</span>
                            <p style={{ fontSize: 13, color: "#3a2a10", lineHeight: 1.75 }}>{item}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Suggestions */}
                  <div className="card-hover" style={{ background: "#fff9f0", border: "1px solid #d8d0c0", borderRadius: 8, padding: "24px 28px", boxShadow: "0 2px 10px rgba(80,60,20,0.06)" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#a09080", letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 18 }}>
                      Top Suggestions
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {resumeAnalysis.topSuggestions.map((tip, i) => (
                        <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 16px", background: "#fdf8f0", border: "1px solid #e8d8b0", borderRadius: 6 }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#b5835a", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <p style={{ fontSize: 13, color: "#3a2a10", lineHeight: 1.75 }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="card-hover" style={{ background: "#fff9f0", border: "1px solid #d8d0c0", borderRadius: 8, padding: "22px 28px", boxShadow: "0 2px 10px rgba(80,60,20,0.06)" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#a09080", letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 14 }}>
                      Missing Keywords
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {resumeAnalysis.missingKeywords.map((kw, i) => (
                        <span key={i} style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 0.5,
                          padding: "5px 12px", background: "#fde8e8",
                          border: "1px solid #fca5a5", borderRadius: 99,
                          color: "#7f1d1d",
                        }}>
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Re-analyze */}
                  <div style={{ textAlign: "center", paddingTop: 8 }}>
                    <button
                      className="btn-secondary"
                      onClick={() => { setResumeAnalysis(null); setFileName(""); fileRef.current?.click(); }}
                      style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                        padding: "10px 24px", background: "transparent", color: "#8a7a6a",
                        border: "1px solid #c0b090", borderRadius: 4, cursor: "pointer", transition: "background 0.15s",
                      }}
                    >
                      ↺ Analyze Another Resume
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: "1px solid #d8d0c0",
          padding: "20px 48px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#ede8dc",
        }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: "#2c2010" }}>
            Briefly<span style={{ color: "#8a6a2a" }}>.</span>
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#a09080", letterSpacing: 1 }}>
            Built by{" "}
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#2c2010", letterSpacing: 0.5 }}>
              Sricharan Boggavarapu
            </span>
          </span>
        </footer>
      </div>
    </>
  );
}