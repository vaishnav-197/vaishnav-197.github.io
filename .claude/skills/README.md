# Job-search skills — local setup

Three skills that work together:

| Skill | Does | Stops for you at |
|---|---|---|
| **tailor-resume** | Rewrites resume bullets against a JD from a verified fact bank | The before/after diff |
| **apply-loop** | Fills the application form in a real browser | Every submit |
| **daily-apply** | One pass a day over the whole pipeline | Wording approval + submit |

They're kept in this repo as the source of truth and *installed* onto the
machine you actually job-hunt from. This repo is a public GitHub Pages site, so
none of the job-search data lives here — only the skills.

## Install on a Mac

```bash
git clone https://github.com/vaishnav-197/vaishnav-197.github.io.git
cd vaishnav-197.github.io/.claude/skills
./install.sh
```

That puts the skills in `~/.claude/skills/` — personal skills, available in
every project, not just this one — and creates the workspace at `~/job-apply/`.

Useful flags:

```bash
./install.sh --dry-run              # show what it would do, change nothing
./install.sh --workspace ~/hunt     # workspace somewhere else
./install.sh --schedule             # + weekday 08:30 morning prep (see below)
./install.sh --uninstall-schedule
```

Re-running is safe. Skills are refreshed (the previous copy is kept as
`<name>.bak-<timestamp>`), and **no file already in the workspace is
overwritten** — that's your data.

Optional but worth it: `brew install poppler`. Without `pdftotext` the resume
verifier can't read the PDF's text layer, which is the check most worth having —
an image-only export scores zero in every applicant tracking system.

## First run

```bash
cp ~/Documents/resume.docx ~/job-apply/master-resume.docx
$EDITOR ~/job-apply/answers.md      # every blank is a form that stalls later
cd ~/job-apply && claude
```

Then: *"build my fact bank from master-resume.docx"*.

The fact bank is the one-time cost that everything else rests on — a list of
verified claims with IDs, each with its metric, its source, safe rewordings, and
a `Do not say` line. Every tailored bullet cites an entry, which is what makes
"never invent anything" a checkable rule rather than a good intention. Expect to
spend half an hour on it and to keep adding as you ship things.

## Daily use

```bash
cd ~/job-apply && claude
/daily-apply
```

Between runs, drop job links into `~/job-apply/inbox.md` — one URL per line, or
a pasted JD under a `## Company — Role` heading. The routine screens them, files
what passes, tailors up to three, and prints a standup led by whatever is
waiting on you.

## The scheduled morning prep

`./install.sh --schedule` installs a launchd agent that runs weekdays at 08:30
and writes `~/job-apply/daily-prep.sh`. It runs only the phases that don't need
anyone present — read the tracker, screen the inbox, draft follow-ups, write the
standup — and deliberately stops before tailoring a resume or opening a form.
Those need you at the keyboard: a resume rewritten unattended is the one output
here that can't be taken back once it's sent.

It runs with a deliberately narrow tool allowlist (`Read`, `Write`, `Edit`,
`Glob`, `Grep`, `WebFetch` — notably no `Bash`), since it runs while you're not
watching. Widen it in `daily-prep.sh` if you decide you want more.

```bash
bash ~/job-apply/daily-prep.sh              # test it now
tail -40 ~/job-apply/journal/prep.log       # what it did
launchctl list | grep daily-apply           # is it loaded
```

Change the time by editing `~/Library/LaunchAgents/com.jobsearch.daily-apply.plist`,
then `launchctl unload` and `load` it. Note launchd skips runs when the Mac is
asleep; if the machine is usually shut overnight, running `/daily-apply` by hand
when you sit down works just as well.

## Workspace layout

```
~/job-apply/
  answers.md        standing answers — the only source for form fields
  fact-bank.md      verified claims, the only source for resume content
  master-resume.docx
  tracker.csv       shared state: new → tailored → ready → submitted
  inbox.md          job links to screen on the next run
  roles/<slug>/     jd.md · resume.pdf/.docx · cover.md · changes.md
  journal/          daily standups and the scheduled run's log
```

`answers.md` holds current and expected CTC; `tracker.csv` holds everywhere
you've applied. The installer drops a catch-all `.gitignore` in the workspace so
that if it ever ends up inside a repo, none of it gets committed.

## Updating

```bash
cd path/to/vaishnav-197.github.io && git pull
cd .claude/skills && ./install.sh
```

If you edit a skill on the Mac and want to keep the change, copy it back into
this repo and commit — `~/.claude/skills/` is the installed copy, not the source.
