import Groq from "groq-sdk";
const pdf = require("pdf-parse");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return Response.json({ error: "No resume uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);

    const resumeText = data.text;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Analyze this resume briefly. Provide score out of 100 and 3 improvement suggestions."
        },
        {
          role: "user",
          content: resumeText,
        },
      ],
    });

    const analysis = completion.choices[0]?.message?.content;

    return Response.json({
      analysis: analysis || "No suggestions generated",
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Resume analysis failed" },
      { status: 500 }
    );
  }
}