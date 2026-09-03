#!/usr/bin/env bash
# Install the job-search skills and workspace on this machine.
#
# Written for macOS's stock bash 3.2 — no associative arrays, no mapfile.
#
#   ./install.sh                    install skills + workspace
#   ./install.sh --schedule         also install the weekday morning launchd job
#   ./install.sh --uninstall-schedule
#   ./install.sh --dry-run          show what would happen, change nothing
#
# Re-running is safe: skills are refreshed (previous copy backed up), and no
# file already in the workspace is ever overwritten — that's your data.

set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${HOME}/.claude/skills"
WORKSPACE="${HOME}/job-apply"
SKILLS="apply-loop tailor-resume daily-apply"
LABEL="com.jobsearch.daily-apply"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
DRY=0
SCHEDULE=0
UNSCHEDULE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dest)       DEST="$2"; shift 2 ;;
    --workspace)  WORKSPACE="$2"; shift 2 ;;
    --schedule)   SCHEDULE=1; shift ;;
    --uninstall-schedule) UNSCHEDULE=1; shift ;;
    --dry-run)    DRY=1; shift ;;
    -h|--help)    sed -n '2,14p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

say()  { printf '  %s\n' "$*"; }
head_() { printf '\n%s\n' "$*"; }
run()  { if [ "$DRY" = 1 ]; then say "would: $*"; else "$@"; fi; }

# ---------------------------------------------------------------- preflight
head_ "Checking prerequisites"

if command -v python3 >/dev/null 2>&1; then
  say "python3      $(python3 --version 2>&1)"
else
  say "python3      MISSING — the resume verifier needs it. Install Xcode command"
  say "             line tools:  xcode-select --install"
fi

CLAUDE_BIN="$(command -v claude 2>/dev/null || true)"
if [ -n "$CLAUDE_BIN" ]; then
  say "claude       $CLAUDE_BIN"
else
  say "claude       not on PATH — skills will still install, but you'll need the"
  say "             CLI to use them, and --schedule can't resolve it."
fi

if command -v pdftotext >/dev/null 2>&1; then
  say "pdftotext    $(command -v pdftotext)"
else
  say "pdftotext    not found (optional). Without it the resume verifier can't"
  say "             read the PDF text layer, which is the check worth having:"
  say "             brew install poppler"
fi

# ------------------------------------------------------------------- skills
head_ "Installing skills → ${DEST}"
run mkdir -p "$DEST"
STAMP="$(date +%Y%m%d-%H%M%S)"
for s in $SKILLS; do
  if [ ! -d "${SRC}/${s}" ]; then
    echo "missing source skill: ${SRC}/${s}" >&2; exit 1
  fi
  if [ -d "${DEST}/${s}" ]; then
    run mv "${DEST}/${s}" "${DEST}/${s}.bak-${STAMP}"
    say "${s} (previous copy → ${s}.bak-${STAMP})"
  else
    say "${s}"
  fi
  run cp -R "${SRC}/${s}" "${DEST}/${s}"
done
[ "$DRY" = 1 ] || chmod +x "${DEST}/tailor-resume/scripts/verify_resume.py"

# ---------------------------------------------------------------- workspace
head_ "Workspace → ${WORKSPACE}"
run mkdir -p "${WORKSPACE}/roles" "${WORKSPACE}/journal"

seed() {  # seed <template-path> <target-name>
  if [ -e "${WORKSPACE}/$2" ]; then
    say "$2 — already there, left alone"
  else
    run cp "$1" "${WORKSPACE}/$2"
    say "$2 — created"
  fi
}
seed "${SRC}/daily-apply/assets/answers.template.md"  "answers.md"
seed "${SRC}/daily-apply/assets/inbox.template.md"    "inbox.md"
seed "${SRC}/daily-apply/assets/tracker.template.csv" "tracker.csv"
seed "${SRC}/tailor-resume/assets/fact-bank.template.md" "fact-bank.md"

if [ ! -e "${WORKSPACE}/master-resume.docx" ]; then
  say "master-resume.docx — MISSING. Copy your full resume there before the first tailor."
fi

# The workspace holds CTC, notice period, and everywhere you've applied. If it
# ever ends up inside a git repo, this stops an accidental commit.
if [ ! -e "${WORKSPACE}/.gitignore" ]; then
  run sh -c "printf '*\n' > '${WORKSPACE}/.gitignore'"
  say ".gitignore — created (ignores everything; this data should never be committed)"
fi

# ----------------------------------------------------------------- schedule
if [ "$UNSCHEDULE" = 1 ]; then
  head_ "Removing the morning job"
  if [ -e "$PLIST" ]; then
    run launchctl unload "$PLIST" 2>/dev/null || true
    run rm -f "$PLIST"
    say "removed ${PLIST}"
  else
    say "nothing installed at ${PLIST}"
  fi
fi

if [ "$SCHEDULE" = 1 ]; then
  head_ "Installing the weekday morning job (08:30, Mon–Fri)"
  if [ -z "$CLAUDE_BIN" ]; then
    echo "  cannot schedule: 'claude' is not on PATH." >&2
    echo "  Install the CLI, then re-run with --schedule." >&2
    exit 1
  fi

  PREP="${WORKSPACE}/daily-prep.sh"
  if [ "$DRY" = 1 ]; then
    say "would write ${PREP} and ${PLIST}"
  else
    cat > "$PREP" <<PREP_EOF
#!/usr/bin/env bash
# Morning prep for the job search. Installed by install.sh — edit freely.
#
# Runs the parts of /daily-apply that need no one present: reads the tracker,
# screens whatever landed in inbox.md, drafts follow-ups, writes the standup.
# It deliberately stops before tailoring resumes and before opening any
# application form — both of those need you at the keyboard, and a resume
# rewritten unattended is the one output here you can't take back.
set -euo pipefail

# launchd starts with a bare PATH, so resolve things explicitly.
export PATH="\$HOME/.local/bin:\$HOME/.claude/local:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
CLAUDE="${CLAUDE_BIN}"
WORKSPACE="${WORKSPACE}"
LOG="\${WORKSPACE}/journal/prep.log"

cd "\$WORKSPACE"
{
  echo "=== \$(date '+%Y-%m-%d %H:%M') ==="
  "\$CLAUDE" -p "/daily-apply Morning prep only: run phases 1, 2, 5, 6 and 7. Do not tailor any resume and do not open application forms — list what is waiting for me instead." \\
    --permission-mode acceptEdits \\
    --allowedTools "Read" "Write" "Edit" "Glob" "Grep" "WebFetch" \\
    2>&1
  echo
} >> "\$LOG" 2>&1

osascript -e "display notification \"Standup ready in \${WORKSPACE}/journal\" with title \"Job hunt\"" 2>/dev/null || true
PREP_EOF
    chmod +x "$PREP"
    say "wrote ${PREP}"

    mkdir -p "$(dirname "$PLIST")"
    cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${PREP}</string>
  </array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>30</integer></dict>
    <dict><key>Weekday</key><integer>2</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>30</integer></dict>
    <dict><key>Weekday</key><integer>3</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>30</integer></dict>
    <dict><key>Weekday</key><integer>4</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>30</integer></dict>
    <dict><key>Weekday</key><integer>5</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>30</integer></dict>
  </array>
  <key>StandardOutPath</key><string>${WORKSPACE}/journal/launchd.out</string>
  <key>StandardErrorPath</key><string>${WORKSPACE}/journal/launchd.err</string>
  <key>RunAtLoad</key><false/>
</dict>
</plist>
PLIST_EOF
    say "wrote ${PLIST}"
    launchctl unload "$PLIST" 2>/dev/null || true
    launchctl load "$PLIST"
    say "loaded — first run next weekday at 08:30"
    say "test it now:  bash ${PREP} && tail -40 ${WORKSPACE}/journal/prep.log"
  fi
fi

# -------------------------------------------------------------------- done
head_ "Done"
say "Skills:     ${DEST}/{apply-loop,tailor-resume,daily-apply}"
say "Workspace:  ${WORKSPACE}"
cat <<NEXT

Next:
  1. cp /path/to/your/resume.docx ${WORKSPACE}/master-resume.docx
  2. Fill in ${WORKSPACE}/answers.md — every blank there is an application
     that would otherwise stop and ask you mid-form.
  3. cd ${WORKSPACE} && claude
     Then: "build my fact bank from master-resume.docx"
  4. Drop job links into inbox.md and run /daily-apply.
NEXT
