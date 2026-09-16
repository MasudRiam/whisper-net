import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    let prompt = "Give me 3 fun open-ended questions separated by ||";

    try {
      const body = await req.json();
      if (body?.prompt) {
        prompt = body.prompt;
      }
    } catch {
      console.log ("Json error")
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({ success: true, message: text }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Gemini error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message ?? "Gemini API error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
