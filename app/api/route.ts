import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
     messages: [
  {
    role: "system",
    content:
      "You are a text summarization tool. Always summarize the given text in 1-2 concise sentences. Do not ask questions or respond conversationally."
  },
  {
    role: "user",
    content: text
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