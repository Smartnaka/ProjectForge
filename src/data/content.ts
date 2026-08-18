export const brand = {
  name: "ProjectForge",
  copyright: "© 2026 ProjectForge",
  tagline: "Plan before code",
  description:
    "A premium software engineering workspace for planning complete applications before implementation.",
};

export const routes = {
  home: "/",
  dashboard: "/dashboard",
  register: "/auth/register",
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
};

export const landingCopy = {
  navigation: {
    features: "Features",
    pricing: "Pricing",
    dashboard: "Dashboard",
    cta: "Start planning",
  },
  hero: {
    eyebrow: "Linear + Notion + GitHub + Figma planning",
    title: "Plan the whole application before writing code.",
    body:
      "ProjectForge turns raw software ideas into production-ready plans: requirements, architecture, database, APIs, UI systems, tests, security, deployment, docs, and release checklists.",
    primaryCta: "Forge a project",
    secondaryCta: "Open workspace",
  },
  features: {
    eyebrow: "Workspace modules",
    title: "Everything engineers decide before sprint one.",
  },
  process: [
    {
      title: "Capture idea",
      body: "Guided workflows and AI actions convert ambiguity into engineering-ready artifacts.",
    },
    {
      title: "Structure plan",
      body: "Turn product context into requirements, schemas, endpoints, tasks, and launch checklists.",
    },
    {
      title: "Ship with confidence",
      body: "Track readiness, risks, and missing decisions before implementation begins.",
    },
  ],
  pricing: {
    title: "Built for focused builders and product teams.",
    body: "Testimonials, team pricing, and enterprise controls are ready as structured sections for launch content.",
    note: "Production planning workspace",
  },
  footerLinks: "FAQ · Privacy · Security · Contact",
};

export const previewCopy = {
  title: "Workspace readiness",
  score: "82%",
  complete: "Complete",
  missing: "Missing",
  rows: [
    "Product discovery",
    "Requirements",
    "Architecture",
    "Database schema",
    "REST API",
    "Security checklist",
  ],
};

export const dashboardCopy = {
  searchPlaceholder: "Search projects, APIs, stories...",
  title: "Planning dashboard",
  subtitle: "Recent projects, activity, progress, and readiness.",
  createProject: "Create project",
  recentProjects: "Recent projects",
  tagsLabel: "tags",
  planningProgress: "Planning progress",
};

export const authCopy = {
  title: {
    login: "Sign in to ProjectForge",
    register: "Create your workspace",
    forgot: "Sign in to ProjectForge",
  },
  subtitle:
    "Secure GitHub OAuth authentication backed by Supabase Auth.",
  githubCta: "Continue with GitHub",
};

export const marketingFeatures = [
  { title: "AI-assisted planning", body: "Generate PRDs, SRS docs, stories, schemas, APIs, tests, READMEs, and release notes from structured project context." },
  { title: "End-to-end workspace", body: "Discovery, requirements, architecture, UI, tasks, security, performance, deployment, and documentation in one flow." },
  { title: "Database designer", body: "Model tables, columns, primary keys, foreign keys, relationships, and ER diagrams before implementation." },
  { title: "API and architecture planner", body: "Define stacks, folder structures, endpoints, validation rules, examples, and operational requirements." },
  { title: "Readiness score", body: "Know exactly what is complete, missing, risky, and ready for engineering kickoff." },
  { title: "Global search", body: "Find projects, notes, endpoints, stories, decisions, and tasks instantly across your workspace." },
];
