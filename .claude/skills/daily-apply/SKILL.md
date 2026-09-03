---
name: daily-apply
description: Run the daily job-search routine over the job-apply workspace — read the tracker, screen new postings from the inbox, tailor resumes for the best fits, queue applications, draft follow-ups, and print a standup. Use whenever the user says "run my daily apply", "daily job routine", "what's my application status", "any follow-ups due", asks what to do on the job hunt today, or when this fires on a schedule.
---

# Daily apply

One pass over the job search, safe to run every morning. It moves each role one
step along and stops at the two places a human is required: approving resume
wording, and clicking submit.

The point is a routine the user can trust enough to actually run daily. That
means it must be **honest about doing nothing** — a run with no new postings and
no follow-ups due should say so in two lines and stop, not manufacture activity.

## Guardrails

- **Idempotent.** Running twice in a day does nothing twice. State lives in
  `tracker.csv` and `journal/`; every phase reads state before acting.
- **Capped.** Three new tailors per run by default. Three good applications beat
  fifteen generic ones, and the cap is what keeps the routine finishable.
- **Nothing leaves the machine.** No submits, no emails, no messages. Follow-ups
  are drafted and left for the user.
- **Decisions surface, they don't get made.** Fit calls, ambiguous JDs, and
  anything contradictory goes in the standup as a question.

## Phase 0 — bootstrap (first run only)

If `job-apply/` doesn't exist, create it from the bundled templates. Paths
below are relative to **this skill's own directory** (given to you when the
skill loads) so they resolve whether the skill is installed personally at
`~/.claude/skills/` or inside a project — never hardcode either location:

```
job-apply/
  answers.md        ← <this skill>/assets/answers.template.md
  inbox.md          ← <this skill>/assets/inbox.template.md
  tracker.csv       ← <this skill>/assets/tracker.template.csv
  fact-bank.md      ← <tailor-resume skill>/assets/fact-bank.template.md
  master-resume.docx  (ask the user for this)
  roles/
  journal/
```

`<tailor-resume skill>` sits beside this one, wherever this one is installed.

Then make sure `job-apply/` is in `.gitignore` and confirm it isn't already
tracked (`git ls-files job-apply/`). It holds current CTC, notice period, and a
list of everywhere the user is applying. If this workspace is a public
repository — a GitHub Pages site, for instance — committing it publishes all of
that. Say so plainly rather than assuming the user checked.

Walk the user through `answers.md` and build the fact bank with **tailor-resume**
before the first tailor. Both are one-time costs that every later run reuses.

## Phase 1 — status

Read `tracker.csv`. Count each status, and pick out:
- follow-ups due today (`follow_up_on <= today`),
- rows `blocked` for more than 14 days,
- rows sitting in `tailored` awaiting the user's approval — those are blocking
  everything downstream, so they lead the standup.

## Phase 2 — intake

`inbox.md` is where the user drops URLs or pasted JDs between runs. For each
entry:

1. Fetch or read the posting; save it to `roles/<slug>/jd.md`. Save it now, not
   later — postings get edited and pulled, and the version applied to is the one
   that matters when a recruiter calls.
2. Slug as `company-role-shortened`, lowercase and hyphenated.
3. Run the fit check from **tailor-resume** (hard gates, then core requirements
   against the fact bank).
4. Add a row: `status=new` with `fit` as `strong` / `stretch`, or
   `status=skipped` with the reason in `notes`.
5. Remove the processed entry from `inbox.md` so the next run doesn't reprocess
   it — that's what keeps the routine idempotent.

A posting that fails a hard gate gets skipped with the reason, not silently
dropped. The user should be able to see why something didn't make it.

## Phase 3 — tailor

Take up to **3** `new` rows, strongest fit first, and run **tailor-resume** on
each: coverage map, bullet rewrite, diff, approval, render, verify.

Each ends at `tailored` — waiting on the user's approval of the diff — or `ready`
if they approve during the run. Don't skip the diff to save time; unreviewed
bullets are the one output of this whole routine that can't be undone once sent.

## Phase 4 — apply

For rows now `ready`, hand off to **apply-loop**. It fills the forms and stops
before each submit. If the user isn't at the keyboard, leave them `ready` and
list them in the standup — there is no version of this phase that runs unattended.

## Phase 5 — follow-ups

For `submitted` rows with no reply after **7 days**:

- Draft a short nudge in `roles/<slug>/followup.md` — three or four sentences,
  referencing something specific from the JD, no re-pitch of the resume.
- Set `follow_up_on` to today + 7.
- Never send it. Sending is the user's call, and the draft is worth more to them
  edited than automated.

After two unanswered follow-ups, say so and suggest closing the row rather than
drafting a third.

## Phase 6 — hygiene

- `blocked` for 14+ days → surface it once with the original reason and ask
  whether to unblock or skip.
- **Fridays only:** ask whether anything shipped this week belongs in the fact
  bank. A fact bank that stops growing is a resume that stops improving — but
  asked daily this becomes noise the user learns to skip past.

## Phase 7 — journal and standup

Append the run to `journal/YYYY-MM-DD.md` (append, don't overwrite — a second run
the same day adds to the record). Then print exactly this:

```markdown
## Job hunt — <Weekday, D Month>

**Needs you**
- Approve resume diff: Acme — Senior RN Engineer  (`roles/acme-rn/changes.md`)
- Submit (form filled, waiting): Globex — Frontend Engineer
- Decide: Initech has been blocked 16 days — needs a workatastartup login

**Moved today**
- Screened 4 from inbox → 2 in, 2 skipped (Initech: on-site Berlin; Umbrella: 8+ yrs)
- Tailored: Acme — Senior RN Engineer (4 of 5 requirements covered)
- Follow-up drafted: Hooli, submitted 8 days ago

**Pipeline**  ready 1 · tailored 1 · submitted 6 · blocked 1 · skipped 3

**Nothing else needs you today.**
```

Lead with what needs the user, because that's the only section they always read.
If a section is empty, drop it — an empty heading is noise.

## When there's nothing to do

Say it in two lines and stop:

> Nothing new in the inbox, no follow-ups due, nothing waiting on you.
> Pipeline: submitted 6 · blocked 1. Next follow-up: Hooli, Thursday.

## Running it on a schedule

The routine is written to be triggered — by the user typing `/daily-apply`, or by
a scheduled task that sends that same instruction each morning. Phases 3 and 4
still stop for a human, so a scheduled run's job is to arrive at the standup with
everything queued up: screened, tailored, drafted, and waiting.
