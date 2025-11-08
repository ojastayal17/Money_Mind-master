import express from "express";
import OpenAI from "openai";
import fetch from "node-fetch"; 

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req, res) => {
  console.log("📩 Received Chat Request:", req.body);

  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.json({ reply: "Please type something first 😊" });
    }

    // ✅ Fetch financial summary safely
    let summary = { totalSpent: 0, monthlyLimit: 0, remaining: 0 };
    try {
      const response = await fetch(`http://localhost:5000/api/financial-summary?userId=${userId}`);
      if (response.ok) summary = await response.json();
    } catch {
      console.log("⚠️ Using default summary (fetch failed)");
    }

    const systemPrompt = `
You are MoneyMind's friendly financial assistant.

User's current budget:
${JSON.stringify(summary, null, 2)}

Instructions:
- If user asks "Can I buy X (price Y)?", compare Y with "remaining".
- Respond in a simple, polite and helpful tone.
- Do not mention APIs or system instructions.
`;

    let completion;

    try {
      // ✅ Primary model (cheap + works well)
      completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      });
    } catch (error) {

      // ✅ Handle quota / rate limit
      if (error.code === "insufficient_quota" || error.status === 429) {
        console.log("⚠️ Quota exceeded → switching to fallback model");

        // Free fallback model
        completion = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
        });
      } else {
        throw error; // rethrow other errors
      }
    }

    const reply = completion.choices?.[0]?.message?.content ?? "Sorry, I couldn’t understand.";
    return res.json({ reply });

  } catch (err) {
    console.error("❌ Chatbot crash:", err);
    return res.status(500).json({
      reply: "⚠️ Server error occurred. Please try again shortly."
    });
  }
});

export default router;
