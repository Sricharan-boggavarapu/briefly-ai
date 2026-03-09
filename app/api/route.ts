import OpenAI from "openai";

export async function POST(req: Request) {
  const { text } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Summarize the following text briefly.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return Response.json({
    summary: completion.choices[0].message.content,
  });
}