---
name: apply-loop
description: Fill job application forms in the browser from a prepared packet, one role at a time, stopping before every submit for human review. Use whenever the user says "run the apply loop", "submit applications", "apply to the next role", "fill out this application", or hands over a job posting URL and wants the application form filled in — even if they never name the skill.
---

# Apply loop

Requires Claude in Chrome. Never runs headless — it drives the real browser so
existing logins (YC / workatastartup, Greenhouse, Ashby, Lever) already work.

The user submits. Everything here is preparation for a click they make
themselves, with the filled form in front of them.

## Expected layout

```
job-apply/
  answers.md          # standing answers: notice period, current/expected CTC,
                      # earliest start, work authorization, links
  fact-bank.md        # verified facts behind every resume claim
  master-resume.docx
  tracker.csv         # shared state — see below
  roles/<slug>/
    jd.md             # the job description, saved at screen time
    resume.pdf        # tailored
    resume.docx
    cover.md
    changes.md        # what was tailored and why
```

`tracker.csv` is the only state. Columns:
`slug,company,role,source,apply_url,status,fit,tailored_on,submitted_on,follow_up_on,notes`

```
new → tailored → ready → submitted
                   ↓
              blocked / skipped
```

This loop reads `ready` and writes `submitted` or `blocked`. It never promotes a
row to `ready` — that transition means a human approved the resume wording, and
inventing it would put unreviewed claims in front of an employer. Rows that
aren't `ready` belong to **tailor-resume** or **daily-apply**.

Quote any field containing a comma; keep `notes` to one short line.

## The loop

Process **one row at a time**, only where `status = ready`. Never batch — batching
is how the wrong resume gets attached to the wrong company.

1. Read `roles/<slug>/jd.md`, `resume.pdf`, `cover.md`, `changes.md`, and
   `answers.md`.
2. **Pre-flight** before opening anything:
   - `resume.pdf` exists, is non-empty, and its filename matches this company —
     a stale PDF from the previous role is the most expensive mistake available
     here and the cheapest to catch.
   - No earlier `submitted` row for the same company and role in `tracker.csv`.
     If there is one, stop and ask — duplicate applications read as careless.
   - `answers.md` covers the obvious knockouts (authorization, notice, CTC).
3. Open `apply_url` in Chrome.
4. Fill every field `answers.md` covers. Attach `resume.pdf`. Paste `cover.md`
   into the cover-letter field.
5. **Verify the parse.** Greenhouse, Workday and Lever autofill from the uploaded
   resume and get it wrong often — a mangled employer, a truncated title, a
   scrambled date range. Read back what the parser wrote and correct it against
   the resume. The parsed fields are what the recruiter's system stores, not the
   PDF.
6. **Stop.** Screenshot the filled form and report (format below). Wait for the
   user to review and click submit themselves.
7. On their confirmation, set `status=submitted` and `submitted_on=<date>`, and
   save their confirmation screenshot or the confirmation email subject to
   `roles/<slug>/confirmation.png|.txt`. Applications vanish from portals; a
   local receipt is what makes a follow-up possible. Move to the next row.

## Rules

- **Never click submit.** The user clicks. No exceptions, and no "they said go
  ahead earlier" — confirmation is per role, because the thing being confirmed
  is this specific form's contents.
- **Never tick a certification or attestation checkbox.** "I confirm this
  information is accurate" is theirs to sign, and signing it for them is
  precisely the thing that makes it worthless.
- **Never invent an answer.** If a field isn't covered by `answers.md`, stop and
  ask. Do not infer CTC, notice period, or start dates from context, and do not
  estimate years of experience — count them from the resume dates or ask.
- **Answer knockout questions truthfully even when the truthful answer
  disqualifies.** "5+ years?" with three years of experience is "3". Rounding up
  to clear a filter produces an interview that ends the moment the dates are
  read.
- **Leave demographic, veteran, and disability self-identification blank.** These
  are voluntary self-identification, and only the user can identify themselves.
- **Pause at logins and CAPTCHAs** and hand the browser back. Don't work around
  either.
- If a form field contradicts the resume or the JD — different seniority, a
  location that moved, a question the JD didn't imply — stop and flag it. This
  usually means the posting was edited or the link points somewhere else.
- On any error or unexpected page, set `status=blocked` with a one-line reason
  and move on. **Never retry a submit** — a duplicate application is worse than a
  missing one, and a failed page often submitted anyway.

## Field guidance

Common fields worth handling consistently rather than improvising per form:

| Field | Where the answer comes from |
|---|---|
| "Why do you want to work here?" | `cover.md`, trimmed to their limit — don't regenerate it at the form |
| Salary expectation | `answers.md` only. Never a number derived from the JD's range |
| Notice period / earliest start | `answers.md` |
| Years of experience | Counted from resume dates |
| "How did you hear about us?" | `source` in `tracker.csv` |
| Links (GitHub, portfolio, LinkedIn) | `answers.md` |
| Free-text "anything else" | Leave blank unless `answers.md` has something. An empty optional field costs nothing; a padded one costs attention |

If a form demands a long free-text answer nothing covers, draft it, put it in
`roles/<slug>/extra-answers.md`, and show it to the user before it goes in the
box — the same review gate the resume gets.

## Report before each submit

```markdown
### <Company> — <Role>
Form: <url>  ·  Screenshot: <path>

**Filled**
- Name / email / phone — from answers.md
- Resume: <filename>  (parser read title as "…" → corrected to "…")
- Cover letter: pasted from cover.md (1,180 / 1,500 chars)
- Notice period: 60 days · Expected CTC: <from answers.md>

**Left for you**
- [ ] "I certify the above is accurate" checkbox
- [ ] Voluntary self-identification (3 fields)

**Flags**
- JD says Bengaluru on-site; your answers.md says remote-only. Worth a look
  before submitting.

Ready for your review — submit when it looks right.
```

## Resuming

Restartable at any point: `tracker.csv` is the only state. Re-read it at the
start of every run and skip anything not `ready`.

## Report

At the end: submitted (with dates), blocked (with reasons), still ready. If
anything was blocked on a missing standing answer, say which — that's a one-line
fix to `answers.md` that unblocks every future application.
