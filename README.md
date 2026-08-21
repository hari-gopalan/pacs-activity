# MSRT300: PACS Kano Activity

Three static pages — `index.html` (role picker), `student.html`, `instructor.html` —
plus a small Google Apps Script backend that acts as the "database," because
GitHub Pages only serves files and can't receive a student's submission on
its own.

```
index.html          landing page, pick student or instructor
student.html         name + PIN, classify 20 features with a live graph of their placements
instructor.html      password gate, live comparator, grading, danger zone
assets/
  data.js             feature list, categories, graph geometry (shared)
  config.js           APPS_SCRIPT_URL + INSTRUCTOR_PASSWORD — edit this
  style.css           shared styling
apps-script/
  Code.gs             paste into a Google Apps Script project (see below)
```

Everything works locally without any setup — open `index.html` in a browser
and click through. Without the backend configured, student saves fall back
to that browser's local storage only (fine for testing, not for a real
class, since the instructor's browser can't see another browser's local
storage). Do the setup below before assigning this for real.

## 1. Set up the backend (Google Sheet + Apps Script)

1. Create a new Google Sheet (sheet.new). Name it anything, e.g. "PACS Kano Responses".
2. In the Sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the contents of `apps-script/Code.gs`.
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize it (it needs to write to your Sheet), and copy
   the **Web app URL** it gives you (ends in `/exec`).
6. Paste that URL into `assets/config.js` as `APPS_SCRIPT_URL`.

That's it — the script auto-creates a "Responses" tab in the Sheet the first
time a student saves. Each row is one student: name, PIN, status, timestamp,
and their full submission as JSON in one cell.

If you ever change the code in Code.gs, use **Deploy → Manage deployments →
Edit → New version** so the same URL picks up the change.

## 2. Set your instructor password

It's `harigopalan` by default, set in two places (keep both in sync):
- `assets/config.js` → `INSTRUCTOR_PASSWORD` (gates the instructor page)
- `apps-script/Code.gs` → `SERVER_PASSWORD` (gates the "clear all responses" action)

**This is a light deterrent, not real security.** The site is fully static,
so the password ships in plain text in the page source — anyone who views
source can read it. It'll stop a casual student from wandering into the
instructor view; it won't stop someone determined. Don't rely on it for
anything actually sensitive.

## 3. Push to GitHub and turn on Pages

From inside this folder:

```bash
git init
git add .
git commit -m "PACS Kano activity"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: GitHub
Actions**. The included `.github/workflows/pages.yml` builds and deploys on
every push to `main` (also runnable on demand from the **Actions** tab).
Your site will be live at `https://<your-username>.github.io/<repo-name>/`
within a minute or two of the workflow completing.

Share `.../student.html` with the class and keep `.../instructor.html` for
yourself.

## How the "auto-load into instructor view" part works

1. A student saves or submits on `student.html` → that POSTs their answers
   to the Apps Script URL → the script writes/updates a row in the Sheet.
2. `instructor.html` polls the same Apps Script URL every 20 seconds (and on
   demand via **Refresh now**), listing every submission — draft or
   submitted — in the Responses panel. There's no manual file loading.
3. Pick any one of those responses from the **Mark as the instructor's
   answer** dropdown to use it as the reference plotted on the graph (e.g.
   your own answers, if you did the activity yourself first). That choice
   is stored server-side (via `PropertiesService`, not a sheet column), so
   it's shared with anyone else who opens the instructor page — not just
   remembered in the browser that set it. There's no separate hand-authored
   answer key — an actual submission is your ground truth.
4. Hover a response row and click **Remove** to permanently delete a single
   submission (e.g. a test entry) without wiping everyone else's — unlike
   Danger zone's "Clear all responses," which deletes every row.

## Privacy cleanup after the assignment

- **Delete all responses**: instructor console → **Danger zone** → type
  `DELETE` → **Clear all responses**. This wipes every row in the Google
  Sheet. Do this once grades are recorded — there's no need to keep
  identifiable student answers around after that.
- **Grades** live only in the browser you graded from (`localStorage`), not
  in the Sheet — export the CSV you need, then **Danger zone → Clear local
  grades**.
- **Remove grading entirely**: once you're done with it for the term, follow
  the note in the Danger zone tab to delete the Grading tab's markup and
  script hooks from `instructor.html`, then redeploy.
- If you want to fully retire an assignment's data, you can also just delete
  the "Responses" tab in the Google Sheet, or delete the whole Sheet.

## Notes on the PIN scheme

Students pick their own PIN the first time they enter a name; the same
name+PIN combination reloads their saved progress. If someone reuses a name
that's already taken with a different PIN, they'll see a message asking them
to use their original PIN (or a slightly different name if it's a genuine
first attempt, e.g. a typo last time). This is intentionally simple — no
accounts, no email, nothing beyond what the assignment needs.
