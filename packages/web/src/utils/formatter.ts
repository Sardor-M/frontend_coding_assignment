import type { Citation } from "@/types/chat";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function extractCitations(text: string): Citation[] {
  const regex = /\[(\d+)-(\d+)\]/g;
  const citationMap = new Map<number, Set<number>>();
  let match;

  while ((match = regex.exec(text)) !== null) {
    const docNum = parseInt(match[1]);
    const index = parseInt(match[2]);

    if (!citationMap.has(docNum)) {
      citationMap.set(docNum, new Set());
    }
    citationMap.get(docNum)!.add(index);
  }

  return Array.from(citationMap.entries()).map(([docNum, indicesSet]) => ({
    docNum,
    indices: Array.from(indicesSet).sort((a, b) => a - b),
  }));
}

export function parseMarkdownWithCitations(content: string): {
  text: string;
  citations: Citation[];
} {
  const citations = extractCitations(content);
  const text = content.replace(/\[\d+-\d+\]/g, "");
  return { text, citations };
}

export function validateMarkdownStructure(markdown: string): boolean {
  const headingRegex = /^(#{1,3}\s)/gm;
  const bulletRegex = /^-\s/gm;
  return headingRegex.test(markdown) && bulletRegex.test(markdown);
}
