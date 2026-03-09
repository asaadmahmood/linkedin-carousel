"use client";

import React from "react";
import { SlideData, SlideImage, ThemeConfig, DecorationStyle, AspectRatio, BackgroundPattern, TextAlign } from "@/lib/types";
import DraggableImage from "./DraggableImage";

interface SlideRendererProps {
  slide: SlideData;
  theme: ThemeConfig;
  authorName: string;
  authorHandle: string;
  brandLabel: string;
  slideIndex: number;
  totalSlides: number;
  scale?: number;
  fontHeadingOverride?: string;
  fontBodyOverride?: string;
  decoration?: DecorationStyle;
  backgroundPattern?: BackgroundPattern;
  aspectRatio?: AspectRatio;
  textAlign?: TextAlign;
  interactive?: boolean;
  interactiveScale?: number;
  onImageChange?: (image: SlideImage | undefined) => void;
}

function renderHighlightedText(
  text: string,
  highlightWords: string[],
  theme: ThemeConfig
) {
  if (!highlightWords.length) return text;
  const escapedWords = highlightWords.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isHighlighted = highlightWords.some(
      (w) => w.toLowerCase() === part.toLowerCase()
    );
    if (isHighlighted) {
      return (
        <span key={i} className="highlight-box" style={{ backgroundColor: theme.highlightColor, color: theme.highlightTextColor }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

// ===== REAL SVG ARROW PATHS (from src/svgs/arrows/) =====

// arrows_60 - clean diagonal arrow pointing top-right
const ARROW_60 = {
  viewBox: "0 0 158 133",
  paths: [
    "M3.87481 131.229C-0.135066 128.774 -1.3584 122.948 1.75934 119.27C4.91001 115.316 10.2657 115.238 14.8682 114.496C28.421 112.188 40.8803 106.15 52.7814 99.4888C91.5111 78.421 119.814 43.563 141.917 6.13965C145.976 -3.77006 161.209 2.51755 156.847 12.3937C133.99 52.1154 104.064 88.9133 63.7378 111.874C48.4639 120.815 32.1094 128.473 14.4283 130.918C11.565 133.362 7.00103 133.22 3.87481 131.229Z",
    "M139.131 56.8336C136.164 43.5574 137.477 30.0248 138.375 16.6076C124.441 19.7532 110.757 23.8758 97.0118 27.7545C92.773 28.9306 88.2502 26.1364 87.1687 21.9371C86.0557 17.6036 88.7475 13.2702 92.9861 12.0941C106.618 8.29743 120.171 4.30332 133.953 1.0597C139.733 -0.560497 146.651 -0.870674 150.862 4.1449C158.813 15.0516 151.615 29.8522 153.482 42.2965C153.673 49.2437 158.387 59.9447 148.974 62.651C144.857 63.7007 140.031 61.1423 139.131 56.8336Z",
  ],
};

// arrows_02 - diagonal slash arrow
const ARROW_02 = {
  viewBox: "0 0 124 123",
  paths: [
    "M45.1954 97.757C31.0008 93.4933 28.3454 64.7202 22.017 52.2947C18.3581 38.3905 -5.80841 20.2228 1.30162 6.67377C13.0043 -7.97124 32.7023 5.71616 47.1707 8.00723C56.1987 11.6635 81.2134 7.68049 79.0118 21.9003C76.9737 30.8698 66.7987 27.6114 60.5022 26.6439C46.227 25.2503 32.7148 20.7057 19.0411 16.73C25.4558 26.6593 33.1789 35.8727 37.3268 47.0966C41.9815 58.7409 44.8851 71.1201 50.311 82.4459C58.8331 86.2909 54.3904 99.8977 45.1954 97.757Z",
    "M108.859 119.313C92.9694 102.156 76.1057 85.9492 60.2705 68.7274C43.3362 51.7241 24.5324 35.8777 10.2319 16.5817C3.73918 5.27143 21.2926 -3.23045 24.9988 9.70747C55.7813 43.8355 90.0835 74.762 121.085 108.744C127.961 116.552 115.687 127.305 108.859 119.313Z",
  ],
};

// arrows_50 - diagonal line with arrowhead
const ARROW_50 = {
  viewBox: "0 0 190 169",
  paths: [
    "M7.89104 168.505C4.56476 168.474 1.42682 166.201 0.375654 163.051C-2.42665 152.581 11.1731 147.751 17.1735 141.526C33.7847 127.833 51.4704 115.528 68.5678 102.468C105.67 75.8179 136.923 42.1868 173.445 14.877C184.697 8.85456 191.415 25.0026 179.875 30.1234C148.406 54.0859 121.364 83.2512 89.4371 106.661C69.586 122.525 48.5837 136.854 28.8479 152.861C24.5608 156.307 20.1743 159.666 15.9936 163.251C14.7766 166.498 11.4562 168.682 7.89104 168.505Z",
    "M174.838 72.5011C153.726 70.0572 186.953 21.8106 166.012 17.144C155.951 14.4504 125.101 23.0071 128.946 5.42337C132.076 -3.46589 142.904 1.4919 149.879 0.498722C162.689 0.618549 179.455 -0.967093 185.565 13.1196C191.161 23.2512 189.401 35.2289 186.948 46.0117C183.534 54.1608 186.924 72.5706 174.838 72.5011Z",
  ],
};

// arrows_10 - spiral arrow
const ARROW_10 = {
  viewBox: "0 0 393 391",
  paths: [
    "M173.464 390.938C104.009 383.124 0.337841 288.192 0.764006 214.969C-5.4551 155.116 27.0531 95.2451 70.6226 56.0213C101.214 27.7293 141.609 14.3214 181.169 3.86871C239.361 -9.87103 299.545 14.9353 347.065 47.5734C355.63 55.7546 396.946 77.5108 386.238 90.0018C383.27 93.1907 377.997 93.4433 374.816 90.4039C331.991 51.1391 278.064 19.7753 219.068 15.9654C169.847 17.9279 118.7 36.2852 81.0656 68.366C30.6435 112.78 0.0549394 186.808 25.0506 252.204C50.4017 304.765 119.033 369.173 178.752 375.05C282.211 369.471 350.521 305.886 322.374 198.786C292.004 48.3073 58.9302 56.7761 96.2548 227.515C104.113 260.029 128.843 292.971 163.232 299.121C196.7 303.573 234.182 294.329 255.789 266.949C281.75 237.289 264.177 188.616 231.971 171.121C216.564 162.015 198.35 152.992 180.038 157.229C150.243 164.261 141.919 201.387 161.432 223.359C173.168 242.247 201.201 254.174 220.202 239.076C220.079 239.224 219.957 239.372 219.835 239.52C219.724 239.626 219.613 239.731 219.538 239.881C231.83 222.004 211.94 177.386 188.651 198.407C192.475 213.315 170.044 212.052 171.775 197.967C173.305 185.671 186.65 178.738 197.77 176.859C232.053 173.36 250.074 224.202 232.682 249.298C190.727 288.406 123.071 231.33 135.74 181.611C169.794 86.6761 308.263 172.666 281.746 253.245C262.964 305.636 196.853 327.079 146.469 311.482C113.636 298.747 89.6527 267.069 81.1068 233.464C53.3978 130.713 135.505 50.6877 236.895 82.2914C318.505 105.175 355.219 198.649 341.861 276.948C327.827 352.962 244.6 391.679 173.464 390.938Z",
    "M344.459 96.9916C343.733 92.7766 346.677 88.2379 351.05 87.6537C359.382 86.6498 367.839 86.0608 375.951 83.798C375.031 71.7189 374.191 59.6169 373.989 47.5002C372.768 39.0753 377.618 29.278 387.06 34.7684C389.85 36.8821 391.285 40.587 390.147 43.9749C390.16 56.7383 391.011 69.5228 392.008 82.2389C392.783 87.3244 391.667 93.0308 387.178 96.1003C377.453 102.415 364.902 101.761 353.805 103.582C349.525 104.177 345.216 101.477 344.459 96.9916Z",
  ],
};

// arrows_03 - horizontal wavy arrow with endpoints
const ARROW_03 = {
  viewBox: "0 0 261 103",
  paths: [
    "M59.0746 101.235C48.534 91.983 36.8986 84.4846 24.6198 77.7674C15.0454 70.0829 -9.59787 58.7027 4.00285 44.3936C15.9809 34.0231 29.1422 25.0803 41.2831 14.8871C49.5819 10.0431 60.2247 -4.47077 70.4968 1.35935C73.4963 3.63264 74.6645 7.13734 73.5357 10.7526C72.6029 13.9392 69.7313 16.1676 66.4729 16.375C49.9608 27.9075 34.6831 41.1362 18.5329 53.1723C34.5946 68.2198 59.3476 74.4761 71.5938 93.0326C73.1778 99.7738 64.6317 105.503 59.0746 101.235Z",
    "M6.5338 63.7675C-5.94805 39.8592 48.6553 51.5039 60.0779 50.1736C87.8835 50.6142 115.547 49.97 143.255 47.587C173.601 46.7985 203.823 42.9802 234.211 44.4446C241.531 44.4322 254.103 42.5869 253.746 53.3009C253.232 59.4939 247.076 61.495 241.709 60.5623C233.135 60.5778 224.559 60.439 215.985 60.2856C198.952 60.2594 181.974 61.8559 164.978 62.8822C118.17 65.6708 71.4202 68.0077 24.5421 64.8573C18.2898 63.6758 11.4948 69.7674 6.5338 63.7675Z",
    "M207.944 100.862C204.707 97.9649 204.321 92.6842 207.312 89.4559C214.702 81.4766 222.708 74.0703 230.532 66.5161C235.559 60.7495 243.512 55.5615 244.864 47.6705C237.134 36.3515 223.932 30.1427 212.756 22.6971C202.325 22.924 202.071 6.33063 212.349 5.8877C221.63 6.81217 228.877 14.4989 236.848 18.8501C261.945 34.8358 270.879 51.4114 246.084 73.8113C240.29 79.5828 234.362 85.2137 228.502 90.9122C222.759 95.733 216.392 107.719 207.944 100.862Z",
  ],
};

// arrows_15 - simple clean curve
const ARROW_15 = {
  viewBox: "0 0 127 143",
  paths: [
    "M112.095 139.583C86.8818 111.555 72.1358 31.1352 42.7207 16.1228C31.5729 21.9838 17.2006 88.089 16.0377 102.526C23.1094 117.036 0.0837106 120.09 0.0137945 104.523C-0.385091 84.2187 7.96443 64.7869 12.3916 45.1798C17.7046 27.8687 22.5989 -1.86101 46.2326 0.0915888C76.7448 8.61732 91.393 67.0097 104.933 93.4721C110.596 105.84 116.172 118.434 124.532 129.26C131.216 137.24 118.709 147.744 112.095 139.583Z",
  ],
};

// arrows_110 - horizontal dashed arrow
const ARROW_110 = {
  viewBox: "0 0 410 87",
  paths: [
    "M43.8336 84.2706C35.6756 75.5471 27.1252 67.2185 17.5889 59.9901C7.12436 52.7974 -5.35992 39.9668 2.44058 26.5849C7.18478 18.8501 34.3571 -2.02353 43.1944 0.159024C48.4994 1.60261 51.2126 8.89754 47.4096 13.1673C45.6478 15.3403 43.2251 17.2107 40.3622 17.1464C32.6284 21.4637 24.8424 26.8727 18.18 32.5454C11.4489 38.6485 27.8994 46.3504 31.5912 50.4633C40.2204 57.2523 47.9473 65.0631 55.4603 73.0379C62.6814 80.6861 51.2495 91.789 43.8336 84.2706Z",
    "M40.6425 49.2862C32.0323 49.304 23.4209 48.9586 14.8291 48.5157C12.1306 49.3325 9.14547 48.4747 6.95382 46.8076C1.34476 42.6726 4.15414 33.1028 11.0425 32.4639C29.3246 33.0179 47.7291 33.0638 66.0665 32.8838C76.5934 33.2198 76.3486 49.1534 65.7907 49.0494C57.4115 48.702 49.0205 49.3246 40.6425 49.2862Z",
    "M88.0887 42.7057C81.9371 28.4779 100.918 29.1128 109.898 29.3886C124.618 29.4646 139.359 29.9688 154.069 30.2963C160.62 30.3107 164.402 38.3644 160.242 43.4244C155.57 49.3731 137.986 45.045 130.302 45.9093C120.413 45.6435 110.5 45.3627 100.61 45.6553C96.159 47.0297 90.7565 47.6794 88.0887 42.7057Z",
    "M182.981 47.4934C174.905 47.5557 172.172 35.8952 178.252 31.3747C182.393 28.163 188.112 28.9638 193.037 28.9125C208.493 29.3698 223.948 30.1768 239.421 30.0679C249.524 29.6589 250.756 45.0682 240.681 46.1753C223.442 46.4687 206.164 45.231 188.921 45.0298C187.354 46.5762 185.173 47.5344 182.981 47.4934Z",
    "M319.918 46.3254C302.427 42.8953 284.438 43.5035 266.899 43.9721C260.659 42.1927 259.079 33.5574 264.356 29.7317C269.735 26.3769 276.842 27.9498 282.922 27.3331C296.129 27.086 309.371 28.1052 322.388 30.3484C332.786 32.1525 330.323 47.9111 319.918 46.3254Z",
    "M401.051 48.0434C389.461 47.1179 378.702 45.8501 367.165 45.7544C360.97 45.4836 351.626 47.105 349.594 39.3138C348.163 34.0396 352.545 29.2869 357.724 28.9258C370.717 29.9335 384.018 30.057 397.12 31.5242C402.652 31.3623 409.509 33.3855 409.268 40.1027C409.206 44.3001 405.405 48.4096 401.051 48.0434Z",
  ],
};

// arrows_105 - clean diagonal line
const ARROW_105 = {
  viewBox: "0 0 255 136",
  paths: [
    "M3.90813 134.755C-12.0263 119.713 25.3108 111.109 34.5749 105.905C66.7767 91.8506 99.9643 80.1669 132.035 65.8163C167.078 48.1669 205.092 34.3926 239.589 16.3538C252.513 9.75605 258.637 27.6673 243.394 32.8048C222.051 44.0101 199.314 52.2301 177.468 62.372C137.989 82.012 96.9453 97.9387 56.084 114.405C42.399 120.44 28.1432 125.354 14.964 132.456C12.2265 135.653 7.67128 137.114 3.90813 134.755Z",
    "M162.645 115.264C152.633 105.919 171.372 94.4236 176.39 86.8418C196.261 63.1921 228.606 47.3525 238.665 16.89C212.316 14.9916 185.782 17.1942 159.401 17.8412C147.921 24.2116 138.173 5.6109 152.535 2.12863C173.584 0.975216 194.765 0.338698 215.88 0.0756029C227.713 0.891561 242.676 -2.77136 252.016 6.20196C264.923 28.1077 230.389 58.5094 215.445 71.8591C205.709 80.5695 196.16 89.4428 187.183 98.9357C180.076 104.462 173.268 122.453 162.645 115.264Z",
  ],
};

// Helper to render SVG arrows
function SvgArrow({
  arrow, x, y, w, h, color, opacity, rotate, flipX,
}: {
  arrow: { viewBox: string; paths: string[] };
  x: number; y: number; w: number; h: number;
  color: string; opacity: number; rotate?: number; flipX?: boolean;
}) {
  const transforms = [
    rotate ? `rotate(${rotate}deg)` : "",
    flipX ? "scaleX(-1)" : "",
  ].filter(Boolean).join(" ");

  return (
    <svg viewBox={arrow.viewBox} fill="none" style={{
      position: "absolute", left: x, top: y, width: w, height: h,
      opacity, pointerEvents: "none", transform: transforms || undefined,
    }}>
      {arrow.paths.map((d, i) => <path key={i} d={d} fill={color} />)}
    </svg>
  );
}

// ===== DECORATION COMPONENTS =====

function DecoSketchArrow({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <SvgArrow arrow={ARROW_60} x={820} y={780} w={200} h={170} color={color} opacity={0.12} />
      <SvgArrow arrow={ARROW_15} x={60} y={140} w={60} h={70} color={color} opacity={0.06} rotate={180} />
    </div>
  );
}

function DecoSwoosh({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <SvgArrow arrow={ARROW_03} x={380} y={850} w={350} h={140} color={color} opacity={0.08} />
      <SvgArrow arrow={ARROW_105} x={750} y={100} w={120} h={70} color={color} opacity={0.05} rotate={15} />
    </div>
  );
}

function DecoDoodle({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <SvgArrow arrow={ARROW_02} x={880} y={60} w={90} h={90} color={color} opacity={0.1} />
      <SvgArrow arrow={ARROW_15} x={40} y={900} w={70} h={80} color={color} opacity={0.08} />
      <SvgArrow arrow={ARROW_60} x={900} y={900} w={100} h={85} color={color} opacity={0.06} rotate={-30} />
    </div>
  );
}

function DecoCornerAccent({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <SvgArrow arrow={ARROW_50} x={850} y={50} w={160} h={140} color={color} opacity={0.1} flipX />
      <SvgArrow arrow={ARROW_02} x={30} y={900} w={100} h={100} color={color} opacity={0.07} rotate={90} />
    </div>
  );
}

function DecoSpiral({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <SvgArrow arrow={ARROW_10} x={600} y={600} w={400} h={400} color={color} opacity={0.06} />
    </div>
  );
}

function DecoGradientOrb({ color }: { color: string }) {
  return (
    <div style={{
      position: "absolute", bottom: -120, right: -120, width: 400, height: 400,
      borderRadius: "50%", background: `radial-gradient(circle, ${color}30, transparent 70%)`,
      pointerEvents: "none",
    }} />
  );
}

function DecoUnderline({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <SvgArrow arrow={ARROW_110} x={80} y={830} w={500} h={110} color={color} opacity={0.08} />
    </div>
  );
}

function SwipeArrow({ color }: { color: string }) {
  return (
    <svg viewBox={ARROW_50.viewBox} fill="none" style={{
      position: "absolute", top: "50%", right: 24, width: 50, height: 44,
      transform: "translateY(-50%) scaleX(-1)", opacity: 0.35, zIndex: 10,
    }}>
      {ARROW_50.paths.map((d, i) => <path key={i} d={d} fill={color} />)}
    </svg>
  );
}

// Background patterns using SVG data URIs (sourced from heropatterns.com, open source)
function getPatternBackground(pattern: BackgroundPattern, accentColor: string): string | null {
  if (pattern === "none") return null;
  // URL-encode the color
  const c = encodeURIComponent(accentColor);
  const patterns: Record<string, string> = {
    dots: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${c}' fill-opacity='0.07' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
    grid: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='${c}' fill-opacity='0.06'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    diagonal: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${c}' fill-opacity='0.06' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
    cross: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${c}' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    waves: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${c}' fill-opacity='0.06'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    stripes: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${c}' fill-opacity='0.06' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
  };
  return patterns[pattern] || null;
}

function SlideDecoration({ decoration, color, isCover }: { decoration: DecorationStyle; color: string; isCover: boolean }) {
  if (decoration === "none") return null;
  const coverOnly = decoration === "sketch-arrow" || decoration === "swoosh";
  if (coverOnly && !isCover) return null;

  switch (decoration) {
    case "sketch-arrow": return <DecoSketchArrow color={color} />;
    case "swoosh": return <DecoSwoosh color={color} />;
    case "doodle": return <DecoDoodle color={color} />;
    case "corner-accent": return <DecoCornerAccent color={color} />;
    case "spiral": return <DecoSpiral color={color} />;
    case "gradient-orb": return <DecoGradientOrb color={color} />;
    case "underline": return <DecoUnderline color={color} />;
    default: return null;
  }
}

export default function SlideRenderer({
  slide, theme, authorName, authorHandle, brandLabel,
  slideIndex, totalSlides, scale = 1,
  fontHeadingOverride, fontBodyOverride,
  decoration = theme.defaultDecoration,
  backgroundPattern = "none",
  aspectRatio = "square",
  textAlign = "left",
  interactive = false,
  interactiveScale,
  onImageChange,
}: SlideRendererProps) {
  const isCover = slide.type === "cover";
  const isCta = slide.type === "cta";
  const headingFont = fontHeadingOverride || theme.fontHeading;
  const bodyFont = fontBodyOverride || theme.fontBody;
  const centered = textAlign === "center";

  // Sans-serif fonts use 600 weight, serif fonts use 800
  const serifFonts = ["var(--font-playfair)", "var(--font-lora)", "var(--font-merriweather)", "var(--font-caveat)"];
  const headingWeight = serifFonts.includes(headingFont) ? 800 : 600;
  const slideHeight = aspectRatio === "portrait" ? 1350 : 1080;
  const patternBg = getPatternBackground(backgroundPattern, theme.accentColor);

  return (
    <div className="slide-container" style={{
      transform: `scale(${scale})`, transformOrigin: "top left",
      fontFamily: bodyFont, width: 1080, height: slideHeight,
    }}>
      <div style={{
        width: 1080, height: slideHeight, backgroundColor: theme.bgColor,
        ...(theme.bgGradient ? { background: theme.bgGradient } : {}),
        color: theme.textColor, position: "relative", display: "flex",
        flexDirection: "column", padding: "80px 80px 60px",
        overflow: "hidden", textAlign: centered ? "center" : "left",
        ...(centered ? { alignItems: "center" } : {}),
      }}>
        {/* Background pattern overlay with radial fade mask */}
        {patternBg && (
          <div style={{
            position: "absolute", inset: 0, backgroundImage: patternBg,
            pointerEvents: "none", zIndex: 1,
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, black 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, black 70%)",
          }} />
        )}
        <SlideDecoration decoration={decoration} color={theme.accentColor} isCover={isCover} />

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: isCover ? 60 : 40, fontSize: 24, color: theme.authorColor,
          fontFamily: bodyFont, position: "relative", zIndex: 10, width: "100%",
        }}>
          <span style={{ fontWeight: 600 }}>{authorName}</span>
          <span style={{ opacity: 0.7 }}>{brandLabel}</span>
        </div>

        {/* Slide number badge */}
        {slide.number && !isCover && !isCta && (
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: "50%",
            backgroundColor: theme.highlightColor, color: theme.highlightTextColor,
            fontSize: 22, fontWeight: 700, marginBottom: 32,
            fontFamily: headingFont, position: "relative", zIndex: 10,
            lineHeight: 1,
          }}>
            {slide.number}
          </div>
        )}

        {/* Heading */}
        <h1 style={{
          fontSize: isCover ? 72 : 58, fontWeight: headingWeight, lineHeight: 1.15,
          marginBottom: slide.subtitle ? 24 : 36, fontFamily: headingFont,
          maxWidth: centered ? "100%" : "95%", letterSpacing: "-0.02em", position: "relative", zIndex: 10,
          ...(centered && isCover ? { marginTop: "auto" } : {}),
        }}>
          {renderHighlightedText(slide.heading, slide.highlightWords, theme)}
        </h1>

        {/* Subtitle */}
        {slide.subtitle && (
          <p style={{
            fontSize: isCover ? 32 : 28, color: theme.subtitleColor,
            marginBottom: 32, lineHeight: 1.5, fontFamily: bodyFont,
            position: "relative", zIndex: 10,
            ...(centered && isCover ? { marginBottom: "auto" } : {}),
          }}>
            {slide.subtitle}
          </p>
        )}

        {/* Body items */}
        {slide.bodyItems.length > 0 && (
          <div style={{
            marginTop: isCta ? "auto" : 0, marginBottom: isCta ? "auto" : 40,
            position: "relative", zIndex: 10,
            ...(centered ? { display: "flex", flexDirection: "column" as const, alignItems: "center" } : {}),
          }}>
            {slide.bodyItems.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: centered ? "center" : "flex-start",
                justifyContent: centered ? "center" : "flex-start", gap: 18,
                marginBottom: slide.type === "list" ? 36 : 28,
                fontSize: slide.type === "list" ? 34 : 32, lineHeight: 1.55,
                color: isCta ? theme.subtitleColor : theme.textColor, fontFamily: bodyFont,
              }}>
                {slide.type === "list" ? (
                  <>
                    <span style={{ color: theme.highlightColor, fontWeight: 700, fontSize: 36, flexShrink: 0, width: 40 }}>{i + 1}.</span>
                    <span>{item}</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: theme.accentColor, fontSize: 16, marginTop: centered ? 0 : 10, flexShrink: 0 }}>{"\u25CF"}</span>
                    <span>{item}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "auto", display: "flex", justifyContent: centered ? "center" : "space-between",
          alignItems: "center", fontSize: 22, color: theme.authorColor,
          position: "relative", zIndex: 10, width: "100%",
          ...(centered ? { gap: 24 } : {}),
        }}>
          <span>{authorHandle}</span>
          {!centered && <span>{slideIndex + 1} / {totalSlides}</span>}
        </div>

        {/* Per-slide image */}
        {slide.image && (
          <DraggableImage
            image={slide.image}
            onChange={(updated) => onImageChange?.(updated)}
            onRemove={() => onImageChange?.(undefined)}
            scale={interactiveScale ?? scale}
            interactive={interactive}
            slideWidth={1080}
            slideHeight={slideHeight}
          />
        )}

      </div>
    </div>
  );
}
