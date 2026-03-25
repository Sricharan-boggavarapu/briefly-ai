// app/api/route.ts
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 20) {
      return Response.json({ summary: "Please provide more text to summarize." });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const wordCount = text.trim().split(/\s+/).length;
    const isLong = wordCount > 300;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.15,
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: `You are a precise, expert summarizer. Your summaries are:
- Accurate: only facts present in the original text
- Concise: no filler, no repetition
- Clear: plain language, active voice
- Complete: capture the most important ideas
Never add opinions, external knowledge, or assumptions.`,
        },
        {
          role: "user",
          content: isLong
            ? `Summarize the following text in 3–5 clear bullet points, each starting with "•". Capture the key ideas, findings, and conclusions.\n\nText:\n${text}`
            : `Summarize the following text in 2–3 concise sentences. Be direct and accurate.\n\nText:\n${text}`,
        },
      ],
    });

    const summary =
      completion.choices?.[0]?.message?.content || "No summary generated.";

    return Response.json({ summary });
  } catch (error) {
    console.error("Summarize API error:", error);
    return Response.json(
      { summary: "Error generating summary. Please try again." },
      { status: 500 }
    );
  }
}