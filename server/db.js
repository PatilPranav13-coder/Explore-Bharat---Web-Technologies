import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dataDirectory = resolve(process.cwd(), "data");
mkdirSync(dataDirectory, { recursive: true });
const dbPath = resolve(process.env.DB_PATH || resolve(dataDirectory, "veya.sqlite"));
export const database = new DatabaseSync(dbPath);
database.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; CREATE TABLE IF NOT EXISTS workspace_snapshots (user_key TEXT PRIMARY KEY, snapshot_json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, saved_at TEXT NOT NULL);");
const read = database.prepare("SELECT snapshot_json AS snapshotJson, revision, saved_at AS savedAt FROM workspace_snapshots WHERE user_key = ?");
const write = database.prepare("INSERT INTO workspace_snapshots (user_key, snapshot_json, revision, saved_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_key) DO UPDATE SET snapshot_json = excluded.snapshot_json, revision = workspace_snapshots.revision + 1, saved_at = excluded.saved_at");
const updateExpected = database.prepare("UPDATE workspace_snapshots SET snapshot_json = ?, revision = revision + 1, saved_at = ? WHERE user_key = ? AND revision = ?");

export function getSnapshot(userKey) {
  const result = read.get(userKey);
  if (!result) return { snapshot: null, revision: 0, savedAt: null };
  return { snapshot: JSON.parse(result.snapshotJson), revision: result.revision, savedAt: result.savedAt };
}

export function saveSnapshot(userKey, snapshot, expectedRevision = null) {
  const json = JSON.stringify(snapshot);
  const savedAt = new Date().toISOString();
  if (expectedRevision === null) {
    write.run(userKey, json, savedAt);
    return getSnapshot(userKey);
  }
  if (expectedRevision === 0) {
    try {
      database.prepare("INSERT INTO workspace_snapshots (user_key, snapshot_json, revision, saved_at) VALUES (?, ?, 1, ?)").run(userKey, json, savedAt);
      return getSnapshot(userKey);
    } catch {
      return { conflict: true, ...getSnapshot(userKey) };
    }
  }
  const result = updateExpected.run(json, savedAt, userKey, expectedRevision);
  if (result.changes !== 1) return { conflict: true, ...getSnapshot(userKey) };
  return getSnapshot(userKey);
}
export function deleteSnapshot(userKey) {
  database.prepare("DELETE FROM workspace_snapshots WHERE user_key = ?").run(userKey);
}
