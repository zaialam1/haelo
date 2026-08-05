"use client";

import { useMemo, useState } from "react";
import { ConstellationTimeline } from "@/components/topics/ConstellationTimeline";
import { GrowthArcs } from "@/components/topics/GrowthArcs";
import { PlanetHeader } from "@/components/topics/PlanetHeader";
import { ReflectionSidePanel } from "@/components/topics/ReflectionSidePanel";
import { ViewFilter } from "@/components/topics/ViewFilter";
import { layoutNodesForMode } from "@/lib/topics/layout";
import type {
  PlanetViewModel,
  TimelineNode,
  TimelineViewMode,
} from "@/lib/topics/types";

type TopicPlanetPageProps = {
  model: PlanetViewModel;
};

export function TopicPlanetPage({ model }: TopicPlanetPageProps) {
  const [viewMode, setViewMode] = useState<TimelineViewMode>("all");
  const [selected, setSelected] = useState<TimelineNode | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const laidOut = useMemo(
    () => layoutNodesForMode(model.topic, model.nodes, viewMode),
    [model.topic, model.nodes, viewMode],
  );

  return (
    <div
      className="relative min-h-full pb-4"
      style={{
        background:
          "radial-gradient(ellipse 70% 45% at 50% -5%, color-mix(in srgb, var(--violet) 22%, transparent), transparent 55%), radial-gradient(ellipse 50% 35% at 100% 30%, color-mix(in srgb, var(--rose) 16%, transparent), transparent 50%), var(--background)",
      }}
    >
      <PlanetHeader topic={model.topic} insights={model.summaryInsights} />

      <div className="mt-8">
        <ViewFilter
          value={viewMode}
          onChange={setViewMode}
          disabled={model.isEmpty}
        />
      </div>

      <ConstellationTimeline
        nodes={laidOut}
        monthAnchors={model.monthAnchors}
        isEmpty={model.isEmpty}
        planetColor={model.topic.color}
        selectedId={selected?.id ?? null}
        onSelect={(node) => {
          setSelected(node);
          setPanelOpen(true);
        }}
      />

      <div className="mt-10">
        <GrowthArcs
          planetLabel={model.topic.label}
          arcs={model.growthArcs}
          isEmpty={model.isEmpty}
        />
      </div>

      <ReflectionSidePanel
        node={selected}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}
