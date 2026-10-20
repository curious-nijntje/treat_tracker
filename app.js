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
  showTab("calendar");
}

function logNoTreat() {
  const today = toDateString(new Date());
  // A day is either star or treat, never both: drop everything on today, then add one star.
  const entries = loadEntries().filter((e) => e.date !== today);
  entries.push({ id: Date.now().toString() + Math.random().toString(36).slice(2, 6), date: today, type: "star" });
  saveEntries(entries);
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
      icon.textContent = hasTreat ? ICONS.treat : ICONS.star;
      cell.appendChild(icon);
    }
    grid.appendChild(cell);
  }
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
document.getElementById("prev-month").addEventListener("click", () => changeMonth(-1));
document.getElementById("next-month").addEventListener("click", () => changeMonth(1));
renderHome();
