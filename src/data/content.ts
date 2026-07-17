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
  demoProject: "/projects/atlas",
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
    secondaryCta: "View demo",
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
    note: "Free planning workspace preview",
  },
  footerLinks: "FAQ · Privacy · Security · Contact",
};

export const previewCopy = {
  title: "Atlas CRM readiness",
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
  stats: [
    { label: "Projects", value: "12" },
    { label: "Avg readiness", value: "69%" },
    { label: "Open tasks", value: "148" },
    { label: "AI actions", value: "36" },
  ],
  recentProjects: "Recent projects",
  tagsLabel: "tags",
  planningProgress: "Planning progress",
  completed: "Completed",
  missing: "Missing",
  recentActivity: "Recent activity",
  activitySummary:
    "Generated REST API draft, edited requirements order, added OAuth security checklist, and archived legacy mobile prototype.",
};

export const authCopy = {
  title: {
    login: "Welcome back",
    register: "Create your workspace",
    forgot: "Reset password",
  },
  subtitle:
    "Supabase Auth ready form with email verification and password recovery flows.",
  emailPlaceholder: "Email",
  passwordPlaceholder: "Password",
  emailRequired: "Email is required",
  emailInvalid: "Please enter a valid email address",
  passwordRequired: "Password is required",
  passwordInvalid: "Password must be at least 8 characters",
  continue: "Continue",
  login: "Login",
  register: "Register",
  forgot: "Forgot",
};

export const projectCopy = {
  projectName: "Atlas CRM",
  eyebrow: "Project overview",
  title: "Atlas CRM planning workspace",
  subtitle: "A complete software engineering plan from discovery through release readiness.",
  sections: {
    discovery: "Product discovery",
    architecture: "Architecture choices",
    assistant: "AI assistant actions",
    documentation: "Documentation and notes",
  },
  discoveryFields: [
    "Problem Statement",
    "Target Users",
    "Pain Points",
    "Competitors",
    "Value Proposition",
    "Success Metrics",
    "Business Goals",
  ],
  drafted: "Drafted",
  recommended: "Recommended",
  plannerTitles: {
    api: "API planner",
    database: "Database designer",
    tasks: "Task board",
    securityPerformance: "Security & performance",
  },
  apiRows: ["GET /projects", "POST /requirements", "PATCH /tasks/:id", "DELETE /features/:id"],
  databaseRows: [
    "projects → requirements",
    "projects → api_endpoints",
    "database_tables → columns",
    "tasks → activities",
  ],
  taskRows: ["Backlog", "Todo", "Doing", "Testing", "Done"],
  documentationBody:
    "# README.md\n\nProject goals, setup, architecture decisions, API contracts, database schema, testing strategy, deployment checklist, and release notes autosave here.",
};
