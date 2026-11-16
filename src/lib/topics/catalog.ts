import { TOPICS } from "@/lib/home/universe";
import type { TopicCatalogEntry, TopicSubtopic } from "@/lib/topics/types";

const soft = {
  rose: "#E8A0BF",
  roseDeep: "#D478A0",
  roseSoft: "#F0C0D4",
  violet: "#5B4B8A",
  violetMid: "#7B6BA8",
  violetSoft: "#9A8BC4",
  gold: "#F6D365",
  goldSoft: "#E8C070",
  mauve: "#C48BB5",
  blush: "#D48A9E",
} as const;

function subs(
  entries: Array<[id: string, label: string, tint: string]>,
): TopicSubtopic[] {
  return entries.map(([id, label, tint]) => ({ id, label, tint }));
}

const CATALOG_BY_ID: Record<string, Omit<TopicCatalogEntry, "id" | "label" | "color">> = {
  friendships: {
    tagline: "Talking about friends",
    subtopics: subs([
      ["belonging", "Fitting in", soft.rose],
      ["conflict", "Conflict", soft.violetMid],
      ["humor", "Humor", soft.gold],
      ["trust", "Trust", soft.mauve],
      ["boundaries", "Boundaries", soft.violet],
      ["vulnerability", "Being open", soft.roseDeep],
    ]),
    explorePrompt: "What's something you wish your friends understood about you?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
  family: {
    tagline: "Talking about family",
    subtopics: subs([
      ["support", "Support", soft.rose],
      ["expectations", "Expectations", soft.violet],
      ["traditions", "Traditions", soft.goldSoft],
      ["conflict", "Conflict", soft.violetMid],
      ["gratitude", "Gratitude", soft.gold],
      ["independence", "Independence", soft.mauve],
    ]),
    explorePrompt: "What do you wish you could say more freely at home?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
  relationships: {
    tagline: "Talking about close relationships",
    subtopics: subs([
      ["affection", "Affection", soft.rose],
      ["communication", "Communication", soft.violetMid],
      ["trust", "Trust", soft.mauve],
      ["boundaries", "Boundaries", soft.violet],
      ["conflict", "Conflict", soft.blush],
      ["vulnerability", "Being open", soft.roseDeep],
    ]),
    explorePrompt: "What feels hardest to say out loud in a close relationship?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
  school: {
    tagline: "Talking about school",
    subtopics: subs([
      ["pressure", "Pressure", soft.violet],
      ["friendship", "Friendship", soft.rose],
      ["curiosity", "Curiosity", soft.gold],
      ["belonging", "Fitting in", soft.mauve],
      ["confidence", "Confidence", soft.goldSoft],
      ["setbacks", "Setbacks", soft.violetMid],
    ]),
    explorePrompt: "What's something school brings out in you that others might not see?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
  sports: {
    tagline: "Talking about sports",
    subtopics: subs([
      ["teamwork", "Teamwork", soft.rose],
      ["competition", "Competition", soft.gold],
      ["discipline", "Discipline", soft.violet],
      ["setbacks", "Setbacks", soft.violetMid],
      ["pride", "Pride", soft.goldSoft],
      ["belonging", "Team fit", soft.mauve],
    ]),
    explorePrompt: "What does competing teach you about yourself?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
  hobbies: {
    tagline: "Talking about hobbies",
    subtopics: subs([
      ["flow", "Flow", soft.gold],
      ["creativity", "Creativity", soft.rose],
      ["learning", "Learning", soft.violetSoft],
      ["sharing", "Sharing", soft.mauve],
      ["persistence", "Persistence", soft.violet],
      ["joy", "Joy", soft.goldSoft],
    ]),
    explorePrompt: "Which hobby makes time disappear for you?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
  future: {
    tagline: "Talking about what's next",
    subtopics: subs([
      ["hopes", "Hopes", soft.gold],
      ["uncertainty", "Uncertainty", soft.violetSoft],
      ["ambition", "Ambition", soft.violet],
      ["fear", "Fear", soft.mauve],
      ["possibility", "Possibility", soft.rose],
      ["planning", "Planning", soft.goldSoft],
    ]),
    explorePrompt: "What future version of yourself are you curious about?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
  emotions: {
    tagline: "Talking about feelings",
    subtopics: subs([
      ["joy", "Joy", soft.gold],
      ["sadness", "Sadness", soft.violetSoft],
      ["anger", "Anger", soft.blush],
      ["calm", "Calm", soft.mauve],
      ["anxiety", "Anxiety", soft.violetMid],
      ["tenderness", "Softness", soft.rose],
    ]),
    explorePrompt: "What emotion have you been carrying that you haven't said out loud?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
  confidence: {
    tagline: "Talking about yourself",
    subtopics: subs([
      ["self-belief", "Self-belief", soft.gold],
      ["doubt", "Doubt", soft.violetSoft],
      ["speaking-up", "Speaking up", soft.violet],
      ["comparison", "Comparison", soft.mauve],
      ["courage", "Trying anyway", soft.goldSoft],
      ["presence", "Presence", soft.rose],
    ]),
    explorePrompt: "When do you feel most like yourself when you speak?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
  creativity: {
    tagline: "Talking about making things",
    subtopics: subs([
      ["ideas", "Ideas", soft.gold],
      ["expression", "Expression", soft.rose],
      ["experiment", "Experiment", soft.violetSoft],
      ["inspiration", "Inspiration", soft.goldSoft],
      ["blocks", "Blocks", soft.violetMid],
      ["sharing", "Sharing", soft.mauve],
    ]),
    explorePrompt: "What are you creating right now, or wishing you could create?",
    insightPlaceholders: [
      "Most natural talking about: Not yet",
      "Practicing more: Not yet",
      "Recently exploring: Not yet",
    ],
  },
};

export function getTopicCatalog(topicId: string): TopicCatalogEntry | undefined {
  const planet = TOPICS.find((t) => t.id === topicId);
  const meta = CATALOG_BY_ID[topicId];
  if (!planet || !meta) return undefined;

  return {
    id: planet.id,
    label: planet.label,
    color: planet.color,
    ...meta,
  };
}

export function getSubtopicTint(
  topic: TopicCatalogEntry,
  subtopicId: string | null,
): string {
  if (!subtopicId) return topic.color;
  return topic.subtopics.find((s) => s.id === subtopicId)?.tint ?? topic.color;
}

export function getAllTopicCatalog(): TopicCatalogEntry[] {
  return TOPICS.map((t) => getTopicCatalog(t.id)!).filter(Boolean);
}
