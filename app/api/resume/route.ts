export const runtime = "nodejs";

import Groq from "groq-sdk";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return Response.json({ analysis: "No file uploaded." });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

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
      messages: [
        {
          role: "system",
          content:
            "You are a resume analyzer. Provide:\n1. Resume score out of 100\n2. Strengths\n3. Suggestions for improvement."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const analysis = completion.choices[0]?.message?.content;

    return Response.json({
      analysis: analysis || "No analysis generated."
    });

  } catch (error) {
    console.error(error);

    return Response.json({
      analysis: "Error analyzing resume."
    });
  }
}