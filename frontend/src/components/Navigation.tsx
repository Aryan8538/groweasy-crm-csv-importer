"use client";

import React from "react";

export default function Navigation() {
  const handleScrollToWizard = () => {
    document.getElementById("wizard-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[672px] z-50 cortex-glass rounded-full px-6 py-2.5 flex items-center justify-between shadow-2xl select-none">
      {/* Left Logo */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]" />
        <span className="font-display text-lg text-white">GrowEasy Flow</span>
      </div>

      {/* Center Links */}
      <div className="hidden sm:flex items-center gap-5 text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase">
        <a href="#hero" className="hover:text-white transition-colors duration-200">System</a>
        <a href="#wizard-section" className="hover:text-white transition-colors duration-200">Importer</a>
        <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
        <a href="#schema-block" className="hover:text-white transition-colors duration-200">Schema</a>
      </div>

      {/* Right CTA */}
      <button
        onClick={handleScrollToWizard}
        className="px-4 py-1.5 bg-white hover:bg-white/90 text-black text-[10px] font-mono tracking-widest uppercase rounded-full font-bold active:scale-95 transition-all duration-200 cursor-pointer"
      >
        Access Importer
      </button>
    </nav>
  );
}
