import { REGEX } from "@/constants/regex";
import { iconsSvg } from "@/ui/icons";
import type { CommonLabels } from "@/types/label";
import { RawHit } from "@/types/board"; // Rettet import

/**
 * Udtrækker labels fra rå tekst baseret på [label1, label2] format
 */
function extractLabels(text: string): string[] {
  const match = text.match(REGEX.LABEL_PATTERN);

  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label.length > 0);
}

/**
 * Tæller forekomster af labels på tværs af alle rå hits
 */
export function countLabels(hits: RawHit[]): Map<string, number> {
  const labelCounts = new Map<string, number>();

  for (const hit of hits) {
    const labels = extractLabels(hit.text);

    for (const label of labels) {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
    }
  }

  return labelCounts;
}

/**
 * Returnerer det korrekte SVG ikon baseret på label-navn
 */
export function getLabelIconSvg(label: string): string {
  const iconMap: Record<CommonLabels, string> = {
    todo: iconsSvg.board,
    bug: iconsSvg.bug,
    fixme: iconsSvg.code,
    refactor: iconsSvg.code,
    security: iconsSvg.security,
    reviewed: iconsSvg.code,
    reviewrequest: iconsSvg.code,
    temp: iconsSvg.clock,
    optimize: iconsSvg.rocket,
    issue: iconsSvg.code,
    task: iconsSvg.code,
    doc: iconsSvg.code,
    test: iconsSvg.test,
    link: iconsSvg.code,
    hack: iconsSvg.code,
    deprecated: iconsSvg.trash,
  };

  const lowerLabel = label.replace(/^@/, "").toLowerCase() as CommonLabels;

  return Object.hasOwn(iconMap, lowerLabel) ? iconMap[lowerLabel] : iconsSvg.tag;
}

export function getLabelColor(label: string): { background: string; text: string } {
  const colorMap: Record<string, { background: string; text: string }> = {
    "urgent": { background: "#DC2626", text: "#FFFFFF" },         
    "high priority": { background: "#EF4444", text: "#FFFFFF" }, 
    "low priority": { background: "#7a94b9", text: "#FFFFFF" },  
    "bug": { background: "#DC2626", text: "#FFFFFF" },           
    "fixme": { background: "#B91C1C", text: "#FFFFFF" },       
    "wontfix": { background: "#0F172A", text: "#FFFFFF" },      
    "wip": { background: "#F59E0B", text: "#000000" },            
    "ready for review": { background: "#10B981", text: "#FFFFFF" }, 
    "staged": { background: "#059669", text: "#FFFFFF" },         
    "draft": { background: "#CBD5E1", text: "#000000" },          
    "deprecated": { background: "#476950", text: "#FFFFFF" },     
    "frontend": { background: "#0EA5E9", text: "#FFFFFF" },       
    "backend": { background: "#1E40AF", text: "#FFFFFF" },        
    "api": { background: "#2563EB", text: "#FFFFFF" },            
    "database": { background: "#4F46E5", text: "#FFFFFF" },      
    "ui/ux": { background: "#06B6D4", text: "#FFFFFF" },        
    "security": { background: "#701A75", text: "#FFFFFF" },     
    ".css": { background: "#EC4899", text: "#FFFFFF" },         
    ".html": { background: "#E11D48", text: "#FFFFFF" },        
    ".tsx": { background: "#A855F7", text: "#FFFFFF" },         
    ".ts": { background: "#8B5CF6", text: "#FFFFFF" },          
    "feature": { background: "#22C55E", text: "#FFFFFF" },
    "quick fix": { background: "#14B8A6", text: "#FFFFFF" },     
    "major change": { background: "#C026D3", text: "#FFFFFF" },   
    "refactor needed": { background: "#6366F1", text: "#FFFFFF" },
    "research needed": { background: "#4338CA", text: "#FFFFFF" }, 
    "unit test": { background: "#0891B2", text: "#FFFFFF" },     
    "documentation missing": { background: "#FBBF24", text: "#000000" }, 
    "temporary hack": { background: "#B45309", text: "#FFFFFF" }, 
  };

  const lowerLabel = label.replace(/^@/, "").toLowerCase().trim();

  return colorMap[lowerLabel] ?? { background: "#64748B", text: "#FFFFFF" }; 
}

/**
 * Hjælpefunktion til at udtrække labels fra tekst (returnerer undefined hvis ingen findes)
 */
export function extractLabelsFromText(text: string): string[] | undefined {
  const labels = extractLabels(text);
  return labels.length > 0 ? labels : undefined;
}