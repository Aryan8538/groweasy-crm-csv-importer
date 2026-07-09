import React from "react";

interface ShinyBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function ShinyBorderButton({ children, className = "", ...props }: ShinyBorderButtonProps) {
  return (
    <button
      className={`relative p-[1px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer select-none group focus:outline-none focus:ring-1 focus:ring-white/20 active:scale-95 transition-transform duration-100 ${className}`}
      {...props}
    >
      {/* Conic rotating neon gradient background */}
      <div className="absolute w-[300%] h-[300%] bg-[conic-gradient(from_0deg,transparent_0%,#8b5cf6_45%,#06b6d4_50%,transparent_55%)] shiny-border-spin" />
      
      {/* Inner button surface */}
      <div className="relative z-10 w-full h-full bg-[#0a0a0a] group-hover:bg-[#121212] px-10 py-4 rounded-full text-[11px] font-mono tracking-widest uppercase text-white font-semibold transition-colors duration-300 flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
}
