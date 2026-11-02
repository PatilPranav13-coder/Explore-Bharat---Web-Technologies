import { readDatasetFile } from "./core/ingest.js";
import { profileDataset, analyzeQuestion, formatNumber, selectGroupColumn, selectMetricColumn } from "./core/analysis.js";
import { chartSeries, renderChart } from "./core/chart.js";
import { loadWorkspace, saveWorkspace, clearWorkspace } from "./core/storage.js";
import { createDrawingPad } from "./core/pencil.js";
import { downloadText, downloadBlob, exportDatasetCSV, exportWorkspaceJSON, exportChartPNG, downloadReport, printReport } from "./core/export.js";

const demoRows = [
  { Month: "Jan", Revenue: 42000, Orders: 410, Marketing: 7200, Region: "West" },
  { Month: "Feb", Revenue: 43800, Orders: 426, Marketing: 7400, Region: "West" },
  { Month: "Mar", Revenue: 46100, Orders: 449, Marketing: 7600, Region: "South" },
  { Month: "Apr", Revenue: 45400, Orders: 438, Marketing: 7350, Region: "South" },
  { Month: "May", Revenue: 48900, Orders: 472, Marketing: 8100, Region: "West" },
  { Month: "Jun", Revenue: 51100, Orders: 495, Marketing: 8300, Region: "North" },
  { Month: "Jul", Revenue: 47600, Orders: 459, Marketing: 7900, Region: "North" },
  { Month: "Aug", Revenue: 53600, Orders: 516, Marketing: 8700, Region: "West" },
  { Month: "Sep", Revenue: 54800, Orders: 529, Marketing: 8900, Region: "East" },
  { Month: "Oct", Revenue: 57100, Orders: 547, Marketing: 9100, Region: "East" },
  { Month: "Nov", Revenue: 55900, Orders: 536, Marketing: 9000, Region: "South" },
  { Month: "Dec", Revenue: 62400, Orders: 588, Marketing: 9900, Region: "West" }
];
const demoDataset = {
  id: "sample-retail",
  name: "Retail pulse · Example",
  sourceName: "Generated retail example",
  projectId: "project-studio",
  createdAt: new Date().toISOString(),
  rows: demoRows,
  isDemo: true,
  parentDatasetId: null,
  version: 1
};
const defaultWorkspace = () => ({
  version: 1,
  projects: [{ id: "project-studio", name: "Studio workspace", description: "A private space to explore data.", createdAt: new Date().toISOString() }],
  activeProjectId: "project-studio",
  datasets: [structuredClone(demoDataset)],
  activeDatasetId: demoDataset.id,
  messages: [],
  timeline: [{ id: crypto.randomUUID(), type: "workspace-created", label: "Example workspace opened", createdAt: new Date().toISOString() }],
  note: { title: "Untitled note", body: "", linkedDatasetId: null, drawing: "" },
  settings: { theme: "light", provider: "none", privacy: "local", serverSync: false, layout: "studio", demoDismissed: false },
  selectedPoint: null
});

let workspace = null;
let health = { providers: { openai: false, anthropic: false }, authRequired: false };
let serverRevision = 0;
let saveTimer = 0;
let tablePage = 1;
let tableSort = { key: "", direction: 1 };
let drawingPad = null;
let isRestoringCanvas = false;
let activeDataset = null;
let profile = null;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const id = value => document.getElementById(value);

function create(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== "") element.textContent = String(text);
  return element;
}
function activeProject() { return workspace.projects.find(item => item.id === workspace.activeProjectId) || workspace.projects[0]; }
function selectedDataset() { return workspace.datasets.find(item => item.id === workspace.activeDatasetId) || workspace.datasets[0] || null; }
function safeFileName(value) { return String(value || "dataset").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "dataset"; }

async function start() {
  const stored = await loadWorkspace();
  hasLocalWorkspace = Boolean(stored);
  workspace = stored ? normalizeWorkspace(stored) : defaultWorkspace();
  applyTheme();
  applyLayout();
  bindUI();
  const healthResult = await fetch("api/health").then(response => response.ok ? response.json() : null).catch(() => null);
  if (healthResult) health = healthResult;
  const authStatus = await fetch("api/auth/status").then(response => response.json()).catch(() => ({ required: false }));
  if (authStatus.required && !authStatus.authenticated) id("login-dialog").showModal();
  if (workspace.settings.serverSync) await loadServerCopy(hasLocalWorkspace);
  refresh();
  initCanvas();
  if (!stored) scheduleSave();
  updateProviderStatus();
  updateDateGreeting();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
  detectSegments();
}

function normalizeWorkspace(value) {
  const base = defaultWorkspace();
  return {
    ...base,
    ...value,
    projects: Array.isArray(value.projects) && value.projects.length ? value.projects : base.projects,
    datasets: Array.isArray(value.datasets) ? value.datasets : base.datasets,
    messages: Array.isArray(value.messages) ? value.messages : [],
    timeline: Array.isArray(value.timeline) ? value.timeline : [],
    note: { ...base.note, ...(value.note || {}) },
    settings: { ...base.settings, ...(value.settings || {}) }
  };
}

function bindUI() {
  $$(".nav-item[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  $$("[data-open-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.openView)));
  id("new-project").addEventListener("click", createProject);
  id("new-project-page").addEventListener("click", createProject);
  id("new-analysis").addEventListener("click", () => {
    if (!workspace.datasets.length) openFilePicker();
    else { setView("datasets"); id("question-input").focus(); }
  });
  [id("import-top"), id("import-chart"), id("import-data-view")].forEach(button => button.addEventListener("click", openFilePicker));
  id("file-input").addEventListener("change", async event => { await importFiles([...event.target.files]); event.target.value = ""; });
  id("dataset-select").addEventListener("change", event => { workspace.activeDatasetId = event.target.value; tablePage = 1; track("dataset-selected", "Opened " + (selectedDataset()?.name || "dataset")); refresh(); scheduleSave(); });
  id("chart-type").addEventListener("change", renderMainChart);
  id("chart-export").addEventListener("click", () => exportChartPNG(id("main-chart")).then(() => toast("Chart exported as PNG.")).catch(error => toast(error.message, true)));
  id("open-data-view").addEventListener("click", () => setView("datasets"));
  id("ask-form").addEventListener("submit", event => { event.preventDefault(); askQuestion(id("question-input").value); });
  $$(".suggestion-chip").forEach(button => button.addEventListener("click", () => askQuestion(button.textContent)));
  id("clear-context").addEventListener("click", () => { workspace.selectedPoint = null; renderContext(); renderMainChart(); scheduleSave(); });
  id("table-search").addEventListener("input", () => { tablePage = 1; renderTable(); });
  id("remove-duplicates").addEventListener("click", deriveDeduplicatedDataset);
  id("refresh-insights").addEventListener("click", () => { refresh(); toast("Quality and distribution checks updated."); });
  id("theme-toggle").addEventListener("click", toggleTheme);
  id("open-settings").addEventListener("click", openSettings);
  id("open-settings-top").addEventListener("click", openSettings);
  id("privacy-settings").addEventListener("click", openSettings);
  id("focus-mode").addEventListener("click", toggleFocus);
  id("layout-toggle").addEventListener("click", toggleFocus);
  id("dismiss-demo").addEventListener("click", () => { workspace.settings.demoDismissed = true; id("demo-notice").classList.add("hidden"); scheduleSave(); });
  id("note-title").addEventListener("input", () => { workspace.note.title = id("note-title").value; noteChanged(); });
  id("note-body").addEventListener("input", () => { workspace.note.body = id("note-body").value; noteChanged(); });
  id("attach-dataset").addEventListener("click", () => {
    workspace.note.linkedDatasetId = activeDataset?.id || null;
    id("note-linked-dataset").textContent = activeDataset?.name || "No dataset selected";
    scheduleSave();
    toast(activeDataset ? "Note attached to " + activeDataset.name + "." : "Choose a dataset first.");
  });
  id("pen-color").addEventListener("input", event => drawingPad?.setColor(event.target.value));
  $$(".tool-button[data-tool]").forEach(button => button.addEventListener("click", () => {
    $$(".tool-button[data-tool]").forEach(item => item.classList.toggle("active", item === button));
    drawingPad?.setTool(button.dataset.tool);
  }));
  id("undo-drawing").addEventListener("click", () => { if (!drawingPad?.undo()) toast("Nothing to undo."); });
  id("clear-drawing").addEventListener("click", () => { if (confirm("Clear the current notebook sketch?")) drawingPad?.clear(); });
  id("ai-provider").addEventListener("change", event => { workspace.settings.provider = event.target.value; updateProviderStatus(); scheduleSave(); });
  id("privacy-mode").addEventListener("change", event => { workspace.settings.privacy = event.target.value; scheduleSave(); updatePrivacyHint(); });
  id("backup-workspace").addEventListener("click", () => exportWorkspaceJSON(workspace));
  id("clear-workspace").addEventListener("click", clearLocalWorkspace);
  id("login-form").addEventListener("submit", login);
  id("global-search").addEventListener("keydown", handleSearch);
  id("table-scroll").addEventListener("click", event => {
    if (event.target.closest("[data-next-page]")) { tablePage += 1; renderTable(); }
    if (event.target.closest("[data-export-report]")) safeAction(() => downloadReport(workspace, profile));
    if (event.target.closest("[data-export-pdf]")) safeAction(() => printReport(workspace, profile));
  });
  id("export-csv").addEventListener("click", () => safeAction(() => exportDatasetCSV(activeDataset)));
  installTableExportButtons();
  installDropZone();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") persistNow(); });
  window.addEventListener("resize", detectSegments);
  window.addEventListener("beforeunload", () => { if (saveTimer) persistNow(); });
  document.addEventListener("keydown", handleShortcuts);
}

function installTableExportButtons() {
  const actions = $(".inspector-actions");
  const report = create("button", "button button-secondary", "HTML report");
  report.type = "button"; report.dataset.exportReport = "true";
  const pdf = create("button", "button button-secondary", "Print / PDF");
  pdf.type = "button"; pdf.dataset.exportPdf = "true";
  report.addEventListener("click", () => safeAction(() => downloadReport(workspace, profile)));
  pdf.addEventListener("click", () => safeAction(() => printReport(workspace, profile)));
  actions.append(report, pdf);
}
function openFilePicker() { id("file-input").click(); }
async function importFiles(files) {
  if (!files.length) return;
  for (const file of files) {
    try {
      const rows = await readDatasetFile(file);
      const dataset = {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^.]+$/, ""),
        sourceName: file.name,
        projectId: workspace.activeProjectId,
        createdAt: new Date().toISOString(),
        rows,
        isDemo: false,
        parentDatasetId: null,
        version: 1
      };
      workspace.datasets.push(dataset);
      workspace.activeDatasetId = dataset.id;
      track("dataset-imported", "Imported " + file.name);
      toast(file.name + " imported · " + rows.length.toLocaleString() + " rows.");
    } catch (error) { toast(file.name + ": " + error.message, true); }
  }
  tablePage = 1;
  refresh();
  scheduleSave();
}

function refresh() {
  activeDataset = selectedDataset();
  profile = activeDataset ? profileDataset(activeDataset.rows) : null;
  applyTheme();
  applyLayout();
  renderProjectList();
  renderProjects();
  renderDatasetOptions();
  renderMetrics();
  renderMainChart();
  renderConversation();
  renderContext();
  renderDatasetList();
  renderTable();
  renderQuality();
  renderDiscoveries();
  renderNote();
  updatePrivacyHint();
}

function renderProjectList() {
  const container = id("project-list");
  container.replaceChildren();
  workspace.projects.slice(0, 5).forEach(project => {
    const button = create("button", "project-link" + (project.id === workspace.activeProjectId ? " selected" : ""));
    button.append(create("span", "project-glyph"), create("span", "", project.name));
    button.addEventListener("click", () => { workspace.activeProjectId = project.id; const match = workspace.datasets.find(item => item.projectId === project.id); if (match) workspace.activeDatasetId = match.id; refresh(); scheduleSave(); });
    container.append(button);
  });
}
function renderProjects() {
  const container = id("projects-grid");
  container.replaceChildren();
  for (const project of workspace.projects) {
    const card = create("article", "project-card");
    card.tabIndex = 0;
    const top = create("div", "project-card-top");
    top.append(create("span", "project-glyph"), create("span", "file-type", project.id === workspace.activeProjectId ? "Active" : "Project"));
    const title = create("h2", "", project.name);
    const description = create("p", "", project.description || "A space for related datasets and notes.");
    const count = workspace.datasets.filter(item => item.projectId === project.id).length;
    const meta = create("div", "project-card-meta", count + " dataset" + (count === 1 ? "" : "s") + " · Updated " + relativeDate(project.updatedAt || project.createdAt));
    card.append(top, title, description, meta);
    card.addEventListener("click", () => { workspace.activeProjectId = project.id; const match = workspace.datasets.find(item => item.projectId === project.id); if (match) workspace.activeDatasetId = match.id; setView("overview"); refresh(); scheduleSave(); });
    container.append(card);
  }
}
function createProject() {
  const name = prompt("Name this project");
  if (!name?.trim()) return;
  const project = { id: crypto.randomUUID(), name: name.trim().slice(0, 80), description: "A new analysis workspace.", createdAt: new Date().toISOString() };
  workspace.projects.push(project);
  workspace.activeProjectId = project.id;
  track("project-created", "Created project " + project.name);
  refresh(); scheduleSave(); setView("projects");
}

function renderDatasetOptions() {
  const select = id("dataset-select");
  const previous = workspace.activeDatasetId;
  select.replaceChildren();
  if (!workspace.datasets.length) select.append(new Option("No dataset", ""));
  workspace.datasets.forEach(dataset => select.append(new Option(dataset.name + (dataset.isDemo ? " · example" : ""), dataset.id)));
  select.value = previous || "";
  id("dataset-title").textContent = activeDataset?.name || "No dataset selected";
}
function renderMetrics() {
  const datasetCount = workspace.datasets.filter(item => !item.isDemo).length;
  id("metric-datasets").textContent = datasetCount || (workspace.datasets.length ? "1 example" : "0");
  id("metric-datasets-foot").textContent = datasetCount ? workspace.datasets.filter(item => !item.isDemo).map(item => item.name).slice(0, 2).join(", ") : "Bring in a CSV, JSON or Excel file";
  id("metric-rows").textContent = (activeDataset?.rows.length || 0).toLocaleString();
  id("metric-rows-foot").textContent = activeDataset ? activeDataset.rows.length.toLocaleString() + " rows in " + Object.keys(activeDataset.rows[0] || {}).length + " columns" : "Calculated locally in your browser";
  const findingCount = profile?.findings.length || 0;
  id("metric-findings").textContent = findingCount;
  id("finding-count").textContent = findingCount;
  id("metric-findings-foot").textContent = findingCount ? "Evidence-backed checks for this dataset" : "New data creates useful checks";
  id("metric-state").textContent = "Saved";
  id("metric-saved").textContent = "On this device · IndexedDB";
  id("demo-notice").classList.toggle("hidden", workspace.settings.demoDismissed || !activeDataset?.isDemo);
}
function renderMainChart() {
  const empty = id("chart-empty");
  const svg = id("main-chart");
  const legend = id("chart-legend");
  legend.replaceChildren();
  if (!activeDataset || !profile?.numericColumns.length) {
    svg.replaceChildren();
    empty.classList.add("visible");
    id("chart-subtitle").textContent = activeDataset ? "No numeric columns were detected in this dataset." : "Choose a dataset to start finding a story.";
    id("chart-footnote").textContent = "Calculations are performed locally.";
    return;
  }
  empty.classList.remove("visible");
  const series = chartSeries(activeDataset.rows, profile, id("chart-type").value);
  id("chart-subtitle").textContent = series.metric + " grouped by " + series.group + (activeDataset.isDemo ? " · example data" : "");
  const key = create("span");
  const swatch = create("span", "legend-swatch");
  key.append(swatch, document.createTextNode(series.metric));
  legend.append(key);
  const rendered = renderChart(svg, series, id("chart-type").value, workspace.selectedPoint?.label, point => {
    workspace.selectedPoint = point;
    renderContext();
    renderMainChart();
    scheduleSave();
  });
  if (!rendered) empty.classList.add("visible");
  id("chart-footnote").textContent = "Grouped totals · " + series.values.length + " points · Click a point to ask about it.";
}
function renderContext() {
  const chip = id("context-chip");
  const text = chip.querySelector("span");
  text.textContent = workspace.selectedPoint
    ? "Selected: " + workspace.selectedPoint.label + (workspace.selectedPoint.value === undefined ? "" : " · " + formatNumber(workspace.selectedPoint.value))
    : (activeDataset ? activeDataset.name + " summary" : "No dataset selected");
}
function renderConversation() {
  const list = id("conversation");
  list.replaceChildren();
  const messages = workspace.messages.slice(-24);
  if (!messages.length) {
    const welcome = create("div", "message assistant", activeDataset
      ? "I profiled " + activeDataset.rows.length.toLocaleString() + " rows. Ask for a maximum, trend, correlation, data-quality check, or a simple baseline forecast."
      : "Import a dataset and I can calculate its profile, compare groups, and flag values worth reviewing.");
    const source = create("small", "source-note", "Local engine · no data leaves this device");
    welcome.append(source);
    list.append(welcome);
  } else {
    messages.forEach(item => {
      const bubble = create("div", "message " + (item.role === "user" ? "user" : "assistant"), item.content);
      if (item.source) bubble.append(create("small", "source-note", item.source));
      list.append(bubble);
    });
  }
  list.scrollTop = list.scrollHeight;
}
function renderDatasetList() {
  const list = id("recent-datasets");
  list.replaceChildren();
  const items = workspace.datasets.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  if (!items.length) list.append(create("div", "empty-line", "No datasets yet. Import a file to begin."));
  items.forEach(dataset => {
    const row = create("div", "dataset-row");
    const glyph = create("span", "dataset-glyph");
    glyph.innerHTML = '<svg class="icon"><use href="#i-table"></use></svg>';
    const main = create("div", "dataset-main");
    main.append(create("strong", "", dataset.name), create("small", "", dataset.rows.length.toLocaleString() + " rows · " + Object.keys(dataset.rows[0] || {}).length + " columns" + (dataset.isDemo ? " · example" : "")));
    const type = create("span", "file-type", dataset.sourceName.split(".").pop().toUpperCase());
    row.append(glyph, main, type);
    row.title = "Open dataset. Double-click its name to rename.";
    row.addEventListener("click", () => { workspace.activeDatasetId = dataset.id; refresh(); setView("datasets"); scheduleSave(); });
    row.addEventListener("dblclick", event => { event.stopPropagation(); renameDataset(dataset); });
    list.append(row);
  });
}
function renameDataset(dataset) {
  const name = prompt("Rename dataset", dataset.name);
  if (!name?.trim() || name.trim() === dataset.name) return;
  const derived = { ...dataset, id: crypto.randomUUID(), name: name.trim().slice(0, 100), rows: dataset.rows.map(row => ({ ...row })), parentDatasetId: dataset.id, version: (dataset.version || 1) + 1, createdAt: new Date().toISOString(), isDemo: false };
  workspace.datasets.push(derived);
  workspace.activeDatasetId = derived.id;
  track("dataset-versioned", "Created renamed dataset version");
  refresh(); scheduleSave();
}
function renderTable() {
  const container = id("table-scroll");
  const search = (id("table-search").value || "").toLowerCase();
  if (!activeDataset || !profile) {
    container.replaceChildren(create("div", "empty-inline", "Import a CSV, JSON or XLSX file to inspect its rows."));
    id("table-count").textContent = "No rows";
    return;
  }
  const columns = profile.columns.map(item => item.name);
  let records = activeDataset.rows.map((row, index) => ({ row, index })).filter(({ row }) => !search || columns.some(key => String(row[key] ?? "").toLowerCase().includes(search)));
  if (tableSort.key) records.sort((a, b) => String(a.row[tableSort.key] ?? "").localeCompare(String(b.row[tableSort.key] ?? ""), undefined, { numeric: true }) * tableSort.direction);
  const total = records.length, visible = records.slice(0, tablePage * 150);
  const table = create("table", "data-table");
  const thead = create("thead"), headRow = create("tr");
  columns.forEach(key => {
    const th = create("th", "", key + (tableSort.key === key ? (tableSort.direction > 0 ? " ↑" : " ↓") : ""));
    th.title = "Click to sort · double-click to create a renamed version";
    th.tabIndex = 0;
    th.addEventListener("click", () => { tableSort = { key, direction: tableSort.key === key ? -tableSort.direction : 1 }; renderTable(); });
    th.addEventListener("dblclick", () => renameColumn(key));
    headRow.append(th);
  });
  thead.append(headRow);
  const tbody = create("tbody");
  visible.forEach(({ row, index }) => {
    const tr = create("tr");
    tr.title = "Select row " + (index + 1) + " as analysis context";
    columns.forEach(key => tr.append(create("td", "", row[key] == null ? "" : String(row[key]))));
    tr.addEventListener("click", () => {
      const metric = profile.numericColumns[0];
      workspace.selectedPoint = { label: "row " + (index + 1), value: metric ? Number(row[metric]) || 0 : undefined, rowIndex: index, row };
      renderContext(); renderMainChart(); scheduleSave();
      toast("Row " + (index + 1) + " selected for contextual questions.");
    });
    tbody.append(tr);
  });
  table.append(thead, tbody);
  container.replaceChildren(table);
  if (visible.length < total) {
    const more = create("button", "text-button", "Load next 150 rows");
    more.dataset.nextPage = "true";
    more.style.margin = "10px";
    container.append(more);
  }
  id("table-count").textContent = total.toLocaleString() + " rows" + (visible.length < total ? " · showing " + visible.length.toLocaleString() : "");
}
function renameColumn(key) {
  const next = prompt("Rename column", key);
  if (!next?.trim() || next.trim() === key) return;
  const newName = next.trim().slice(0, 80);
  if (activeDataset.rows.some(row => Object.hasOwn(row, newName))) return toast("A column with that name already exists.", true);
  const derived = { ...activeDataset, id: crypto.randomUUID(), name: activeDataset.name + " · revised", sourceName: activeDataset.sourceName, rows: activeDataset.rows.map(row => { const copy = { ...row }; copy[newName] = copy[key]; delete copy[key]; return copy; }), parentDatasetId: activeDataset.id, version: (activeDataset.version || 1) + 1, createdAt: new Date().toISOString(), isDemo: false };
  workspace.datasets.push(derived);
  workspace.activeDatasetId = derived.id;
  track("column-renamed", "Created a derived dataset with a renamed column");
  refresh(); scheduleSave();
}
function deriveDeduplicatedDataset() {
  if (!activeDataset) return toast("Choose a dataset first.");
  const seen = new Set(), rows = [];
  for (const row of activeDataset.rows) {
    const key = JSON.stringify(Object.keys(row).sort().map(name => row[name] ?? null));
    if (seen.has(key)) continue;
    seen.add(key); rows.push({ ...row });
  }
  const removed = activeDataset.rows.length - rows.length;
  if (!removed) return toast("No exact duplicate rows were found.");
  const derived = { ...activeDataset, id: crypto.randomUUID(), name: activeDataset.name + " · deduplicated", rows, parentDatasetId: activeDataset.id, version: (activeDataset.version || 1) + 1, createdAt: new Date().toISOString(), isDemo: false };
  workspace.datasets.push(derived);
  workspace.activeDatasetId = derived.id;
  track("dataset-transformed", "Created a derived dataset with " + removed + " duplicates removed");
  refresh(); scheduleSave();
  toast("Created a new version with " + removed + " duplicate row" + (removed === 1 ? "" : "s") + " removed. Original kept.");
}

function renderQuality() {
  const strip = id("quality-strip"), columns = id("column-profile");
  strip.replaceChildren(); columns.replaceChildren();
  if (!profile) {
    id("quality-score").textContent = "—";
    ["Rows", "Columns", "Missing", "Duplicates"].forEach(label => { const item = create("div", "quality-item"); item.append(create("span", "", label), create("strong", "", "—")); strip.append(item); });
    return;
  }
  id("quality-score").textContent = profile.qualityScore + "/100";
  [["Rows", profile.rowCount], ["Columns", profile.columnCount], ["Missing", profile.missingCount], ["Duplicates", profile.duplicateCount]].forEach(([label, value]) => {
    const item = create("div", "quality-item"); item.append(create("span", "", label), create("strong", "", Number(value).toLocaleString())); strip.append(item);
  });
  profile.columns.forEach(column => {
    const card = create("article", "column-card");
    card.append(create("strong", "", column.name), create("small", "", column.type + " · " + column.uniqueCount.toLocaleString() + " unique"));
    const detail = column.type === "number" ? "Mean " + formatNumber(column.mean) + " · range " + formatNumber(column.min) + "–" + formatNumber(column.max) : column.missingCount + " missing · " + column.count + " present";
    card.append(create("div", "column-stat", detail));
    columns.append(card);
  });
}
function renderDiscoveries() {
  const recent = id("recent-discoveries"), board = id("discovery-board");
  recent.replaceChildren(); board.replaceChildren();
  const findings = profile?.findings || [];
  if (!findings.length) {
    recent.append(create("div", "empty-line", "Import a dataset to run the quality checks."));
    board.append(create("div", "empty-line", "There are no checks to show yet."));
    return;
  }
  findings.slice(0, 3).forEach(item => recent.append(discoveryRow(item)));
  findings.forEach(item => {
    const card = create("article", "discovery-card");
    const header = create("div", "discovery-card-header");
    header.append(create("span", "discovery-icon", item.kind.slice(0, 1).toUpperCase()), create("h2", "", item.title));
    card.append(header, create("p", "", item.detail), create("div", "evidence-line", item.evidence));
    const follow = create("button", "follow-up", "Ask: " + item.question);
    follow.addEventListener("click", () => { setView("overview"); askQuestion(item.question); });
    card.append(follow);
    board.append(card);
  });
}
function discoveryRow(item) {
  const row = create("div", "discovery-row");
  row.append(create("span", "discovery-icon", item.kind.slice(0, 1).toUpperCase()));
  const main = create("div", "discovery-main");
  main.append(create("strong", "", item.title), create("small", "", item.detail));
  row.append(main);
  return row;
}
function renderNote() {
  id("note-title").value = workspace.note.title || "Untitled note";
  id("note-body").value = workspace.note.body || "";
  id("note-linked-dataset").textContent = workspace.datasets.find(item => item.id === workspace.note.linkedDatasetId)?.name || "No dataset attached";
}
function initCanvas() {
  drawingPad?.dispose();
  drawingPad = createDrawingPad(id("note-canvas"), { onChange: () => { if (isRestoringCanvas) return; id("canvas-placeholder").classList.add("hidden"); workspace.note.drawing = drawingPad.serialize(); noteChanged(); } });
  isRestoringCanvas = true;
  drawingPad.restore(workspace.note.drawing);
  if (workspace.note.drawing) id("canvas-placeholder").classList.add("hidden");
  isRestoringCanvas = false;
}
async function askQuestion(rawQuestion) {
  const question = String(rawQuestion || "").trim();
  if (!question) return;
  id("question-input").value = "";
  workspace.messages.push({ role: "user", content: question, createdAt: new Date().toISOString() });
  const result = analyzeQuestion(question, activeDataset?.rows || [], profile || { columns: [], findings: [], numericColumns: [], categoricalColumns: [], rowCount: 0, columnCount: 0, missingCount: 0, duplicateCount: 0, qualityScore: 0 }, workspace.selectedPoint);
  workspace.messages.push({ role: "assistant", content: result.answer, source: result.source, createdAt: new Date().toISOString() });
  workspace.messages = workspace.messages.slice(-100);
  renderConversation();
  track("question-asked", question.slice(0, 90));
  scheduleSave();
  const provider = workspace.settings.provider;
  const mayShare = workspace.settings.privacy !== "local";
  if (!provider || provider === "none" || !mayShare) return;
  if (!health.providers?.[provider]) { toast("That provider is not configured on the server. Local calculations are still available.", true); return; }
  const context = buildAIContext(result);
  const pending = { role: "assistant", content: "Thinking with the calculated summary…", source: "Sent only the information allowed by your privacy setting.", pending: true };
  workspace.messages.push(pending);
  renderConversation();
  try {
    const response = await fetch("api/ai/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ provider, question, context })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "AI request failed.");
    workspace.messages = workspace.messages.filter(item => item !== pending);
    workspace.messages.push({ role: "assistant", content: payload.text, source: "Optional " + (provider === "openai" ? "OpenAI" : "Anthropic") + " provider · calculated context supplied", createdAt: new Date().toISOString() });
  } catch (error) {
    workspace.messages = workspace.messages.filter(item => item !== pending);
    workspace.messages.push({ role: "assistant", content: "The optional AI request could not finish: " + error.message + "\nYour local calculation above is still available.", source: "Local engine", createdAt: new Date().toISOString() });
  }
  workspace.messages = workspace.messages.slice(-100);
  renderConversation(); scheduleSave();
}

function buildAIContext(localResult) {
  const context = {
    dataset: { name: activeDataset?.name || "", rowCount: profile?.rowCount || 0, columnCount: profile?.columnCount || 0 },
    calculatedProfile: {
      qualityScore: profile?.qualityScore,
      missingCount: profile?.missingCount,
      duplicateCount: profile?.duplicateCount,
      columns: (profile?.columns || []).map(column => ({
        name: column.name, type: column.type, count: column.count, missingCount: column.missingCount,
        mean: column.mean, median: column.median, min: column.min, max: column.max, sum: column.sum, outlierCount: column.outlierCount,
        topValues: column.topValues
      })),
      findings: profile?.findings || []
    },
    localCalculation: localResult,
    selectedPoint: workspace.selectedPoint ? {
      label: workspace.selectedPoint.label,
      group: workspace.selectedPoint.group,
      metric: workspace.selectedPoint.metric,
      value: workspace.selectedPoint.value
    } : null
  };
  if (workspace.settings.privacy === "selection" && workspace.selectedPoint?.row) {
    context.selectedRows = [{ rowNumber: workspace.selectedPoint.rowIndex + 1, values: workspace.selectedPoint.row }];
  }
  return context;
}

function noteChanged() {
  id("note-save-state").textContent = "Saving…";
  scheduleSave();
}
function track(type, label) {
  workspace.timeline.push({ id: crypto.randomUUID(), type, label, createdAt: new Date().toISOString() });
  workspace.timeline = workspace.timeline.slice(-250);
  const project = activeProject();
  if (project) project.updatedAt = new Date().toISOString();
}
function scheduleSave() {
  clearTimeout(saveTimer);
  id("metric-state").textContent = "Saving…";
  id("sync-dot").className = "status-dot pending";
  id("sync-label").textContent = "Saving changes";
  id("note-save-state").textContent = "Saving…";
  saveTimer = setTimeout(persistNow, 600);
}
async function persistNow() {
  clearTimeout(saveTimer);
  saveTimer = 0;
  workspace.savedAt = new Date().toISOString();
  try {
    await saveWorkspace(workspace);
    id("metric-state").textContent = "Saved";
    id("metric-saved").textContent = "On this device · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    id("sync-dot").className = "status-dot";
    id("sync-label").textContent = "Saved on this device";
    id("note-save-state").textContent = "Saved";
  } catch (error) {
    id("sync-dot").className = "status-dot error";
    id("sync-label").textContent = "Save failed";
    toast("Could not save this workspace: " + error.message, true);
    return;
  }
  if (workspace.settings.serverSync) await pushServerCopy();
}
async function loadServerCopy(hasLocal = true) {
  try {
    const response = await fetch("api/workspace", { credentials: "same-origin" });
    if (response.status === 401) { id("login-dialog").showModal(); return; }
    if (!response.ok) throw new Error("server workspace unavailable");
    const remote = await response.json();
    serverRevision = remote.revision || 0;
    if (!hasLocal && remote.snapshot) {
      workspace = normalizeWorkspace(remote.snapshot);
      await saveWorkspace(workspace);
      refresh();
      toast("Restored this workspace from the local server.");
    }
    id("server-sync-setting").textContent = "Connected · revision " + serverRevision;
  } catch {
    id("server-sync-setting").textContent = "Unavailable";
  }
}
async function pushServerCopy() {
  if (!workspace.settings.serverSync) return;
  try {
    if (serverRevision === 0) {
      const current = await fetch("api/workspace", { credentials: "same-origin" });
      if (current.status === 401) { id("login-dialog").showModal(); return; }
      if (current.ok) serverRevision = (await current.json()).revision || 0;
    }
    const response = await fetch("api/workspace", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ snapshot: workspace, expectedRevision: serverRevision })
    });
    if (response.status === 409) {
      workspace.settings.serverSync = false;
      id("server-sync-toggle").checked = false;
      id("server-sync-setting").textContent = "Paused · conflict";
      toast("The server copy changed elsewhere. Local data is safe; server sync paused to avoid overwriting it.", true);
      await saveWorkspace(workspace);
      return;
    }
    if (!response.ok) throw new Error((await response.json()).error || "sync failed");
    const saved = await response.json();
    serverRevision = saved.revision;
    id("server-sync-setting").textContent = "Connected · revision " + serverRevision;
    id("sync-label").textContent = "Saved on this device and local server";
  } catch {
    id("server-sync-setting").textContent = "Unavailable";
    id("sync-dot").className = "status-dot error";
  }
}

function applyTheme() {
  document.documentElement.dataset.theme = workspace.settings.theme === "dark" ? "dark" : "light";
  id("theme-toggle").setAttribute("aria-label", workspace.settings.theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}
function toggleTheme() {
  workspace.settings.theme = workspace.settings.theme === "dark" ? "light" : "dark";
  applyTheme(); scheduleSave();
}
function applyLayout() { document.documentElement.dataset.layout = workspace.settings.layout === "focus" ? "focus" : "studio"; }
function toggleFocus() {
  workspace.settings.layout = workspace.settings.layout === "focus" ? "studio" : "focus";
  applyLayout(); scheduleSave();
  toast(workspace.settings.layout === "focus" ? "Focus layout is on." : "Studio layout is on.");
}
function setView(view) {
  $$(".view-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.viewPanel === view));
  $$(".nav-item[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  const label = ({ overview: "Overview", projects: "Projects", datasets: "Data explorer", insights: "Discoveries", notebook: "Notebook" })[view] || "Overview";
  id("crumb-current").textContent = label;
  history.replaceState(null, "", "#" + view);
  if (view === "notebook") setTimeout(() => drawingPad?.restore(workspace.note.drawing), 50);
  if (view === "datasets") renderTable();
}
function updateProviderStatus() {
  const provider = workspace.settings.provider;
  id("ai-provider").value = provider || "none";
  id("privacy-mode").value = workspace.settings.privacy || "local";
  const status = id("provider-status");
  const configured = health.providers?.[provider];
  status.textContent = provider === "none"
    ? "Local engine only. No provider receives workspace data."
    : configured
      ? "Configured on the server. API credentials are not visible to this browser."
      : "Not configured. Add the provider key and model ID to the server environment.";
  status.classList.toggle("error", provider !== "none" && !configured);
  id("server-sync-toggle").checked = Boolean(workspace.settings.serverSync);
  id("server-sync-setting").textContent = workspace.settings.serverSync ? "Checking…" : "Off";
  id("server-sync-toggle").onchange = async event => {
    workspace.settings.serverSync = event.target.checked;
    if (event.target.checked) {
      await loadServerCopy(true);
      await persistNow();
    } else {
      id("server-sync-setting").textContent = "Off";
      scheduleSave();
    }
  };
}
function updatePrivacyHint() {
  const hint = $(".privacy-hint");
  if (!hint) return;
  hint.lastChild.textContent = workspace.settings.privacy === "local" ? " Local calculations" : workspace.settings.privacy === "selection" ? " Summary + selected row" : " Calculated summary only";
}
function openSettings() {
  updateProviderStatus();
  id("settings-dialog").showModal();
}
function updateDateGreeting() {
  const date = new Date();
  const day = date.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase();
  $(".eyebrow").lastChild.textContent = " " + day + ", YOUR WORKSPACE IS READY";
  const hour = date.getHours();
  const greeting = hour < 12 ? "Good morning, " : hour < 17 ? "Good afternoon, " : "Good evening, ";
  $("h1 span").textContent = "Pranav.";
  $("h1").firstChild.textContent = greeting;
}
function detectSegments() {
  let segments = [];
  try { if (typeof window.getWindowSegments === "function") segments = window.getWindowSegments(); } catch {}
  if (segments.length === 2) {
    document.documentElement.dataset.segments = "2";
    document.documentElement.dataset.posture = segments[0].y === segments[1].y ? "book" : "tabletop";
  } else {
    document.documentElement.dataset.segments = "1";
    document.documentElement.dataset.posture = "flat";
  }
}
function handleSearch(event) {
  if (event.key !== "Enter") return;
  const query = event.currentTarget.value.trim().toLowerCase();
  if (!query) return;
  const dataset = workspace.datasets.find(item => item.name.toLowerCase().includes(query));
  if (dataset) {
    workspace.activeDatasetId = dataset.id;
    refresh(); setView("datasets"); scheduleSave(); return;
  }
  id("table-search").value = query;
  setView("datasets"); renderTable();
  if (!activeDataset?.rows.some(row => Object.values(row).some(value => String(value).toLowerCase().includes(query)))) toast("No rows or dataset names matched that search.");
}
function handleShortcuts(event) {
  const mod = event.ctrlKey || event.metaKey;
  if (mod && event.key.toLowerCase() === "k") { event.preventDefault(); id("global-search").focus(); }
  if (mod && event.key.toLowerCase() === "i") { event.preventDefault(); openFilePicker(); }
  if (!mod && !event.altKey && !event.target.matches("input,textarea,select")) {
    const view = ({ "1": "overview", "2": "projects", "3": "datasets", "4": "insights", "5": "notebook" })[event.key];
    if (view) setView(view);
    if (event.key === "/") { event.preventDefault(); id("global-search").focus(); }
  }
}
function installDropZone() {
  const overlay = id("drop-overlay");
  let depth = 0;
  window.addEventListener("dragenter", event => { if (!event.dataTransfer?.types.includes("Files")) return; event.preventDefault(); depth += 1; overlay.classList.add("visible"); });
  window.addEventListener("dragover", event => { if (event.dataTransfer?.types.includes("Files")) event.preventDefault(); });
  window.addEventListener("dragleave", event => { if (!event.dataTransfer?.types.includes("Files")) return; depth -= 1; if (depth <= 0) { depth = 0; overlay.classList.remove("visible"); } });
  window.addEventListener("drop", async event => {
    if (!event.dataTransfer?.files.length) return;
    event.preventDefault(); depth = 0; overlay.classList.remove("visible");
    await importFiles([...event.dataTransfer.files]);
  });
}
async function login(event) {
  event.preventDefault();
  id("login-error").textContent = "";
  try {
    const response = await fetch("api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: id("login-password").value }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not sign in.");
    id("login-dialog").close();
    id("login-password").value = "";
    toast("Signed in to this private workspace.");
    if (workspace.settings.serverSync) await loadServerCopy(true);
  } catch (error) { id("login-error").textContent = error.message; }
}
async function clearLocalWorkspace() {
  if (!confirm("Clear the data saved in this browser? Download a backup first if you want to keep a copy.")) return;
  await clearWorkspace();
  workspace = defaultWorkspace();
  hasLocalWorkspace = false;
  serverRevision = 0;
  await fetch("api/workspace", { method: "DELETE", credentials: "same-origin" }).catch(() => {});
  refresh(); initCanvas(); scheduleSave();
  id("settings-dialog").close();
  toast("This browser's workspace data was cleared.");
}
function safeAction(action) {
  try { action(); }
  catch (error) { toast(error.message, true); }
}
function toast(message, error = false) {
  const item = create("div", "toast" + (error ? " error" : ""), message);
  id("toast-region").append(item);
  setTimeout(() => item.remove(), 4500);
}
function relativeDate(value) {
  if (!value) return "recently";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
  return days < 1 ? "today" : days === 1 ? "yesterday" : days + " days ago";
}

let hasLocalWorkspace = false;
start();