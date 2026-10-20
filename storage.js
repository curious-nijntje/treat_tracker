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
