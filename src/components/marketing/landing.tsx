"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { features } from "@/data/mock";
import { brand, landingCopy, previewCopy, routes } from "@/data/content";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GitBranch, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen overflow-hidden grid-bg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href={routes.home} className="flex items-center gap-2 font-bold" aria-label={`${brand.name} home`}>
          <span className="rounded-xl bg-violet-600 p-2 text-white dark:bg-violet-500">
            <Sparkles size={18} />
          </span>
          {brand.name}
        </a>
        <div className="hidden gap-6 text-sm font-medium text-[var(--muted)] md:flex">
          <a className="hover:text-[var(--foreground)]" href="#features">{landingCopy.navigation.features}</a>
          <a className="hover:text-[var(--foreground)]" href="#pricing">{landingCopy.navigation.pricing}</a>
          <a className="hover:text-[var(--foreground)]" href={routes.dashboard}>{landingCopy.navigation.dashboard}</a>
        </div>
        <Button onClick={() => router.push(routes.register)}>{landingCopy.navigation.cta}</Button>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_.95fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm font-medium text-violet-700 dark:text-violet-200">
            {landingCopy.hero.eyebrow}
          </div>
          <h1 className="text-balance text-5xl font-black tracking-tight md:text-7xl">{landingCopy.hero.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">{landingCopy.hero.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => router.push(routes.register)}>
              {landingCopy.hero.primaryCta} <ArrowRight size={16} />
            </Button>
            <Button className="border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800" onClick={() => router.push(routes.dashboard)}>
              <GitBranch size={16} /> {landingCopy.hero.secondaryCta}
            </Button>
          </div>
        </motion.div>
        <ProjectPreview />
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">{landingCopy.features.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold">{landingCopy.features.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group">
              <feature.icon className="mb-5 text-violet-600 dark:text-violet-300" />
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{feature.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-4 lg:grid-cols-3">
          {landingCopy.process.map((step, index) => (
            <Card key={step.title}>
              <span className="text-5xl font-black text-violet-600/40 dark:text-violet-400/40">0{index + 1}</span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-[var(--muted)]">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-14">
        <Card className="text-center">
          <h2 className="text-3xl font-bold">{landingCopy.pricing.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--muted)]">{landingCopy.pricing.body}</p>
          <div className="mt-6 flex justify-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" /> {landingCopy.pricing.note}
          </div>
        </Card>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <span>{brand.copyright}</span>
        <span>{landingCopy.footerLinks}</span>
      </footer>
    </main>
  );
}

function ProjectPreview() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-4">
      <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-2xl shadow-slate-950/20">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-semibold">{previewCopy.title}</span>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">{previewCopy.score}</span>
        </div>
        {previewCopy.rows.map((row, index) => (
          <div key={row} className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[.04] p-3">
            <span>{row}</span>
            <span className={index < 4 ? "font-medium text-emerald-300" : "font-medium text-amber-300"}>
              {index < 4 ? previewCopy.complete : previewCopy.missing}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
