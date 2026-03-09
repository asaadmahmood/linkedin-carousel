"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import SlideRenderer from "@/components/SlideRenderer";
import SlideEditor from "@/components/SlideEditor";
import ThemePicker from "@/components/ThemePicker";
import FontPicker from "@/components/FontPicker";
import {
  SlideData,
  CarouselSettings,
  THEMES,
  createDefaultSlides,
  AspectRatio,
  BACKGROUND_PATTERNS,
  BackgroundPattern,
} from "@/lib/types";
import { exportCarouselAsPdf, EXPORT_QUALITIES, ExportQuality } from "@/lib/exportPdf";
import { parseMarkdownToSlides, MARKDOWN_EXAMPLE } from "@/lib/parseMarkdown";
import { processImageFile, removeImageBackground } from "@/lib/imageUtils";

const STORAGE_KEY_SLIDES = "carousel-slides";
const STORAGE_KEY_SETTINGS = "carousel-settings";
const STORAGE_KEY_ACTIVE = "carousel-active-index";
const STORAGE_KEY_MARKDOWN = "carousel-markdown";

const DEFAULT_SETTINGS: CarouselSettings = {
  theme: "dark-professional",
  authorName: "Your Name",
  authorHandle: "@yourhandle",
  brandLabel: "Content Design",
  fontHeading: "",
  fontBody: "",
  decoration: "none",
  backgroundPattern: "none",
  aspectRatio: "square",
  textAlign: "left",
};

export default function Home() {
  const [slides, setSlides] = useState<SlideData[]>(createDefaultSlides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [settings, setSettings] = useState<CarouselSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"slides" | "theme" | "settings">("theme");
  const [showMarkdownModal, setShowMarkdownModal] = useState(false);
  const [markdownText, setMarkdownText] = useState("");
  const [savedMarkdown, setSavedMarkdown] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [exportQuality, setExportQuality] = useState<ExportQuality>("high");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const slideRefs = useRef<Map<string, HTMLElement>>(new Map());
  const dragCounterRef = useRef(0);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const storedSlides = localStorage.getItem(STORAGE_KEY_SLIDES);
      if (storedSlides) setSlides(JSON.parse(storedSlides));
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (storedSettings) setSettings(JSON.parse(storedSettings));
      const storedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (storedActive) setActiveSlideIndex(JSON.parse(storedActive));
      const storedMarkdown = localStorage.getItem(STORAGE_KEY_MARKDOWN);
      if (storedMarkdown) setSavedMarkdown(storedMarkdown);
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage (only after initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(slides));
    } catch {
      // QuotaExceededError — large images may exceed localStorage limits
    }
  }, [slides, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeSlideIndex));
  }, [activeSlideIndex, hydrated]);
  useEffect(() => {
    if (!hydrated || !savedMarkdown) return;
    localStorage.setItem(STORAGE_KEY_MARKDOWN, savedMarkdown);
  }, [savedMarkdown, hydrated]);

  const theme = THEMES[settings.theme];
  const activeSlide = slides[activeSlideIndex];
  const effectiveDecoration = settings.decoration;
  const slideHeight = settings.aspectRatio === "portrait" ? 1350 : 1080;

  const updateSlide = useCallback(
    (updated: SlideData) => {
      setSlides((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    },
    []
  );

  const handleCanvasDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/") || !activeSlide) return;
    try {
      const image = await processImageFile(file, 1080, slideHeight);
      updateSlide({ ...activeSlide, image });
    } catch {
      // silently fail
    }
  }, [activeSlide, slideHeight, updateSlide]);

  const handleRemoveBg = useCallback(async () => {
    if (!activeSlide?.image || removingBg) return;
    setRemovingBg(true);
    try {
      const newDataUrl = await removeImageBackground(activeSlide.image.dataUrl);
      updateSlide({ ...activeSlide, image: { ...activeSlide.image, dataUrl: newDataUrl } });
    } catch {
      alert("Background removal failed. Please try again.");
    } finally {
      setRemovingBg(false);
    }
  }, [activeSlide, removingBg, updateSlide]);

  const addSlide = useCallback(() => {
    const newSlide: SlideData = {
      id: crypto.randomUUID(),
      type: "content",
      heading: "New slide heading",
      highlightWords: [],
      subtitle: "",
      bodyItems: ["First point", "Second point"],
      number: String(slides.length).padStart(2, "0"),
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  }, [slides.length]);

  const duplicateSlide = useCallback(() => {
    const clone: SlideData = {
      ...activeSlide,
      id: crypto.randomUUID(),
    };
    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, clone);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
  }, [activeSlide, activeSlideIndex, slides]);

  const deleteSlide = useCallback((index?: number) => {
    const targetIndex = index ?? activeSlideIndex;
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== targetIndex);
    setSlides(newSlides);
    setActiveSlideIndex(Math.min(activeSlideIndex, newSlides.length - 1));
  }, [activeSlideIndex, slides]);

  const moveSlide = useCallback(
    (fromIndex: number, dir: -1 | 1) => {
      const newIndex = fromIndex + dir;
      if (newIndex < 0 || newIndex >= slides.length) return;
      const newSlides = [...slides];
      [newSlides[fromIndex], newSlides[newIndex]] = [
        newSlides[newIndex],
        newSlides[fromIndex],
      ];
      setSlides(newSlides);
      if (fromIndex === activeSlideIndex) {
        setActiveSlideIndex(newIndex);
      } else if (newIndex === activeSlideIndex) {
        setActiveSlideIndex(fromIndex);
      }
    },
    [activeSlideIndex, slides]
  );

  const reorderSlide = useCallback((fromIndex: number, toIndex: number) => {
    const newSlides = [...slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);
    setSlides(newSlides);
    // Update active index to follow the active slide
    if (activeSlideIndex === fromIndex) {
      setActiveSlideIndex(toIndex);
    } else if (fromIndex < activeSlideIndex && toIndex >= activeSlideIndex) {
      setActiveSlideIndex(activeSlideIndex - 1);
    } else if (fromIndex > activeSlideIndex && toIndex <= activeSlideIndex) {
      setActiveSlideIndex(activeSlideIndex + 1);
    }
  }, [activeSlideIndex, slides]);

  const handleExport = useCallback(async (quality?: ExportQuality) => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const elements = slides
        .map((s) => slideRefs.current.get(s.id))
        .filter(Boolean) as HTMLElement[];
      await exportCarouselAsPdf(elements, "linkedin-carousel", quality ?? exportQuality);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [slides, exportQuality]);

  const setSlideRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        slideRefs.current.set(id, el);
      } else {
        slideRefs.current.delete(id);
      }
    },
    []
  );

  const handleThemeChange = useCallback((themeId: typeof settings.theme) => {
    const newTheme = THEMES[themeId];
    setSettings((s) => ({
      ...s,
      theme: themeId,
      decoration: newTheme.defaultDecoration,
      fontHeading: "",
      fontBody: "",
    }));
  }, []);

  const handleImportMarkdown = useCallback(() => {
    const parsed = parseMarkdownToSlides(markdownText);
    if (parsed.length === 0) {
      alert("Could not parse any slides from the markdown. Check the format.");
      return;
    }
    // Preserve images from existing slides by position
    const merged = parsed.map((slide, i) => {
      if (i < slides.length && slides[i].image) {
        return { ...slide, image: slides[i].image };
      }
      return slide;
    });
    setSlides(merged);
    setActiveSlideIndex(0);
    setSavedMarkdown(markdownText);
    setShowMarkdownModal(false);
  }, [markdownText, slides]);

  const previewScale = settings.aspectRatio === "portrait" ? 0.45 : 0.55;
  const thumbHeight = settings.aspectRatio === "portrait" ? 150 : 120;
  const thumbScale = 120 / 1080;

  const tabIcons = {
    slides: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="5" height="5" rx="1" />
        <rect x="9" y="2" width="5" height="5" rx="1" />
        <rect x="2" y="9" width="5" height="5" rx="1" />
        <rect x="9" y="9" width="5" height="5" rx="1" />
      </svg>
    ),
    theme: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
      </svg>
    ),
    settings: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="2" />
        <path d="M13.3 9.7a1.2 1.2 0 00.24 1.32l.04.04a1.44 1.44 0 11-2.04 2.04l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.72 1.08v.12a1.44 1.44 0 11-2.88 0v-.06a1.2 1.2 0 00-.78-1.08 1.2 1.2 0 00-1.32.24l-.04.04a1.44 1.44 0 11-2.04-2.04l.04-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.08-.72H1.44a1.44 1.44 0 110-2.88h.06a1.2 1.2 0 001.08-.78 1.2 1.2 0 00-.24-1.32l-.04-.04a1.44 1.44 0 112.04-2.04l.04.04a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.72-1.08V1.44a1.44 1.44 0 012.88 0v.06a1.2 1.2 0 00.72 1.08 1.2 1.2 0 001.32-.24l.04-.04a1.44 1.44 0 112.04 2.04l-.04.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.08.72h.12a1.44 1.44 0 110 2.88h-.06a1.2 1.2 0 00-1.08.72z" />
      </svg>
    ),
  };

  return (
    <div className="h-screen flex flex-col bg-[#09090b]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06] bg-[#0c0c0f] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
            C
          </div>
          <h1 className="text-sm font-semibold text-white/90">Carousel Generator</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMarkdownText(savedMarkdown || MARKDOWN_EXAMPLE);
              setShowMarkdownModal(true);
            }}
            className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-zinc-300 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2H4.5A1.5 1.5 0 003 3.5v9A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V6L9 2z" />
              <path d="M9 2v4h4" />
            </svg>
            Import Markdown
          </button>
          <span className="text-xs text-zinc-500 tabular-nums ml-2">
            {slides.length} slide{slides.length !== 1 ? "s" : ""}
          </span>
          <div className="relative">
            <div className="flex">
              <button
                onClick={() => handleExport()}
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg text-sm font-medium text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 10v2.5A1.5 1.5 0 003.5 14h9a1.5 1.5 0 001.5-1.5V10M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Export PDF
                  </>
                )}
              </button>
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                disabled={exporting}
                className="px-2 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-r-lg border-l border-blue-500/40 text-white transition-all shadow-lg shadow-blue-600/20"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </button>
            </div>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-[#1a1a1f] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/[0.06]">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Export Quality</span>
                  </div>
                  {(["high", "medium", "low"] as ExportQuality[]).map((q) => {
                    const config = EXPORT_QUALITIES[q];
                    return (
                      <button
                        key={q}
                        onClick={() => {
                          setExportQuality(q);
                          handleExport(q);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.05] transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${exportQuality === q ? "bg-blue-500" : "bg-zinc-600"}`} />
                        <div>
                          <div className="text-xs font-medium text-white">{config.label}</div>
                          <div className="text-[10px] text-zinc-500">{config.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-[320px] border-r border-white/[0.06] flex flex-col bg-[#0c0c0f] shrink-0">
          {/* Sidebar tabs */}
          <div className="flex gap-1 p-2 border-b border-white/[0.06]">
            {(
              [
                ["theme", "Theme"],
                ["slides", "Slides"],
                ["settings", "Settings"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSidebarTab(key)}
                className={`sidebar-tab flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium ${
                  sidebarTab === key
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                }`}
              >
                {tabIcons[key]}
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto sidebar-scroll p-3">
            {sidebarTab === "slides" && activeSlide && (
              <SlideEditor slide={activeSlide} onChange={updateSlide} aspectRatio={settings.aspectRatio} />
            )}

            {sidebarTab === "theme" && (
              <div className="space-y-4">
                <div className="section-card">
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Theme
                  </h3>
                  <ThemePicker
                    selected={settings.theme}
                    onSelect={handleThemeChange}
                  />
                </div>

                <div className="section-card">
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Aspect Ratio
                  </h3>
                  <div className="flex gap-2">
                    {(["square", "portrait"] as AspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setSettings((s) => ({ ...s, aspectRatio: ratio }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                          settings.aspectRatio === ratio
                            ? "border-blue-500/50 bg-blue-500/10 text-white"
                            : "border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
                        }`}
                      >
                        <div
                          className="border border-current rounded-sm"
                          style={{
                            width: ratio === "square" ? 14 : 12,
                            height: ratio === "square" ? 14 : 17,
                          }}
                        />
                        {ratio === "square" ? "1:1 Square" : "4:5 Portrait"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="section-card">
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Text Alignment
                  </h3>
                  <div className="flex gap-2">
                    {(["left", "center"] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => setSettings((s) => ({ ...s, textAlign: align }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                          settings.textAlign === align
                            ? "border-blue-500/50 bg-blue-500/10 text-white"
                            : "border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          {align === "left" ? (
                            <>
                              <line x1="1" y1="2" x2="13" y2="2" />
                              <line x1="1" y1="5.5" x2="9" y2="5.5" />
                              <line x1="1" y1="9" x2="11" y2="9" />
                              <line x1="1" y1="12.5" x2="7" y2="12.5" />
                            </>
                          ) : (
                            <>
                              <line x1="1" y1="2" x2="13" y2="2" />
                              <line x1="3" y1="5.5" x2="11" y2="5.5" />
                              <line x1="2" y1="9" x2="12" y2="9" />
                              <line x1="4" y1="12.5" x2="10" y2="12.5" />
                            </>
                          )}
                        </svg>
                        {align === "left" ? "Left" : "Center"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="section-card">
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Background Pattern
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5">
                    {BACKGROUND_PATTERNS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSettings((s) => ({ ...s, backgroundPattern: p.id }))}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] transition-all border ${
                          settings.backgroundPattern === p.id
                            ? "border-blue-500/50 bg-blue-500/10 text-white"
                            : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
                        }`}
                      >
                        <PatternPreview pattern={p.id} />
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="section-card">
                  <FontPicker
                    label="Heading Font"
                    selectedFontCss={settings.fontHeading || theme.fontHeading}
                    onSelect={(css) => setSettings((s) => ({ ...s, fontHeading: css }))}
                  />
                </div>

                <div className="section-card">
                  <FontPicker
                    label="Body Font"
                    selectedFontCss={settings.fontBody || theme.fontBody}
                    onSelect={(css) => setSettings((s) => ({ ...s, fontBody: css }))}
                  />
                </div>
              </div>
            )}

            {sidebarTab === "settings" && (
              <div className="section-card space-y-4">
                <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Branding
                </h3>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={settings.authorName}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, authorName: e.target.value }))
                    }
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 input-glow transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                    Handle
                  </label>
                  <input
                    type="text"
                    value={settings.authorHandle}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, authorHandle: e.target.value }))
                    }
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 input-glow transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                    Brand Label
                  </label>
                  <input
                    type="text"
                    value={settings.brandLabel}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, brandLabel: e.target.value }))
                    }
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 input-glow transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main canvas area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Preview area */}
          <div
            className="flex-1 flex items-center justify-center p-8 overflow-auto canvas-bg relative"
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
              e.preventDefault();
              dragCounterRef.current++;
              if (e.dataTransfer.types.includes("Files")) setIsDraggingFile(true);
            }}
            onDragLeave={() => {
              dragCounterRef.current--;
              if (dragCounterRef.current === 0) setIsDraggingFile(false);
            }}
            onDrop={handleCanvasDrop}
          >
            {/* Drop overlay */}
            {isDraggingFile && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 border-2 border-dashed border-blue-500/40 rounded-lg backdrop-blur-sm pointer-events-none">
                <div className="flex flex-col items-center gap-2 text-blue-400">
                  <svg width="32" height="32" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="2" width="12" height="10" rx="1.5" />
                    <circle cx="4.5" cy="5.5" r="1" />
                    <path d="M13 9l-3-3-4 4M6 10l-2-2-3 3" />
                  </svg>
                  <span className="text-sm font-medium">Drop image on slide</span>
                </div>
              </div>
            )}

            <div className="slide-preview-wrapper">
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "center center",
                }}
              >
                <div style={{ width: 1080, height: slideHeight, borderRadius: 8, overflow: "hidden" }}>
                  <SlideRenderer
                    slide={activeSlide}
                    theme={theme}
                    authorName={settings.authorName}
                    authorHandle={settings.authorHandle}
                    brandLabel={settings.brandLabel}
                    slideIndex={activeSlideIndex}
                    totalSlides={slides.length}
                    fontHeadingOverride={settings.fontHeading || undefined}
                    fontBodyOverride={settings.fontBody || undefined}
                    decoration={effectiveDecoration}
                    backgroundPattern={settings.backgroundPattern}
                    aspectRatio={settings.aspectRatio}
                    textAlign={settings.textAlign}
                    interactive={true}
                    interactiveScale={previewScale}
                    onImageChange={(image) => updateSlide({ ...activeSlide, image })}
                  />
                </div>
              </div>
            </div>

            {/* Canvas image controls */}
            {activeSlide?.image && (
              <div className="absolute bottom-6 right-6 flex gap-2">
                <button
                  onClick={() => {
                    if (!activeSlide.image) return;
                    updateSlide({ ...activeSlide, image: { ...activeSlide.image, inverted: !activeSlide.image.inverted } });
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all backdrop-blur-sm ${
                    activeSlide.image.inverted
                      ? "bg-blue-500/20 border-blue-500/50 text-white"
                      : "bg-white/[0.08] border-white/[0.1] text-zinc-300 hover:bg-white/[0.14] hover:text-white"
                  }`}
                >
                  Invert
                </button>
                <button
                  onClick={handleRemoveBg}
                  disabled={removingBg}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:bg-white/[0.14] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                >
                  {removingBg ? (
                    <>
                      <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Removing...
                    </>
                  ) : (
                    "Remove BG"
                  )}
                </button>
                <button
                  onClick={() => updateSlide({ ...activeSlide, image: undefined })}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-white/[0.08] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all backdrop-blur-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Slide thumbnails strip with drag-and-drop */}
          <div className="border-t border-white/[0.06] bg-[#0c0c0f] px-4 py-3">
            <div className="flex gap-2.5 overflow-x-auto slides-scroll pb-1 items-end">
              {slides.map((slide, i) => (
                <div
                  key={slide.id}
                  className="shrink-0 group/thumb relative"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", String(i));
                    e.dataTransfer.effectAllowed = "move";
                    setDragIndex(i);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                    if (isNaN(fromIndex) || fromIndex === i) return;
                    reorderSlide(fromIndex, i);
                    setDragIndex(null);
                  }}
                >
                  <button
                    onClick={() => setActiveSlideIndex(i)}
                    className={`relative rounded-lg overflow-hidden transition-all cursor-grab active:cursor-grabbing ${
                      i === activeSlideIndex
                        ? "thumb-active"
                        : "ring-1 ring-white/[0.08] hover:ring-white/[0.2]"
                    } ${dragIndex === i ? "opacity-40" : ""}`}
                    style={{ width: 120, height: thumbHeight }}
                  >
                    <div
                      style={{
                        transform: `scale(${thumbScale})`,
                        transformOrigin: "top left",
                        width: 1080,
                        height: slideHeight,
                        pointerEvents: "none",
                      }}
                    >
                      <SlideRenderer
                        slide={slide}
                        theme={theme}
                        authorName={settings.authorName}
                        authorHandle={settings.authorHandle}
                        brandLabel={settings.brandLabel}
                        slideIndex={i}
                        totalSlides={slides.length}
                        fontHeadingOverride={settings.fontHeading || undefined}
                        fontBodyOverride={settings.fontBody || undefined}
                        decoration={effectiveDecoration}
                        backgroundPattern={settings.backgroundPattern}
                        aspectRatio={settings.aspectRatio}
                        textAlign={settings.textAlign}
                      />
                    </div>
                    <div className={`absolute bottom-0 left-0 right-0 text-center py-0.5 ${
                      i === activeSlideIndex ? "bg-blue-600/80" : "bg-black/60"
                    }`}>
                      <span className="text-[10px] text-white font-medium">{i + 1}</span>
                    </div>
                    {/* Trash button on hover */}
                    {slides.length > 1 && (
                      <div
                        className="absolute top-1 right-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity z-20"
                        onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                      >
                        <div className="w-5 h-5 rounded-md bg-black/70 hover:bg-red-600 flex items-center justify-center transition-colors cursor-pointer">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M2 2l6 6M8 2l-6 6" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              ))}
              <button
                onClick={addSlide}
                className="shrink-0 rounded-lg border border-dashed border-white/[0.1] flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-white/[0.2] hover:bg-white/[0.02] transition-all"
                style={{ width: 120, height: thumbHeight }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M10 4v12M4 10h12" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Hidden rendering area for PDF export */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          opacity: 1,
          pointerEvents: "none",
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={`export-${slide.id}`}
            ref={setSlideRef(slide.id)}
            style={{ width: 1080, height: slideHeight }}
          >
            <SlideRenderer
              slide={slide}
              theme={theme}
              authorName={settings.authorName}
              authorHandle={settings.authorHandle}
              brandLabel={settings.brandLabel}
              slideIndex={i}
              totalSlides={slides.length}
              fontHeadingOverride={settings.fontHeading || undefined}
              fontBodyOverride={settings.fontBody || undefined}
              decoration={effectiveDecoration}
              backgroundPattern={settings.backgroundPattern}
              aspectRatio={settings.aspectRatio}
              textAlign={settings.textAlign}
            />
          </div>
        ))}
      </div>

      {/* Markdown Import Modal */}
      {showMarkdownModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMarkdownModal(false)}
        >
          <div
            className="bg-[#141418] border border-white/[0.1] rounded-2xl shadow-2xl w-[680px] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-lg font-semibold text-white">Import from Markdown</h2>
                <p className="text-xs text-zinc-500 mt-1">Paste your carousel content in markdown format. Separate slides with ---</p>
              </div>
              <button
                onClick={() => setShowMarkdownModal(false)}
                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={markdownText}
                onChange={(e) => setMarkdownText(e.target.value)}
                className="w-full h-[400px] bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-blue-500/50 input-glow transition-all resize-none placeholder:text-zinc-600"
                placeholder={`# Your Cover Title\n*highlight, words*\n> Subtitle text\n---\n## 01 | Slide Heading\n- First bullet point\n- Second bullet point\n---\n## 02 | Another Slide\n*keyword*\n> Subtitle\n- Point one\n- Point two`}
                spellCheck={false}
              />
              <div className="mt-3 flex items-start gap-2 text-[11px] text-zinc-500 leading-relaxed">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 mt-0.5">
                  <circle cx="7" cy="7" r="6" />
                  <path d="M7 4v3M7 9.5v.5" strokeLinecap="round" />
                </svg>
                <span>
                  <strong className="text-zinc-400">Format:</strong> # = cover, ## NN | = numbered slide, *words* = highlights, {"> text"} = subtitle, - text = bullets. Add (list), (cta), (quote) to set slide type.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
              <button
                onClick={() => setMarkdownText(MARKDOWN_EXAMPLE)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Reset to example
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMarkdownModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportMarkdown}
                  disabled={!markdownText.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20"
                >
                  Import Slides
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pattern preview thumbnails for the picker
function PatternPreview({ pattern }: { pattern: BackgroundPattern }) {
  if (pattern === "none") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="4" y1="4" x2="20" y2="20" />
        <line x1="20" y1="4" x2="4" y2="20" />
      </svg>
    );
  }

  const previews: Record<string, React.ReactNode> = {
    dots: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
        <circle cx="4" cy="4" r="1.5" /><circle cx="12" cy="4" r="1.5" /><circle cx="20" cy="4" r="1.5" />
        <circle cx="4" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="20" cy="12" r="1.5" />
        <circle cx="4" cy="20" r="1.5" /><circle cx="12" cy="20" r="1.5" /><circle cx="20" cy="20" r="1.5" />
      </svg>
    ),
    grid: (
      <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.5">
        <line x1="8" y1="0" x2="8" y2="24" /><line x1="16" y1="0" x2="16" y2="24" />
        <line x1="0" y1="8" x2="24" y2="8" /><line x1="0" y1="16" x2="24" y2="16" />
      </svg>
    ),
    diagonal: (
      <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.5">
        <line x1="0" y1="6" x2="6" y2="0" /><line x1="0" y1="14" x2="14" y2="0" /><line x1="0" y1="22" x2="22" y2="0" />
        <line x1="2" y1="24" x2="24" y2="2" /><line x1="10" y1="24" x2="24" y2="10" /><line x1="18" y1="24" x2="24" y2="18" />
      </svg>
    ),
    cross: (
      <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5">
        <path d="M5 4v4M3 6h4" /><path d="M17 4v4M15 6h4" /><path d="M11 14v4M9 16h4" />
        <path d="M5 16v4M3 18h4" /><path d="M17 16v4M15 18h4" />
      </svg>
    ),
    waves: (
      <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5">
        <path d="M0 6c4-4 8 4 12 0s8 4 12 0" /><path d="M0 12c4-4 8 4 12 0s8 4 12 0" /><path d="M0 18c4-4 8 4 12 0s8 4 12 0" />
      </svg>
    ),
    stripes: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
        <rect x="0" y="2" width="24" height="2" /><rect x="0" y="8" width="24" height="2" />
        <rect x="0" y="14" width="24" height="2" /><rect x="0" y="20" width="24" height="2" />
      </svg>
    ),
  };

  return <>{previews[pattern] || null}</>;
}
