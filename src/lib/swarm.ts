import { animate } from "motion/react";

/**
 * Cursor swarm: three named cursors build marked elements as they scroll into view.
 *
 * Mark an element with `data-swarm="frame|type|scan|drag|pop"`. While `html.swarm` is set
 * (added in index.html unless reduced motion is on), marked elements stay hidden until a
 * cursor builds them. Only inline styles and data attributes are touched, never React's text.
 */

type Kind = "frame" | "type" | "scan" | "drag" | "pop";
type Role = "layout" | "copy" | "media";

type Task = { el: HTMLElement; kind: Kind; label: string; eligible: boolean; taken: boolean; done: boolean };
type Agent = { role: Role; color: string; ink: string; node: HTMLDivElement; x: number; y: number; shown: boolean; busy: boolean };

const owner: Record<Kind, Role> = { frame: "layout", type: "copy", scan: "copy", drag: "media", pop: "media" };
const verb: Record<Kind, string> = { frame: "framing", type: "typing", scan: "writing", drag: "placing", pop: "adding" };

const roster: { role: Role; color: string; ink: string }[] = [
  { role: "copy", color: "var(--accent)", ink: "#fff" },
  { role: "media", color: "#7c6bd1", ink: "#fff" },
  { role: "layout", color: "var(--ink)", ink: "var(--paper)" },
];

type Curve = [number, number, number, number];
const ease: Curve = [0.22, 1, 0.36, 1];
const sweep: Curve = [0.45, 0, 0.55, 1];
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const POINTER =
  '<svg width="20" height="20" viewBox="0 0 20 20" style="display:block;margin:-2px 0 0 -3px;overflow:visible"><path d="M3 2 L9.6 18 L11.9 11.3 L18.4 9 Z" fill="currentColor" stroke="var(--paper)" stroke-width="1.4" stroke-linejoin="round"/></svg>';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, style: string, html = "") {
  const node = document.createElement(tag);
  node.style.cssText = style;
  node.innerHTML = html;
  return node;
}

function labelFor(node: HTMLElement) {
  const text = node.dataset.swarmLabel ?? node.querySelector("img")?.alt ?? node.innerText ?? "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 26 ? `${clean.slice(0, 25)}…` : clean;
}

export function startSwarm(): () => void {
  const html = document.documentElement;
  if (!html.classList.contains("swarm")) return () => {};
  (window as unknown as { __swarm?: boolean }).__swarm = true;

  let stopped = false;
  const running = new Set<{ stop: () => void }>();
  const go = (...args: Parameters<typeof animate>) => {
    const controls = (animate as any)(...args);
    running.add(controls);
    return Promise.resolve(controls).finally(() => running.delete(controls));
  };

  // --- overlay: a fixed layer whose inner plane is shifted by the scroll, so cursors use page coordinates.
  const layer = el("div", "position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:20");
  const plane = el("div", "position:absolute;left:0;top:0;will-change:transform");
  layer.setAttribute("aria-hidden", "true");
  layer.append(plane);
  const hud = el(
    "div",
    "position:fixed;left:16px;bottom:16px;z-index:20;pointer-events:none;display:flex;align-items:center;gap:10px;padding:6px 10px;border:1px solid var(--rule);border-radius:999px;background:color-mix(in srgb,var(--paper) 85%,transparent);backdrop-filter:blur(8px);font:11px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.04em;color:var(--ink);opacity:0;transition:opacity .3s",
  );
  hud.setAttribute("aria-hidden", "true");
  const hudDot = el("span", "width:7px;height:7px;border-radius:999px;background:var(--accent)");
  const hudText = el("span", "white-space:nowrap;max-width:60vw;overflow:hidden;text-overflow:ellipsis");
  const hudPct = el("span", "color:var(--ink);font-variant-numeric:tabular-nums");
  hud.append(hudDot, hudText, hudPct);
  document.body.append(layer, hud);

  let frame = 0;
  const syncScroll = () => {
    frame = 0;
    plane.style.transform = `translate3d(${-window.scrollX}px,${-window.scrollY}px,0)`;
    check();
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(syncScroll);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // --- agents
  const agents: Agent[] = roster.map(({ role, color, ink }, i) => {
    const node = el(
      "div",
      `position:absolute;left:0;top:0;color:${color};opacity:0;will-change:transform`,
      `${POINTER}<span style="position:absolute;left:14px;top:16px;padding:2px 6px;border-radius:4px;background:${color};color:${ink};font:10px/1.3 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.04em;white-space:nowrap">${role}</span>`,
    );
    plane.append(node);
    const x = window.scrollX + window.innerWidth * (0.2 + 0.3 * i);
    const y = window.scrollY + window.innerHeight + 40;
    return { role, color, ink, node, x, y, shown: false, busy: false };
  });

  const place = (a: Agent, x: number, y: number) => {
    a.x = x;
    a.y = y;
    a.node.style.transform = `translate(${x}px,${y}px)`;
  };
  agents.forEach((a) => place(a, a.x, a.y));

  // --- tasks
  const tasks: Task[] = [];
  const known = new WeakSet<HTMLElement>();
  const collect = () => {
    let added = false;
    for (const node of document.querySelectorAll<HTMLElement>("[data-swarm]:not([data-swarm-done])")) {
      if (known.has(node)) continue;
      known.add(node);
      tasks.push({ el: node, kind: node.dataset.swarm as Kind, label: "", eligible: false, taken: false, done: false });
      added = true;
    }
    return added;
  };
  collect();
  // Lazy sections and fetched content mount later; pick up their marked elements too.
  const observer = new MutationObserver((records) => {
    if (records.some((r) => !layer.contains(r.target)) && collect()) onScroll();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  const progress = () => `${Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)}%`;

  let wake: (() => void)[] = [];
  const notify = () => {
    const w = wake;
    wake = [];
    w.forEach((fn) => fn());
  };

  // Runs once per scrolled frame. A position check rather than an IntersectionObserver, so
  // elements skipped by a fast scroll or a restored scroll position still get handled.
  const check = () => {
    let woke = false;
    for (const t of tasks) {
      if (t.eligible || t.done) continue;
      const r = t.el.getBoundingClientRect();
      if (r.bottom < 0 || !t.el.isConnected) {
        t.eligible = t.taken = true;
        finish(t);
      } else if (r.top < window.innerHeight) {
        t.eligible = woke = true;
      }
    }
    if (woke) notify();
    if (tasks.every((t) => t.done)) complete();
  };

  const clear = (node: HTMLElement) => {
    for (const p of ["opacity", "clip-path", "transform", "transform-origin"]) node.style.removeProperty(p);
  };
  const finish = (task: Task) => {
    task.done = true;
    task.el.dataset.swarmDone = "";
    // Motion commits its final frame after the promise settles, so clear on the next frames.
    requestAnimationFrame(() => requestAnimationFrame(() => clear(task.el)));
    hudPct.textContent = progress();
    task.el.dispatchEvent(new CustomEvent("swarm:built", { bubbles: false }));
  };

  const pending = () => tasks.filter((t) => t.eligible && !t.taken && !t.done);
  const pick = (a: Agent) => {
    const open = pending();
    return (
      open.find((t) => owner[t.kind] === a.role) ??
      // Help out when the cursor that usually does this job is busy.
      open.find((t) => agents.find((b) => b.role === owner[t.kind])!.busy)
    );
  };
  const speed = () => clamp(1 + pending().length / 5, 1, 3);

  // --- HUD
  let hudTimer = 0;
  const report = (a: Agent, task: Task) => {
    window.clearTimeout(hudTimer);
    hudDot.style.background = a.color;
    hudText.textContent = `${a.role} · ${verb[task.kind]} “${task.label}”`;
    hudPct.textContent = progress();
    hud.style.opacity = "1";
  };
  const quietHud = () => {
    window.clearTimeout(hudTimer);
    hudTimer = window.setTimeout(() => {
      if (agents.every((a) => !a.busy)) hud.style.opacity = "0";
    }, 1400);
  };

  // --- movement
  const fly = async (a: Agent, x: number, y: number, s: number) => {
    if (!a.shown) {
      // Enter from the nearest side of the viewport.
      const fromLeft = x - window.scrollX < window.innerWidth / 2;
      place(a, window.scrollX + (fromLeft ? -30 : window.innerWidth + 10), clamp(y, window.scrollY + 40, window.scrollY + window.innerHeight - 40));
      a.shown = true;
      go(a.node, { opacity: 1 }, { duration: 0.2 });
    }
    const distance = Math.hypot(x - a.x, y - a.y);
    await move(a, x, y, clamp(0.2 + distance / 1800, 0.2, 0.75) / s, ease);
  };
  const move = (a: Agent, x: number, y: number, duration: number, curve: Curve = sweep) => {
    const from = `translate(${a.x}px,${a.y}px)`;
    const tag = a.node.lastElementChild as HTMLElement;
    const nearRight = x - window.scrollX > window.innerWidth - 90;
    tag.style.left = nearRight ? "auto" : "14px";
    tag.style.right = nearRight ? "4px" : "auto";
    a.x = x;
    a.y = y;
    return go(a.node, { transform: [from, `translate(${x}px,${y}px)`] }, { duration, ease: curve });
  };
  const click = async (a: Agent, x: number, y: number) => {
    const ring = el(
      "div",
      `position:absolute;left:${x - 12}px;top:${y - 12}px;width:24px;height:24px;border-radius:999px;border:1.5px solid ${a.color}`,
    );
    plane.append(ring);
    go(ring, { scale: [0.2, 1.6], opacity: [1, 0] }, { duration: 0.45, ease }).then(() => ring.remove());
    await go(a.node.firstElementChild as Element, { scale: [1, 0.8, 1] }, { duration: 0.12 });
  };

  // --- builds
  async function perform(a: Agent, task: Task) {
    const { el: node, kind } = task;
    const r = node.getBoundingClientRect();
    // Scrolled well past already, or unmounted: just show it.
    if (!node.isConnected || r.bottom < -200 || r.top > window.innerHeight + 200) return finish(task);

    const s = speed();
    task.label = labelFor(node);
    const left = r.left + window.scrollX;
    const top = r.top + window.scrollY;
    report(a, task);

    if (kind === "type") {
      const y = top + Math.min(r.height / 2, 28);
      await fly(a, left, y, s);
      node.style.opacity = "1";
      node.style.clipPath = "inset(-20px 100% -20px -20px)";
      const duration = clamp(r.width / 650, 0.3, 0.95) / s;
      await Promise.all([
        go(node, { clipPath: ["inset(-20px 100% -20px -20px)", "inset(-20px -20px -20px -20px)"] }, { duration, ease: sweep }),
        move(a, left + r.width, y, duration),
      ]);
    } else if (kind === "scan") {
      await fly(a, left, top + 8, s);
      node.style.opacity = "1";
      node.style.clipPath = "inset(-20px -20px 100% -20px)";
      const duration = clamp(r.height / 260, 0.35, 0.9) / s;
      await Promise.all([
        go(node, { clipPath: ["inset(-20px -20px 100% -20px)", "inset(-20px -20px -20px -20px)"] }, { duration, ease: sweep }),
        move(a, left + Math.min(r.width, 420) * 0.7, top + r.height, duration),
      ]);
    } else if (kind === "frame") {
      await fly(a, left, top, s);
      const box = el(
        "div",
        `position:absolute;left:${left}px;top:${top}px;width:0;height:0;border:1px dashed ${a.color};background:color-mix(in srgb,${a.color} 7%,transparent)`,
      );
      const size = el(
        "span",
        `position:absolute;right:0;bottom:-18px;font:10px/1 'JetBrains Mono',ui-monospace,monospace;color:${a.color};opacity:0`,
        `${Math.round(r.width)} × ${Math.round(r.height)}`,
      );
      box.append(size);
      plane.append(box);
      const duration = 0.45 / s;
      await Promise.all([
        go(box, { width: r.width, height: r.height }, { duration, ease: sweep }),
        move(a, left + r.width, top + r.height, duration),
      ]);
      size.style.opacity = "1";
      await go(node, { opacity: [0, 1] }, { duration: 0.2 / s });
      go(box, { opacity: 0 }, { duration: 0.35 }).then(() => box.remove());
    } else if (kind === "drag") {
      const fromLeft = node.dataset.swarmFrom === "left" || (!node.dataset.swarmFrom && r.left + r.width / 2 < window.innerWidth / 2);
      const dx = (fromLeft ? -1 : 1) * clamp(r.width * 0.35, 60, 140);
      const dy = -clamp(r.height * 0.15, 20, 60);
      const grabX = left + Math.min(r.width * 0.4, 120);
      const grabY = top + Math.min(r.height * 0.3, 60);
      node.style.transformOrigin = `${grabX - left}px ${grabY - top}px`;
      const lifted = `translate(${dx}px,${dy}px) rotate(${fromLeft ? -4 : 4}deg) scale(0.96)`;
      node.style.transform = lifted;
      await fly(a, grabX + dx, grabY + dy, s);
      await click(a, grabX + dx, grabY + dy);
      await go(node, { opacity: [0, 0.75] }, { duration: 0.1 / s });
      const duration = 0.55 / s;
      await Promise.all([
        go(node, { transform: [lifted, "translate(0px,0px) rotate(0deg) scale(1)"], opacity: [0.75, 1] }, { duration, ease }),
        move(a, grabX, grabY, duration, ease),
      ]);
    } else {
      const cx = left + Math.min(r.width / 2, 80);
      const cy = top + r.height / 2;
      await fly(a, cx, cy, s);
      await click(a, cx, cy);
      await go(node, { opacity: [0, 1], scale: [0.9, 1] }, { duration: 0.2 / s, ease });
    }
    if (!stopped) finish(task);
  }

  async function loop(a: Agent) {
    let idle = 0;
    while (!stopped) {
      const task = pick(a);
      if (!task) {
        // Fade out after a short idle; wake when new work appears.
        idle = window.setTimeout(() => {
          if (!a.busy && a.shown) {
            a.shown = false;
            go(a.node, { opacity: 0 }, { duration: 0.4 });
          }
        }, 900);
        quietHud();
        await new Promise<void>((resolve) => wake.push(resolve));
        window.clearTimeout(idle);
        continue;
      }
      task.taken = true;
      a.busy = true;
      await perform(a, task);
      a.busy = false;
      notify();
      if (tasks.every((t) => t.done)) return complete();
    }
  }

  let tornDown = false;
  function teardown() {
    if (tornDown) return;
    tornDown = true;
    stopped = true;
    notify();
    observer.disconnect();
    window.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(frame);
    hud.style.opacity = "0";
    setTimeout(() => {
      layer.remove();
      hud.remove();
    }, 600);
  }
  // Everything is built: anything that mounts from now on just shows.
  function complete() {
    teardown();
    html.classList.remove("swarm");
  }

  syncScroll();
  agents.forEach((a) => void loop(a));

  return () => {
    stopped = true;
    running.forEach((c) => c.stop());
    notify();
    tasks.forEach((t) => !t.done && clear(t.el));
    teardown();
    layer.remove();
    hud.remove();
  };
}
