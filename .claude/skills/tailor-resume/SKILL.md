---
name: tailor-resume
description: Rewrite resume bullets for a specific job description without inventing anything — map the JD's requirements to real evidence, re-emphasize facts from a verified fact bank, show a before/after diff for approval, then render an ATS-parseable PDF. Use this whenever the user wants a resume tailored or "matched" to a posting, bullets rewritten/reworded/punched up for a role, keyword or ATS alignment, a fit check against a JD, or asks "does my experience work for this job" — even if they never say the word "tailor".
---

# Tailor resume

Tailoring is **re-emphasis, not authorship**. Every claim on the tailored resume
already existed before the JD was read. What changes is which true things are on
the page, in what order, and in whose vocabulary.

That constraint is not squeamishness. The user has to sit in an interview and
defend every line for 45 minutes. A bullet they can't defend costs them the
offer, and a number they can't source costs them their credibility in the room.
Optimize for "they can talk about this for ten minutes", not for keyword density.

## Inputs

```
job-apply/
  fact-bank.md          # verified facts, one per entry, with IDs — the only source of claims
  master-resume.docx    # the full, untailored resume
  roles/<slug>/jd.md    # the posting, saved as text
```

If `fact-bank.md` doesn't exist yet, build it first — see "Building the fact
bank" below. Tailoring without one degrades into improvisation, which is exactly
the failure this skill exists to prevent.

## Workflow

### 1. Read the JD properly

Extract into a scratch list, before touching the resume:

- **Hard gates** — years of experience, work authorization, location/on-site,
  degree, a named non-negotiable technology.
- **Core requirements** — the 4–8 things the role is actually about, usually in
  the first half of the responsibilities list and repeated in the "about you".
- **Their vocabulary** — the exact strings they use ("React Native", "SDUI",
  "observability", "design system"). You will mirror these where they are true.
- **Signal about the team** — greenfield vs. maintenance, startup vs. platform,
  who they report to. This decides which register to write in.

Weight requirements by where they appear: the first three responsibilities and
anything repeated across sections is what the screener is scanning for.

### 2. Fit check — before spending an hour

Build the coverage map: every core requirement → the fact-bank entries that
support it → one of three verdicts.

| Verdict | Meaning | What to do |
|---|---|---|
| **Strong** | Direct, demonstrable evidence | Lead with it; put it in the top two bullets |
| **Adjacent** | Related but not the same thing | State the real thing plainly; let the reader draw the line |
| **None** | No honest evidence | Leave it off the resume; if it's central, say so in the cover letter |

Then stop and report before rewriting anything if:

- a **hard gate** fails (authorization, on-site in another country, 8+ years when
  they have 3), or
- **half or more** of the core requirements land in **None**.

Say what's missing and let the user decide whether to apply anyway. A stretch
application is a legitimate choice — burning an hour tailoring for a role that
fails a hard gate is not. Set `status=skipped` with the reason in `notes` only
after the user agrees.

### 3. Rewrite the bullets

Read `references/bullet-craft.md` now. It has the anatomy of a strong bullet,
the allowed and forbidden transformations with worked examples, ordering and
length rules, and the specific ways tailoring goes wrong.

The short version of the boundary:

**Allowed** — reorder; swap in a different true bullet; mirror the JD's word for
the same thing; shift emphasis within a true bullet; cut what doesn't serve this
role; split one dense bullet into two.

**Forbidden** — new numbers; numbers moved to a different system than the one
they measured; new technologies; upgraded scope or ownership ("led" for work you
contributed to); changed titles, dates, or employers; a singular thing pluralized
into "multiple".

Every bullet you write or keep must cite a fact-bank ID. If you catch yourself
writing a claim with nothing to cite, that is the signal to stop and ask the
user — either it's a real fact missing from the bank (add it) or you were about
to invent it.

### 4. Show the diff and wait

Never render a PDF before the user has seen what changed. Show only bullets that
were changed, added, or dropped — an unchanged bullet in the diff is noise.

```markdown
## <Company> — <Role>

**Coverage:** 5 core requirements → 3 strong, 1 adjacent, 1 none (Kubernetes)

| # | Before | After | Why | Facts |
|---|---|---|---|---|
| 1 | Implemented server-driven UI architecture for React Native apps… | Built a server-driven UI layer for React Native, shipping screen changes remotely without App Store resubmission | JD's first responsibility is OTA/remote config; mirrors their wording | F-004 |
| 3 | *(dropped)* Built modular backend CRUD interfaces using NestJS… | — | Role is mobile-only; the space buys a second RN bullet | F-009 |

**Not claimed:** no Kubernetes experience — left off rather than stretched.
Worth a line in the cover letter if you want to address it.
```

Then ask plainly: *approve, or tell me what to change?* Wait for the answer.

### 5. Render and verify

On approval, edit a copy of `master-resume.docx` (use the **docx** skill for the
mechanics — don't hand-roll XML editing) and export to PDF.

```
roles/<slug>/resume.docx
roles/<slug>/resume.pdf
roles/<slug>/changes.md    # the diff table above, plus the coverage map
```

Name the PDF `<Full Name>_<Company>_<Role>.pdf` — recruiters download dozens of
files called `resume.pdf` into one folder, and yours should still be findable.

Then verify, because a resume that looks right on screen can still be unreadable
to the parser that reads it first:

Run the verifier bundled with this skill — `scripts/verify_resume.py`, relative
to this skill's own directory (given to you when the skill loads, so it resolves
from `~/.claude/skills/` or from a project install alike):

```bash
python3 "<this skill>/scripts/verify_resume.py" roles/<slug>/resume.pdf \
  --bullets roles/<slug>/changes.md
```

It checks that the PDF has an extractable text layer (an image-only export
scores zero in every ATS), that it's one page unless the user chose otherwise,
that every approved bullet actually made it in, and that no template placeholder
survived. If its dependencies aren't installed, do the same four checks by hand
rather than skipping them.

Finally set `status=ready` and `tailored_on=<date>` in `tracker.csv`. `ready`
means a human approved these words — the apply loop trusts that.

## Building the fact bank

First run, or whenever the resume gains new material. Copy
`assets/fact-bank.template.md` to `job-apply/fact-bank.md` and populate it from
`master-resume.docx`, past tailored resumes, and what the user tells you.

One entry per distinct accomplishment:

```markdown
### F-012 · Shared component library
- **Claim:** Built a standardized, reusable React/TypeScript component library.
- **Metric:** ~30% faster feature development.
- **Source:** self-reported, team estimate H2 2023.
- **Where:** KeyValue Software Systems, 2022–present.
- **Safe rewordings:** shared UI kit; reusable component library; internal component library.
- **Do not say:** "design system" (implies tokens/docs/governance that didn't exist);
  "adopted by N teams" (never counted).
```

`Do not say` is the field that earns its keep. It's where a specific inflation
the user has already rejected gets written down once, so it doesn't get
re-proposed on the next role. Add to it every time the user pushes back on a
rewrite.

When the user mentions something new they shipped, offer to add it — a fact bank
that stops growing quietly becomes a resume that stops improving.

## Consistency across applications

`changes.md` is not paperwork; it's the record of what this company was told.
Before tailoring for a company already in `tracker.csv`, read the earlier
`changes.md`. Two applications to the same company describing the same work with
different numbers is the single worst outcome this workflow can produce.

The same applies to the interview: the user should be able to open `changes.md`
six weeks later and see exactly which version of their history is in that
recruiter's inbox.
