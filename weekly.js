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

// Streak = finished weeks in a row, newest first. A week counts if it has at
// least one entry (star or treat) and its treats are <= limit, so forgetting to
// log a week ends the streak. The current week is still in progress, so it is
// never counted.
function countWeekStreak(entries, today, limit) {
  // Count treats per week once, instead of re-scanning every entry for each week.
  // A week with any entry gets a key, even if it has no treats.
  const treatsByWeek = {};
  for (const entry of entries) {
    const week = weekStart(entry.date);
    treatsByWeek[week] = (treatsByWeek[week] || 0) + (entry.type === "treat" ? 1 : 0);
  }

  let streak = 0;
  for (let week = addDays(weekStart(today), -7); week in treatsByWeek; week = addDays(week, -7)) {
    if (treatsByWeek[week] > limit) break;
    streak++;
  }
  return streak;
}

// Lets the tests load this file in node; browsers ignore it.
if (typeof module !== "undefined") {
  module.exports = { countTreatsInWeek, countWeekStreak, weekStart, addDays };
}
