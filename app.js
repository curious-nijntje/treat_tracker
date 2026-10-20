// Settings. Kept here so the limit is never hardcoded in the logic.
const WEEKLY_LIMIT = 3;

function weeklyMessage(count, limit) {
  if (count === limit) return `This week limit ${count}/${limit} reached`;
  if (count > limit) return `You have had ${count}/${limit} treats this week.`;
  return `You've had ${count}/${limit} treats this week.`;
}

function renderHome() {
  const count = countTreatsInWeek(loadEntries(), toDateString(new Date()));
  document.getElementById("weekly-status").textContent = weeklyMessage(count, WEEKLY_LIMIT);
}

function logTreat() {
  const today = toDateString(new Date());
  // A day is either star or treat, never both: drop today's star first.
  const entries = loadEntries().filter((e) => !(e.date === today && e.type === "star"));
  entries.push({ id: Date.now().toString() + Math.random().toString(36).slice(2, 6), date: today, type: "treat" });
  saveEntries(entries);
  renderHome();
}

document.getElementById("log-treat").addEventListener("click", logTreat);
renderHome();
