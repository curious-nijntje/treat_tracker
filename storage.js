// All localStorage access lives here, so it can be swapped for a backend later.
const STORAGE_KEY = "treatTracker.entries";

// Returns the list of entries: [{ id, date: "YYYY-MM-DD", type: "treat" | "star" }]
function loadEntries() {
  try {
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(entries) ? entries : []; // missing or damaged data
  } catch (e) {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ---- Backup ----
// A backup is plain JSON: { app, version, exportedAt, entries }.

function makeBackup(entries) {
  return JSON.stringify(
    { app: "treat-tracker", version: 1, exportedAt: new Date().toISOString(), entries },
    null,
    2
  );
}

// Returns the entries from backup text, or throws an Error with a message that
// can be shown to the user. Checks everything first so bad files never touch saved data.
function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = null;
  }
  if (!data || data.app !== "treat-tracker" || !Array.isArray(data.entries)) {
    throw new Error("This file is not a Treat Tracker backup.");
  }
  if (data.version !== 1) {
    throw new Error("This backup was made by a newer version of the app.");
  }

  const seenIds = new Set();
  return data.entries.map((e, i) => {
    if (!e || typeof e.id !== "string" || e.id === "" || !isRealDate(e.date) ||
        (e.type !== "treat" && e.type !== "star")) {
      throw new Error(`The backup is damaged at entry ${i + 1}.`);
    }
    if (seenIds.has(e.id)) throw new Error(`The backup has a duplicate entry (entry ${i + 1}).`);
    seenIds.add(e.id);
    return { id: e.id, date: e.date, type: e.type };
  });
}

// "YYYY-MM-DD" that is an actual calendar day (rejects 2026-02-30 and timestamps).
function isRealDate(text) {
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [y, m, d] = text.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// Lets the tests load this file in node; browsers ignore it.
if (typeof module !== "undefined") {
  module.exports = { makeBackup, parseBackup };
}
