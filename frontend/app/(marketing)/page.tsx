"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Search, ShieldCheck, Zap, 
  BarChart3, TrendingUp, Cpu, Globe, 
  Layers, Sparkles
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

// --- Type Safety Interfaces ---
interface BentoCardProps {
  icon: React.ElementType;
  bgIcon: React.ElementType;
  title: string;
  description: string;
  className?: string;
  glowColor: string;
}

interface AgentNodeProps {
  name: string;
  index: number;
}

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const { scrollYProgress } = useScroll();

  // Hero scaling and fade
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.1], [0, -50]);

  return (
    <div className="flex flex-col min-h-[250vh] relative selection:bg-primary/30">
      
      {/* SECTION 1: HERO (No Static Header) */}
      <motion.section 
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative h-screen flex flex-col items-center justify-center text-center px-6"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 px-4 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-bold uppercase tracking-[0.3em] text-primary"
        >
          Agentic Swarm Architecture
        </motion.div>

        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] max-w-5xl">
          Scale marketplace growth with <br />
          <span className="text-primary italic font-medium">autonomous research.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/40 max-w-2xl mb-12 font-normal leading-relaxed">
          Submit a URL. Our agents audit competitors, analyze sentiment, and deliver fact-checked strategies.
        </p>

        <Button size="lg" className="rounded-full px-12 h-16 text-sm font-bold bg-primary hover:opacity-90 transition-all group">
          Launch Analysis <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.section>

      {/* SECTION 2: SEQUENTIAL PROCESS FLOW */}
      <section className="py-40 bg-white/[0.01] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-2">
            <AgentNode name="Planner" index={1} />
            <div className="hidden md:block w-16 h-[1px] bg-white/10" />
            <AgentNode name="Researcher" index={2} />
            <div className="hidden md:block w-16 h-[1px] bg-white/10" />
            <AgentNode name="Analyst" index={3} />
            <div className="hidden md:block w-16 h-[1px] bg-white/10" />
            <AgentNode name="Optimizer" index={4} />
            <div className="hidden md:block w-16 h-[1px] bg-white/10" />
            <AgentNode name="Critic" index={5} />
          </div>
        </div>
      </section>

      {/* SECTION 3: CREATIVE BENTO GRID */}
      <section className="container mx-auto px-6 py-40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <BentoCard 
            icon={Search} bgIcon={Globe}
            title="Competitor Intelligence"
            description="Tavily-powered agents crawl the live web to find pricing shifts and stock levels."
            className="md:col-span-8"
            glowColor="text-violet-500"
          />
          <BentoCard 
            icon={BarChart3} bgIcon={TrendingUp}
            title="Review Mining"
            description="Sentiment extraction using Mistral to find customer opportunity gaps."
            className="md:col-span-4"
            glowColor="text-blue-400"
          />
          <BentoCard 
            icon={Cpu} bgIcon={Layers}
            title="Economic Logic"
            description="Margin-aware strategies integrated with your internal catalog data."
            className="md:col-span-5"
            glowColor="text-emerald-500"
          />
          <BentoCard 
            icon={ShieldCheck} bgIcon={Sparkles}
            title="Fact-Checked"
            description="Every strategy is audited by our verification agent to eliminate hallucinations."
            className="md:col-span-7"
            glowColor="text-indigo-400"
          />
        </div>
      </section>

      {/* SECTION 4: LAUNCH MISSION (Neat & Neon) */}
      <section className="container mx-auto px-6 py-60">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-12 md:p-24 rounded-[3.5rem] bg-white/[0.02] border border-white/10 overflow-hidden"
        >
          {/* Neon Glow background */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 text-white">
              Initialize Swarm.
            </h2>
            
            <div className="flex flex-col md:flex-row gap-3 p-2 bg-black/60 border border-white/5 rounded-3xl backdrop-blur-3xl shadow-2xl">
              <input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://amazon.com/product-url..." 
                className="flex-1 bg-transparent border-none px-6 py-4 text-sm outline-none text-white font-medium"
              />
              <Button size="lg" className="rounded-2xl px-10 h-14 bg-primary text-white font-bold shadow-lg shadow-primary/20">
                Execute Swarm
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="py-20 border-t border-white/5 opacity-20 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em]">
          Built with Multi-Agent Intelligence
        </p>
      </footer>
    </div>
  );
}

// --- Dynamic Components ---

function AgentNode({ name, index }: AgentNodeProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group hover:border-primary/50 transition-colors">
        <Layers className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
      </div>
      <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{name}</span>
    </motion.div>
  );
}

function BentoCard({ icon: Icon, bgIcon: BgIcon, title, description, className = "", glowColor }: BentoCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.01 }}
      className={`relative p-12 rounded-[3rem] border border-white/5 bg-white/[0.02] overflow-hidden group transition-all duration-500 ${className}`}
    >
      {/* Massive Background Icon */}
      <div className="absolute -top-16 -right-16 opacity-[0.02] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-1000 pointer-events-none">
        <BgIcon size={400} className={glowColor} />
      </div>

      <div className="relative z-10">
        <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-8 ${glowColor}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-2xl font-bold mb-4 tracking-tight text-white">{title}</h3>
        <p className="text-white/40 text-base leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}