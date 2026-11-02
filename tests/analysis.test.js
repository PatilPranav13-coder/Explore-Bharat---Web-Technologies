import test from "node:test";
import assert from "node:assert/strict";
import { profileDataset, calculateCorrelation, analyzeQuestion, calculateMovingAverageForecast } from "../src/core/analysis.js";

const rows = [
  { month: "Jan", revenue: 10, spend: 1, note: "ok" },
  { month: "Feb", revenue: 20, spend: 2, note: "" },
  { month: "Mar", revenue: 30, spend: 3, note: "ok" },
  { month: "Apr", revenue: 40, spend: 4, note: "ok" },
  { month: "May", revenue: 50, spend: 5, note: "ok" },
  { month: "May", revenue: 50, spend: 5, note: "ok" }
];

test("profiles missing values, duplicates, and numeric summaries", () => {
  const profile = profileDataset(rows);
  assert.equal(profile.rowCount, 6);
  assert.equal(profile.missingCount, 1);
  assert.equal(profile.duplicateCount, 1);
  assert.equal(profile.columns.find(item => item.name === "revenue").mean, 200 / 6);
  assert.ok(profile.findings.some(item => item.id === "missing-values"));
  assert.ok(profile.findings.some(item => item.id === "duplicate-rows"));
});

test("computes Pearson correlation from complete numeric pairs", () => {
  const result = calculateCorrelation(rows, "revenue", "spend");
  assert.equal(result.count, 6);
  assert.ok(Math.abs(result.value - 1) < 1e-12);
});

test("answers maxima from the source rows and marks forecast limits", () => {
  const profile = profileDataset(rows);
  const maximum = analyzeQuestion("What is the highest revenue?", rows, profile);
  assert.match(maximum.answer, /50/);
  assert.match(maximum.source, /direct row/);
  const forecast = calculateMovingAverageForecast(rows, "month", "revenue", 3, 3);
  assert.equal(forecast.forecasts.length, 3);
  assert.match(forecast.method, /moving average/);
});

test("does not claim a correlation is causal", () => {
  const profile = profileDataset(rows);
  const answer = analyzeQuestion("Is there a correlation?", rows, profile);
  assert.match(answer.answer, /does not establish causation/);
});