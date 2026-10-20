// Settings. Kept here so the limit is never hardcoded in the logic.
const WEEKLY_LIMIT = 3;

const ICONS = { treat: "\u{1F9C1}", star: "⭐" }; // cupcake, star
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Screen state. The shown month is 0-11, like JS Dates.
let shownYear;
let shownMonth;
let selectedDate = null;

const $ = (id) => document.getElementById(id);
const todayString = () => toDateString(new Date());

// ---- Home ----

function weeklyMessage(count, limit) {
  if (count === limit) return `This week limit ${count}/${limit} reached`;
  if (count > limit) return `You have had ${count}/${limit} treats this week.`;
  return `You've had ${count}/${limit} treats this week.`;
}

function streakMessage(weeks) {
  if (weeks === 0) return "Log this week and stay within your limit to start a streak.";
  return `\u{1F525} ${weeks} week streak`; // fire
}

function renderHome() {
  const entries = loadEntries();
  const today = todayString();
  $("weekly-status").textContent = weeklyMessage(countTreatsInWeek(entries, today), WEEKLY_LIMIT);
  $("streak").textContent = streakMessage(countWeekStreak(entries, today, WEEKLY_LIMIT));
}

// ---- Changing a day (works on any date, past or present) ----
// A day is either one star or one or more treats, never both.

function newEntry(date, type) {
  return { id: Date.now().toString() + Math.random().toString(36).slice(2, 6), date, type };
}

function addTreat(date) {
  // Drop the day's star (if any), then add a treat. Calling again adds another.
  const entries = loadEntries().filter((e) => !(e.date === date && e.type === "star"));
  saveEntries([...entries, newEntry(date, "treat")]);
}

function setStar(date) {
  // Replaces any treats on the day with a single star.
  const entries = loadEntries().filter((e) => e.date !== date);
  saveEntries([...entries, newEntry(date, "star")]);
}

function clearDay(date) {
  saveEntries(loadEntries().filter((e) => e.date !== date));
}

// Home buttons: change today, then show it on the Calendar.
function logToday(action) {
  action(todayString());
  renderHome();
  showTab("calendar");
}

// ---- Calendar ----

function renderCalendar() {
  // Group the entries by date once, instead of searching them for every day.
  const byDate = {};
  for (const e of loadEntries()) {
    const day = (byDate[e.date] = byDate[e.date] || { treats: 0, star: false });
    if (e.type === "treat") day.treats++;
    else day.star = true;
  }

  $("month-title").textContent = new Date(shownYear, shownMonth, 1)
    .toLocaleString("en-US", { month: "long", year: "numeric" });

  // Blank cells before the 1st so it lands under the right weekday (Monday = column 0).
  const blanks = (new Date(shownYear, shownMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(shownYear, shownMonth + 1, 0).getDate();
  const today = todayString();

  let html = WEEKDAYS.map((name) => `<div class="weekday">${name}</div>`).join("");
  html += '<div class="day empty"></div>'.repeat(blanks);
  for (let n = 1; n <= daysInMonth; n++) {
    const date = toDateString(new Date(shownYear, shownMonth, n));
    const { treats = 0, star = false } = byDate[date] || {};
    // Treats win over a star; show "×2" etc. when a day has more than one treat.
    const icon = treats ? ICONS.treat + (treats > 1 ? `×${treats}` : "") : star ? ICONS.star : "";
    const classes = ["day", date === today && "today", date === selectedDate && "selected"]
      .filter(Boolean).join(" ");
    html += `<button type="button" class="${classes}" data-date="${date}">` +
      `<span>${n}</span><span class="icon">${icon}</span></button>`;
  }
  $("calendar-grid").innerHTML = html;

  // Day picker for the tapped day.
  $("day-picker").hidden = selectedDate === null;
  if (selectedDate !== null) {
    $("picked-date").textContent = parseDate(selectedDate)
      .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }
}

function changeMonth(delta) {
  // Date rolls the year over for us (month -1 or 12 are valid).
  const next = new Date(shownYear, shownMonth + delta, 1);
  shownYear = next.getFullYear();
  shownMonth = next.getMonth();
  renderCalendar();
}

function applyToSelected(action) {
  if (selectedDate === null) return;
  action(selectedDate);
  renderHome();
  renderCalendar();
}

// ---- Tabs ----

function showTab(name) {
  for (const tab of ["home", "calendar"]) {
    $(`view-${tab}`).hidden = tab !== name;
    $(`tab-${tab}`).classList.toggle("active", tab === name);
  }
  if (name === "calendar") {
    // Open on the current month so today's new icon is visible.
    const now = new Date();
    shownYear = now.getFullYear();
    shownMonth = now.getMonth();
    selectedDate = null;
    renderCalendar();
  }
}

// ---- Backup ----

function exportBackup() {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([makeBackup(loadEntries())], { type: "application/json" }));
  link.download = `treat-tracker-backup-${todayString()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  $("backup-status").textContent = "Backup saved to your downloads.";
}

async function importBackup(file) {
  try {
    const imported = parseBackup(await file.text()); // checks everything before touching saved data
    const current = loadEntries().length;
    if (!confirm(`Replace your ${current} saved entries with the ${imported.length} in this backup?`)) {
      $("backup-status").textContent = "Import cancelled.";
      return;
    }
    saveEntries(imported);
    renderHome();
    $("backup-status").textContent = `Restored ${imported.length} entries.`;
  } catch (e) {
    $("backup-status").textContent = e.message;
  }
}

// ---- Wiring ----

$("log-treat").addEventListener("click", () => logToday(addTreat));
$("no-treat").addEventListener("click", () => logToday(setStar));
$("export-backup").addEventListener("click", exportBackup);
$("import-backup").addEventListener("click", () => $("import-file").click());
$("import-file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  event.target.value = ""; // so choosing the same file again still triggers a change
  if (file) importBackup(file);
});
$("tab-home").addEventListener("click", () => showTab("home"));
$("tab-calendar").addEventListener("click", () => showTab("calendar"));
$("prev-month").addEventListener("click", () => changeMonth(-1));
$("next-month").addEventListener("click", () => changeMonth(1));
$("pick-treat").addEventListener("click", () => applyToSelected(addTreat));
$("pick-star").addEventListener("click", () => applyToSelected(setStar));
$("pick-clear").addEventListener("click", () => applyToSelected(clearDay));

// One listener for the whole grid; it is rebuilt on every render.
$("calendar-grid").addEventListener("click", (event) => {
  const cell = event.target.closest("[data-date]");
  if (!cell) return;
  selectedDate = cell.dataset.date;
  renderCalendar();
});

// A phone app can stay open past midnight. Refresh "today" when you come back to it.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  renderHome();
  if (!$("view-calendar").hidden) renderCalendar();
});

showTab("home");
renderHome();

// Work offline once the app has been opened online (service workers need https or localhost).
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");

// Ask the browser not to clear our data when it is short on space (it may say no).
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
