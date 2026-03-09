import { SlideData } from "./types";

/**
 * Parse markdown into slides. Expected format:
 *
 * ---
 * # Cover Heading
 * *highlight1, highlight2*
 * > Subtitle text
 * ---
 * ## 01 | Content Heading
 * *highlight*
 * > Optional subtitle
 * - Bullet point one
 * - Bullet point two
 * ---
 * ## 03 | List Heading (list)
 * - First item
 * - Second item
 * ---
 * # CTA Heading (cta)
 * > Follow me for more
 * - Like this post
 * - Share with a friend
 * ---
 *
 * Slide types: First slide = "cover", last slide = "cta" (auto-detected),
 * or specify in parens: (list), (content), (quote), (cta)
 * Use ## NN | for slide numbers, # for covers
 * *words* on its own line = highlight words (comma separated)
 * > text = subtitle
 * - text = bullet points
 */
export function parseMarkdownToSlides(markdown: string): SlideData[] {
  const raw = markdown.trim();
  if (!raw) return [];

  // Split by --- separators
  const blocks = raw
    .split(/^---$/m)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length === 0) return [];

  const slides: SlideData[] = [];

  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let heading = "";
    let subtitle = "";
    let highlightWords: string[] = [];
    let bodyItems: string[] = [];
    let number: string | undefined;
    let type: SlideData["type"] = "content";

    for (const line of lines) {
      // Heading line: # or ##
      if (/^#{1,2}\s/.test(line)) {
        let h = line.replace(/^#{1,2}\s*/, "");

        // Check for explicit type in parens at end: (list), (cta), etc
        const typeMatch = h.match(/\((cover|content|list|quote|cta)\)\s*$/i);
        if (typeMatch) {
          type = typeMatch[1].toLowerCase() as SlideData["type"];
          h = h.replace(/\s*\((?:cover|content|list|quote|cta)\)\s*$/i, "");
        }

        // Check for ## NN | pattern (slide number)
        const numMatch = h.match(/^(\d{1,2})\s*\|\s*/);
        if (numMatch) {
          number = numMatch[1].padStart(2, "0");
          h = h.replace(/^\d{1,2}\s*\|\s*/, "");
        }

        // # means cover
        if (line.startsWith("# ") && !line.startsWith("## ")) {
          type = typeMatch ? type : "cover";
        }

        heading = h.trim();
      }
      // Highlight words: *word1, word2*
      else if (/^\*[^*]+\*$/.test(line)) {
        const inner = line.slice(1, -1);
        highlightWords = inner.split(",").map((w) => w.trim()).filter(Boolean);
      }
      // Subtitle: > text
      else if (line.startsWith("> ")) {
        subtitle = line.replace(/^>\s*/, "");
      }
      // Bullet: - text
      else if (line.startsWith("- ")) {
        bodyItems.push(line.replace(/^-\s*/, ""));
      }
      // Numbered bullet: 1. text
      else if (/^\d+\.\s/.test(line)) {
        bodyItems.push(line.replace(/^\d+\.\s*/, ""));
      }
      // Fallback: if no heading yet, treat as heading
      else if (!heading) {
        heading = line;
      }
    }

    // Auto-detect list type if has bullets and no explicit type set
    if (bodyItems.length > 0 && type === "content" && !lines.some((l) => /\((list|quote|cta)\)/i.test(l))) {
      // If all items contain arrows or numbered format, make it a list
      if (bodyItems.some((item) => /→|->|=>/.test(item))) {
        type = "list";
      }
    }

    slides.push({
      id: crypto.randomUUID(),
      type,
      heading: heading || "Untitled Slide",
      highlightWords,
      subtitle,
      bodyItems,
      number,
    });
  }

  return slides;
}

export const MARKDOWN_EXAMPLE = `# How to create content that actually attracts customers
*content, attracts*
> (Even if you hate marketing)
---
## 01 | Most educational content fails
*fails*
- It tells people WHAT to do
- But never shows them HOW
- So it entertains but doesn't convert
---
## 02 | The fix is simple: Add context
*context*
> Here's what that means:
- Share the specific steps, not just the advice
- Include real examples from your experience
- Show the before and after
---
## 03 | 3 types of context that convert (list)
*convert*
- Process breakdowns → Show your exact workflow
- Case studies → Share real client results
- Frameworks → Give them a repeatable system
---
# Want more content strategies that work? (cta)
*work*
> Follow me for weekly tips on content that converts.
- Like this post if it helped
- Save it for later
- Share with a friend who needs this`;
