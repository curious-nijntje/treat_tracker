// Run with: node weekly.test.js
const assert = require("node:assert");
const { countTreatsInWeek, countWeekStreak } = require("./weekly.js");

// Calendar reminder for Oct/Nov 2026:
//   Mon Oct 19 ... Sun Oct 25 | Mon Oct 26 ... Sat Oct 31, Sun Nov 1
const treat = (id, date) => ({ id, date, type: "treat" });
const star = (id, date) => ({ id, date, type: "star" });

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test("Sunday night: Monday and Sunday count, neighbouring weeks don't", () => {
  const entries = [
    treat(1, "2026-10-18"), // Sunday of the previous week
    treat(2, "2026-10-19"), // Monday of this week
    treat(3, "2026-10-25"), // Sunday of this week
    treat(4, "2026-10-26"), // Monday of the next week
  ];
  assert.strictEqual(countTreatsInWeek(entries, "2026-10-25"), 2);
});

test("Monday morning: the new week starts at 0 for last week's treats", () => {
  const entries = [
    treat(1, "2026-10-24"),
    treat(2, "2026-10-25"), // last Sunday, previous week
  ];
  assert.strictEqual(countTreatsInWeek(entries, "2026-10-26"), 0);
});

test("Monday morning: a treat logged today counts", () => {
  const entries = [treat(1, "2026-10-25"), treat(2, "2026-10-26")];
  assert.strictEqual(countTreatsInWeek(entries, "2026-10-26"), 1);
});

test("Week crossing a month boundary counts both months", () => {
  const entries = [
    treat(1, "2026-10-25"), // previous week
    treat(2, "2026-10-26"),
    treat(3, "2026-10-30"),
    treat(4, "2026-11-01"),
    treat(5, "2026-11-02"), // next week
  ];
  assert.strictEqual(countTreatsInWeek(entries, "2026-11-01"), 3);
  assert.strictEqual(countTreatsInWeek(entries, "2026-10-28"), 3);
});

test("Stars are not counted, multiple treats on one day all are", () => {
  const entries = [
    star(1, "2026-10-20"),
    treat(2, "2026-10-21"),
    treat(3, "2026-10-21"),
  ];
  assert.strictEqual(countTreatsInWeek(entries, "2026-10-22"), 2);
});

test("No entries gives 0", () => {
  assert.strictEqual(countTreatsInWeek([], "2026-10-20"), 0);
});

// ---- Week streak ----
// countWeekStreak(entries, today, limit): consecutive finished weeks, going back
// from last week, with treats <= limit. The current week is still in progress so
// it never counts. Weeks before the first entry are not counted.
const treats = (startId, date, n) =>
  Array.from({ length: n }, (_, i) => treat(startId + i, date));

test("Streak: no entries gives 0", () => {
  assert.strictEqual(countWeekStreak([], "2026-10-26", 3), 0);
});

test("Streak: one finished week within the limit is a 1 week streak", () => {
  const entries = treats(1, "2026-10-21", 2); // week of Oct 19
  assert.strictEqual(countWeekStreak(entries, "2026-10-26", 3), 1);
});

test("Streak: exactly at the limit still counts", () => {
  const entries = treats(1, "2026-10-21", 3);
  assert.strictEqual(countWeekStreak(entries, "2026-10-26", 3), 1);
});

test("Streak: last week over the limit gives 0", () => {
  const entries = treats(1, "2026-10-21", 4);
  assert.strictEqual(countWeekStreak(entries, "2026-10-26", 3), 0);
});

test("Streak: consecutive weeks add up", () => {
  const entries = [...treats(1, "2026-10-14", 3), ...treats(10, "2026-10-21", 3)];
  assert.strictEqual(countWeekStreak(entries, "2026-10-26", 3), 2);
});

test("Streak: an older over-limit week breaks the count", () => {
  const entries = [...treats(1, "2026-10-14", 4), ...treats(10, "2026-10-21", 1)];
  assert.strictEqual(countWeekStreak(entries, "2026-10-26", 3), 1);
});

test("Streak: the current week, even over the limit, does not affect it", () => {
  const entries = [...treats(1, "2026-10-21", 2), ...treats(10, "2026-10-27", 5)];
  assert.strictEqual(countWeekStreak(entries, "2026-10-28", 3), 1);
});

test("Streak: weeks before the first entry are not counted", () => {
  const entries = [star(1, "2026-10-22")];
  assert.strictEqual(countWeekStreak(entries, "2026-10-26", 3), 1);
});

test("Streak: empty weeks after the first entry count as met", () => {
  const entries = [star(1, "2026-10-05")];
  assert.strictEqual(countWeekStreak(entries, "2026-10-26", 3), 3);
});

test("Streak: first entry in the current week gives 0", () => {
  const entries = [treat(1, "2026-10-27")];
  assert.strictEqual(countWeekStreak(entries, "2026-10-28", 3), 0);
});

let failed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log("PASS", name);
  } catch (e) {
    failed++;
    console.log("FAIL", name, "-", e.message.split("\n")[0]);
  }
}
console.log(failed ? `\n${failed} of ${tests.length} failing` : "\nAll passing");
process.exit(failed ? 1 : 0);
