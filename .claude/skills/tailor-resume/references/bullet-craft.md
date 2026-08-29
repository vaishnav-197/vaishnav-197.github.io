# Bullet craft

Read this while rewriting bullets in step 3 of the tailor-resume workflow.

- [Anatomy](#anatomy)
- [Allowed transformations](#allowed-transformations)
- [Forbidden transformations](#forbidden-transformations)
- [Ordering and how many](#ordering-and-how-many)
- [Length](#length)
- [Verbs and ownership](#verbs-and-ownership)
- [Mirroring their vocabulary](#mirroring-their-vocabulary)
- [Numbers](#numbers)
- [What never changes](#what-never-changes)
- [Failure modes](#failure-modes)

## Anatomy

A strong bullet answers four questions in one breath:

**What you did** → **to what** → **how** → **so what**.

> Built a server-driven UI layer for React Native apps, shipping screen changes
> remotely without an App Store resubmission.

`Built` (action) · `a server-driven UI layer for React Native apps` (the thing) ·
implied technical means · `without an App Store resubmission` (the consequence a
hiring manager cares about).

Not every bullet needs a percentage. A bullet with a real consequence and no
number beats a bullet with an invented number, and it beats a bullet that just
lists technology. The weakest form is the responsibility statement —
"Responsible for maintaining the frontend codebase" — which describes a job
description rather than a person.

When there is no metric, the consequence carries the bullet: what became
possible, what stopped breaking, what got faster in words the reader can picture.

## Allowed transformations

These preserve the claim and change only what is foregrounded.

**Reorder.** The strongest evidence for *this* JD goes first. Recruiters read the
first two bullets of the most recent role and skim the rest.

**Swap.** Pull a different true bullet out of the fact bank and drop one that
doesn't serve this role. This is the highest-leverage move available and it
carries zero risk, because both bullets were already true.

**Mirror vocabulary.** Same claim, their word for it.

> Bank: *server-driven UI, dynamic screen updates without app store resubmission*
> JD says: *"remote configuration"*, *"OTA screen updates"*
> → "Implemented server-driven UI for React Native, enabling OTA screen updates
> without an App Store resubmission."

Their string now appears; the claim is unchanged.

**Shift emphasis.** Lead with the half that matters here.

> Metric-first (JD is performance-led): "Cut frontend load time 40% via code
> splitting, lazy loading, and Lighthouse-driven optimization."
> Craft-first (JD is platform-led): "Drove a Lighthouse-guided optimization pass
> across the web app — code splitting and lazy loading — for a 40% improvement."

**Split.** One overloaded bullet becomes two when the JD cares about both halves.

> Before: "Delivered Zenyum, a multi-clinic healthcare platform serving 75,000+
> active users with real-time chat, scheduling, and patient-tracking workflows."
> After (JD is realtime-messaging heavy):
> - "Shipped real-time chat in Zenyum, a multi-clinic healthcare platform with
>   75,000+ active users."
> - "Built scheduling and patient-tracking workflows across the same platform."

**Cut.** Removing a bullet that doesn't serve the role is tailoring. A shorter,
sharper resume outperforms a padded one — cut before you compress.

## Forbidden transformations

Each of these is a way of writing something the user cannot defend.

**A new number.** If the fact bank has no number, the bullet has no number.
"Improved performance" does not become "improved performance by ~35%" because
35% feels plausible.

**A transplanted number.** A metric belongs to the system it measured. The 40%
was frontend web performance; a React Native role does not get "improved React
Native performance by 40%." Both facts are individually true and the sentence is
still false.

**A derived number.** "30% faster development" does not become "saved ~400
engineering hours." The arithmetic may work; the claim is new.

**A new technology.** Not in the bank, not on the page — no matter how heavily
the JD leans on it. A keyword that wins the screen and loses the interview is a
bad trade.

**Upgraded ownership.** `contributed to` → `led`; `built a module` → `architected
the platform`; `helped migrate` → `owned the migration`. This is the most common
inflation and the easiest to catch: ask whether the user could name the three
decisions they personally made. If not, the verb is too big.

**Invented breadth.** "a component library" → "a design system adopted across
teams". One project does not become "multiple projects"; one client does not
become "enterprise clients".

**Reinterpreted nouns.** "75,000+ active users" → "75,000+ patients" looks
harmless and isn't — users and patients are different populations, and the
number was counted for one of them. Keep the noun the metric was measured in.

**Changed facts of record.** Titles, dates, employer names, degrees. If the JD
wants a title the user didn't hold, the cover letter is where that gets
addressed, not the experience section.

## Ordering and how many

Roles stay in reverse-chronological order — that is a fact of record, and
reordering roles by relevance reads as evasion.

Within a role, order bullets by relevance to this JD. Depth by recency and
weight: roughly 4–6 bullets for the current role, 2–3 for the one before, 1–2
for anything older than about five years. Older roles usually earn a single
bullet or a line in a summary, not a full block.

If two bullets prove the same competence, keep the stronger one. Redundancy
costs space the JD's second requirement should be using.

## Length

Aim for one rendered line, accept two, rewrite at three. This is about the
rendered PDF, not the character count — check it after export, not in the editor.

When a bullet runs long, cut the setup clause rather than the outcome. The
reader scans the first few words of each line, so the distinguishing content
belongs at the front:

> Weak: "Working closely with product and design stakeholders, implemented a
> server-driven UI architecture that allowed…"
> Strong: "Built server-driven UI for React Native, shipping screen changes
> without a store release — with product and design."

## Verbs and ownership

Pick the verb that matches what actually happened:

| Reality | Verbs |
|---|---|
| You wrote it | Built, Implemented, Shipped, Wrote, Migrated |
| You made it measurably better | Improved, Reduced, Cut, Increased, Optimized |
| You owned direction and others followed | Led, Drove, Owned, Established |
| You were one of several | Contributed to, Partnered on, Supported |

Vary them across the resume — six bullets opening with "Developed" read as one
undifferentiated blur — but never reach for a bigger verb to fix monotony. Reach
for a more specific one.

## Mirroring their vocabulary

Match the JD's exact string when it names something the user has actually done:
if they write "TypeScript", don't write "TS"; if they write "CI/CD", don't write
"build pipelines". Screening — human or automated — often matches on strings,
and there is no cost to using theirs when the claim is identical.

The line is between **terminology** and **claims**. Adopting their word for
something the user did is free. Adopting their word for something the user
didn't do is a lie with better SEO.

Never keyword-stuff: no skills-section padding with unused technologies, no
white text, no invisible keyword blocks. Modern parsers extract raw text — the
hidden block shows up in the recruiter's view, and it reads exactly as bad as it
is.

## Numbers

Keep the number attached to what it measured, in the unit it was measured in.

Keep the precision the fact bank has. "40%" stays "40%" — not "nearly half", not
"~40%" unless the source was already approximate, and not "45%". If the source
is an estimate, the bullet can say so ("roughly 30%") and the user can defend
that in the room.

A bullet without a number is fine. Three bullets in a row without one is a sign
the fact bank is thin — worth telling the user, because that's a gap to fill
with real measurement, not with prose.

## What never changes

Employers, titles, dates, degrees, certifications, and location history. These
are checkable, and a discrepancy found in a background check is a withdrawn
offer regardless of how good the rest of the resume was.

## Failure modes

**Tailored into blandness.** Every bullet bent toward the JD until the resume
describes a generic candidate. Keep at least one or two bullets that are
distinctly *this person* — the unusual project, the odd technology, the thing
that starts a conversation.

**Keyword soup.** Their nouns appear everywhere and nothing is claimed. If a
bullet has three of the JD's terms and no verb of consequence, rewrite it.

**Quiet promotion.** The gap between what the user did and what the bullet
implies widens one adjective at a time, no single edit obviously wrong. Re-read
the final resume as a stranger and ask what seniority it implies. If it reads a
level above the user's actual scope, walk it back.

**Contradiction across versions.** Company A's copy says "led"; Company B's says
"contributed to"; the same recruiter network sees both. Check `changes.md` for
previous applications to the same company before rewriting.

**Metric drift.** The number creeps across roles — 30% becomes 35% becomes "over
a third" — because each step was small. The fact bank is the anchor; the number
in the bullet must match the entry exactly.
