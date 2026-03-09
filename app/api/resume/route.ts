export const runtime = "nodejs";

import Groq from "groq-sdk";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return Response.json({ analysis: "No resume uploaded." });
    }

    const arrayBuffer = await file.arrayBuffer();

    // Load PDF WITHOUT worker (important for Node)
    const pdf = await pdfjs.getDocument({
  data: arrayBuffer,
} as any).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map((item: any) => item.str);
      text += strings.join(" ") + "\n";
    }

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
        "You are an expert resume reviewer. Analyze the resume objectively based only on the provided text. Do not assume or invent missing information."
    },
    {
      role: "user",
      content: `
Analyze the following resume and provide:

1. Resume score out of 100
2. Key strengths
3. Areas for improvement
4. Specific suggestions to improve the resume

Only use information present in the resume text.

Resume:
${text}
`
    }
  ]
});

    const analysis = completion.choices[0]?.message?.content;

    return Response.json({
      analysis: analysis || "No analysis generated."
    });

  } catch (error) {
    console.error("Resume API error:", error);

    return Response.json({
      analysis: "Error analyzing resume."
    });
  }
}