import { createServer } from "node:http";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { config } from "./config.js";
import { getSnapshot, saveSnapshot, deleteSnapshot } from "./db.js";
import { askOpenAI } from "./providers/openai.js";
import { askAnthropic } from "./providers/anthropic.js";

const root = resolve(process.cwd());
const sessionCookie = "veya_session";
const bodyLimit = 2_500_000;
const rates = new Map();
const contentTypes = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function hash(value) { return createHash("sha256").update(value).digest(); }
function safeEqual(left, right) { return timingSafeEqual(hash(left), hash(right)); }
function sign(payload) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", config.sessionSecret).update(value).digest("base64url");
  return value + "." + signature;
}
function validSession(request) {
  if (!config.appPassword) return true;
  const cookies = Object.fromEntries((request.headers.cookie || "").split(";").map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf("=");
    return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
  const token = cookies[sessionCookie] || "";
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", config.sessionSecret).update(payload).digest();
  let actual;
  try { actual = Buffer.from(signature, "base64url"); } catch { return false; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).exp > Date.now(); }
  catch { return false; }
}
function cookie(value, maxAge = 7 * 86400) {
  const secure = config.nodeEnv === "production" ? "; Secure" : "";
  return sessionCookie + "=" + encodeURIComponent(value) + "; Path=/; HttpOnly; SameSite=Strict; Max-Age=" + maxAge + secure;
}
function json(response, status, value, extraHeaders = {}) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...extraHeaders
  });
  response.end(JSON.stringify(value));
}
function message(response, status, text) { json(response, status, { error: text }); }
async function readBody(request, limit = bodyLimit) {
  let total = 0;
  const chunks = [];
  for await (const chunk of request) {
    total += chunk.length;
    if (total > limit) throw Object.assign(new Error("Request body is too large."), { status: 413 });
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  try { return JSON.parse(text || "{}"); }
  catch { throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 }); }
}
function allowedOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.host; } catch { return false; }
}
function rateAllowed(key, maximum, intervalMs) {
  const now = Date.now();
  const current = rates.get(key) || { count: 0, reset: now + intervalMs };
  if (current.reset <= now) { current.count = 0; current.reset = now + intervalMs; }
  current.count += 1;
  rates.set(key, current);
  return current.count <= maximum;
}
function apiReady(provider) {
  return provider === "openai"
    ? Boolean(config.openai.key && config.openai.model)
    : provider === "anthropic" && Boolean(config.anthropic.key && config.anthropic.model);
}
function peerKey(request, route) { return (request.socket.remoteAddress || "local") + ":" + route; }

async function handleApi(request, response, url) {
  const route = url.pathname;
  if (route === "/api/health" && request.method === "GET") {
    return json(response, 200, {
      ok: true,
      product: "Veya",
      authRequired: Boolean(config.appPassword),
      providers: { openai: apiReady("openai"), anthropic: apiReady("anthropic") },
      storage: "sqlite"
    });
  }
  if (route === "/api/auth/status" && request.method === "GET") {
    return json(response, 200, { required: Boolean(config.appPassword), authenticated: validSession(request) });
  }
  if (route === "/api/auth/login" && request.method === "POST") {
    if (!allowedOrigin(request)) return message(response, 403, "This origin is not allowed.");
    const key = peerKey(request, "login");
    if (!rateAllowed(key, 8, 60_000)) return message(response, 429, "Too many sign-in attempts. Try again in a minute.");
    const body = await readBody(request, 4096);
    if (!config.appPassword) return json(response, 200, { authenticated: true });
    if (typeof body.password !== "string" || !safeEqual(body.password, config.appPassword)) return message(response, 401, "That password did not match.");
    const token = sign({ exp: Date.now() + 7 * 86400_000 });
    return json(response, 200, { authenticated: true }, { "set-cookie": cookie(token) });
  }
  if (route === "/api/auth/logout" && request.method === "POST") {
    if (!allowedOrigin(request)) return message(response, 403, "This origin is not allowed.");
    return json(response, 200, { authenticated: false }, { "set-cookie": cookie("", 0) });
  }
  if (route === "/api/workspace" && ["GET", "PUT", "DELETE"].includes(request.method)) {
    if (!validSession(request)) return message(response, 401, "Sign in to continue.");
    const userKey = "local-user";
    if (request.method === "DELETE") {
      if (!allowedOrigin(request)) return message(response, 403, "This origin is not allowed.");
      deleteSnapshot(userKey);
      return json(response, 200, { revision: 0, snapshot: null });
    }
    if (request.method === "GET") return json(response, 200, getSnapshot(userKey));
    if (!allowedOrigin(request)) return message(response, 403, "This origin is not allowed.");
    const body = await readBody(request);
    if (!body.snapshot || typeof body.snapshot !== "object" || Array.isArray(body.snapshot)) return message(response, 400, "A workspace snapshot is required.");
    if (JSON.stringify(body.snapshot).length > bodyLimit) return message(response, 413, "Workspace snapshot is too large.");
    const expectedRevision = Number.isInteger(body.expectedRevision) ? body.expectedRevision : null;
    const result = saveSnapshot(userKey, body.snapshot, expectedRevision);
    if (result.conflict) return json(response, 409, result);
    return json(response, 200, result);
  }
  if (route === "/api/ai/chat" && request.method === "POST") {
    if (!validSession(request)) return message(response, 401, "Sign in to continue.");
    if (!allowedOrigin(request)) return message(response, 403, "This origin is not allowed.");
    if (!rateAllowed(peerKey(request, "ai"), 20, 60_000)) return message(response, 429, "The local AI request limit was reached. Try again in a minute.");
    const body = await readBody(request, 24_000);
    if (!["openai", "anthropic"].includes(body.provider)) return message(response, 400, "Choose a supported AI provider.");
    if (!apiReady(body.provider)) return message(response, 503, "Configure both the server API key and model ID for this provider.");
    if (typeof body.question !== "string" || !body.question.trim() || body.question.length > 1200) return message(response, 400, "Enter a question up to 1,200 characters.");
    const context = body.context && typeof body.context === "object" ? body.context : {};
    if (JSON.stringify(context).length > 16_000) return message(response, 413, "AI context is too large. Send a shorter summary or smaller selection.");
    const requestData = { question: body.question.trim(), context, timeoutMs: config.aiTimeoutMs };
    try {
      const text = body.provider === "openai"
        ? await askOpenAI({ ...requestData, key: config.openai.key, model: config.openai.model })
        : await askAnthropic({ ...requestData, key: config.anthropic.key, model: config.anthropic.model });
      return json(response, 200, { text, provider: body.provider });
    } catch (error) {
      const detail = String(error.message || "provider unavailable").replace(/(?:sk-[A-Za-z0-9_-]{12,}|xox[baprs]-[A-Za-z0-9-]+)/g, "[redacted]").slice(0, 400);
      return message(response, 502, "Provider request failed: " + detail);
    }
  }
  return message(response, 404, "API route not found.");
}

async function serveStatic(request, response, url) {
  if (request.method !== "GET" && request.method !== "HEAD") return message(response, 405, "Method not allowed.");
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { return message(response, 400, "Invalid path."); }
  if (pathname === "/") pathname = "/index.html";
  if (pathname.split("/").includes("..") || pathname.includes("\\")) return message(response, 400, "Invalid path.");
  const publicPath = pathname === "/index.html" || pathname === "/style.css" || pathname === "/script.js" || pathname === "/studio.html" || pathname === "/studio.css" || pathname === "/image-credits.html" || pathname === "/manifest.webmanifest" || pathname === "/service-worker.js" || pathname.startsWith("/src/") || pathname.startsWith("/assets/") || pathname.startsWith("/images/");
  if (!publicPath) return message(response, 404, "Not found.");
  const filePath = resolve(root, "." + pathname);
  if (filePath !== root && !filePath.startsWith(root + sep)) return message(response, 403, "Forbidden.");
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return message(response, 404, "Not found.");
    const data = request.method === "HEAD" ? null : await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
      "content-length": info.size,
      "cache-control": filePath.endsWith("service-worker.js") ? "no-cache" : "no-cache",
      "x-content-type-options": "nosniff"
    });
    response.end(data);
  } catch { message(response, 404, "Not found."); }
}

const server = createServer(async (request, response) => {
  response.setHeader("x-frame-options", "DENY");
  response.setHeader("referrer-policy", "no-referrer");
  response.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("content-security-policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  try {
    const url = new URL(request.url || "/", "http://" + (request.headers.host || "localhost"));
    if (url.pathname.startsWith("/api/")) await handleApi(request, response, url);
    else await serveStatic(request, response, url);
  } catch (error) {
    console.error("Request failed:", error);
    if (!response.headersSent) message(response, error.status || 500, error.status ? error.message : "The request could not be completed.");
    else response.destroy();
  }
});

server.listen(config.port, config.host, () => {
  console.log("Veya Data Studio listening at http://" + config.host + ":" + config.port);
  if (config.appPassword) console.log("Password gate enabled.");
  if (!apiReady("openai") && !apiReady("anthropic")) console.log("AI providers are not configured; local analysis remains available.");
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);