const DB_NAME = "veya-workspace";
const STORE = "workspace";
const KEY = "main";

export async function loadWorkspace() {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
      request.onsuccess = () => resolve(request.result?.value ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    try { return JSON.parse(localStorage.getItem("veya-workspace-fallback") || "null"); }
    catch { return null; }
  }
}

export async function saveWorkspace(value) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put({ key: KEY, value, savedAt: new Date().toISOString() });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    return "indexeddb";
  } catch {
    localStorage.setItem("veya-workspace-fallback", JSON.stringify(value));
    return "localstorage";
  }
}

export async function clearWorkspace() {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).delete(KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    localStorage.removeItem("veya-workspace-fallback");
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in globalThis)) return reject(new Error("IndexedDB is unavailable"));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}