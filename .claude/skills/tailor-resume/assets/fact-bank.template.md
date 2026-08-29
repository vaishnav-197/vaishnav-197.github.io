# Fact bank

Every claim that may appear on a resume lives here first. Bullets are assembled
from these entries and cite them by ID; nothing gets written that isn't here.

Keep entries atomic — one accomplishment each — so they can be recombined for
different roles without rewriting the underlying claim.

## How to add an entry

Copy the block, take the next free ID, fill every field. `Do not say` is the
important one: it records inflations already rejected, so they don't get
re-proposed on the next application.

```markdown
### F-000 · Short label
- **Claim:** What was done, in one plain sentence.
- **Metric:** The number, in the unit it was measured in. Omit the field if there isn't one.
- **Source:** Where the number came from and when (dashboard, team estimate, retro).
- **Where:** Employer, project, rough dates.
- **Safe rewordings:** Other true ways to say this.
- **Do not say:** Phrasings that overstate it, and why.
```

---

## Examples — replace these with your own

### F-001 · Healthcare platform delivery
- **Claim:** Delivered Zenyum, a multi-clinic healthcare platform with real-time chat, scheduling, and patient-tracking workflows.
- **Metric:** 75,000+ active users.
- **Source:** self-reported; product analytics, 2024.
- **Where:** KeyValue Software Systems, 2022–present.
- **Safe rewordings:** multi-clinic healthcare platform; clinic management platform.
- **Do not say:** "75,000+ patients" (the count was users, not patients); "led delivery" unless that was the actual role.

### F-002 · Frontend performance
- **Claim:** Improved frontend performance through code splitting, lazy loading, and Lighthouse-driven optimization.
- **Metric:** 40% improvement.
- **Source:** self-reported; Lighthouse before/after.
- **Where:** KeyValue Software Systems — web app.
- **Safe rewordings:** cut load time 40%; 40% faster frontend.
- **Do not say:** apply this number to the React Native apps — it measured web.

### F-003 · Shared component library
- **Claim:** Built a standardized, reusable React/TypeScript component library.
- **Metric:** ~30% faster feature development.
- **Source:** self-reported team estimate.
- **Where:** KeyValue Software Systems.
- **Safe rewordings:** shared UI kit; reusable component library.
- **Do not say:** "design system" (implies tokens, docs, governance); "adopted across N teams" (never counted).

### F-004 · Server-driven UI
- **Claim:** Implemented server-driven UI architecture for React Native apps, enabling dynamic screen updates without an App Store resubmission.
- **Where:** KeyValue Software Systems.
- **Safe rewordings:** SDUI; remote-configured screens; OTA screen updates.
- **Do not say:** "designed the architecture" unless that was the actual scope.
