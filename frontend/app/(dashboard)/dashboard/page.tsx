"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, Search, BarChart3, TrendingUp, 
  ShieldCheck, Loader2, CheckCircle2, AlertCircle 
} from "lucide-react";

// --- Types for Agent State ---
type AgentStatus = "waiting" | "running" | "completed" | "failed";

interface AgentState {
  name: string;
  id: string;
  status: AgentStatus;
  description: string;
  icon: React.ElementType;
}

export default function CommandCenter() {
  const { jobId } = useParams();
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState(false);

  // Mock initial state for visualization
  const [agents, setAgents] = useState<AgentState[]>([
    { id: "planner", name: "Planner", status: "running", description: "Decomposing URL into research tasks...", icon: Cpu },
    { id: "researcher", name: "Researcher", status: "waiting", description: "Awaiting search parameters...", icon: Search },
    { id: "analyst", name: "Analyst", status: "waiting", description: "Pending market data stream...", icon: BarChart3 },
    { id: "optimizer", name: "Optimizer", status: "waiting", description: "Awaiting analysis results...", icon: TrendingUp },
    { id: "critic", name: "Critic", status: "waiting", description: "Final validation queue...", icon: ShieldCheck },
  ]);

  // Polling logic to fetch job status from FastAPI
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/analysis/${jobId}`);
        const data = await res.json();
        setJobData(data);

        // Logic to update agent statuses based on data.status and data.analysis_result
        // (Implementation details depend on your exact backend state mapping)
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [jobId]);

  return (
    <div className="min-h-screen bg-background pt-24 px-6 relative overflow-hidden">
      {/* Background Liquid Wave (inherited from globals.css) */}
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">Command Center</h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
              Job_ID: {jobId} // System_Status: Active_Swarm
            </p>
          </div>
          <div className="text-right">
             <span className="text-primary font-bold text-sm">Estimated Completion: 45s</span>
          </div>
        </header>

        {/* BENTO GRID OF AGENTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {agents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {/* REAL-TIME LOG TERMINAL */}
        <section className="mt-8 border border-white/5 bg-black/40 backdrop-blur-xl rounded-3xl p-6 h-64 overflow-y-auto font-mono text-[11px]">
          <div className="text-primary mb-2">[SYSTEM] Initializing multi-agent handshake...</div>
          <div className="text-white/40">[PLANNER] URL identified: Analyzing marketplace structure...</div>
          {jobData?.status === "completed" && (
             <div className="text-emerald-400">[SUCCESS] Mission complete. Analysis stored in Knowledge Base.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function AgentCard({ agent, index }: { agent: AgentState; index: number }) {
  const Icon = agent.icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-6 rounded-3xl border transition-all duration-500 flex flex-col items-center text-center h-full
        ${agent.status === 'running' ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]' : 'border-white/5 bg-white/[0.02]'}
      `}
    >
      <div className={`p-4 rounded-2xl mb-4 ${agent.status === 'running' ? 'text-primary' : 'text-white/20'}`}>
        {agent.status === 'running' ? <Loader2 className="h-8 w-8 animate-spin" /> : <Icon className="h-8 w-8" />}
      </div>
      
      <h3 className="font-bold text-sm mb-2 uppercase tracking-widest">{agent.name}</h3>
      <p className="text-[11px] text-white/40 leading-relaxed mb-4">{agent.description}</p>
      
      {agent.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
      {agent.status === 'waiting' && <div className="h-1.5 w-1.5 rounded-full bg-white/10" />}
    </motion.div>
  );
}