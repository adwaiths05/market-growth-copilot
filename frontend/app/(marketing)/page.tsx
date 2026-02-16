"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  Rocket, Terminal, Sparkles, Search, 
  ShieldCheck, Activity, BarChart3, 
  Zap, Globe, Layers, TrendingUp,
  Database, Network, Workflow, Microscope, 
  ArrowUp, Sun, Moon, BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [bootSequence, setBootSequence] = useState(0);
  
  const logs = [
    "Initializing orchestration protocol...",
    "Loading Mistral-Large reasoning core...",
    "Synchronizing Tavily search nodes...",
    "System Ready: Awaiting Target URL"
  ];

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    if (bootSequence < logs.length - 1) {
      const timer = setTimeout(() => setBootSequence(prev => prev + 1), 800);
      return () => clearTimeout(timer);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [bootSequence, logs.length]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-500 selection:bg-primary/30 ${
      isDarkMode ? "bg-[#030303] text-white" : "bg-[#fcfdff] text-slate-900"
    }`}>
      
      {/* TELEMETRY OVERLAY */}
      <div className="fixed top-6 left-6 z-50 pointer-events-none hidden lg:block">
        <div className={`p-4 rounded-2xl border backdrop-blur-md font-mono text-[10px] space-y-1 transition-colors ${
          isDarkMode ? "bg-white/5 border-white/10 text-white/40" : "bg-indigo-500/5 border-indigo-100 text-indigo-400"
        }`}>
          <div className="flex items-center gap-2 text-primary font-bold">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            LIVE_TELEMETRY_STREAM
          </div>
          <div>NODES_ACTIVE: 14</div>
          <div>CORE: MISTRAL_LARGE_24.11</div>
          <div>DB_STATE: NEON_POSTGRES_SYNCED</div>
        </div>
      </div>

      {/* THEME TOGGLE */}
      <div className="fixed top-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className={`p-3 rounded-xl border transition-all ${
            isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-indigo-100 shadow-xl shadow-indigo-500/10 text-indigo-600 hover:bg-indigo-50"
          }`}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <main className="flex-grow relative z-10">
        
        {/* HERO SECTION */}
        <section className="container mx-auto px-6 pt-32 pb-40 text-center max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] mb-8 ${
              isDarkMode ? "border-primary/20 bg-primary/5 text-primary" : "border-indigo-200 bg-indigo-50 text-indigo-600"
            }`}
          >
            <Activity size={12} />
            Agentic Market Orchestration v1.0
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-10 leading-[0.85] font-sans">
            <motion.span 
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
              className="block"
            >
              Precision growth
            </motion.span>
            
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="block"
            >
              <span className="opacity-40">through </span>
              <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50">
                deep market synthesis.
              </span>
            </motion.span>
          </h1>

          <div className="relative max-w-4xl mx-auto mb-32">
            <div className={`group relative p-[1px] rounded-[2.5rem] bg-gradient-to-b transition-all duration-700 ${
              isDarkMode ? "from-white/10 to-transparent hover:from-primary/50" : "from-indigo-200 to-transparent hover:from-indigo-400"
            }`}>
              <div className={`${isDarkMode ? "bg-[#050505]/90" : "bg-white"} backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl`}>
                <div className="flex items-center gap-3 mb-8 font-mono text-xs opacity-40">
                  <Terminal size={16} className="text-primary" />
                  <AnimatePresence mode="wait">
                    <motion.span key={bootSequence} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      {logs[bootSequence]}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://marketplace.com/product-url"
                    className={`flex-1 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium ${
                      isDarkMode ? "bg-white/[0.03] border border-white/10 text-white" : "bg-indigo-50/50 border border-indigo-100 text-slate-900"
                    }`}
                  />
                  <Button size="lg" className="bg-primary text-black font-bold h-auto py-5 px-10 rounded-2xl hover:scale-[1.05] shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                    INITIALIZE ENGINE 
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* OPPORTUNITY GAP PREVIEW WITH TYPEWRITER EFFECT */}
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-4 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 mb-8">Agentic Synthesis Pipeline</h3>
            <div className={`grid md:grid-cols-2 gap-px border overflow-hidden backdrop-blur-sm rounded-[2rem] relative z-10 ${
              isDarkMode ? "bg-white/5 border-white/10" : "bg-indigo-100/50 border-indigo-200 shadow-sm"
            }`}>
              <div className={`p-10 text-left ${isDarkMode ? "bg-[#080808]" : "bg-white"}`}>
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Input: Raw Review Data</div>
                <p className="text-sm opacity-60 leading-relaxed font-medium">"The product is decent, but delivery to Chicago was delayed by 5 days and the box was completely crushed. Unacceptable."</p>
              </div>
              <div className={`p-10 text-left ${isDarkMode ? "bg-primary/[0.03]" : "bg-indigo-50"}`}>
                <div className="text-[9px] font-bold text-primary uppercase mb-4 flex items-center gap-2 tracking-widest">
                  <BrainCircuit size={14} /> Intelligence Synthesis
                </div>
                <div className="text-sm font-semibold leading-relaxed">
                   <TypewriterText text="Supply chain bottleneck detected in Midwest. Recommend switching to local 3PL fulfillment. Impact: 15% margin increase via lower shipping zones and 100% reduction in transit damage." />
                </div>
              </div>
            </div>
          </div>
        </section>

        <HorizontalScrollSection isDarkMode={isDarkMode} />

        {/* INTELLIGENCE STACK WITH KNOWLEDGE NODES */}
        <section className="container mx-auto px-6 py-60 relative overflow-hidden">
          <div className="mb-24 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 italic">The Intelligence Stack</h2>
            <p className="opacity-40 max-w-xl mx-auto text-lg">Infrastructure designed for sub-second orchestration and long-term memory.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto relative z-10">
            <BentoCard icon={Globe} title="Global Web Index" description="Real-time multi-marketplace retrieval via Tavily nodes." className="md:col-span-8" bgIcon={Globe} isDarkMode={isDarkMode} />
            <BentoCard icon={TrendingUp} title="Price Forge" description="Mistral-driven price elasticity simulation." className="md:col-span-4" bgIcon={Zap} isDarkMode={isDarkMode} />
            <BentoCard icon={Database} title="Vector Memory" description="Every analysis persists in Neon PostgreSQL." className="md:col-span-5" bgIcon={Database} isDarkMode={isDarkMode} />
            <BentoCard icon={ShieldCheck} title="Critic Audit" description="Mathematical verification for zero-hallucination." className="md:col-span-7" bgIcon={ShieldCheck} isDarkMode={isDarkMode} />
          </div>

          {/* Floating Knowledge Nodes (Neon Memory Simulation) */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <KnowledgeNode text="[SKU_OPTIMIZATION_LOGIC]" top="10%" left="15%" isDarkMode={isDarkMode} />
            <KnowledgeNode text="[COMPETITOR_ELASTICITY]" top="50%" left="80%" isDarkMode={isDarkMode} />
            <KnowledgeNode text="[NEON_DB_INDEX_0x42]" top="85%" left="20%" isDarkMode={isDarkMode} />
            <KnowledgeNode text="[MISTRAL_REASONING_CLUSTER]" top="30%" left="70%" isDarkMode={isDarkMode} />
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className={`fixed bottom-10 left-10 z-50 p-4 rounded-full border shadow-2xl transition-all ${
              isDarkMode ? "bg-zinc-900 border-white/10 text-primary" : "bg-white border-indigo-100 text-indigo-600 shadow-indigo-500/20"
            }`}
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className={`py-12 text-center opacity-30 text-[9px] font-bold uppercase tracking-[0.6em] border-t mt-auto ${isDarkMode ? "border-white/5" : "border-indigo-100"}`}>
        Marketplace Growth Copilot // Powered by Mistral & Neon
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TypewriterText({ text }: { text: string }) {
  const characters = text.split("");
  return (
    <motion.span>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.01, delay: i * 0.02 }}
          viewport={{ once: true }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

function KnowledgeNode({ text, top, left, isDarkMode }: any) {
  return (
    <motion.div 
      animate={{ y: [0, -25, 0], x: [0, 10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{ top, left }}
      className={`absolute px-5 py-2 rounded-full border font-mono text-[9px] font-bold tracking-[0.2em] shadow-sm ${
        isDarkMode ? "bg-white/5 border-white/10 text-white/30" : "bg-white border-indigo-100 text-indigo-400"
      }`}
    >
      {text}
    </motion.div>
  );
}

function HorizontalScrollSection({ isDarkMode }: { isDarkMode: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);
  const springX = useSpring(x, { stiffness: 100, damping: 30 });

  const stages = [
    { id: "01", name: "Market Discovery", icon: Search, desc: "Researcher nodes initiate multi-threaded deep crawls.", color: isDarkMode ? "bg-primary/5 border-primary/20" : "bg-indigo-50/50 border-indigo-100" },
    { id: "02", name: "Synthesis Engine", icon: Microscope, desc: "Mistral-Large extracts precise consumer 'Opportunity Gaps'.", color: isDarkMode ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50/50 border-blue-100" },
    { id: "03", name: "Strategy Forge", icon: Workflow, desc: "Simulating margin-aware pricing and fulfillment logic.", color: isDarkMode ? "bg-purple-500/5 border-purple-500/20" : "bg-purple-50/50 border-purple-100" },
    { id: "04", name: "Validation Gate", icon: ShieldCheck, desc: "Critic agents verify every growth strategy for accuracy.", color: isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50/50 border-emerald-100" }
  ];

  return (
    <section ref={sectionRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className={`absolute top-1/2 left-0 w-full h-[1px] ${isDarkMode ? "bg-white/10" : "bg-indigo-100"}`} />
        <motion.div style={{ x: springX }} className="flex gap-20 px-[20vw] items-center relative z-10">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-20">
              <div className={`w-[520px] shrink-0 p-12 rounded-[3.5rem] border backdrop-blur-3xl group relative transition-all duration-500 ${stage.color}`}>
                <div className={`absolute top-1/2 -right-10 w-20 h-20 border rounded-full flex items-center justify-center group-hover:border-primary transition-all z-20 ${
                  isDarkMode ? "bg-[#030303] border-white/5" : "bg-white border-indigo-100"
                }`}>
                   <Network className={`${isDarkMode ? "text-white/10" : "text-indigo-200"} group-hover:text-primary transition-colors`} size={24} />
                </div>
                <div className="flex justify-between items-start mb-10">
                  <div className={`p-5 rounded-2xl ${isDarkMode ? "bg-white/5" : "bg-indigo-500/5"}`}>
                    <stage.icon size={40} className={isDarkMode ? "text-white" : "text-indigo-600"} />
                  </div>
                  <span className="font-mono text-5xl font-bold opacity-5">{stage.id}</span>
                </div>
                <h3 className={`text-4xl font-bold mb-6 italic tracking-tight ${isDarkMode ? "text-white" : "text-indigo-900"}`}>{stage.name}</h3>
                <p className={`text-xl leading-relaxed font-medium opacity-40 ${isDarkMode ? "text-white" : "text-slate-600"}`}>{stage.desc}</p>
              </div>
              {idx !== stages.length - 1 && <div className={`w-40 h-[1px] ${isDarkMode ? "bg-white/20" : "bg-indigo-100"}`} />}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BentoCard({ icon: Icon, title, description, className, bgIcon: BgIcon, isDarkMode }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`relative group overflow-hidden p-14 rounded-[3.5rem] border transition-all duration-700 ${className} ${
        isDarkMode ? "bg-[#050505] border-white/5 hover:border-primary/20" : "bg-white border-indigo-100 hover:border-indigo-400 shadow-xl shadow-indigo-500/[0.02]"
      }`}
    >
      <div className="absolute -right-20 -bottom-20 text-primary/[0.01] group-hover:text-primary/[0.05] group-hover:-translate-x-10 group-hover:-translate-y-10 transition-all duration-1000 ease-out pointer-events-none">
        <BgIcon size={420} strokeWidth={0.5} />
      </div>
      <div className="relative z-10 text-left">
        <div className={`mb-12 p-5 w-fit rounded-2xl text-primary transition-colors ${isDarkMode ? "bg-white/5" : "bg-indigo-50"}`}>
          <Icon size={36} />
        </div>
        <h3 className={`text-3xl font-bold mb-6 italic tracking-tight ${isDarkMode ? "text-white" : "text-indigo-900"}`}>{title}</h3>
        <p className={`text-lg leading-relaxed opacity-40 font-medium ${isDarkMode ? "text-white" : "text-slate-600"}`}>{description}</p>
      </div>
    </motion.div>
  );
}