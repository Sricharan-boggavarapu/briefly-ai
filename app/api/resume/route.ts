// app/api/resume/route.ts
export const runtime = "nodejs";

import Groq from "groq-sdk";
const PDFParser = require("pdf2json");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return Response.json({ error: "No resume uploaded." });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParser = new PDFParser();

    const text: string = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err: any) => reject(err));
      pdfParser.on("pdfParser_dataReady", (data: any) => {
        let extractedText = "";
        data.Pages.forEach((page: any) => {
          page.Texts.forEach((textBlock: any) => {
            textBlock.R.forEach((t: any) => {
              try {
                extractedText += decodeURIComponent(t.T) + " ";
              } catch {
                extractedText += t.T + " ";
              }
            });
          });
          extractedText += "\n";
        });
        resolve(extractedText.trim());
      });
      pdfParser.parseBuffer(buffer);
    });

    if (!text || text.length < 80) {
      return Response.json({
        error:
          "Could not extract readable text from this PDF. Make sure it is not a scanned image.",
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a senior technical recruiter and ATS expert with 15+ years hiring at top tech companies. 
You evaluate resumes with honest, calibrated scores. 

SCORING CALIBRATION:
- Most resumes score 40–65
- Good resumes with real experience score 65–78
- Only polished, highly quantified, role-aligned resumes score above 80
- Never inflate scores — be a strict but fair evaluator

RESPOND ONLY WITH VALID JSON. No markdown, no explanation outside JSON.`,
        },
        {
          role: "user",
          content: `Analyze this resume and return EXACTLY this JSON structure (no extra fields):

{
  "overallScore": <integer 0–100, sum of category scores>,
  "atsCompatibility": <integer 0–100, how well ATS bots would parse this>,
  "detectedRole": "<job role this person is targeting>",
  "experienceLevel": "<one of: Fresher | Junior | Mid-Level | Senior | Lead>",
  "verdict": "<one honest, direct sentence about this resume's overall quality>",
  "categories": {
    "skills": {
      "score": <0–20>,
      "maxScore": 20,
      "feedback": "<2–3 specific sentences. Mention actual skills listed or what's missing.>"
    },
    "experience": {
      "score": <0–25>,
      "maxScore": 25,
      "feedback": "<2–3 specific sentences. Comment on roles, duration, action verbs, relevance.>"
    },
    "projects": {
      "score": <0–20>,
      "maxScore": 20,
      "feedback": "<2–3 specific sentences. Comment on tech stack, outcomes, depth.>"
    },
    "education": {
      "score": <0–15>,
      "maxScore": 15,
      "feedback": "<1–2 specific sentences about degree, institution, relevance.>"
    },
    "impact": {
      "score": <0–12>,
      "maxScore": 12,
      "feedback": "<2–3 sentences on metrics, numbers, business outcomes. Penalise if none found.>"
    },
    "formatting": {
      "score": <0–8>,
      "maxScore": 8,
      "feedback": "<1–2 sentences on layout, length, readability, section clarity.>"
    }
  },
  "strengths": [
    "<specific strength with evidence from the resume>",
    "<specific strength with evidence from the resume>",
    "<specific strength with evidence from the resume>"
  ],
  "weaknesses": [
    "<specific weakness — what's wrong or missing>",
    "<specific weakness — what's wrong or missing>",
    "<specific weakness — what's wrong or missing>"
  ],
  "topSuggestions": [
    "<very specific, actionable fix #1>",
    "<very specific, actionable fix #2>",
    "<very specific, actionable fix #3>",
    "<very specific, actionable fix #4>"
  ],
  "missingKeywords": ["<kw1>", "<kw2>", "<kw3>", "<kw4>", "<kw5>", "<kw6>"]
}

STRICT RULES:
- overallScore MUST equal the sum of all 6 category scores
- If no measurable achievements exist, impact score ≤ 5
- If skills are a flat tag cloud with no context, skills score ≤ 12
- If projects have no outcomes or stack, projects score ≤ 10

Resume text:
${text}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return Response.json({ error: "No analysis generated." });

    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch {
      return Response.json({ error: "Failed to parse AI response. Please try again." });
    }

    return Response.json({ analysis });
  } catch (error) {
    console.error("Resume API error:", error);
    return Response.json({ error: "Error analyzing resume. Please try again." });
  }
}