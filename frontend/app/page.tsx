'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProductUrlForm } from '@/components/product-url-form'
import { LivePipelineFeed } from '@/components/live-pipeline-feed'
import { ArchitecturePanel } from '@/components/architecture-panel'
import { LandingFeatureCard } from '@/components/landing-feature-card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import {
  BarChart3,
  DollarSign,
  Sparkles,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Zap,
  Briefcase,
  TrendingUp,
  Target,
  ArrowRight,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authenticated = api.getIsAuthenticated()
    setIsAuthenticated(authenticated)
    setIsLoading(false)
  }, [])

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          className="space-y-20 lg:space-y-28"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={container}
        >
          {/* Hero */}
          <section className="text-center space-y-8 pt-4">
            <motion.p
              variants={item}
              className="text-sm font-medium text-primary uppercase tracking-widest"
            >
              AI-Powered Marketplace Intelligence
            </motion.p>
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-pretty text-foreground max-w-4xl mx-auto leading-[1.1]"
            >
              Turn product URLs into strategic insights
            </motion.h1>
            <motion.p
              variants={item}
              className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed"
            >
              Analyze e-commerce products with a multi-agent pipeline: market sizing, cost metrics,
              competitor intel, and LLM-backed recommendations—built with LangGraph, FastAPI, and
              modern observability.
            </motion.p>
            {!isAuthenticated && !isLoading && (
              <motion.div variants={item}>
                <Link href="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                    Get started
                  </Button>
                </Link>
              </motion.div>
            )}
          </section>

          {/* What it does — one liner for recruiters */}
          <section className="max-w-3xl mx-auto text-center">
            <motion.p
              variants={item}
              className="text-base text-muted-foreground leading-relaxed"
            >
              This project demonstrates an <strong className="text-foreground">agentic AI system</strong> for
              marketplace analysis: async job pipeline, multi-step reasoning, MCP tool integration,
              and production-ready API design—suitable for technical deep-dives and product-minded
              discussions.
            </motion.p>
          </section>

          {/* Technical — ~70% for recruiters */}
          <section id="technical" className="space-y-10" aria-labelledby="technical-heading">
            <div className="text-center space-y-2">
              <motion.h2
                id="technical-heading"
                variants={item}
                className="text-2xl sm:text-3xl font-bold text-foreground"
              >
                Built for scale and clarity
              </motion.h2>
              <motion.p variants={item} className="text-muted-foreground max-w-xl mx-auto">
                Architecture and stack choices aimed at production readiness and recruiter-friendly
                technical discussion.
              </motion.p>
            </div>

            {/* Tech strip */}
            <motion.div
              variants={item}
              className="flex flex-wrap justify-center gap-3 sm:gap-4"
            >
              {[
                { icon: Layers, label: 'FastAPI' },
                { icon: GitBranch, label: 'LangGraph' },
                { icon: Zap, label: 'Celery' },
                { icon: Database, label: 'PostgreSQL' },
                { icon: Cpu, label: 'Mistral LLM' },
                { icon: BarChart3, label: 'MCP tools' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground/90 backdrop-blur-sm"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* How it works — pipeline */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-8"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">How it works</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-medium shrink-0">1.</span>
                  <span>Submit a product URL → job created and queued (Celery).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-medium shrink-0">2.</span>
                  <span>LangGraph orchestrates agents: research, analytics, optimization, critic—with state and tool calls (MCP, SerpAPI, Firecrawl).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-medium shrink-0">3.</span>
                  <span>Results and telemetry are stored (PostgreSQL); frontend polls status and displays reports and KPIs.</span>
                </li>
              </ul>
            </motion.div>
          </section>

          {/* Business / Real-world — ~30% */}
          <section id="use-cases" className="space-y-8" aria-labelledby="use-cases-heading">
            <div className="text-center space-y-2">
              <motion.h2 id="use-cases-heading" variants={item} className="text-2xl sm:text-3xl font-bold text-foreground">
                Real-world use cases
              </motion.h2>
              <motion.p variants={item} className="text-muted-foreground max-w-xl mx-auto">
                Scenarios where this system delivers concrete business value.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Briefcase,
                  title: 'Pricing strategist',
                  scenario:
                    'Validate list prices against competitor data and LLM-derived benchmarks before launching a new SKU.',
                },
                {
                  icon: TrendingUp,
                  title: 'Category manager',
                  scenario:
                    'Assess market size and growth signals for a category to prioritize inventory and partnerships.',
                },
                {
                  icon: Target,
                  title: 'Seller onboarding',
                  scenario:
                    'Give new sellers instant feedback on listing quality and positioning with actionable recommendations.',
                },
              ].map(({ icon: Icon, title, scenario }, i) => (
                <motion.div
                  key={title}
                  variants={item}
                  className="rounded-xl border border-border bg-card/70 backdrop-blur-sm p-5 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">{title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scenario}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Feature cards with contextual hover icons */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <motion.h2 variants={item} className="text-2xl sm:text-3xl font-bold text-foreground">
                What you get from each run
              </motion.h2>
              <motion.p variants={item} className="text-muted-foreground max-w-xl mx-auto">
                Structured outputs designed for both dashboards and decision-making.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <LandingFeatureCard
                icon={BarChart3}
                title="Market analysis"
                description="Market size, growth rates, and competitive landscape for any product—backed by research and MCP tools."
                delay={0}
              />
              <LandingFeatureCard
                icon={DollarSign}
                title="Cost metrics"
                description="Revenue potential, COGS, marketing and operational cost estimates with AI-powered recommendations."
                delay={0.05}
              />
              <LandingFeatureCard
                icon={Sparkles}
                title="AI recommendations"
                description="Actionable strategies with priority and impact scores, linked to competitor and market evidence."
                delay={0.1}
              />
            </div>
          </section>

          {/* Authenticated: app shell */}
          {isAuthenticated && (
            <motion.section variants={item} className="space-y-8">
              <h2 className="text-xl font-semibold text-foreground">Start analysis</h2>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="rounded-2xl border border-border bg-card/80 shadow-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold">New job</h3>
                    <ProductUrlForm />
                  </div>
                  <ArchitecturePanel />
                </div>
                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-border bg-card/80 shadow-lg overflow-hidden">
                    <LivePipelineFeed />
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* CTA */}
          {!isAuthenticated && !isLoading && (
            <motion.section
              variants={item}
              className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 sm:p-10 text-center space-y-4"
            >
              <p className="text-lg font-medium text-foreground">
                Ready to run your first analysis?
              </p>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2 group">
                  Sign in or sign up
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </motion.section>
          )}
        </motion.div>
      </div>
    </div>
  )
}
