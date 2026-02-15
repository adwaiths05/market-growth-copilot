import Link from "next/link";
import { ArrowRight, Bot, Zap, ShieldCheck, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    // bg-zinc-950 is the "Modern Dark" base
    <div className="relative min-h-screen pt-20 overflow-hidden bg-zinc-950 text-zinc-50">
      
      {/* Subtle Grid Overlay to add texture to the dark background */}
      <div className="absolute inset-0 z-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z\' fill=\'rgba(255,255,255,0.07)\'/%3E%3C/svg%3E")' }} 
      />

      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center py-16 sm:py-24">
          
          <div className="flex flex-col items-start space-y-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              <span>Multi-Agent System Ready</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
              Growth <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-50 to-zinc-500">
                Automated.
              </span>
            </h1>
            
            {/* Zinc-400 font matches the dark Zinc-950 background perfectly */}
            <p className="text-xl text-zinc-400 max-w-md leading-relaxed font-light">
              A professional-grade swarm of AI agents working in sync to dominate your marketplace. 
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Button asChild size="lg" className="bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold px-10 h-14 rounded-full transition-all">
                <Link href="/dashboard">
                  Launch Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="text-zinc-400 hover:text-zinc-50 px-8 h-14">
                Documentation <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Minimalist Dashboard Preview */}
          <div className="relative">
             <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md">
                <div className="flex gap-2 mb-6">
                   <div className="w-2 h-2 rounded-full bg-zinc-700" />
                   <div className="w-2 h-2 rounded-full bg-zinc-700" />
                </div>
                <div className="space-y-6">
                   <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
                   <div className="h-20 w-full bg-zinc-800/50 rounded-2xl border border-zinc-700/50 flex items-center justify-center">
                      <PieChart className="w-8 h-8 text-zinc-600" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" />
                      <div className="h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl" />
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}