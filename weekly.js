// Weekly count logic. Rebecca writes this one.
//
// countTreatsInWeek(entries, today)
//   entries: [{ id, date: "YYYY-MM-DD", type: "treat" | "star" }]
//   today:   "YYYY-MM-DD"
//   returns: how many "treat" entries fall in the Monday-to-Sunday week containing `today`.
//
// Reminder: dates are plain text, never timestamps.
function countTreatsInWeek(entries, today) {
  const start = weekStart(today);
  const end = addDays(start, 6);

  // YYYY-MM-DD strings sort in date order, so plain string comparison works.
  return entries.filter(
    (entry) => entry.type === "treat" && entry.date >= start && entry.date <= end
  ).length;
}

// The Monday of the week containing `dateString`, as "YYYY-MM-DD".
function weekStart(dateString) {
  // Build dates from numbers (not new Date("YYYY-MM-DD"), which is parsed as UTC).
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  // getDay(): Sunday is 0, so Sunday goes back 6 days to reach Monday.
  const daysSinceMonday = (date.getDay() + 6) % 7;
  return toDateString(new Date(year, month - 1, day - daysSinceMonday));
}

function addDays(dateString, n) {
  const [year, month, day] = dateString.split("-").map(Number);
  return toDateString(new Date(year, month - 1, day + n));
}

// Streak = finished weeks in a row, newest first, with treats <= limit.
// The current week is still in progress, so it is never counted. Weeks before
// the first entry were before the app was used, so they are not counted either.
function countWeekStreak(entries, today, limit) {
  if (entries.length === 0) return 0;

  const firstWeek = weekStart(entries.reduce((a, e) => (e.date < a ? e.date : a), entries[0].date));
  let week = addDays(weekStart(today), -7); // last week's Monday
  let streak = 0;

  while (week >= firstWeek && countTreatsInWeek(entries, week) <= limit) {
    streak++;
    week = addDays(week, -7);
  }
  return streak;
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
  module.exports = { countTreatsInWeek, countWeekStreak };
}
