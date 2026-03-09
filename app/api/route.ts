import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

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
      "You are a strict text summarization tool. Only summarize the provided text. Do not add new information, opinions, or assumptions. If information is not present in the text, do not mention it."
  },
  {
    role: "user",
    content: `Summarize the following text accurately in 1-2 sentences:\n\n${text}`
  }
]
    });

    const summary =
      completion.choices?.[0]?.message?.content || "No summary generated.";

    return new Response(
      JSON.stringify({ summary }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("API ERROR:", error);

    return new Response(
      JSON.stringify({ summary: "Error generating summary." }),
      { status: 500 }
    );
  }
}