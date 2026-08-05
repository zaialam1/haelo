import { getSubtopicTint } from "@/lib/topics/catalog";
import type {
  TimelineNode,
  TimelineViewMode,
  TopicCatalogEntry,
} from "@/lib/topics/types";

/**
 * Recompute node positions / emphasis for a view mode.
 * Base nodes already have chronological x and a gentle y snake.
 */
export function layoutNodesForMode(
  topic: TopicCatalogEntry,
  baseNodes: TimelineNode[],
  mode: TimelineViewMode,
): TimelineNode[] {
  if (baseNodes.length === 0) return [];

  switch (mode) {
    case "all":
      return baseNodes.map((n) => ({ ...n, emphasis: 1 }));

    case "confidence":
      return baseNodes.map((n) => ({
        ...n,
        // Keep chronological positions; remap glow for confidence view
        glow: n.glow,
        emphasis: 0.55 + n.glow * 0.45,
      }));

    case "topics": {
      const bands = topic.subtopics;
      const bandCount = Math.max(bands.length, 1);

      return baseNodes.map((n) => {
        const idx = n.subtopicId
          ? bands.findIndex((s) => s.id === n.subtopicId)
          : -1;
        const bandIndex = idx >= 0 ? idx : bandCount / 2;
        // Vertical bands from top to bottom for each subtopic
        const y = 0.12 + ((bandIndex + 0.5) / bandCount) * 0.76;
        return {
          ...n,
          y,
          tint: getSubtopicTint(topic, n.subtopicId),
          emphasis: 1,
        };
      });
    }

    case "growth":
      return baseNodes.map((n) => ({
        ...n,
        emphasis: n.growth ? 1 : 0.28,
        glow: n.growth ? Math.max(n.glow, 0.85) : n.glow * 0.5,
      }));

    default:
      return baseNodes;
  }
}
