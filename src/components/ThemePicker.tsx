"use client";

import React from "react";
import { ThemeId, THEMES } from "@/lib/types";

interface ThemePickerProps {
  selected: ThemeId;
  onSelect: (theme: ThemeId) => void;
}

export default function ThemePicker({ selected, onSelect }: ThemePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.values(THEMES).map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={`relative rounded-xl p-2.5 text-left transition-all border ${
            selected === theme.id
              ? "border-blue-500/50 ring-1 ring-blue-500/20"
              : "border-white/[0.06] hover:border-white/[0.12]"
          }`}
          style={{ backgroundColor: theme.preview.bg }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.preview.accent }}
            />
            <div className="flex gap-1">
              <div
                className="w-6 h-1 rounded-full"
                style={{
                  backgroundColor: theme.textColor,
                  opacity: 0.5,
                }}
              />
              <div
                className="w-3.5 h-1 rounded-full"
                style={{
                  backgroundColor: theme.preview.accent,
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
          <div
            className="text-[10px] font-semibold leading-tight"
            style={{ color: theme.textColor }}
          >
            {theme.name}
          </div>
          <div className="text-[8px] mt-0.5 leading-tight opacity-60" style={{ color: theme.subtitleColor }}>
            {theme.description}
          </div>
          {selected === theme.id && (
            <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                width="8"
                height="8"
                viewBox="0 0 10 10"
                fill="none"
                className="text-white"
              >
                <path
                  d="M2 5L4 7L8 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
