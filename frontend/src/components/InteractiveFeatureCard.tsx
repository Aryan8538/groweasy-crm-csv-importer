"use client";

import React, { useEffect, useRef, useState } from "react";

interface InteractiveFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function InteractiveFeatureCard({ icon, title, description }: InteractiveFeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`cortex-glass-card p-10 flex flex-col items-start text-left group hover:scale-[1.01] hover:-translate-y-3 hover:border-[#8b5cf6]/40 hover:bg-white/[0.04] hover:shadow-[0_0_20px_-10px_rgba(139,92,246,0.4)] select-none snappy-transition cursor-default
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[30px]"}`}
    >
      {/* Icon Square Tinted Box */}
      <div className="w-12 h-12 flex items-center justify-center bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-xl border border-[#8b5cf6]/10 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
        {icon}
      </div>

      {/* Card Header title in Instrument Serif */}
      <h4 className="font-display text-2xl text-white mb-3">
        {title}
      </h4>

      {/* Body text in Inter font */}
      <p className="text-xs sm:text-sm font-sans text-[#A1A1AA] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
