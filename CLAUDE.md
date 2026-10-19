# Treat Tracker

## What this is
My first personal project: a simple app to help me cut down on sweet treats (cake, bread with Nutella, etc.). I log treats against a weekly limit and see them on a month calendar.

## About me and how to work with me
- I am new to building apps. Explain briefly what you are doing and why.
- Do the boilerplate (page layout, calendar grid, styling) yourself.
- Leave the weekly-count logic to me. Help me write tests for it first, then I write the code.
- Keep it simple. No frameworks, no build step, no accounts, no backend in v1.

## Scope (v1)
- Web prototype as a PWA: plain HTML, CSS and JavaScript, data in the browser's localStorage.
- Deployed on GitHub Pages (public repo), added to my phone's home screen.
- Phase 2, not now: a phone home-screen widget. A PWA cannot provide one. It needs a small backend or a native shell, so all data access stays in one file (storage.js) to make that swap easy.

## Data model
One entry per tap, stored as a list: `{ id, date, type }`
- `date` is plain text, `YYYY-MM-DD`. Never a timestamp (avoids timezone and week-rollover bugs).
- `type` is `"treat"` or `"star"` (star = a day with no treat).
- storage.js exposes `loadEntries()` and `saveEntries(entries)`. Nothing else touches localStorage.
- The weekly count is derived, never stored: the number of `"treat"` entries dated inside the current week.

## Rules
- Weekly limit: 3, kept as a setting (not hardcoded in logic).
- A week runs Monday to Sunday.
- Everything is manual. Nothing is added automatically at the end of the week, and empty days stay empty.
- A day holds either one star or one or more treats, never both.
- Choosing star on a day replaces any treats on that day.
- Choosing treat on a day removes its star and adds a treat. Choosing treat again adds another.
- Clear takes a day back to empty (this is how I fix a mistaken tap).

## Screens
Two tabs in a bottom bar: Home and Calendar.

**Home**
- Text: "You've had N/3 treats this week."
- At exactly 3/3: "This week limit 3/3 reached".
- Above 3, e.g. 4/3: "You have had 4/3 treats this week."
- Two buttons: "Log treat" and "No treat" (star). Both apply to today. After tapping, switch to the Calendar tab, which now shows the new icon on today.

**Calendar**
- Month title with prev/next arrows.
- 7-column grid, Monday to Sunday.
- Each day shows a cupcake icon (treat) or a star icon (no treat), or nothing.
- Tap any day, including past days, to choose star, treat or clear.
- Not in v1: the week strip of stars and cupcakes at the top of the calendar in my sketch.

## Tests (write these before the logic)
Weekly count must be correct for: Sunday night, Monday morning, a week that crosses a month boundary.

## Plan (6 sessions)
- Mon Oct 19 (30 min): sketch, data model, repo, empty index.html and storage.js, hardcoded "0/3 this week".
- Tue Oct 20 (30 min): Log treat saves to localStorage; weekly count with the 3 tests.
- Sun Oct 25 (60 min): calendar grid, icons on logged days, prev/next month, tab bar.
- Mon Oct 26 (30 min): clear/undo, over-limit messages, tone is motivating not scolding.
- Tue Oct 27 (30 min): PWA manifest and icon, deploy to GitHub Pages, add to phone.
- Sun Nov 1 (60 min): fix top 3 issues from a week of real use, JSON export as backup, written phase 2 plan.
- If behind, drop JSON export first, then the clear option. Never skip the real-use week.
