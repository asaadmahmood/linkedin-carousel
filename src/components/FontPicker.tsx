"use client";

import React from "react";
import { FONT_OPTIONS } from "@/lib/types";

interface FontPickerProps {
  label: string;
  selectedFontCss: string;
  onSelect: (css: string) => void;
}

export default function FontPicker({ label, selectedFontCss, onSelect }: FontPickerProps) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-1.5">
        {FONT_OPTIONS.map((font) => (
          <button
            key={font.id}
            onClick={() => onSelect(font.css)}
            className={`px-2.5 py-2 rounded-lg text-left text-xs transition-all border ${
              selectedFontCss === font.css
                ? "border-blue-500/50 bg-blue-500/10 text-white"
                : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
            }`}
          >
            <span style={{ fontFamily: font.css }} className="text-sm block truncate">
              {font.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
