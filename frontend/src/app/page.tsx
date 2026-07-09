import Navigation from "@/components/Navigation";
import MetricsTicker from "@/components/MetricsTicker";
import ImportWizard from "@/components/ImportWizard";
import InteractiveFeatureCard from "@/components/InteractiveFeatureCard";
import CodeBlock from "@/components/CodeBlock";
import ShinyBorderButton from "@/components/ShinyBorderButton";
import { Cpu, FileText, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative bg-[#030303] text-white flex flex-col items-center overflow-x-hidden pt-28">
      {/* Floating Navigation Pill */}
      <Navigation />

      {/* Floating Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[30vw] bg-[#8b5cf6]/8 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[15%] w-[40vw] h-[25vw] bg-[#06b6d4]/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section id="hero" className="w-full max-w-5xl px-6 pt-16 pb-24 text-center z-10 flex flex-col items-center justify-center relative">
        {/* Subhead Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase mb-8 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#06b6d4]" />
          AURA // SYSTEM ACTIVE
        </div>

        {/* Massive Serif Title */}
        <h1 className="font-display text-5xl sm:text-8xl leading-[0.95] tracking-tighter text-white max-w-4xl mb-8">
          Architecting CRM Lead Pipelines for <span className="text-shimmer block sm:inline">Tomorrow</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg font-sans text-[#A1A1AA] max-w-2xl mt-2 leading-relaxed">
          Designing modular environments with precision-crafted AI mapping systems. Standardise and clean messy ad campaign exports into unified records.
        </p>

        {/* Hero Actions Staggered */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mt-10">
          <a href="#wizard-section">
            <ShinyBorderButton>Access Lead Importer</ShinyBorderButton>
          </a>
          <a
            href="#schema-block"
            className="text-xs font-mono tracking-wider uppercase text-[#A1A1AA] hover:text-white transition-colors duration-200 border-b border-white/10 pb-0.5 hover:border-white"
          >
            Review schema specifications //
          </a>
        </div>
      </section>

      {/* Horizontal Scroll Metrics Ticker */}
      <section className="w-full z-10">
        <MetricsTicker />
      </section>

      {/* Core Interactive Wizard Module */}
      <section id="wizard-section" className="w-full max-w-6xl px-6 py-28 z-10 scroll-mt-28">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono tracking-widest text-[#8b5cf6] uppercase font-bold">
            Interactive Portal //
          </span>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 text-white">
            Lead Import Wizard
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-3 max-w-md mx-auto">
            Upload, preview, and process CSV leads directly through our localized mapping layer.
          </p>
        </div>
        <ImportWizard />
      </section>

      {/* Features Grid Section */}
      <section id="features" className="w-full max-w-5xl px-6 py-20 z-10 text-center">
        <div className="mb-16">
          <span className="text-[10px] font-mono tracking-widest text-[#06b6d4] uppercase font-bold">
            System Modules //
          </span>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 text-white">
            Architected Pipeline Strengths
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InteractiveFeatureCard
            icon={<Cpu className="w-6 h-6" />}
            title="Semantic Mapping"
            description="Leverages modern LLM prompt engineering to instantly resolve custom naming headers into clean output fields."
          />
          <InteractiveFeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="High-Density Preview"
            description="Read and scroll raw CSV metrics on the client-side lag-free using virtualized grid viewport renders."
          />
          <InteractiveFeatureCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Deterministic Validation"
            description="Sanitizes enums, splits compound phones, normalizes messy dates, and filters skipped rows using a post-LLM layer."
          />
        </div>
      </section>

      {/* Code Block Integration Section */}
      <section id="schema-block" className="w-full max-w-5xl px-6 py-28 z-10 text-center">
        <div className="mb-16">
          <span className="text-[10px] font-mono tracking-widest text-[#8b5cf6] uppercase font-bold">
            Technical Integration //
          </span>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 text-white">
            Strict Output Contract
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-3 max-w-md mx-auto">
            The importer processes records to fit this fixed schema format, guaranteeing database safety.
          </p>
        </div>
        <CodeBlock />
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#050505] border-t border-white/5 py-16 px-8 z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Logo & Info */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]" />
              <span className="font-display text-xl text-white">Synapse</span>
            </div>
            <p className="text-[10px] font-mono text-[#A1A1AA]/50 tracking-wider">
              GROW_EASY // LEAD_NORMALIZATION_INTEGRATION
            </p>
          </div>

          {/* Operational Status */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="text-[10px] font-mono text-[#A1A1AA] tracking-widest uppercase">
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between text-[10px] font-mono text-[#A1A1AA]/30">
          <span>&copy; {new Date().getFullYear()} SYNAPSE INC. ALL RIGHTS RESERVED.</span>
          <span className="mt-2 sm:mt-0">DESIGNED BY MENG TO // IMPLEMENTED BY ANTIGRAVITY</span>
        </div>
      </footer>
    </main>
  );
}
