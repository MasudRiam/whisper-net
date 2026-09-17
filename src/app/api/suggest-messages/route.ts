import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const DEFAULT_PROMPT =
  "Create a list of three fun, open-ended, anonymous-friendly questions for sending to a friend. Separate them with || and keep each under 120 characters. No numbering, no extra commentary.";

export async function POST() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { success: false, message: "AI suggestions are not configured" },
        { status: 503 }
      );
    }

    // NOTE: client-supplied prompts are intentionally ignored to prevent
    // prompt-injection and uncontrolled API spend.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(DEFAULT_PROMPT);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return Response.json(
        { success: false, message: "No suggestions generated" },
        { status: 502 }
      );
    }

    return Response.json({ success: true, message: text }, { status: 200 });
  } catch (error: unknown) {
    console.error("Gemini error:", error);
    const message =
      error instanceof Error ? error.message : "Gemini API error";
    return Response.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
