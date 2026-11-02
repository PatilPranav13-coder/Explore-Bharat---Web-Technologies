import { parseDelimited } from "./csv.js";

const MAX_FILE_BYTES = 30 * 1024 * 1024;
const MAX_ROWS = 250000;

export async function readDatasetFile(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error("Files are limited to 30 MB in this browser workspace.");
  const name = file.name.toLowerCase();
  let rows;
  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
    rows = parseDelimited(await file.text(), name.endsWith(".tsv") ? "\t" : undefined);
  } else if (name.endsWith(".json")) {
    rows = parseJSON(await file.text());
  } else if (name.endsWith(".xlsx")) {
    rows = await parseXLSX(await file.arrayBuffer());
  } else if (name.endsWith(".xls")) {
    throw new Error("Legacy .xls files are not supported in this browser-only importer. Save the file as .xlsx or .csv, then import it again.");
  } else {
    throw new Error("Choose a CSV, TSV, JSON, or XLSX file.");
  }
  if (!rows.length) throw new Error("No data rows were found.");
  if (rows.length > MAX_ROWS) throw new Error("This browser version is limited to 250,000 rows per dataset.");
  return rows;
}

function parseJSON(text) {
  const parsed = JSON.parse(text);
  const data = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.data) ? parsed.data : null;
  if (!data || data.length === 0 || !data.every(item => item && typeof item === "object" && !Array.isArray(item))) {
    throw new Error("JSON must contain an array of row objects, or an object with a data array.");
  }
  const keys = [...new Set(data.flatMap(item => Object.keys(item)))];
  return data.slice(0, MAX_ROWS + 1).map(item => Object.fromEntries(keys.map(key => [key, item[key] ?? ""])));
}

async function parseXLSX(buffer) {
  if (typeof DOMParser === "undefined" || typeof DecompressionStream === "undefined") {
    throw new Error("This browser does not provide the APIs needed to read XLSX files. Try a current version of Chrome, Edge, or Safari.");
  }
  const entries = unzipDirectory(buffer);
  const workbookXml = await readZipText(entries, "xl/workbook.xml");
  const relsXml = await readZipText(entries, "xl/_rels/workbook.xml.rels");
  if (!workbookXml || !relsXml) throw new Error("The workbook is missing its sheet index.");
  const workbook = new DOMParser().parseFromString(workbookXml, "application/xml");
  const rels = new DOMParser().parseFromString(relsXml, "application/xml");
  const firstSheet = workbook.querySelector("sheet");
  if (!firstSheet) throw new Error("The workbook does not contain a worksheet.");
  const relId = firstSheet.getAttribute("r:id");
  const relationship = [...rels.querySelectorAll("Relationship")].find(item => item.getAttribute("Id") === relId);
  let target = relationship?.getAttribute("Target");
  if (!target) throw new Error("Could not locate the first worksheet.");
  target = target.startsWith("/") ? target.slice(1) : "xl/" + target.replace(/^\.?\//, "");
  target = target.replace(/\/\.\//g, "/");
  const sheetXml = await readZipText(entries, target);
  if (!sheetXml) throw new Error("Could not read the first worksheet.");
  const sharedXml = await readZipText(entries, "xl/sharedStrings.xml");
  const shared = sharedXml ? [...new DOMParser().parseFromString(sharedXml, "application/xml").querySelectorAll("si")].map(item => [...item.querySelectorAll("t")].map(node => node.textContent || "").join("")) : [];
  const doc = new DOMParser().parseFromString(sheetXml, "application/xml");
  const matrix = [...doc.querySelectorAll("sheetData row")].slice(0, MAX_ROWS + 1).map(row => {
    const cells = [];
    for (const cell of row.querySelectorAll("c")) {
      const index = columnIndex(cell.getAttribute("r") || "");
      const type = cell.getAttribute("t");
      const raw = cell.querySelector("v")?.textContent ?? "";
      let value = raw;
      if (type === "s") value = shared[Number(raw)] ?? "";
      else if (type === "inlineStr") value = [...cell.querySelectorAll("is t")].map(node => node.textContent || "").join("");
      else if (type === "b") value = raw === "1";
      else if (raw !== "" && Number.isFinite(Number(raw))) value = Number(raw);
      cells[index] = value;
    }
    return cells;
  }).filter(row => row.some(value => value !== undefined && value !== ""));
  if (matrix.length < 2) throw new Error("The first worksheet needs a header and at least one row.");
  const header = matrix[0].map((value, index) => String(value || "Column " + (index + 1)).trim());
  const seen = new Map();
  const keys = header.map(key => {
    const count = seen.get(key) || 0;
    seen.set(key, count + 1);
    return count ? key + " (" + (count + 1) + ")" : key;
  });
  return matrix.slice(1).map(row => Object.fromEntries(keys.map((key, index) => [key, row[index] ?? ""])));
}

function columnIndex(reference) {
  const letters = String(reference).match(/^[A-Z]+/i)?.[0]?.toUpperCase() || "A";
  let index = 0;
  for (const letter of letters) index = index * 26 + letter.charCodeAt(0) - 64;
  return index - 1;
}

function unzipDirectory(buffer) {
  const data = new DataView(buffer);
  const low = Math.max(0, buffer.byteLength - 65557);
  let end = -1;
  for (let offset = buffer.byteLength - 22; offset >= low; offset -= 1) {
    if (data.getUint32(offset, true) === 0x06054b50) { end = offset; break; }
  }
  if (end < 0) throw new Error("This XLSX file is not a readable ZIP workbook.");
  const count = data.getUint16(end + 10, true);
  let offset = data.getUint32(end + 16, true);
  const decoder = new TextDecoder();
  const entries = new Map();
  for (let i = 0; i < count; i += 1) {
    if (data.getUint32(offset, true) !== 0x02014b50) break;
    const method = data.getUint16(offset + 10, true);
    const size = data.getUint32(offset + 20, true);
    const nameLength = data.getUint16(offset + 28, true);
    const extraLength = data.getUint16(offset + 30, true);
    const commentLength = data.getUint16(offset + 32, true);
    const localOffset = data.getUint32(offset + 42, true);
    const name = decoder.decode(new Uint8Array(buffer, offset + 46, nameLength));
    const localNameLength = data.getUint16(localOffset + 26, true);
    const localExtraLength = data.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    entries.set(name, { method, bytes: buffer.slice(start, start + size) });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function readZipText(entries, path) {
  const entry = entries.get(path);
  if (!entry) return null;
  if (entry.method === 0) return new TextDecoder().decode(entry.bytes);
  if (entry.method !== 8) throw new Error("This XLSX uses an unsupported compression method.");
  const stream = new Blob([entry.bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new TextDecoder().decode(await new Response(stream).arrayBuffer());
}