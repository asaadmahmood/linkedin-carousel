"use client";

import React, { useRef } from "react";
import { SlideData, AspectRatio } from "@/lib/types";
import { processImageFile } from "@/lib/imageUtils";

interface SlideEditorProps {
  slide: SlideData;
  onChange: (updated: SlideData) => void;
  aspectRatio?: AspectRatio;
}

const inputClass =
  "w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 input-glow transition-all placeholder:text-zinc-600";

export default function SlideEditor({ slide, onChange, aspectRatio = "square" }: SlideEditorProps) {
  const update = (partial: Partial<SlideData>) =>
    onChange({ ...slide, ...partial });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideHeight = aspectRatio === "portrait" ? 1350 : 1080;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const image = await processImageFile(file, 1080, slideHeight);
      update({ image });
    } catch {
      // silently fail
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Slide type */}
      <div className="section-card">
        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Slide Type
        </label>
        <select
          value={slide.type}
          onChange={(e) =>
            update({ type: e.target.value as SlideData["type"] })
          }
          className={inputClass}
        >
          <option value="cover">Cover</option>
          <option value="content">Content</option>
          <option value="list">Numbered List</option>
          <option value="quote">Quote</option>
          <option value="cta">Call to Action</option>
        </select>
      </div>

      {/* Number badge */}
      {slide.type !== "cover" && slide.type !== "cta" && (
        <div className="section-card">
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Slide Number
          </label>
          <input
            type="text"
            value={slide.number || ""}
            onChange={(e) => update({ number: e.target.value })}
            placeholder="01"
            className={inputClass}
          />
        </div>
      )}

      {/* Heading */}
      <div className="section-card">
        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Heading
        </label>
        <textarea
          value={slide.heading}
          onChange={(e) => update({ heading: e.target.value })}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Your main heading..."
        />
      </div>

      {/* Highlight words */}
      <div className="section-card">
        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
          Highlight Words
        </label>
        <p className="text-[10px] text-zinc-600 mb-2">Comma-separated words to highlight</p>
        <input
          type="text"
          value={slide.highlightWords.join(", ")}
          onChange={(e) =>
            update({
              highlightWords: e.target.value
                .split(",")
                .map((w) => w.trim())
                .filter(Boolean),
            })
          }
          className={inputClass}
          placeholder="word1, word2"
        />
      </div>

      {/* Subtitle */}
      <div className="section-card">
        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Subtitle
        </label>
        <input
          type="text"
          value={slide.subtitle}
          onChange={(e) => update({ subtitle: e.target.value })}
          className={inputClass}
          placeholder="Optional subtitle..."
        />
      </div>

      {/* Body items */}
      <div className="section-card">
        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Bullet Points
        </label>
        <div className="space-y-2">
          {slide.bodyItems.map((item, i) => (
            <div key={i} className="flex gap-1.5">
              <div className="flex items-center justify-center w-5 h-9 text-[10px] text-zinc-600 font-medium shrink-0">
                {i + 1}
              </div>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...slide.bodyItems];
                  newItems[i] = e.target.value;
                  update({ bodyItems: newItems });
                }}
                className={`flex-1 ${inputClass}`}
                placeholder={`Point ${i + 1}`}
              />
              <button
                onClick={() => {
                  const newItems = slide.bodyItems.filter((_, idx) => idx !== i);
                  update({ bodyItems: newItems });
                }}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            update({ bodyItems: [...slide.bodyItems, ""] })
          }
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2.5 px-1"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 1v10M1 6h10" />
          </svg>
          Add bullet point
        </button>
      </div>

      {/* Slide Image */}
      <div className="section-card">
        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Slide Image
        </label>
        {slide.image ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image.dataUrl}
              alt=""
              className="w-full h-20 object-cover rounded-lg border border-white/[0.08]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12] transition-all"
              >
                Replace
              </button>
              <button
                onClick={() => {
                  if (!slide.image) return;
                  update({ image: { ...slide.image, inverted: !slide.image.inverted } });
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all ${
                  slide.image?.inverted
                    ? "border-blue-500/50 bg-blue-500/10 text-white"
                    : "border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
                }`}
              >
                Invert
              </button>
              <button
                onClick={() => update({ image: undefined })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-medium border border-dashed border-white/[0.12] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.25] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M7 1v12M1 7h12" />
            </svg>
            Upload Image
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
