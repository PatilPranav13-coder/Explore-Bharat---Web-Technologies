export function parseDelimited(text, delimiter) {
  const source = String(text || "").replace(/^\uFEFF/, "");
  if (!delimiter) delimiter = source.split(/\r?\n/, 1)[0].includes("\t") ? "\t" : ",";
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { value += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else value += char;
      continue;
    }
    if (char === '"' && value.length === 0) quoted = true;
    else if (char === delimiter) { row.push(value); value = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i += 1;
      row.push(value); value = "";
      if (row.some(cell => String(cell).trim() !== "")) rows.push(row);
      row = [];
    } else value += char;
  }
  row.push(value);
  if (row.some(cell => String(cell).trim() !== "")) rows.push(row);
  if (rows.length < 2) throw new Error("This file needs a header row and at least one data row.");
  const headers = rows[0].map((header, index) => String(header).trim() || "Column " + (index + 1));
  const uniqueHeaders = makeUnique(headers);
  return rows.slice(1).map(cells => Object.fromEntries(uniqueHeaders.map((key, index) => [key, cells[index] ?? ""])));
}

function makeUnique(values) {
  const seen = new Map();
  return values.map(value => {
    const base = value || "Column";
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? base + " (" + (count + 1) + ")" : base;
  });
}

export function stringifyCSV(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const encode = value => {
    const text = value == null ? "" : String(value);
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  };
  return [headers, ...rows.map(row => headers.map(key => row[key]))]
    .map(line => line.map(encode).join(",")).join("\r\n");
}