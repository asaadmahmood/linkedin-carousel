"use client";

import React, { useState } from "react";
import CarouselGenerator from "@/components/CarouselGenerator";
import LinkedInFormatter from "@/components/LinkedInFormatter";

type AppTab = "carousel" | "formatter";

export default function Home() {
  const [appTab, setAppTab] = useState<AppTab>("carousel");

  return (
    <div className="h-screen flex flex-col bg-[#09090b]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06] bg-[#0c0c0f] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
            C
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
            {([["carousel", "Carousel Generator"], ["formatter", "Post Formatter"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setAppTab(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  appTab === key
                    ? "bg-white/[0.1] text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Tab content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {appTab === "carousel" ? <CarouselGenerator /> : <LinkedInFormatter />}
      </div>
    </div>
  );
}
