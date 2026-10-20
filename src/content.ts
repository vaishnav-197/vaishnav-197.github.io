// All site copy lives here. Add new roles, projects or links by extending these arrays.

export const profile = {
  name: ["Vaishnav", "Valsaraj"],
  role: "Software Engineer",
  location: "Bengaluru, India",
  standfirst:
    "Software engineer with four years of building products end to end — services, databases and the interfaces on top of them. Working in",
  stack: ["Node.js", "PostgreSQL", "React", "TypeScript", "AWS"],
  exploring: ["Go", "Distributed systems"],
  email: "vaishnavea18@gmail.com",
  github: "https://github.com/vaishnav-197",
  linkedin: "https://www.linkedin.com/in/vaishnav-valsaraj9746",
  medium: "vyshnav18",
  resume: "/resume/vaishnav-valsaraj-frontend.pdf",
};

export const about = {
  lead: "Good software feels effortless. I do the hard work that makes it that way.",
  body: "I care about the parts people feel but rarely name: how fast a page renders, how a service behaves under load, how a codebase holds up as a team grows. Four years in, that's still the work I enjoy most.",
  facts: [
    ["Now", "Senior Product Engineer, Premagic"],
    ["Based in", "Bengaluru, India"],
    ["Focus", "Node.js, PostgreSQL, React"],
    ["Exploring", "Go, distributed systems"],
  ],
};

export type Role = {
  company: string;
  title: string;
  period: string;
  points: string[];
};

export const experience: Role[] = [
  // NEW ROLE: add the most recent role first.
  {
    company: "Premagic",
    title: "Senior Product Engineer",
    period: "Apr 2026 — Present",
    points: [
      "Built a Node.js and Playwright rendering service for attendee posters and PDFs — re-renders in ~100 ms, down from ~20 s.",
      "Sped up large-event pages with PostgreSQL indexing and query rewrites.",
      "Added two-factor and Google sign-in on AWS Cognito.",
    ],
  },
  {
    company: "KeyValue Software Systems",
    title: "Software Engineer",
    period: "Jul 2022 — Mar 2026",
    points: [
      "Owned front-end delivery for clinic-management, payments and AI-onboarding products across Southeast Asia.",
      "Cut LCP from 4.2s to 2.5s by removing duplicate API calls and splitting code by route.",
      "Built the shared React and TypeScript component library that cut feature delivery ~30%, and designed a Module Federation micro-frontend architecture so teams shipped independently.",
      "Cut production regressions 35% with a Jest and React Testing Library gate on merge.",
      "Built modular backend CRUD services with NestJS, TypeORM and PostgreSQL.",
    ],
  },
];

export type CaseStudy = {
  id: "zenyum" | "fps" | (string & {});
  title: string;
  kicker: string;
  period: string;
  quote: string;
  problem: string;
  approach: string;
  /** Rendered with the figures in `highlights` marked up. */
  outcome: string;
  highlights: string[];
  stack: string[];
  links: { label: string; href: string }[];
};

export const work: CaseStudy[] = [
  {
    id: "zenyum",
    title: "Zenyum",
    kicker: "Healthcare platform · KeyValue",
    period: "2022 — 2026",
    quote: "Many clinics, one product, every screen fast.",
    problem:
      "Clinics, patients and care teams coordinating chat, appointments and treatment tracking across web and mobile — on a product growing faster than its UI could keep up.",
    approach:
      "A shared React and TypeScript component library, Module Federation micro-frontends so teams shipped independently, code splitting on the web, and server-driven UI on React Native.",
    outcome:
      "40% faster front end, 30% faster feature delivery and 35% fewer production regressions.",
    highlights: ["40% faster", "30% faster", "35% fewer"],
    stack: ["React", "React Native", "GraphQL", "NestJS", "PostgreSQL", "AWS"],
    links: [{ label: "zenyum.com", href: "https://www.zenyum.com" }],
  },
  {
    id: "fps",
    title: "React Native FPS Counter",
    kicker: "Open source · npm",
    period: "Library",
    quote: "Measure frames without costing frames.",
    problem:
      "JavaScript-side FPS meters in React Native add the very overhead they are trying to measure, and can't see the native UI thread at all.",
    approach:
      "Native frame timing through CADisplayLink on iOS and Choreographer on Android, exposed via Turbo Modules, with a draggable overlay and a useFPS hook.",
    outcome: "Published on npm as @vyshnav18/react-native-fps-counter for the New Architecture.",
    highlights: [],
    stack: ["React Native", "Turbo Modules", "JSI", "TypeScript", "iOS", "Android"],
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/@vyshnav18/react-native-fps-counter" },
      { label: "GitHub", href: "https://github.com/vaishnav-197/FPS-Counter" },
    ],
  },
  // NEW PROJECT: add another case study here.
];

export const archive = [
  {
    title: "ReactChat",
    note: "Real-time chat with React, Node.js and Socket.io",
    href: "https://github.com/vaishnav-197/Reactchat",
  },
];

export type LabEntry = {
  title: string;
  summary: string;
  stack: string[];
  status: "Building" | "Shipped";
  href?: string;
};

// Go and distributed-systems experiments. Newest first.
export const lab: LabEntry[] = [];

export const toolkit: { label: string; items: string[] }[] = [
  { label: "Back end", items: ["Node.js", "NestJS", "PostgreSQL", "REST", "GraphQL", "AWS", "Cognito", "Playwright"] },
  { label: "Front end", items: ["TypeScript", "React", "Next.js", "React Native", "Redux", "TanStack Query", "Tailwind CSS", "Storybook"] },
  { label: "Tooling", items: ["Jest", "React Testing Library", "Cypress", "Nx", "Webpack Module Federation", "GitHub Actions"] },
];

export const education = {
  degree: "B.Tech, Computer Science and Engineering",
  school: "Cochin University of Science and Technology",
  period: "2018 — 2022",
};
