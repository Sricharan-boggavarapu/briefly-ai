export const runtime = "nodejs";

import Groq from "groq-sdk";
const PDFParser = require("pdf2json");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return Response.json({ analysis: "No resume uploaded." });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfParser = new PDFParser();

    const text: string = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err: any) => reject(err));

      pdfParser.on("pdfParser_dataReady", (data: any) => {
        let extractedText = "";

        data.Pages.forEach((page: any) => {
          page.Texts.forEach((text: any) => {
            text.R.forEach((t: any) => {
              try {
  extractedText += decodeURIComponent(t.T) + " ";
} catch {
  extractedText += t.T + " ";
}
            });
          });
          extractedText += "\n";
        });

        resolve(extractedText);
      });

      pdfParser.parseBuffer(buffer);
    });

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 500,
      messages: [
  {
    role: "system",
    content:
      "You are a strict ATS resume evaluator. Score resumes realistically based only on the provided text."
  },
  {
    role: "user",
    content: `
Evaluate this resume using these criteria:

Skills (20 points)
Projects (20 points)
Experience (20 points)
Education (15 points)
Impact / Achievements (15 points)
Formatting / Clarity (10 points)

Calculate a TOTAL SCORE out of 100.

Then provide:

1. Resume Score (0-100)
2. Strengths
3. Weaknesses
4. Suggestions for improvement

Resume text:
${text}
`
  }
]
    });

    const analysis = completion.choices[0]?.message?.content;

    return Response.json({
      analysis: analysis || "No analysis generated.",
    });
  } catch (error) {
    console.error("Resume API error:", error);

    return Response.json({
      analysis: "Error analyzing resume.",
    });
  }
}