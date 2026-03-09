"use client";

import React, { useState, useCallback } from "react";

/**
 * LinkedIn collapses consecutive newlines. To preserve line breaks,
 * we insert a zero-width space on otherwise-empty lines.
 */
function formatForLinkedIn(text: string): string {
  return text
    .split("\n")
    .map((line) => (line.trim() === "" ? "\u200B" : line))
    .join("\n");
}

export default function LinkedInFormatter() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const formatted = formatForLinkedIn(input);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = formatted;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [formatted]);

  const charCount = input.length;
  const lineCount = input.split("\n").length;

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-[#0c0c0f]">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 tabular-nums">
            {charCount} char{charCount !== 1 ? "s" : ""} · {lineCount} line{lineCount !== 1 ? "s" : ""}
          </span>
          {charCount > 3000 && (
            <span className="text-sm text-amber-400 font-medium">
              LinkedIn limit is ~3,000 characters
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={!input.trim()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-base font-semibold text-white transition-all flex items-center gap-2.5 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
        >
          {copied ? (
            <>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8.5l3 3 7-7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="5" width="8" height="8" rx="1.5" />
                <path d="M3 11V3.5A1.5 1.5 0 014.5 2H11" />
              </svg>
              Copy for LinkedIn
            </>
          )}
        </button>
      </div>

      {/* Two-pane editor */}
      <div className="flex-1 flex min-h-0">
        {/* Input */}
        <div className="flex-1 flex flex-col border-r border-white/[0.06]">
          <div className="px-5 py-2.5 border-b border-white/[0.04]">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Your Text</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 w-full bg-transparent px-6 py-5 text-base text-white/90 leading-relaxed focus:outline-none resize-none placeholder:text-zinc-600 font-sans"
            placeholder={"Paste your LinkedIn post here...\n\nLine breaks will be preserved when you copy.\n\n→ Bullet points\n→ Spacing\n→ Everything stays intact"}
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col">
          <div className="px-5 py-2.5 border-b border-white/[0.04]">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">LinkedIn Preview</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[560px] mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Fake LinkedIn post header */}
              <div className="flex items-center gap-3 p-4 pb-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-violet-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Your Name</div>
                  <div className="text-xs text-gray-500">Your headline · 1m</div>
                </div>
              </div>
              {/* Post body */}
              <div className="px-4 py-3">
                {input.trim() ? (
                  <div className="text-[14px] text-gray-900 leading-[1.6] whitespace-pre-wrap break-words">
                    {input}
                  </div>
                ) : (
                  <div className="text-[14px] text-gray-400 italic">
                    Your formatted post will appear here...
                  </div>
                )}
              </div>
              {/* Fake engagement bar */}
              <div className="flex items-center gap-1 px-4 py-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">👍 ❤️ 42</span>
                <span className="ml-auto text-xs text-gray-400">12 comments · 3 reposts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
