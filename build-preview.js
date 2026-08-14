#!/usr/bin/env node
// Builds every HTML output for this project from its source fragments:
//   - Standalone previews: fragment.html + *-wrapper.html -> *-preview.html
//   - Combined sheet: main/equipment/vehicles.html + sheet-template.html
//     -> sheet.html (the actual file that ships to Roll20)
//   - Combined preview: sheet.html + sheet-wrapper.html -> sheet-preview.html

const fs = require("fs");
const path = require("path");

const root = __dirname;

// Simple standalone sheets: one fragment + one wrapper -> one preview page.
const STANDALONE = [
  { fragment: "main.html", wrapper: "preview-wrapper.html", out: "preview.html", placeholder: "<!-- MAIN_HTML -->" },
  { fragment: "equipment.html", wrapper: "equipment-wrapper.html", out: "equipment-preview.html", placeholder: "<!-- EQUIPMENT_HTML -->" },
  { fragment: "vehicles.html", wrapper: "vehicle-wrapper.html", out: "vehicle-preview.html", placeholder: "<!-- VEHICLE_HTML -->" },
];

// The combined sheet: three fragments spliced into one template, tab-wrapped.
const COMBINED = {
  template: "sheet-template.html",
  out: "sheet.html",
  parts: [
    { fragment: "main.html", placeholder: "<!-- MAIN_HTML -->" },
    { fragment: "equipment.html", placeholder: "<!-- EQUIPMENT_HTML -->" },
    { fragment: "vehicles.html", placeholder: "<!-- VEHICLE_HTML -->" },
  ],
};

// Preview of the combined sheet: sheet.html spliced into its own wrapper.
const COMBINED_PREVIEW = {
  wrapper: "sheet-wrapper.html",
  fragment: "sheet.html",
  out: "sheet-preview.html",
  placeholder: "<!-- SHEET_HTML -->",
};

function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

function write(name, contents) {
  fs.writeFileSync(path.join(root, name), contents);
  console.log(`[build-preview] wrote ${name} (${new Date().toLocaleTimeString()})`);
}

function buildStandalone(sheet) {
  const wrapper = read(sheet.wrapper);
  const fragment = read(sheet.fragment);
  if (!wrapper.includes(sheet.placeholder)) {
    throw new Error(`${sheet.placeholder} not found in ${sheet.wrapper}`);
  }
  write(sheet.out, wrapper.replace(sheet.placeholder, fragment));
}

function buildCombined() {
  let page = read(COMBINED.template);
  COMBINED.parts.forEach((part) => {
    if (!page.includes(part.placeholder)) {
      throw new Error(`${part.placeholder} not found in ${COMBINED.template}`);
    }
    page = page.replace(part.placeholder, read(part.fragment));
  });
  write(COMBINED.out, page);
}

function buildCombinedPreview() {
  const wrapper = read(COMBINED_PREVIEW.wrapper);
  const fragment = read(COMBINED_PREVIEW.fragment);
  if (!wrapper.includes(COMBINED_PREVIEW.placeholder)) {
    throw new Error(`${COMBINED_PREVIEW.placeholder} not found in ${COMBINED_PREVIEW.wrapper}`);
  }
  write(COMBINED_PREVIEW.out, wrapper.replace(COMBINED_PREVIEW.placeholder, fragment));
}

function buildAll() {
  STANDALONE.forEach(buildStandalone);
  buildCombined();
  buildCombinedPreview();
}

buildAll();

if (process.argv.includes("--watch")) {
  console.log("[build-preview] watching source html files for changes...");
  // Watch the directory (not the files directly): editors that save via
  // rename-on-write replace the file's inode, which silently kills a
  // fs.watch() handle held on the old file.
  const watchedFiles = new Set([
    ...STANDALONE.flatMap((s) => [s.fragment, s.wrapper]),
    COMBINED.template,
    ...COMBINED.parts.map((p) => p.fragment),
    COMBINED_PREVIEW.wrapper,
  ]);

  let pending = null;
  fs.watch(root, (eventType, filename) => {
    if (!filename || !watchedFiles.has(filename)) return;
    clearTimeout(pending);
    pending = setTimeout(() => {
      try {
        buildAll();
      } catch (err) {
        console.error("[build-preview] error:", err.message);
      }
    }, 50);
  });
}
