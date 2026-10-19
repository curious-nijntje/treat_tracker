// All localStorage access lives here, so it can be swapped for a backend later.
const STORAGE_KEY = "treatTracker.entries";

// Returns the list of entries: [{ id, date: "YYYY-MM-DD", type: "treat" | "star" }]
function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
