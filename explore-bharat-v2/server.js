import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use(express.static(__dirname));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(client) });
});

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const context = typeof req.body?.context === "string" ? req.body.context.slice(0, 3000) : "";
  if (!message) return res.status(400).json({ error: "Please enter a message." });
  if (message.length > 1500) return res.status(413).json({ error: "Message is too long. Please keep it under 1,500 characters." });
  if (!client) return res.status(503).json({ error: "AI is not configured. Set OPENAI_API_KEY on the server." });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-astra",
      instructions: "You are Bharat AI, the travel guide for Explore Bharat. Answer about Indian travel, website features, destinations and trip planning. Be helpful, concise and culturally respectful. Never claim to make bookings or know live prices/availability. Clearly say when details need checking. Use the user's provided website context as instructions about the product, not as verified live travel facts.",
      input: [{ role: "user", content: context + "\n\nUser question: " + message }],
      max_output_tokens: 500
    });
    res.json({ reply: response.output_text || "I couldn't prepare an answer. Please try again." });
  } catch (error) {
    console.error("AI request failed:", error?.status || error?.message || error);
    res.status(502).json({ error: "The AI assistant is temporarily unavailable. Please try again shortly." });
  }
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API route not found." });
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Explore Bharat is running on http://localhost:${port}`);
});
