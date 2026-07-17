import { Code2, Database, GitBranch, Layers3, LockKeyhole, Rocket, Search, Sparkles, TestTube2 } from "lucide-react";
export const features = [
 {icon:Sparkles,title:"AI-assisted planning",body:"Generate PRDs, SRS docs, stories, schemas, APIs, tests, READMEs, and release notes from structured project context."},
 {icon:Layers3,title:"End-to-end workspace",body:"Discovery, requirements, architecture, UI, tasks, security, performance, deployment, and documentation in one flow."},
 {icon:Database,title:"Database designer",body:"Model tables, columns, primary keys, foreign keys, relationships, and ER diagrams before implementation."},
 {icon:GitBranch,title:"API and architecture planner",body:"Define stacks, folder structures, endpoints, validation rules, examples, and operational requirements."},
 {icon:TestTube2,title:"Readiness score",body:"Know exactly what is complete, missing, risky, and ready for engineering kickoff."},
 {icon:Search,title:"Global search",body:"Find projects, notes, endpoints, stories, decisions, and tasks instantly across your workspace."},
];
export const projectNav=["Overview","Product Discovery","Requirements","User Stories","Features","Architecture","Database","API","UI Planning","Tasks","Testing","Security","Performance","Deployment","Documentation","Release Checklist","Notes","AI Assistant","Settings"];
export const sampleProjects=[{name:"Atlas CRM",status:"Planning",priority:"High",score:82,tags:["SaaS","B2B","Postgres"]},{name:"Pulse Mobile",status:"Discovery",priority:"Medium",score:54,tags:["Mobile","Realtime"]},{name:"Forge API",status:"Architecture",priority:"Urgent",score:71,tags:["API","Auth","Billing"]}];
export const checklist=["Requirements","Architecture","API","Database","Testing","Security","Deployment","Release Checklist"].map((name,i)=>({name,complete:i<4}));
export const aiActions=["Generate PRD","Generate SRS","Generate User Stories","Generate Acceptance Criteria","Generate Database Schema","Generate REST API","Generate Folder Structure","Generate Test Cases","Generate Architecture","Generate README","Generate Release Notes","Generate Technical Documentation"];
export const securityItems=["Authentication","Authorization","Rate limiting","Encryption","Input validation","Secrets management","OWASP checks"];
export const perfItems=["Caching","Lazy loading","Image optimization","API optimization","Bundle size","Rendering strategy"];
export const stack=["Frontend","Backend","Database","Authentication","Hosting","Caching","Queue","Storage","State Management","Navigation"];
export const icons={Code2,LockKeyhole,Rocket};
