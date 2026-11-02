import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createProbe } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const root = resolve(process.cwd());
let child;
let baseURL;
let tempDirectory;
let startupLog = "";

before(async () => {
  tempDirectory = await mkdtemp(resolve(tmpdir(), "veya-server-test-"));
  const probe = createProbe();
  await new Promise(resolveListen => probe.listen(0, "127.0.0.1", resolveListen));
  const port = probe.address().port;
  await new Promise(resolveClose => probe.close(resolveClose));
  baseURL = "http://127.0.0.1:" + port;
  child = spawn(process.execPath, ["server/index.js"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), DB_PATH: resolve(tempDirectory, "test.sqlite"), APP_PASSWORD: "", SESSION_SECRET: "", OPENAI_API_KEY: "", OPENAI_MODEL: "", ANTHROPIC_API_KEY: "", ANTHROPIC_MODEL: "" }
  });
  child.stdout.on("data", chunk => startupLog += chunk.toString());
  child.stderr.on("data", chunk => startupLog += chunk.toString());
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseURL + "/api/health");
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 75));
  }
  assert.ok(ready, "server should start and expose its health endpoint: " + startupLog);
});

after(async () => {
  if (child && child.exitCode === null) {
    child.kill("SIGTERM");
    await Promise.race([new Promise(resolveExit => child.once("exit", resolveExit)), new Promise(resolveWait => setTimeout(resolveWait, 2000))]);
  }
  if (tempDirectory) await rm(tempDirectory, { recursive: true, force: true });
});

test("keeps the original home and serves the separate studio and approved assets", async () => {
  const home = await fetch(baseURL + "/");
  assert.equal(home.status, 200);
  assert.match(home.headers.get("content-type"), /text\/html/);
  assert.match(await home.text(), /Explore <span class="logo-highlight">Bharat<\/span>/);
  const studio = await fetch(baseURL + "/studio.html");
  assert.equal(studio.status, 200);
  assert.match(await studio.text(), /href="studio\.css"/);
  assert.equal((await fetch(baseURL + "/studio.css")).status, 200);
  assert.equal((await fetch(baseURL + "/images/Kashmir%20for%20project.jpg")).status, 200);
  assert.equal((await fetch(baseURL + "/server/index.js")).status, 404);
  assert.equal((await fetch(baseURL + "/.env")).status, 404);
});

test("persists workspace snapshots and rejects stale revisions", async () => {
  const initial = await fetch(baseURL + "/api/workspace").then(response => response.json());
  assert.equal(initial.revision, 0);
  const saved = await fetch(baseURL + "/api/workspace", {
    method: "PUT", headers: { "content-type": "application/json" },
    body: JSON.stringify({ snapshot: { title: "local" }, expectedRevision: 0 })
  });
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).revision, 1);
  const stale = await fetch(baseURL + "/api/workspace", {
    method: "PUT", headers: { "content-type": "application/json" },
    body: JSON.stringify({ snapshot: { title: "stale" }, expectedRevision: 0 })
  });
  assert.equal(stale.status, 409);
  const current = await fetch(baseURL + "/api/workspace").then(response => response.json());
  assert.deepEqual(current.snapshot, { title: "local" });
});