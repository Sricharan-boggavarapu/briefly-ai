import OpenAI from "openai";
import pdf from "pdf-parse";

export async function POST(req: Request) {

  const formData = await req.formData();
  const file = formData.get("resume") as File;

  const buffer = Buffer.from(await file.arrayBuffer());

  const data = await pdf(buffer);

  const resumeText = data.text;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Analyze this resume. Give resume score out of 100 and suggestions for improvement.",
      },
      {
        role: "user",
        content: resumeText,
      },
    ],
  });

  return Response.json({
    analysis: completion.choices[0].message.content,
  });
}