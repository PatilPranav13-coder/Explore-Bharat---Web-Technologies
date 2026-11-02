import { formatNumber, groupMetric, selectGroupColumn, selectMetricColumn } from "./analysis.js";

const NS = "http://www.w3.org/2000/svg";

export function chartSeries(rows, profile, type = "line") {
  if (!rows.length || !profile.numericColumns.length) return { labels: [], values: [], group: null, metric: null };
  const metric = selectMetricColumn(profile);
  const group = selectGroupColumn(profile, rows);
  const grouped = groupMetric(rows, group, metric);
  let items = grouped.length ? grouped : rows.slice(0, 20).map((row, index) => ({ label: String(row[group] ?? index + 1), value: Number(row[metric]) }));
  const maxPoints = 60;
  if (items.length > maxPoints) {
    const stride = (items.length - 1) / (maxPoints - 1);
    items = Array.from({ length: maxPoints }, (_, index) => items[Math.round(index * stride)]);
  }
  return { labels: items.map(item => item.label), values: items.map(item => item.value), group, metric, type };
}

export function renderChart(svg, series, type, selectedLabel, onSelect) {
  clear(svg);
  const values = series.values.filter(Number.isFinite);
  if (!values.length) return false;
  const width = 700, height = 250, left = 55, right = 17, top = 12, bottom = 37;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const low = Math.min(0, values.reduce((minimum, value) => Math.min(minimum, value), Infinity));
  const high = values.reduce((maximum, value) => Math.max(maximum, value), -Infinity);
  const span = high - low || 1;
  const y = value => top + plotHeight - ((value - low) / span) * plotHeight;
  const x = index => left + (series.values.length < 2 ? plotWidth / 2 : (index / (series.values.length - 1)) * plotWidth);
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("preserveAspectRatio", "none");
  const defs = make("defs");
  const gradient = make("linearGradient", { id: "chartFill", x1: "0", y1: "0", x2: "0", y2: "1" });
  gradient.append(make("stop", { offset: "0%", "stop-color": "#9580e3", "stop-opacity": ".23" }));
  gradient.append(make("stop", { offset: "100%", "stop-color": "#9580e3", "stop-opacity": "0" }));
  defs.append(gradient);
  svg.append(defs);
  for (let index = 0; index < 4; index += 1) {
    const fraction = index / 3;
    const yy = top + fraction * plotHeight;
    svg.append(make("line", { x1: left, x2: width - right, y1: yy, y2: yy, class: "chart-grid-line" }));
    svg.append(textNode(formatNumber(high - fraction * span), left - 8, yy + 3, "chart-axis-label", "end"));
  }
  const step = Math.max(1, Math.ceil(series.labels.length / 6));
  series.labels.forEach((label, index) => {
    if (index % step !== 0 && index !== series.labels.length - 1) return;
    svg.append(textNode(shortLabel(label), x(index), height - 11, "chart-axis-label", "middle"));
  });
  if (type === "bar") {
    const slot = plotWidth / series.values.length;
    const barWidth = Math.max(4, Math.min(34, slot * .58));
    series.values.forEach((value, index) => {
      const bar = make("rect", { x: x(index) - barWidth / 2, y: y(value), width: barWidth, height: Math.max(1, top + plotHeight - y(value)), class: "chart-bar" + (series.labels[index] === selectedLabel ? " selected" : "") });
      bar.setAttribute("tabindex", "0");
      bar.setAttribute("role", "button");
      bar.setAttribute("aria-label", series.labels[index] + ", " + series.metric + " " + formatNumber(value));
      const title = make("title");
      title.textContent = series.labels[index] + ": " + formatNumber(value);
      bar.append(title);
      bar.addEventListener("click", () => onSelect?.({ label: series.labels[index], value, group: series.group, metric: series.metric, index }));
      bar.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") onSelect?.({ label: series.labels[index], value, group: series.group, metric: series.metric, index }); });
      svg.append(bar);
    });
  } else {
    const coords = series.values.map((value, index) => [x(index), y(value)]);
    const linePath = coords.map((point, index) => (index ? "L" : "M") + point[0] + " " + point[1]).join(" ");
    const areaPath = linePath + " L " + coords.at(-1)[0] + " " + (top + plotHeight) + " L " + coords[0][0] + " " + (top + plotHeight) + " Z";
    svg.append(make("path", { d: areaPath, class: "chart-area" }));
    svg.append(make("path", { d: linePath, class: "chart-line" }));
    coords.forEach((point, index) => {
      const circle = make("circle", { cx: point[0], cy: point[1], r: 4, class: "chart-point" + (series.labels[index] === selectedLabel ? " selected" : "") });
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("role", "button");
      circle.setAttribute("aria-label", series.labels[index] + ", " + series.metric + " " + formatNumber(series.values[index]));
      const title = make("title");
      title.textContent = series.labels[index] + ": " + formatNumber(series.values[index]);
      circle.append(title);
      circle.addEventListener("click", () => onSelect?.({ label: series.labels[index], value: series.values[index], group: series.group, metric: series.metric, index }));
      circle.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") onSelect?.({ label: series.labels[index], value: series.values[index], group: series.group, metric: series.metric, index }); });
      svg.append(circle);
    });
  }
  return true;
}

function shortLabel(value) {
  const text = String(value);
  return text.length > 10 ? text.slice(0, 8) + "…" : text;
}

function clear(element) { while (element.firstChild) element.removeChild(element.firstChild); }
function make(tag, attributes = {}) {
  const element = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}
function textNode(value, x, y, className, anchor) {
  const node = make("text", { x, y, class: className, "text-anchor": anchor });
  node.textContent = value;
  return node;
}