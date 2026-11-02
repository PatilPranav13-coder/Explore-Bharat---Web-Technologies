import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(process.cwd(), ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || Object.hasOwn(process.env, match[1])) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}

export const config = {
  host: process.env.HOST || "127.0.0.1",
  port: Number(process.env.PORT || 4173),
  appPassword: process.env.APP_PASSWORD || "",
  sessionSecret: process.env.SESSION_SECRET || "",
  nodeEnv: process.env.NODE_ENV || "development",
  aiTimeoutMs: Math.min(90000, Math.max(5000, Number(process.env.AI_TIMEOUT_MS || 45000))),
  openai: { key: process.env.OPENAI_API_KEY || "", model: process.env.OPENAI_MODEL || "" },
  anthropic: { key: process.env.ANTHROPIC_API_KEY || "", model: process.env.ANTHROPIC_MODEL || "" }
};

if (config.appPassword && config.sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters when APP_PASSWORD is configured.");
}
if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}