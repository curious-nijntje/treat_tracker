// Run with: node storage.test.js
const assert = require("node:assert");
const { makeBackup, parseBackup } = require("./storage.js");

const entry = (id, date, type) => ({ id, date, type });
const bad = (text, pattern) => assert.throws(() => parseBackup(text), pattern);

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test("A backup restores exactly the entries that were exported", () => {
  const entries = [entry("a", "2026-10-20", "treat"), entry("b", "2026-10-21", "star")];
  assert.deepStrictEqual(parseBackup(makeBackup(entries)), entries);
});

test("An empty backup is valid", () => {
  assert.deepStrictEqual(parseBackup(makeBackup([])), []);
});

test("Backup records the app name and format version", () => {
  const data = JSON.parse(makeBackup([]));
  assert.strictEqual(data.app, "treat-tracker");
  assert.strictEqual(data.version, 1);
});

test("Rejects text that is not JSON", () => bad("not json", /not a Treat Tracker backup/));

test("Rejects JSON from something else", () => {
  bad("[]", /not a Treat Tracker backup/);
  bad('{"app":"other","version":1,"entries":[]}', /not a Treat Tracker backup/);
});

test("Rejects a newer format version", () => {
  bad('{"app":"treat-tracker","version":2,"entries":[]}', /newer version/);
});

test("Rejects entries with a bad type", () => {
  const text = makeBackup([entry("a", "2026-10-20", "cake")]);
  bad(text, /entry 1/);
});

test("Rejects dates that are not real days", () => {
  bad(makeBackup([entry("a", "2026-02-30", "treat")]), /entry 1/);
  bad(makeBackup([entry("a", "20-10-2026", "treat")]), /entry 1/);
  bad(makeBackup([entry("a", "2026-10-20T10:00:00Z", "treat")]), /entry 1/);
});

test("Rejects a missing or empty id", () => {
  bad(makeBackup([entry("", "2026-10-20", "treat")]), /entry 1/);
  bad(makeBackup([{ date: "2026-10-20", type: "treat" }]), /entry 1/);
});

test("Rejects duplicate ids", () => {
  const entries = [entry("a", "2026-10-20", "treat"), entry("a", "2026-10-21", "treat")];
  bad(makeBackup(entries), /duplicate/);
});

test("Names the first bad entry", () => {
  const entries = [entry("a", "2026-10-20", "treat"), entry("b", "nope", "star")];
  bad(makeBackup(entries), /entry 2/);
});

test("Keeps only the known fields of each entry", () => {
  const text = JSON.stringify({
    app: "treat-tracker",
    version: 1,
    entries: [{ id: "a", date: "2026-10-20", type: "treat", extra: "x" }],
  });
  assert.deepStrictEqual(parseBackup(text), [entry("a", "2026-10-20", "treat")]);
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
