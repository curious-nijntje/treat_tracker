// Weekly count and streak logic. Weeks run Monday to Sunday.
//
// entries: [{ id, date: "YYYY-MM-DD", type: "treat" | "star" }]
// Dates are plain text, never timestamps, so timezones can't shift a day.

// Build dates from numbers (not new Date("YYYY-MM-DD"), which is parsed as UTC).
function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Not toISOString(): that converts to UTC and can shift the day.
function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// setDate() works on calendar days, so month ends and clock changes are handled.
function addDays(dateString, n) {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + n);
  return toDateString(date);
}

// The Monday of the week containing `dateString`.
function weekStart(dateString) {
  // getDay(): Sunday is 0, so Sunday goes back 6 days to reach Monday.
  return addDays(dateString, -((parseDate(dateString).getDay() + 6) % 7));
}

// How many "treat" entries fall in the week containing `today`.
function countTreatsInWeek(entries, today) {
  const start = weekStart(today);
  const end = addDays(start, 6);

  // YYYY-MM-DD strings sort in date order, so plain string comparison works.
  return entries.filter(
    (entry) => entry.type === "treat" && entry.date >= start && entry.date <= end
  ).length;
}

// Streak = finished weeks in a row, newest first, with treats <= limit.
// The current week is still in progress, so it is never counted. Weeks before
// the first entry were before the app was used, so they are not counted either.
function countWeekStreak(entries, today, limit) {
  if (entries.length === 0) return 0;

  // Count treats per week once, instead of re-scanning every entry for each week.
  const treatsByWeek = {};
  for (const entry of entries) {
    if (entry.type !== "treat") continue;
    const week = weekStart(entry.date);
    treatsByWeek[week] = (treatsByWeek[week] || 0) + 1;
  }

  const firstWeek = weekStart(entries.map((e) => e.date).sort()[0]);
  let streak = 0;
  for (let week = addDays(weekStart(today), -7); week >= firstWeek; week = addDays(week, -7)) {
    if ((treatsByWeek[week] || 0) > limit) break;
    streak++;
  }
  return streak;
}

// Lets the tests load this file in node; browsers ignore it.
if (typeof module !== "undefined") {
  module.exports = { countTreatsInWeek, countWeekStreak, weekStart, addDays };
}
