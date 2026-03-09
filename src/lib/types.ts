export type ThemeId =
  | "dark-professional"
  | "light-personal"
  | "midnight-blue"
  | "warm-gradient"
  | "asaad-dark"
  | "soft-beige"
  | "clean-white"
  | "forest-dark"
  | "coral-sunset"
  | "ocean-deep";

export type DecorationStyle =
  | "none"
  | "sketch-arrow"
  | "swoosh"
  | "doodle"
  | "corner-accent"
  | "spiral"
  | "gradient-orb"
  | "underline";

export type AspectRatio = "square" | "portrait";

export type TextAlign = "left" | "center";

export type BackgroundPattern = "none" | "dots" | "grid" | "diagonal" | "cross" | "waves" | "stripes";

export const BACKGROUND_PATTERNS: { id: BackgroundPattern; name: string }[] = [
  { id: "none", name: "None" },
  { id: "dots", name: "Dots" },
  { id: "grid", name: "Grid" },
  { id: "diagonal", name: "Diagonal" },
  { id: "cross", name: "Cross" },
  { id: "waves", name: "Waves" },
  { id: "stripes", name: "Stripes" },
];

export interface FontOption {
  id: string;
  name: string;
  css: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "inter", name: "Inter", css: "var(--font-inter)" },
  { id: "dm-sans", name: "DM Sans", css: "var(--font-dm-sans)" },
  { id: "playfair", name: "Playfair Display", css: "var(--font-playfair)" },
  { id: "plus-jakarta", name: "Plus Jakarta Sans", css: "var(--font-plus-jakarta)" },
  { id: "space-grotesk", name: "Space Grotesk", css: "var(--font-space-grotesk)" },
  { id: "lora", name: "Lora", css: "var(--font-lora)" },
  { id: "poppins", name: "Poppins", css: "var(--font-poppins)" },
  { id: "outfit", name: "Outfit", css: "var(--font-outfit)" },
  { id: "merriweather", name: "Merriweather", css: "var(--font-merriweather)" },
  { id: "caveat", name: "Caveat", css: "var(--font-caveat)" },
];

export interface SlideImage {
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
  inverted?: boolean;
}

export interface SlideData {
  id: string;
  type: "cover" | "content" | "list" | "quote" | "cta";
  heading: string;
  highlightWords: string[];
  subtitle: string;
  bodyItems: string[];
  number?: string;
  image?: SlideImage;
}

export interface CarouselSettings {
  theme: ThemeId;
  authorName: string;
  authorHandle: string;
  brandLabel: string;
  fontHeading: string;
  fontBody: string;
  decoration: DecorationStyle;
  backgroundPattern: BackgroundPattern;
  aspectRatio: AspectRatio;
  textAlign: TextAlign;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  bgColor: string;
  bgGradient?: string;
  textColor: string;
  highlightColor: string;
  highlightTextColor: string;
  subtitleColor: string;
  accentColor: string;
  authorColor: string;
  fontHeading: string;
  fontBody: string;
  defaultDecoration: DecorationStyle;
  preview: {
    bg: string;
    accent: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  "dark-professional": {
    id: "dark-professional",
    name: "Dark Professional",
    description: "Inspired by Nick Broekema",
    bgColor: "#0f1923",
    bgGradient: "linear-gradient(135deg, #142e25 0%, #0f1923 50%, #0c141c 100%)",
    textColor: "#e2f5e9",
    highlightColor: "#2d7a4f",
    highlightTextColor: "#ffffff",
    subtitleColor: "#94a3b8",
    accentColor: "#e8a838",
    authorColor: "#64748b",
    fontHeading: "var(--font-dm-sans)",
    fontBody: "var(--font-inter)",
    defaultDecoration: "none",
    preview: {
      bg: "#0f1923",
      accent: "#2d7a4f",
    },
  },
  "light-personal": {
    id: "light-personal",
    name: "Light Personal",
    description: "Inspired by Ali Abdaal",
    bgColor: "#faf8f5",
    textColor: "#1a1a1a",
    highlightColor: "#c4a7e7",
    highlightTextColor: "#1a1a1a",
    subtitleColor: "#6b7280",
    accentColor: "#8b5cf6",
    authorColor: "#9ca3af",
    fontHeading: "var(--font-playfair)",
    fontBody: "var(--font-inter)",
    defaultDecoration: "none",
    preview: {
      bg: "#faf8f5",
      accent: "#c4a7e7",
    },
  },
  "midnight-blue": {
    id: "midnight-blue",
    name: "Midnight Blue",
    description: "Deep blue with cyan accents",
    bgColor: "#0a1628",
    bgGradient: "linear-gradient(135deg, #0d1f38 0%, #0a1628 50%, #081220 100%)",
    textColor: "#d4e8fc",
    highlightColor: "#0ea5e9",
    highlightTextColor: "#ffffff",
    subtitleColor: "#6b8aab",
    accentColor: "#38bdf8",
    authorColor: "#475569",
    fontHeading: "var(--font-dm-sans)",
    fontBody: "var(--font-inter)",
    defaultDecoration: "none",
    preview: {
      bg: "#0a1628",
      accent: "#0ea5e9",
    },
  },
  "warm-gradient": {
    id: "warm-gradient",
    name: "Warm Gradient",
    description: "Warm tones with orange accent",
    bgColor: "#1c1117",
    bgGradient: "linear-gradient(135deg, #24151b 0%, #1c1117 50%, #150d12 100%)",
    textColor: "#f5ddd8",
    highlightColor: "#ea580c",
    highlightTextColor: "#ffffff",
    subtitleColor: "#a8a29e",
    accentColor: "#f97316",
    authorColor: "#78716c",
    fontHeading: "var(--font-dm-sans)",
    fontBody: "var(--font-inter)",
    defaultDecoration: "none",
    preview: {
      bg: "#1c1117",
      accent: "#ea580c",
    },
  },
  "asaad-dark": {
    id: "asaad-dark",
    name: "Asaad Dark",
    description: "Dark navy with mint accents",
    bgColor: "#0c1824",
    bgGradient: "linear-gradient(135deg, #122e3e 0%, #0c1824 50%, #08121e 100%)",
    textColor: "#d4fcf6",
    highlightColor: "#7dd3c0",
    highlightTextColor: "#0c1824",
    subtitleColor: "#d0f3ee",
    accentColor: "#9366e8",
    authorColor: "#5a7a9b",
    fontHeading: "var(--font-dm-sans)",
    fontBody: "var(--font-inter)",
    defaultDecoration: "none",
    preview: {
      bg: "#0c1824",
      accent: "#7dd3c0",
    },
  },
  "soft-beige": {
    id: "soft-beige",
    name: "Soft Beige",
    description: "Warm cream with elegant serif",
    bgColor: "#f5f0e8",
    textColor: "#2d2926",
    highlightColor: "#b8a0d8",
    highlightTextColor: "#2d2926",
    subtitleColor: "#7a7067",
    accentColor: "#9b7ed8",
    authorColor: "#8a8078",
    fontHeading: "var(--font-playfair)",
    fontBody: "var(--font-lora)",
    defaultDecoration: "none",
    preview: {
      bg: "#f5f0e8",
      accent: "#b8a0d8",
    },
  },
  "clean-white": {
    id: "clean-white",
    name: "Clean White",
    description: "Minimal modern white",
    bgColor: "#ffffff",
    textColor: "#111827",
    highlightColor: "#3b82f6",
    highlightTextColor: "#ffffff",
    subtitleColor: "#6b7280",
    accentColor: "#3b82f6",
    authorColor: "#9ca3af",
    fontHeading: "var(--font-plus-jakarta)",
    fontBody: "var(--font-inter)",
    defaultDecoration: "none",
    preview: {
      bg: "#ffffff",
      accent: "#3b82f6",
    },
  },
  "forest-dark": {
    id: "forest-dark",
    name: "Forest Dark",
    description: "Deep green woodland tones",
    bgColor: "#0d1f14",
    bgGradient: "linear-gradient(135deg, #122c1c 0%, #0d1f14 50%, #0a1810 100%)",
    textColor: "#d4f0d8",
    highlightColor: "#4caf50",
    highlightTextColor: "#ffffff",
    subtitleColor: "#81c784",
    accentColor: "#66bb6a",
    authorColor: "#4a6e4d",
    fontHeading: "var(--font-space-grotesk)",
    fontBody: "var(--font-inter)",
    defaultDecoration: "none",
    preview: {
      bg: "#0d1f14",
      accent: "#4caf50",
    },
  },
  "coral-sunset": {
    id: "coral-sunset",
    name: "Coral Sunset",
    description: "Warm coral and peach tones",
    bgColor: "#1a0f0f",
    bgGradient: "linear-gradient(135deg, #221313 0%, #1a0f0f 50%, #140b0b 100%)",
    textColor: "#f5dbd9",
    highlightColor: "#ff6b6b",
    highlightTextColor: "#ffffff",
    subtitleColor: "#d4a0a0",
    accentColor: "#ff8a80",
    authorColor: "#8a6060",
    fontHeading: "var(--font-outfit)",
    fontBody: "var(--font-poppins)",
    defaultDecoration: "none",
    preview: {
      bg: "#1a0f0f",
      accent: "#ff6b6b",
    },
  },
  "ocean-deep": {
    id: "ocean-deep",
    name: "Ocean Deep",
    description: "Deep sea blues and teals",
    bgColor: "#0a1a2e",
    bgGradient: "linear-gradient(135deg, #0e263e 0%, #0a1a2e 50%, #071525 100%)",
    textColor: "#d0ecf8",
    highlightColor: "#06b6d4",
    highlightTextColor: "#ffffff",
    subtitleColor: "#7bbdd4",
    accentColor: "#22d3ee",
    authorColor: "#456b80",
    fontHeading: "var(--font-poppins)",
    fontBody: "var(--font-dm-sans)",
    defaultDecoration: "none",
    preview: {
      bg: "#0a1a2e",
      accent: "#06b6d4",
    },
  },
};

export function createDefaultSlides(): SlideData[] {
  return [
    {
      id: crypto.randomUUID(),
      type: "cover",
      heading: "How to create content that actually attracts customers",
      highlightWords: ["content", "attracts"],
      subtitle: "(Even if you hate marketing)",
      bodyItems: [],
    },
    {
      id: crypto.randomUUID(),
      type: "content",
      heading: "Most educational content fails",
      highlightWords: ["fails"],
      subtitle: "",
      bodyItems: [
        "It tells people WHAT to do",
        "But never shows them HOW",
        "So it entertains but doesn't convert",
      ],
      number: "01",
    },
    {
      id: crypto.randomUUID(),
      type: "content",
      heading: "The fix is simple: Add context",
      highlightWords: ["context"],
      subtitle: "Here's what that means:",
      bodyItems: [
        "Share the specific steps, not just the advice",
        "Include real examples from your experience",
        "Show the before and after",
      ],
      number: "02",
    },
    {
      id: crypto.randomUUID(),
      type: "list",
      heading: "3 types of context that convert",
      highlightWords: ["convert"],
      subtitle: "",
      bodyItems: [
        "Process breakdowns \u2192 Show your exact workflow",
        "Case studies \u2192 Share real client results",
        "Frameworks \u2192 Give them a repeatable system",
      ],
      number: "03",
    },
    {
      id: crypto.randomUUID(),
      type: "cta",
      heading: "Want more content strategies that work?",
      highlightWords: ["work"],
      subtitle: "Follow me for weekly tips on content that converts.",
      bodyItems: ["Like this post if it helped", "Save it for later", "Share with a friend who needs this"],
    },
  ];
}
