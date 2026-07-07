import ImportWizard from "@/components/ImportWizard";
import AmbientBackground from "@/components/AmbientBackground";
import { Cpu, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-between p-4 sm:p-12 md:p-24 overflow-hidden bg-[#050505] text-[#FFFFFF]">
      {/* Dynamic atmospheric WebGL-like Canvas Grid Background */}
      <AmbientBackground />

      {/* Decorative scanline screen gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/20 to-[#050505] pointer-events-none z-10" />

      {/* Content Frame */}
      <div className="w-full max-w-6xl z-20 flex-1 flex flex-col">
        {/* Navigation/Header Bar */}
        <header className="flex flex-col items-center text-center mb-16 select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-full text-xs text-[#A1A1AA] font-mono tracking-widest uppercase mb-6 shadow-lg animate-pulse">
            <Sparkles className="w-3 h-3 text-[#FFFFFF]" />
            AURA // CRM MODULE X-01
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white max-w-3xl leading-none">
            Architecting Frontiers for Tomorrow
          </h1>
          
          <p className="text-sm sm:text-base text-[#A1A1AA] font-sans max-w-xl mt-6 leading-relaxed">
            Designing modular environments with precision-crafted AI mapping systems. Normalise messy CRM spreadsheets into unified lead records instantly.
          </p>
        </header>

        {/* Wizard Panel */}
        <div className="flex-1 w-full">
          <ImportWizard />
        </div>
      </div>

      {/* Bottom Technical Footer */}
      <footer className="w-full text-center py-8 z-20 border-t border-[#27272A] mt-20">
        <p className="text-[10px] font-mono text-[#A1A1AA]/50 tracking-widest uppercase">
          SECURE ACCESS CONTROL // GROWEASY INTEGRATION MODULE
        </p>
      </footer>
    </main>
  );
}
