import test from "node:test";
import assert from "node:assert/strict";
import { parseDelimited, stringifyCSV } from "../src/core/csv.js";

test("parses quoted commas, escaped quotes, and embedded newlines", () => {
  const rows = parseDelimited('name,description,count\r\n"Lake, blue","Said ""hello""\nagain",4');
  assert.deepEqual(rows, [{ name: "Lake, blue", description: 'Said "hello"\nagain', count: "4" }]);
});

test("makes duplicate or blank headers unique", () => {
  const rows = parseDelimited("name,name,\nfirst,second,third");
  assert.deepEqual(rows, [{ name: "first", "name (2)": "second", "Column 3": "third" }]);
});

test("detects tab-separated files and round-trips quoted values", () => {
  const rows = parseDelimited("city\tcomment\nPune\t\"warm\tand bright\"");
  assert.deepEqual(rows, [{ city: "Pune", comment: "warm\tand bright" }]);
  assert.deepEqual(parseDelimited(stringifyCSV([{ city: "Pune", comment: "warm, bright" }])), [{ city: "Pune", comment: "warm, bright" }]);
});

test("rejects an empty or header-only file", () => {
  assert.throws(() => parseDelimited(""), /header row/);
  assert.throws(() => parseDelimited("header"), /header row/);
});