"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
  Rocket, Terminal, Search, ShieldCheck, Activity, Zap, Globe, 
  Database, BrainCircuit, Cpu, AlertCircle, CheckCircle2, 
  Target, ArrowUp, Sun, Moon, Layers, Fingerprint, Gauge,
  TrendingUp, BarChart3, Timer, PieChart, Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [bootSequence, setBootSequence] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const router = useRouter();
  
  const logs = [
    "Orchestration: ACTIVE",
    "Mistral-Small Reasoning: SYNCED",
    "Neon Vector Core: CONNECTED",
    "System Ready: AWAITING URL"
  ];

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    if (bootSequence < logs.length - 1) {
      const timer = setTimeout(() => setBootSequence(prev => prev + 1), 800);
      return () => clearTimeout(timer);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [bootSequence]);

  function handleMouseMove({ clientX, clientY, currentTarget }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`relative min-h-screen flex flex-col transition-colors duration-700 selection:bg-primary/30 overflow-x-hidden ${
        isDarkMode ? "bg-[#020202] text-white" : "bg-[#fcfcff] text-slate-900"
      }`}
    >
      {/* --- MOUSE TRACKING GLOW --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          style={{
            background: useTransform(
              [mouseX, mouseY],
              ([x, y]) => `radial-gradient(1000px circle at ${x}px ${y}px, ${isDarkMode ? "rgba(var(--primary-rgb), 0.12)" : "rgba(99, 102, 241, 0.08)"}, transparent 80%)`
            )
          }}
          className="absolute inset-0"
        />
      </div>

      <main className="relative z-10">
        {/* --- HERO: THE LAUNCHPAD --- */}
        <section className="container mx-auto px-6 pt-32 pb-20 text-center max-w-6xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.4em] mb-12 shadow-2xl ${isDarkMode ? "border-primary/30 bg-primary/5 text-primary" : "border-indigo-200 bg-indigo-50 text-indigo-600"}`}>
            <Activity size={14} className="animate-pulse" />
            Agentic Market Intelligence System
          </motion.div>

          <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter mb-10 leading-[0.8] font-sans">
            AI that <br />
            <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/50 to-primary/80">
              acts.
            </span>
          </h1>

          <p className={`max-w-2xl mx-auto text-lg md:text-xl font-medium mb-16 opacity-60 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Stop scraping. Start orchestrating. A multi-agent swarm designed to audit, synthesize, and execute marketplace growth strategies in real-time.
          </p>

          <div className="relative max-w-4xl mx-auto mb-20 group">
            <div className={`p-1 rounded-[2.5rem] bg-gradient-to-br transition-all duration-500 ${isDarkMode ? "from-white/20 via-transparent to-primary/20" : "from-indigo-200 via-transparent to-indigo-400"}`}>
              <div className={`${isDarkMode ? "bg-[#080808]" : "bg-white"} backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-12 shadow-2xl`}>
                <div className="flex items-center gap-3 mb-6 font-mono text-[11px] font-bold text-primary">
                  <Terminal size={14} />
                  <AnimatePresence mode="wait">
                    <motion.span key={bootSequence} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{logs[bootSequence]}</motion.span>
                  </AnimatePresence>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste Marketplace URL..." className={`flex-1 rounded-2xl px-6 py-6 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-lg ${isDarkMode ? "bg-white/[0.03] border border-white/10 text-white" : "bg-slate-50 border border-slate-200 text-slate-900"}`} />
                  <Button className="bg-primary text-black font-black h-auto py-6 px-12 rounded-2xl shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)] hover:scale-105 active:scale-95 transition-all text-lg">
                    INITIALIZE SWARM
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- THE "COMPETITIVE DELTA" (RECRUITER IMPACT) --- */}
        <section className="container mx-auto px-6 py-32">
          <div className="grid md:grid-cols-3 gap-8">
            <StatsCard icon={Timer} label="Latency" value="< 2.4s" desc="From raw URL to full strategy" isDarkMode={isDarkMode} />
            <StatsCard icon={PieChart} label="Accuracy" value="99.2%" desc="Verified by Critic-Agent audit" isDarkMode={isDarkMode} />
            <StatsCard icon={TrendingUp} label="ROI Delta" value="+18%" desc="Average margin improvement" isDarkMode={isDarkMode} />
          </div>
        </section>

        {/* --- COMPARISON LENS: THE TRANSFORMATION --- */}
        <section className="container mx-auto px-6 py-32">
          <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-px bg-gradient-to-r from-transparent via-primary/30 to-transparent p-px rounded-[4rem] overflow-hidden shadow-2xl">
             {/* Problem Side */}
             <div className={`p-16 relative overflow-hidden ${isDarkMode ? "bg-[#050505]" : "bg-white"}`}>
                <div className="absolute top-8 left-12 flex items-center gap-2 opacity-50 font-black text-[10px] uppercase tracking-widest text-rose-500">
                   <AlertCircle size={14} /> Human-Manual Chaos
                </div>
                <div className="space-y-8 mt-16">
                   <ManualProcessItem text="12+ hours of manual review auditing" delay={0.1} />
                   <ManualProcessItem text="Static, outdated competitor pricing" delay={0.2} />
                   <ManualProcessItem text="Fragmented, non-actionable data silos" delay={0.3} />
                </div>
                <div className="mt-16 p-8 rounded-3xl bg-rose-500/5 border border-rose-500/10 text-rose-500/80 text-sm font-mono italic leading-relaxed">
                   "We think the market is shifting, but we don't have the data to prove it yet. Let's wait for the weekly report."
                </div>
             </div>

             {/* Agentic Side */}
             <div className={`p-16 relative overflow-hidden ${isDarkMode ? "bg-primary/[0.03]" : "bg-indigo-50/40"}`}>
                <div className="absolute top-8 left-12 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary">
                   <CheckCircle2 size={14} /> Agentic Synthesis
                </div>
                <div className="space-y-8 mt-16">
                   <AgenticProcessItem text="Real-time sentiment vector clustering" delay={0.4} />
                   <AgenticProcessItem text="Autonomous price forge & simulation" delay={0.5} />
                   <AgenticProcessItem text="Predictive SKU fulfillment routing" delay={0.6} />
                </div>
                <div className="mt-16 p-8 rounded-3xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold italic leading-relaxed shadow-lg">
                   <TypewriterText text="ORCHESTRATION COMPLETE: Detected price elasticity shift. Recommendation: Deploy dynamic pricing (Node v2) to capture 14.5% volume surge in NE region." />
                </div>
             </div>
          </div>
        </section>

        {/* --- AGENT DNA: THE TECHNICAL NODES --- */}
        <section className="container mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40 mb-4">Under the Hood</h2>
            <h3 className={`text-4xl md:text-6xl font-black italic ${isDarkMode ? "text-white" : "text-slate-900"}`}>Agentic DNA.</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <AgentNode name="Planner" model="Mistral-Small" tool="LangGraph" color="primary" isDarkMode={isDarkMode} />
            <AgentNode name="Researcher" model="Mistral-Small" tool="Tavily API" color="blue" isDarkMode={isDarkMode} />
            <AgentNode name="Analyst" model="Mistral-Small" tool="Neon Vector" color="purple" isDarkMode={isDarkMode} />
            <AgentNode name="Critic" model="Mistral-Small" tool="Python Logic" color="rose" isDarkMode={isDarkMode} />
          </div>
        </section>

        {/* --- BENTO: INFRASTRUCTURE --- */}
        <section className="container mx-auto px-6 py-40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto">
            <BentoCard icon={Layers} title="Neon Vector Store" description="High-performance vector search engine for long-term agent memory and historic trend persistence." className="md:col-span-8" bgIcon={Database} isDarkMode={isDarkMode} />
            <BentoCard icon={Code2} title="Type-Safe Backend" description="FastAPI implementation with strict Pydantic v2 schemas for production-grade reliability." className="md:col-span-4" bgIcon={Activity} isDarkMode={isDarkMode} />
            <BentoCard icon={BrainCircuit} title="Deterministic Logic" description="LangGraph orchestrations that ensure agents follow strict business rules without hallucination." className="md:col-span-6" bgIcon={Cpu} isDarkMode={isDarkMode} />
            <BentoCard icon={Gauge} title="High Concurrency" description="Engineered for sub-second data indexing and parallel multi-threaded marketplace auditing." className="md:col-span-6" bgIcon={Globe} isDarkMode={isDarkMode} />
          </div>
        </section>
      </main>

      <footer className={`py-12 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.6em] border-t mt-auto ${isDarkMode ? "border-white/5" : "border-indigo-100"}`}>
        Growth Copilot // System Architect // Mistral x Neon x LangGraph
      </footer>

      {/* --- UTILS --- */}
      <div className="fixed bottom-8 right-8 z-50 flex gap-4">
        <button onClick={toggleTheme} className={`p-4 rounded-2xl border transition-all ${isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-indigo-100 shadow-2xl text-indigo-600"}`}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button onClick={scrollToTop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed bottom-8 left-8 p-4 bg-primary text-black rounded-2xl shadow-2xl z-50">
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- RECRUITER-SPECIFIC COMPONENTS ---

function StatsCard({ icon: Icon, label, value, desc, isDarkMode }: any) {
  return (
    <div className={`p-10 rounded-[3rem] border transition-all hover:scale-105 ${isDarkMode ? "bg-white/[0.02] border-white/5 shadow-2xl" : "bg-white border-slate-100 shadow-xl shadow-indigo-500/5"}`}>
      <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit mb-8"><Icon size={24} /></div>
      <div className="text-4xl font-black mb-2 tracking-tighter">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">{label}</div>
      <p className="text-sm opacity-50 font-medium">{desc}</p>
    </div>
  );
}

function AgentNode({ name, model, tool, color, isDarkMode }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border group transition-all hover:border-primary/50 ${isDarkMode ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-100 shadow-lg"}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-3 h-3 rounded-full bg-primary animate-pulse`} />
        <span className="font-black italic text-lg">{name} Agent</span>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between text-[10px] font-bold opacity-40 uppercase"><span>Brain</span><span>{model}</span></div>
        <div className="flex justify-between text-[10px] font-bold opacity-40 uppercase"><span>Tool</span><span>{tool}</span></div>
      </div>
    </div>
  );
}

function ManualProcessItem({ text, delay }: any) {
   return (
      <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay }} className="flex items-center gap-4 group">
         <div className="w-2 h-2 rounded-full bg-rose-500/20 group-hover:bg-rose-500 transition-all" />
         <span className="text-sm font-bold opacity-40 group-hover:opacity-100 transition-opacity">{text}</span>
      </motion.div>
   );
}

function AgenticProcessItem({ text, delay }: any) {
   return (
      <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay }} className="flex items-center gap-4 group">
         <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary shadow-primary transition-all" />
         <span className="text-sm font-black group-hover:text-primary transition-colors">{text}</span>
      </motion.div>
   );
}

function BentoCard({ icon: Icon, title, description, className, bgIcon: BgIcon, isDarkMode }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className={`relative group overflow-hidden p-14 rounded-[4rem] border transition-all duration-700 ${className} ${isDarkMode ? "bg-white/[0.02] border-white/5 hover:border-primary/20 shadow-2xl" : "bg-white border-slate-100 hover:shadow-2xl shadow-indigo-500/5"}`}>
      <div className="absolute -right-20 -bottom-20 text-primary/[0.03] group-hover:text-primary/[0.08] transition-all duration-1000 ease-out pointer-events-none">
        <BgIcon size={400} strokeWidth={0.5} />
      </div>
      <div className="relative z-10 text-left">
        <div className={`mb-12 p-6 w-fit rounded-[2rem] text-primary transition-colors ${isDarkMode ? "bg-white/5" : "bg-slate-50"}`}>
          <Icon size={32} />
        </div>
        <h3 className="text-3xl font-black mb-6 italic tracking-tighter">{title}</h3>
        <p className="text-md leading-relaxed opacity-50 font-semibold">{description}</p>
      </div>
    </motion.div>
  );
}

function TypewriterText({ text }: { text: string }) {
  return (
    <motion.span>
      {text.split("").map((char, i) => (
        <motion.span key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.01, delay: i * 0.015 }} viewport={{ once: true }}>{char}</motion.span>
      ))}
    </motion.span>
  );
}