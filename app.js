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

function newEntry(date, type) {
  return { id: Date.now().toString() + Math.random().toString(36).slice(2, 6), date, type };
}

// Each of these works on any date, past or present. A day is either one star
// or one or more treats, never both.
function addTreat(date) {
  // Drop the day's star (if any), then add a treat. Calling again adds another.
  const entries = loadEntries().filter((e) => !(e.date === date && e.type === "star"));
  entries.push(newEntry(date, "treat"));
  saveEntries(entries);
}

function setStar(date) {
  // Replaces any treats on the day with a single star.
  const entries = loadEntries().filter((e) => e.date !== date);
  entries.push(newEntry(date, "star"));
  saveEntries(entries);
}

function clearDay(date) {
  saveEntries(loadEntries().filter((e) => e.date !== date));
}

function logTreat() {
  addTreat(toDateString(new Date()));
  renderHome();
  showTab("calendar");
}

function logNoTreat() {
  setStar(toDateString(new Date()));
  renderHome();
  showTab("calendar");
}

// ---- Calendar ----

const ICONS = { treat: "\u{1F9C1}", star: "⭐" }; // cupcake, star
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// The month on screen. Month is 0-11, like JS Dates.
let shownYear = new Date().getFullYear();
let shownMonth = new Date().getMonth();

function renderCalendar() {
  const entries = loadEntries();
  const today = toDateString(new Date());

  document.getElementById("month-title").textContent = new Date(shownYear, shownMonth, 1)
    .toLocaleString("en-US", { month: "long", year: "numeric" });

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  for (const name of WEEKDAYS) {
    const cell = document.createElement("div");
    cell.className = "weekday";
    cell.textContent = name;
    grid.appendChild(cell);
  }

  // Blank cells before the 1st so it lands under the right weekday (Monday = column 0).
  const blanks = (new Date(shownYear, shownMonth, 1).getDay() + 6) % 7;
  for (let i = 0; i < blanks; i++) {
    const cell = document.createElement("div");
    cell.className = "day empty";
    grid.appendChild(cell);
  }

  const daysInMonth = new Date(shownYear, shownMonth + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = toDateString(new Date(shownYear, shownMonth, day));
    const dayEntries = entries.filter((e) => e.date === dateString);
    const hasTreat = dayEntries.some((e) => e.type === "treat");
    const hasStar = dayEntries.some((e) => e.type === "star");

    const cell = document.createElement("div");
    cell.className = "day" + (dateString === today ? " today" : "");
    cell.dataset.date = dateString;

    const number = document.createElement("span");
    number.textContent = day;
    cell.appendChild(number);

    if (hasTreat || hasStar) {
      const icon = document.createElement("span");
      icon.className = "icon";
      const treatCount = dayEntries.filter((e) => e.type === "treat").length;
      // Show "x2" etc. when a day has more than one treat.
      icon.textContent = hasTreat ? ICONS.treat + (treatCount > 1 ? "×" + treatCount : "") : ICONS.star;
      cell.appendChild(icon);
    }
    if (dateString === selectedDate) cell.classList.add("selected");
    cell.addEventListener("click", () => selectDay(dateString));
    grid.appendChild(cell);
  }

  renderDayPicker();
}

// ---- Day picker (tap a day to choose treat, star or clear) ----

let selectedDate = null;

function selectDay(dateString) {
  selectedDate = dateString;
  renderCalendar();
}

function renderDayPicker() {
  const picker = document.getElementById("day-picker");
  picker.hidden = selectedDate === null;
  if (selectedDate === null) return;

  const [y, m, d] = selectedDate.split("-").map(Number);
  document.getElementById("picked-date").textContent = new Date(y, m - 1, d)
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function applyToSelected(action) {
  if (selectedDate === null) return;
  action(selectedDate);
  renderHome();
  renderCalendar();
}

function changeMonth(delta) {
  // Date rolls the year over for us (month -1 or 12 are valid).
  const next = new Date(shownYear, shownMonth + delta, 1);
  shownYear = next.getFullYear();
  shownMonth = next.getMonth();
  renderCalendar();
}

// ---- Tabs ----

function showTab(name) {
  document.getElementById("view-home").hidden = name !== "home";
  document.getElementById("view-calendar").hidden = name !== "calendar";
  document.getElementById("tab-home").classList.toggle("active", name === "home");
  document.getElementById("tab-calendar").classList.toggle("active", name === "calendar");

  if (name === "calendar") {
    // Jump back to the current month so the new icon on today is visible.
    shownYear = new Date().getFullYear();
    shownMonth = new Date().getMonth();
    renderCalendar();
  }
}

document.getElementById("log-treat").addEventListener("click", logTreat);
document.getElementById("no-treat").addEventListener("click", logNoTreat);
document.getElementById("tab-home").addEventListener("click", () => showTab("home"));
document.getElementById("tab-calendar").addEventListener("click", () => showTab("calendar"));
document.getElementById("pick-treat").addEventListener("click", () => applyToSelected(addTreat));
document.getElementById("pick-star").addEventListener("click", () => applyToSelected(setStar));
document.getElementById("pick-clear").addEventListener("click", () => applyToSelected(clearDay));
document.getElementById("prev-month").addEventListener("click", () => changeMonth(-1));
document.getElementById("next-month").addEventListener("click", () => changeMonth(1));
renderHome();
