export function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const clean = value.trim().replace(/,/g, "");
  if (!clean || !/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(clean)) return null;
  const number = Number(clean);
  return Number.isFinite(number) ? number : null;
}

export function median(values) {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

export function profileDataset(rows) {
  const records = Array.isArray(rows) ? rows : [];
  const columns = [...new Set(records.flatMap(row => Object.keys(row || {})))];
  const totalCells = records.length * columns.length;
  const missingCount = records.reduce((sum, row) => sum + columns.filter(key => isMissing(row?.[key])).length, 0);
  const duplicateCount = countDuplicates(records, columns);
  const columnProfiles = columns.map(key => profileColumn(key, records));
  const numericColumns = columnProfiles.filter(column => column.type === "number");
  const dateColumns = columnProfiles.filter(column => column.type === "date");
  const categoricalColumns = columnProfiles.filter(column => column.type === "category" || column.type === "boolean");
  const correlations = [];
  for (let i = 0; i < numericColumns.length; i += 1) {
    for (let j = i + 1; j < numericColumns.length; j += 1) {
      const correlation = calculateCorrelation(records, numericColumns[i].name, numericColumns[j].name);
      if (correlation && Math.abs(correlation.value) >= 0.7 && correlation.count >= 5) correlations.push(correlation);
    }
  }
  const missingRate = totalCells ? missingCount / totalCells : 0;
  const duplicateRate = records.length ? duplicateCount / records.length : 0;
  const qualityScore = Math.max(0, Math.round(100 - missingRate * 45 - duplicateRate * 25));
  const profile = {
    rowCount: records.length,
    columnCount: columns.length,
    columns: columnProfiles,
    missingCount,
    missingRate,
    duplicateCount,
    qualityScore,
    numericColumns: numericColumns.map(column => column.name),
    dateColumns: dateColumns.map(column => column.name),
    categoricalColumns: categoricalColumns.map(column => column.name),
    correlations
  };
  profile.findings = buildFindings(profile);
  return profile;
}

function profileColumn(name, rows) {
  const values = rows.map(row => row?.[name]);
  const present = values.filter(value => !isMissing(value));
  const parsedNumbers = present.map(toNumber);
  const numericCount = parsedNumbers.filter(value => value !== null).length;
  const parsedDates = present.map(parseDate);
  const dateCount = parsedDates.filter(value => value !== null).length;
  const uniqueValues = new Set(present.map(value => String(value))).size;
  let type = "category";
  if (present.length && numericCount / present.length >= 0.8) type = "number";
  else if (present.length && dateCount / present.length >= 0.8) type = "date";
  else if (present.length && present.every(value => typeof value === "boolean" || /^(true|false|yes|no)$/i.test(String(value)))) type = "boolean";
  const result = {
    name,
    type,
    count: present.length,
    missingCount: values.length - present.length,
    missingRate: values.length ? (values.length - present.length) / values.length : 0,
    uniqueCount: uniqueValues,
    topValues: topValues(present)
  };
  if (type === "number") {
    const numbers = parsedNumbers.filter(value => value !== null);
    const sorted = [...numbers].sort((a, b) => a - b);
    const mean = numbers.reduce((sum, value) => sum + value, 0) / (numbers.length || 1);
    const variance = numbers.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (numbers.length || 1);
    const q1 = median(sorted.slice(0, Math.floor(sorted.length / 2)));
    const q3 = median(sorted.slice(Math.ceil(sorted.length / 2)));
    const iqr = q1 === null || q3 === null ? 0 : q3 - q1;
    const outliers = iqr > 0 ? numbers.filter(value => value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr) : [];
    Object.assign(result, {
      validCount: numbers.length,
      sum: numbers.reduce((sum, value) => sum + value, 0),
      mean,
      median: median(numbers),
      min: numbers.reduce((minimum, value) => Math.min(minimum, value), Infinity),
      max: numbers.reduce((maximum, value) => Math.max(maximum, value), -Infinity),
      standardDeviation: Math.sqrt(variance),
      outlierCount: outliers.length
    });
  }
  return result;
}

function isMissing(value) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function parseDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.getTime();
  if (typeof value !== "string" || value.trim() === "") return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function countDuplicates(rows, columns) {
  const seen = new Set();
  let count = 0;
  for (const row of rows) {
    const key = JSON.stringify(columns.map(column => row?.[column] ?? null));
    if (seen.has(key)) count += 1;
    else seen.add(key);
  }
  return count;
}

function topValues(values, limit = 4) {
  const counts = new Map();
  for (const value of values) counts.set(String(value), (counts.get(String(value)) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([value, count]) => ({ value, count }));
}

export function calculateCorrelation(rows, firstColumn, secondColumn) {
  const pairs = rows.map(row => [toNumber(row[firstColumn]), toNumber(row[secondColumn])]).filter(pair => pair.every(value => value !== null));
  if (pairs.length < 3) return null;
  const meanX = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length;
  const meanY = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length;
  const covariance = pairs.reduce((sum, pair) => sum + (pair[0] - meanX) * (pair[1] - meanY), 0);
  const varianceX = pairs.reduce((sum, pair) => sum + (pair[0] - meanX) ** 2, 0);
  const varianceY = pairs.reduce((sum, pair) => sum + (pair[1] - meanY) ** 2, 0);
  const denominator = Math.sqrt(varianceX * varianceY);
  if (!denominator) return null;
  return { firstColumn, secondColumn, value: covariance / denominator, count: pairs.length };
}

function buildFindings(profile) {
  const findings = [];
  if (profile.missingCount) findings.push({
    id: "missing-values", kind: "quality", title: "Some cells are empty",
    detail: profile.missingCount + " missing values across " + profile.rowCount + " rows and " + profile.columnCount + " columns.",
    evidence: "Counted empty cells directly in the imported rows.",
    question: "Which columns have the most missing values?"
  });
  if (profile.duplicateCount) findings.push({
    id: "duplicate-rows", kind: "quality", title: "Repeated records found",
    detail: profile.duplicateCount + " rows match an earlier row across all columns.",
    evidence: "Compared complete row values; original rows are unchanged.",
    question: "Show me the repeated records."
  });
  for (const column of profile.columns.filter(item => item.type === "number" && item.outlierCount > 0)) findings.push({
    id: "outliers-" + column.name, kind: "distribution", title: "Unusual values in " + column.name,
    detail: column.outlierCount + " values fall beyond the 1.5×IQR fences.",
    evidence: "Tukey fences: Q1 − 1.5×IQR and Q3 + 1.5×IQR. This is a review flag, not proof of an error.",
    question: "Show unusual values in " + column.name + "."
  });
  for (const correlation of profile.correlations.slice(0, 3)) findings.push({
    id: "correlation-" + correlation.firstColumn + "-" + correlation.secondColumn, kind: "relationship",
    title: "Two numeric columns move together",
    detail: correlation.firstColumn + " and " + correlation.secondColumn + " have a Pearson correlation of " + correlation.value.toFixed(2) + " across " + correlation.count + " paired rows.",
    evidence: "Pearson correlation on complete numeric pairs. Correlation does not establish causation.",
    question: "Explain the relationship between " + correlation.firstColumn + " and " + correlation.secondColumn + "."
  });
  if (!findings.length && profile.rowCount) findings.push({
    id: "profile-complete", kind: "profile", title: "No obvious quality flags",
    detail: "The profile did not find empty cells, repeated rows, or strong numeric correlations.",
    evidence: "Checked missingness, exact row duplicates, numeric distributions, and pairwise correlations.",
    question: "Summarize this dataset."
  });
  return findings;
}

export function selectMetricColumn(profile, question = "") {
  const lower = question.toLowerCase();
  const columns = profile.columns.filter(column => column.type === "number");
  return columns.find(column => lower.includes(column.name.toLowerCase()))?.name
    || columns.find(column => /revenue|sales|amount|price|cost|profit|value|total/i.test(column.name))?.name
    || columns[0]?.name
    || null;
}

export function selectGroupColumn(profile, rows, question = "") {
  const lower = question.toLowerCase();
  const columns = profile.columns.filter(column => column.type === "category" || column.type === "boolean" || column.type === "date");
  return columns.find(column => lower.includes(column.name.toLowerCase()))?.name
    || columns.find(column => /date|month|week|quarter|year|time/i.test(column.name))?.name
    || columns[0]?.name
    || Object.keys(rows[0] || {})[0]
    || null;
}

export function groupMetric(rows, groupColumn, metricColumn) {
  const groups = new Map();
  for (const row of rows) {
    const key = String(row[groupColumn] ?? "(missing)");
    const value = toNumber(row[metricColumn]);
    if (value === null) continue;
    const item = groups.get(key) || { label: key, value: 0, count: 0 };
    item.value += value;
    item.count += 1;
    groups.set(key, item);
  }
  return [...groups.values()];
}

export function calculateMovingAverageForecast(rows, groupColumn, metricColumn, periods = 3, horizon = 3) {
  const series = groupMetric(rows, groupColumn, metricColumn);
  if (series.length < 3) return null;
  const windowSize = Math.max(2, Math.min(periods, series.length));
  const recent = series.slice(-windowSize);
  const average = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
  const lastValue = series.at(-1).value;
  const forecasts = Array.from({ length: Math.min(12, Math.max(1, horizon)) }, (_, index) => ({
    label: "Forecast " + (index + 1),
    value: average,
    lower: Math.min(average, lastValue) * 0.9,
    upper: Math.max(average, lastValue) * 1.1
  }));
  return { method: windowSize + "-period moving average", windowSize, average, forecasts, historical: series };
}

export function analyzeQuestion(question, rows, profile, selectedPoint = null) {
  const text = String(question || "").trim();
  if (!rows.length) return { answer: "Import a dataset first. The local analysis engine will calculate results from the rows you provide.", source: "local engine" };
  const lower = text.toLowerCase();
  const metric = selectMetricColumn(profile, lower);
  const group = selectGroupColumn(profile, rows, lower);
  const quality = /missing|empty|quality|duplicate|invalid|clean/i.test(lower);
  if (selectedPoint && /why|investigat|explain|compare|about|selected/i.test(lower)) {
    const detail = selectedPoint.label + (selectedPoint.value !== undefined ? " has a value of " + formatNumber(selectedPoint.value) : "");
    return { answer: "You selected " + detail + ". I can compare that point with the surrounding rows, but a causal explanation needs another measured variable or external context.", source: "selected chart point", facts: [detail, "Selection is a row or aggregated chart group from the active dataset."] };
  }
  if (quality) {
    const affected = profile.columns.filter(column => column.missingCount > 0).map(column => column.name + " (" + column.missingCount + ")");
    const parts = [profile.missingCount + " empty cells", profile.duplicateCount + " repeated rows"];
    if (affected.length) parts.push("columns with empty cells: " + affected.join(", "));
    return { answer: "The quality check found " + parts.join("; ") + ". Original rows are preserved until you choose a transformation.", source: "local quality profile", facts: parts };
  }
  if (/forecast|predict|project forward/i.test(lower) && metric && group) {
    const forecast = calculateMovingAverageForecast(rows, group, metric, 3, 3);
    if (!forecast) return { answer: "There are not enough grouped observations to calculate a moving-average forecast. I need at least three ordered groups.", source: "local engine" };
    return { answer: "Using a " + forecast.method + " over " + metric + ", the next three simulated periods are approximately " + forecast.forecasts.map(item => formatNumber(item.value)).join(", ") + ". This is a simple baseline, not a guarantee.", source: "calculated moving average", facts: ["Recent window average: " + formatNumber(forecast.average), "Historical groups: " + forecast.historical.length, "No seasonality adjustment or backtest is applied."] };
  }
  if (/correlat|relationship|associated/i.test(lower)) {
    const correlation = profile.correlations[0];
    if (!correlation) return { answer: "I did not find a strong pairwise correlation with at least five complete rows. This does not rule out a nonlinear relationship.", source: "local correlation scan" };
    const direction = correlation.value >= 0 ? "positive" : "negative";
    return { answer: correlation.firstColumn + " and " + correlation.secondColumn + " have a " + direction + " Pearson correlation of " + correlation.value.toFixed(2) + " across " + correlation.count + " complete rows. Correlation does not establish causation.", source: "Pearson correlation", facts: ["r = " + correlation.value.toFixed(3), "Paired rows: " + correlation.count] };
  }
  if (/highest|largest|maximum|best|top|most|peak/i.test(lower) && metric) {
    const found = rows.map((row, index) => ({ row, index, value: toNumber(row[metric]) })).filter(item => item.value !== null).sort((a, b) => b.value - a.value)[0];
    if (found) return { answer: "The highest " + metric + " value is " + formatNumber(found.value) + " at row " + (found.index + 1) + (group ? " (" + group + ": " + found.row[group] + ")" : "") + ".", source: "direct row calculation", facts: [metric + " maximum: " + formatNumber(found.value), "Source row: " + (found.index + 1)] };
  }
  if (/average|mean|sum|total|growth|trend|declin|over time|month|change/i.test(lower) && metric) {
    const groups = group ? groupMetric(rows, group, metric) : [];
    if (groups.length >= 2 && /trend|declin|growth|over time|month|change/i.test(lower)) {
      const first = groups[0], last = groups.at(-1);
      const change = first.value === 0 ? null : ((last.value - first.value) / Math.abs(first.value)) * 100;
      const direction = last.value > first.value ? "increased" : last.value < first.value ? "decreased" : "was unchanged";
      return { answer: metric + " " + direction + " from " + formatNumber(first.value) + " in " + first.label + " to " + formatNumber(last.value) + " in " + last.label + (change === null ? "." : " (" + change.toFixed(1) + "%)."), source: "grouped local calculation", facts: ["Grouped by " + group, "First group: " + first.label, "Last group: " + last.label] };
    }
    const column = profile.columns.find(item => item.name === metric);
    return { answer: metric + " has a mean of " + formatNumber(column.mean) + ", a median of " + formatNumber(column.median) + ", and a total of " + formatNumber(column.sum) + " across " + column.validCount + " numeric rows.", source: "local statistics", facts: ["Minimum: " + formatNumber(column.min), "Maximum: " + formatNumber(column.max), "Valid numeric rows: " + column.validCount] };
  }
  if (selectedPoint) return { answer: "You selected " + selectedPoint.label + ". Ask for a comparison or a calculation to inspect this point against the active rows.", source: "selected chart context" };
  return {
    answer: "This dataset has " + profile.rowCount + " rows and " + profile.columnCount + " columns. I found " + profile.numericColumns.length + " numeric columns, " + profile.missingCount + " empty cells, and " + profile.duplicateCount + " repeated rows. Ask for a maximum, trend, quality check, correlation, or forecast.",
    source: "local dataset profile",
    facts: [profile.numericColumns.length + " numeric columns", profile.categoricalColumns.length + " categorical columns", "Quality score: " + profile.qualityScore + "/100"]
  };
}

export function formatNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return String(value ?? "—");
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}