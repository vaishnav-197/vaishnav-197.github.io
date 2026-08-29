#!/usr/bin/env python3
"""Verify a tailored resume PDF before it goes out.

Checks the four things that silently ruin an application:
  1. the PDF has an extractable text layer (image-only exports score zero in ATS)
  2. it is one page (override with --pages)
  3. every approved bullet actually made it into the file
  4. no template placeholder survived the edit

Usage:
    python3 verify_resume.py roles/<slug>/resume.pdf [--bullets roles/<slug>/changes.md] [--pages 1]

Text extraction uses `pdftotext` (poppler) if present, else pypdf/PyPDF2.
If neither is available it says so and exits 2 — do the checks by hand rather
than assuming they passed.
"""

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

# Matched against the raw lowercased text so brackets and % survive. Bare words
# are word-bounded so a real word never trips a false failure.
PLACEHOLDERS = [
    r"lorem ipsum", r"\[company\]", r"\[role\]", r"<company>", r"<role>",
    r"\bxx%", r"\byy%", r"\btbd\b", r"\btodo\b",
    r"your name here", r"\binsert your\b",
]


def extract(pdf: Path):
    """Return (text, page_count) or (None, None) if no extractor is available."""
    if shutil.which("pdftotext"):
        text = subprocess.run(
            ["pdftotext", "-layout", str(pdf), "-"],
            capture_output=True, text=True, check=True,
        ).stdout
        info = subprocess.run(
            ["pdfinfo", str(pdf)], capture_output=True, text=True
        ).stdout if shutil.which("pdfinfo") else ""
        m = re.search(r"^Pages:\s+(\d+)", info, re.M)
        return text, int(m.group(1)) if m else None

    for mod in ("pypdf", "PyPDF2"):
        try:
            reader = __import__(mod).PdfReader(str(pdf))
        except ImportError:
            continue
        pages = reader.pages
        return "\n".join(p.extract_text() or "" for p in pages), len(pages)

    return None, None


def norm(s: str) -> str:
    """Drop punctuation that PDF layout shifts around, then collapse whitespace.

    Order matters: stripping punctuation introduces runs of spaces, so the
    collapse has to come last or substring matching fails on "40% via".
    """
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]", " ", s.lower())).strip()


def approved_bullets(path: Path):
    """Pull the 'After' column out of the changes.md diff table."""
    out = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip().startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 3 or cells[2] in ("", "-", "—", "After"):
            continue
        if set(cells[0]) <= set("-: "):     # separator row
            continue
        out.append(re.sub(r"[*_`]", "", cells[2]))
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf", type=Path)
    ap.add_argument("--bullets", type=Path, help="changes.md holding the approved diff table")
    ap.add_argument("--pages", type=int, default=1, help="expected page count (default 1)")
    args = ap.parse_args()

    if not args.pdf.exists():
        print(f"FAIL  no such file: {args.pdf}")
        return 1

    text, pages = extract(args.pdf)
    if text is None:
        print("SKIP  no text extractor available (install poppler-utils or pypdf).")
        print("      Verify by hand: text selectable, page count, bullets present, no placeholders.")
        return 2

    failures = []

    words = len(text.split())
    if words < 100:
        failures.append(f"text layer looks empty ({words} words) — likely exported as an image; ATS will read nothing")
    else:
        print(f"OK    text layer extractable ({words} words)")

    if pages is None:
        print("WARN  could not determine page count")
    elif pages != args.pages:
        failures.append(f"{pages} pages, expected {args.pages}")
    else:
        print(f"OK    {pages} page(s)")

    flat = re.sub(r"\s+", " ", text.lower())
    found = [p for p in PLACEHOLDERS if re.search(p, flat)]
    for p in found:
        failures.append(f"placeholder text still present: {p}")
    if not found:
        print("OK    no placeholder text")

    haystack = norm(text)

    if args.bullets and args.bullets.exists():
        missing = []
        for b in approved_bullets(args.bullets):
            probe = " ".join(norm(b).split()[:8])
            if probe and probe not in haystack:
                missing.append(b[:70])
        if missing:
            failures.extend(f"approved bullet missing from PDF: {m}…" for m in missing)
        else:
            print("OK    every approved bullet present")
    elif args.bullets:
        print(f"WARN  {args.bullets} not found — bullet check skipped")

    print()
    if failures:
        for f in failures:
            print(f"FAIL  {f}")
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
