import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import helmet from "helmet";
import pg from "pg";
import Razorpay from "razorpay";
import crypto from "node:crypto";
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
const razorpayReady = Boolean(
  process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") && process.env.RAZORPAY_KEY_SECRET
);
const razorpay = razorpayReady
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

app.disable("x-powered-by");
app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// Payment webhooks need the unmodified raw request body for signature verification.
app.post("/api/payments/webhook", express.raw({ type: "application/json", limit: "64kb" }), async (req, res) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !database) {
    return res.status(503).json({ error: "Payment webhook is not configured." });
  }
  const received = String(req.headers["x-razorpay-signature"] || "");
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(req.body).digest("hex");
  const a = Buffer.from(received, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(400).json({ error: "Invalid webhook signature." });
  }
  let event;
  try { event = JSON.parse(req.body.toString("utf8")); }
  catch { return res.status(400).json({ error: "Invalid webhook payload." }); }
  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    try {
      const session = await database.query("SELECT * FROM checkout_sessions WHERE order_id=$1", [payment?.order_id]);
      if (session.rowCount && payment.amount === session.rows[0].amount_paise && payment.currency === "INR") {
        await createBookingFromPayment(session.rows[0], payment.id);
      }
    } catch (error) {
      console.error("Payment webhook processing failed:", error?.message || error);
      return res.status(500).json({ error: "Webhook processing failed; provider may retry." });
    }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: "24kb" }));
app.use(express.static(__dirname));

// Lightweight in-memory rate limit for metered AI/payment endpoints. Use a shared store at scale.
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
app.use("/api/payments/order", rateLimit);
app.use("/api/payments/verify", rateLimit);

const CATALOG = Object.freeze({
  rajasthan: { name: "Colours of Rajasthan", priceRupees: 18900, days: "5 days · 4 nights", places: ["Jaipur", "Jodhpur", "Udaipur"] },
  kerala: { name: "Kerala, Unhurried", priceRupees: 24500, days: "6 days · 5 nights", places: ["Kochi", "Munnar", "Alleppey"] },
  himalaya: { name: "Himalayan Highways", priceRupees: 32800, days: "7 days · 6 nights", places: ["Manali", "Jispa", "Leh"] }
});
let schemaReady = false;
async function ensureCommerceSchema() {
  if (!database || schemaReady) return;
  await database.query(`
    CREATE TABLE IF NOT EXISTS checkout_sessions (
      id BIGSERIAL PRIMARY KEY,
      order_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      travel_date DATE NOT NULL,
      items JSONB NOT NULL,
      amount_paise INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'created',
      payment_id TEXT UNIQUE,
      booking_id BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      paid_at TIMESTAMPTZ
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id BIGSERIAL PRIMARY KEY,
      booking_reference TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      travel_date DATE NOT NULL,
      items JSONB NOT NULL,
      amount_paise INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      payment_id TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  schemaReady = true;
}

async function createBookingFromPayment(session, paymentId) {
  const existing = await database.query("SELECT * FROM bookings WHERE payment_id=$1", [paymentId]);
  if (existing.rowCount) return existing.rows[0];
  const connection = await database.connect();
  try {
    await connection.query("BEGIN");
    const locked = await connection.query("SELECT * FROM checkout_sessions WHERE order_id=$1 FOR UPDATE", [session.order_id]);
    if (!locked.rowCount) throw new Error("Checkout session not found.");
    const checkout = locked.rows[0];
    const duplicate = await connection.query("SELECT * FROM bookings WHERE payment_id=$1", [paymentId]);
    if (duplicate.rowCount) {
      await connection.query("COMMIT");
      return duplicate.rows[0];
    }
    const reference = "EB-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const inserted = await connection.query(
      `INSERT INTO bookings (booking_reference, customer_name, customer_email, customer_phone, travel_date, items, amount_paise, currency, payment_id, status)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,'confirmed') RETURNING *`,
      [reference, checkout.customer_name, checkout.customer_email, checkout.customer_phone, checkout.travel_date, JSON.stringify(checkout.items), checkout.amount_paise, checkout.currency, paymentId]
    );
    await connection.query(
      "UPDATE checkout_sessions SET status='paid', payment_id=$2, booking_id=$3, paid_at=NOW() WHERE order_id=$1",
      [checkout.order_id, paymentId, inserted.rows[0].id]
    );
    await connection.query("COMMIT");
    return inserted.rows[0];
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  } finally {
    connection.release();
  }
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(client),
    searchConfigured: Boolean(client),
    enquiryStorageConfigured: Boolean(database),
    paymentsConfigured: Boolean(razorpayReady && database),
    paymentMode: "test"
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
      instructions: "You are Bharat AI, the interactive website guide for Explore Bharat. Explain the site clearly: the navigation search, destination category filters, expandable destination cards, custom trip builder, tour package cards, add-to-cart actions, profile, secure email sign-in, traveller details, Razorpay test checkout and personal travel log. A package is added to the cart per traveller; quantities change the number of travellers. Explain that bookings appear in history only after server-side payment verification. The current catalogues and prices are test/demo values, not real tours. No live payment or travel service is offered by this demo. Be concise and useful. Never claim a payment or booking succeeded unless the server confirms it. Also help with Indian travel questions carefully, without inventing availability, prices, opening hours or permissions.",
      input: [{ role: "user", content: context + "\n\nUser question: " + message }],
      max_output_tokens: 600
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
      instructions: "You are the Explore Bharat search assistant. Search the web for useful, relevant information about Indian destinations, transport, official tourism information, culture and travel planning. Prefer official tourism/government sources for permits, safety, transport rules and opening details. Never invent prices or availability.",
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
  const preferredContact = ["Email", "WhatsApp", "Phone call"].includes(contact.preferredContact) ? contact.preferredContact : "Email";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please provide a valid name and email address." });
  if (preferredContact !== "Email" && phone.replace(/\D/g, "").length < 7) return res.status(400).json({ error: "A valid mobile number is required for WhatsApp or phone contact." });
  if (contact.consent !== true) return res.status(400).json({ error: "Please confirm that you agree to be contacted about this trip enquiry." });
  if (!Array.isArray(trip.places) || trip.places.length === 0 || trip.places.length > 20) return res.status(400).json({ error: "Please choose between 1 and 20 destinations." });
  if (!database) return res.status(503).json({ error: "Server enquiry storage is not configured. Add DATABASE_URL to enable online submissions." });
  try {
    await database.query(`CREATE TABLE IF NOT EXISTS trip_enquiries (
      id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
      preferred_contact TEXT NOT NULL DEFAULT 'Email', consent BOOLEAN NOT NULL DEFAULT FALSE,
      trip JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    const saved = await database.query(
      "INSERT INTO trip_enquiries (name,email,phone,preferred_contact,consent,trip) VALUES ($1,$2,$3,$4,$5,$6::jsonb) RETURNING id,created_at",
      [name,email,phone || null,preferredContact,true,JSON.stringify(trip)]
    );
    res.status(201).json({ saved: true, enquiryId: saved.rows[0].id, createdAt: saved.rows[0].created_at });
  } catch (error) {
    console.error("Enquiry save failed:", error?.message || error);
    res.status(500).json({ error: "We couldn't save your enquiry. Please try again." });
  }
});

app.get("/api/payments/config", (_req, res) => {
  res.json({ configured: Boolean(razorpayReady && database), mode: "test", keyId: razorpayReady && database ? process.env.RAZORPAY_KEY_ID : null });
});

app.post("/api/payments/order", async (req, res) => {
  if (!razorpayReady || !database) return res.status(503).json({ error: "Test checkout is not configured. The site owner must add Razorpay test credentials and DATABASE_URL." });
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const customer = req.body?.customer || {};
  const name = typeof customer.name === "string" ? customer.name.trim().slice(0, 100) : "";
  const email = typeof customer.email === "string" ? customer.email.trim().toLowerCase().slice(0, 254) : "";
  const phone = typeof customer.phone === "string" ? customer.phone.trim().slice(0, 24) : "";
  const travelDate = typeof customer.travelDate === "string" ? customer.travelDate : "";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, "").length < 7) return res.status(400).json({ error: "Enter a valid name, email and mobile number." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate) || Number.isNaN(Date.parse(travelDate)) || travelDate < new Date().toISOString().slice(0,10)) return res.status(400).json({ error: "Choose a valid future departure date." });
  if (!items.length || items.length > 10) return res.status(400).json({ error: "Your cart must contain between 1 and 10 package types." });
  const verifiedItems = [];
  let amountPaise = 0;
  const seen = new Set();
  for (const item of items) {
    const product = CATALOG[item?.id];
    const quantity = Number(item?.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || seen.has(item.id)) return res.status(400).json({ error: "The cart contains an invalid package or quantity." });
    seen.add(item.id);
    const linePaise = product.priceRupees * 100 * quantity;
    amountPaise += linePaise;
    verifiedItems.push({ id: item.id, name: product.name, quantity, unit_price_rupees: product.priceRupees, line_total_paise: linePaise, days: product.days, places: product.places });
  }
  if (amountPaise < 100 || amountPaise > 50000000) return res.status(400).json({ error: "Checkout total is outside the supported test range." });
  try {
    await ensureCommerceSchema();
    const order = await razorpay.orders.create({
      amount: amountPaise, currency: "INR",
      receipt: "eb_" + crypto.randomBytes(10).toString("hex"),
      notes: { customer_email: email, demo_mode: "true" }
    });
    await database.query(
      "INSERT INTO checkout_sessions (order_id,customer_name,customer_email,customer_phone,travel_date,items,amount_paise,currency,status) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,'INR','created')",
      [order.id,name,email,phone,travelDate,JSON.stringify(verifiedItems),amountPaise]
    );
    res.status(201).json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID, items: verifiedItems, mode: "test" });
  } catch (error) {
    console.error("Order creation failed:", error?.error?.description || error?.message || error);
    res.status(502).json({ error: "We could not create your test payment order. Please try again." });
  }
});

app.post("/api/payments/verify", async (req, res) => {
  if (!razorpayReady || !database) return res.status(503).json({ error: "Payment verification is not configured." });
  const orderId = typeof req.body?.razorpay_order_id === "string" ? req.body.razorpay_order_id : "";
  const paymentId = typeof req.body?.razorpay_payment_id === "string" ? req.body.razorpay_payment_id : "";
  const signature = typeof req.body?.razorpay_signature === "string" ? req.body.razorpay_signature : "";
  if (!orderId || !paymentId || !signature) return res.status(400).json({ error: "Payment verification details are incomplete." });
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(orderId + "|" + paymentId).digest("hex");
  const receivedBytes = Buffer.from(signature, "hex");
  const expectedBytes = Buffer.from(expected, "hex");
  if (receivedBytes.length !== expectedBytes.length || !crypto.timingSafeEqual(receivedBytes, expectedBytes)) return res.status(400).json({ error: "Payment signature could not be verified." });
  try {
    await ensureCommerceSchema();
    const session = await database.query("SELECT * FROM checkout_sessions WHERE order_id=$1", [orderId]);
    if (!session.rowCount) return res.status(404).json({ error: "Checkout session not found." });
    const payment = await razorpay.payments.fetch(paymentId);
    const checkout = session.rows[0];
    if (payment.order_id !== orderId || payment.amount !== checkout.amount_paise || payment.currency !== "INR") return res.status(400).json({ error: "The payment does not match this cart." });
    if (payment.status !== "captured") return res.status(202).json({ pending: true, error: "Payment has not been captured yet. Your booking is not confirmed." });
    const booking = await createBookingFromPayment(checkout, paymentId);
    res.json({ verified: true, booking: { reference: booking.booking_reference, status: booking.status, createdAt: booking.created_at, travelDate: booking.travel_date, items: booking.items, amountPaise: booking.amount_paise, currency: booking.currency } });
  } catch (error) {
    console.error("Payment verification failed:", error?.error?.description || error?.message || error);
    res.status(502).json({ error: "We could not confirm payment yet. Do not pay again; check your profile or contact support before retrying." });
  }
});

app.listen(port, () => console.log(`Explore Bharat is running on http://localhost:${port} (payment mode: test only)`));
