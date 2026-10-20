// Weekly count logic. Rebecca writes this one.
//
// countTreatsInWeek(entries, today)
//   entries: [{ id, date: "YYYY-MM-DD", type: "treat" | "star" }]
//   today:   "YYYY-MM-DD"
//   returns: how many "treat" entries fall in the Monday-to-Sunday week containing `today`.
//
// Reminder: dates are plain text, never timestamps.
function countTreatsInWeek(entries, today) {
  // Build dates from numbers (not new Date("YYYY-MM-DD"), which is parsed as UTC).
  const [year, month, day] = today.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // getDay(): Sunday is 0, so Sunday goes back 6 days to reach Monday.
  const daysSinceMonday = (date.getDay() + 6) % 7;
  const monday = new Date(year, month - 1, day - daysSinceMonday);
  const sunday = new Date(year, month - 1, day - daysSinceMonday + 6);

  const start = toDateString(monday);
  const end = toDateString(sunday);

  // YYYY-MM-DD strings sort in date order, so plain string comparison works.
  return entries.filter(
    (entry) => entry.type === "treat" && entry.date >= start && entry.date <= end
  ).length;
}

// Not toISOString(): that converts to UTC and can shift the day.
function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Lets the tests load this file in node; browsers ignore it.
if (typeof module !== "undefined") {
  module.exports = { countTreatsInWeek };
}
