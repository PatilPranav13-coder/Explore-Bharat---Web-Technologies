import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import helmet from "helmet";
import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const { Pool } = pg;
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const database = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined
    })
  : null;
let schemaReady = false;

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static(__dirname));

// Lightweight per-IP protection for metered AI and enquiry endpoints.
const requestBuckets = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  let bucket = requestBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    bucket = { startedAt: now, count: 0 };
    requestBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > 12) {
    res.set("Retry-After", "60");
    return res.status(429).json({ error: "Please pause for a moment before making more requests." });
  }
  if (requestBuckets.size > 2000) {
    for (const [ip, entry] of requestBuckets) {
      if (now - entry.startedAt >= 60_000) requestBuckets.delete(ip);
    }
  }
  next();
}
app.use("/api/chat", rateLimit);
app.use("/api/search", rateLimit);
app.use("/api/enquiries", rateLimit);

async function ensureEnquiryTable() {
  if (!database || schemaReady) return;
  await database.query(`
    CREATE TABLE IF NOT EXISTS trip_enquiries (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      trip JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  schemaReady = true;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(client),
    searchConfigured: Boolean(client),
    enquiryStorageConfigured: Boolean(database)
  });
});

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const context = typeof req.body?.context === "string" ? req.body.context.slice(0, 3000) : "";
  if (!message) return res.status(400).json({ error: "Please enter a message." });
  if (message.length > 1500) return res.status(413).json({ error: "Message is too long. Please keep it under 1,500 characters." });
  if (!client) return res.status(503).json({ error: "AI is not configured. Set OPENAI_API_KEY on the server." });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",
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

app.post("/api/search", async (req, res) => {
  const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";
  if (!query) return res.status(400).json({ error: "Enter something to search for." });
  if (query.length > 300) return res.status(413).json({ error: "Search queries must be under 300 characters." });
  if (!client) return res.status(503).json({ error: "Live search is not configured. Add OPENAI_API_KEY to the server." });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",
      tools: [{ type: "web_search" }],
      instructions: "You are the Explore Bharat search assistant. Search the web for useful, relevant information about Indian destinations, transport, official tourism information, culture and travel planning. Summarise the most useful findings with care. Prefer official tourism/government sources for permits, safety, transport rules and opening details. Never invent prices or availability.",
      input: query,
      max_output_tokens: 700
    });
    const citations = (response.output || []).flatMap(item =>
      item.type === "message" ? (item.content || []).flatMap(part => part.annotations || []) : []
    ).filter(item => item.type === "url_citation" && item.url)
      .map(item => ({ title: item.title || item.url, url: item.url }))
      .filter((item, index, all) => all.findIndex(other => other.url === item.url) === index)
      .slice(0, 5);
    res.json({ answer: response.output_text || "No search summary was returned.", sources: citations });
  } catch (error) {
    console.error("Web search failed:", error?.status || error?.message || error);
    res.status(502).json({ error: "Live search is temporarily unavailable. Please try again." });
  }
});

app.post("/api/enquiries", async (req, res) => {
  const contact = req.body?.contact || {};
  const trip = req.body?.trip || {};
  const name = typeof contact.name === "string" ? contact.name.trim().slice(0, 100) : "";
  const email = typeof contact.email === "string" ? contact.email.trim().slice(0, 254) : "";
  const phone = typeof contact.phone === "string" ? contact.phone.trim().slice(0, 30) : "";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please provide a valid name and email address." });
  }
  if (!Array.isArray(trip.places) || trip.places.length === 0 || trip.places.length > 20) {
    return res.status(400).json({ error: "Please choose between 1 and 20 destinations." });
  }
  if (!database) {
    return res.status(503).json({ error: "Server enquiry storage is not configured. Add DATABASE_URL to enable online submissions." });
  }
  try {
    await ensureEnquiryTable();
    const saved = await database.query(
      "INSERT INTO trip_enquiries (name, email, phone, trip) VALUES ($1, $2, $3, $4::jsonb) RETURNING id, created_at",
      [name, email, phone || null, JSON.stringify(trip)]
    );
    res.status(201).json({ saved: true, enquiryId: saved.rows[0].id, createdAt: saved.rows[0].created_at });
  } catch (error) {
    console.error("Enquiry save failed:", error?.message || error);
    res.status(500).json({ error: "We couldn't save your enquiry. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`Explore Bharat is running on http://localhost:${port}`);
});
