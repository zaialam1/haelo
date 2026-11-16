/**
 * Natural-language Orbit search.
 *
 * Ranks the 40 Orbit definitions against a short user situation description.
 * AI classifies relevance only — no diagnosis, therapy, crisis interpretation,
 * or advice. Raw query text is never persisted.
 */

import { tidyGeneratedCopy, withBrandVoice } from "@/lib/ai/brandVoice";
import {
  getOpenAIAnalysisModel,
  getOpenAIApiKey,
} from "@/lib/openai";
import { getActiveOrbits, getOrbitByKey } from "@/lib/orbits/catalog";
import { getOrbitRegion } from "@/lib/orbits/regions";
import { getAnalysisProviderStatus } from "@/lib/sessions/analysisProvider";
import { matchesOrbitSearch } from "@/lib/orbits/ui";
import type { OrbitListItem, OrbitRegionKey } from "@/lib/orbits/types";

export type OrbitSearchMatch = {
  orbitKey: string;
  title: string;
  shortDescription: string;
  regionKey: OrbitRegionKey;
  why: string;
};

export type OrbitSearchResult = {
  matches: OrbitSearchMatch[];
  /** True when substring fallback was used because AI failed / unavailable. */
  usedFallback: boolean;
  emptyReason: "none" | "no_match" | "empty_query";
};

type CompactOrbitMeta = {
  orbitKey: string;
  title: string;
  shortDescription: string;
  situation: string;
  regionTitle: string;
  regionKey: OrbitRegionKey;
};

/**
 * Shared writing rules are appended by withBrandVoice
 * (see src/lib/ai/brandVoice.ts and docs/HAELO_BRAND_VOICE.md).
 */
const SEARCH_SYSTEM_PROMPT = withBrandVoice(`You help teens find relevant Orbits in Halo. An Orbit is a set of six spoken questions about one real situation.

Your only job is to classify which Orbits (if any) fit the user's situation description.
Return at most 3 strong matches. Prefer quality over quantity.

Rules:
- Do NOT diagnose, give therapy, interpret crisis, or tell the user what to do.
- Do NOT invent Orbits. Only use orbitKeys from the provided catalog.
- Each "why" is the only text the user reads. Make it one short sentence that links what they typed to what the Orbit covers (e.g. "This one is about telling a friend something they won't want to hear."). Don't comment on how they feel and don't restate their whole situation.
- If nothing is a good fit, return an empty matches array.
- Respond with JSON only: { "matches": [ { "orbitKey": string, "why": string } ] }`);

function compactCatalog(): CompactOrbitMeta[] {
  return getActiveOrbits().map((orbit) => ({
    orbitKey: orbit.orbitKey,
    title: orbit.title,
    shortDescription: orbit.shortDescription,
    situation: orbit.situation,
    regionTitle: getOrbitRegion(orbit.regionKey)?.title ?? orbit.regionKey,
    regionKey: orbit.regionKey,
  }));
}

function toMatch(
  orbitKey: string,
  why: string,
): OrbitSearchMatch | null {
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) return null;
  const cleanedWhy = tidyGeneratedCopy(why.trim().replace(/\s+/g, " ")).slice(
    0,
    180,
  );
  if (!cleanedWhy) return null;
  return {
    orbitKey: orbit.orbitKey,
    title: orbit.title,
    shortDescription: orbit.shortDescription,
    regionKey: orbit.regionKey,
    why: cleanedWhy,
  };
}

function parseAiMatches(raw: unknown): OrbitSearchMatch[] {
  if (!raw || typeof raw !== "object") return [];
  const matches = (raw as { matches?: unknown }).matches;
  if (!Array.isArray(matches)) return [];

  const seen = new Set<string>();
  const out: OrbitSearchMatch[] = [];
  for (const entry of matches) {
    if (!entry || typeof entry !== "object") continue;
    const orbitKey =
      typeof (entry as { orbitKey?: unknown }).orbitKey === "string"
        ? (entry as { orbitKey: string }).orbitKey.trim()
        : "";
    const why =
      typeof (entry as { why?: unknown }).why === "string"
        ? (entry as { why: string }).why
        : "";
    if (!orbitKey || seen.has(orbitKey)) continue;
    const match = toMatch(orbitKey, why);
    if (!match) continue;
    seen.add(orbitKey);
    out.push(match);
    if (out.length >= 3) break;
  }
  return out;
}

async function rankWithOpenAI(query: string): Promise<OrbitSearchMatch[]> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");

  const model = getOpenAIAnalysisModel();
  const catalog = compactCatalog();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SEARCH_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            situation: query.slice(0, 400),
            orbits: catalog,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Orbit search failed (${response.status})${detail ? `: ${detail.slice(0, 160)}` : "."}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Orbit search returned empty content.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Orbit search returned invalid JSON.");
  }

  return parseAiMatches(parsed);
}

/** Deterministic substring fallback using existing matchesOrbitSearch. */
export function fallbackOrbitSearch(
  query: string,
  items: OrbitListItem[],
): OrbitSearchMatch[] {
  const q = query.trim();
  if (!q) return [];

  const scored: OrbitSearchMatch[] = [];
  for (const item of items) {
    const regionTitle =
      getOrbitRegion(item.definition.regionKey)?.title ?? "";
    if (!matchesOrbitSearch(item, q, regionTitle)) continue;
    scored.push({
      orbitKey: item.definition.orbitKey,
      title: item.definition.title,
      shortDescription: item.definition.shortDescription,
      regionKey: item.definition.regionKey,
      why: "Its title or description is close to what you typed.",
    });
    if (scored.length >= 3) break;
  }
  return scored;
}

/**
 * Rank Orbits for a free-text situation. Never throws — falls back quietly.
 */
export async function searchOrbits(
  query: string,
  items: OrbitListItem[],
): Promise<OrbitSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { matches: [], usedFallback: false, emptyReason: "empty_query" };
  }

  const status = getAnalysisProviderStatus();
  if (status.available && status.provider === "openai") {
    try {
      const matches = await rankWithOpenAI(trimmed);
      return {
        matches,
        usedFallback: false,
        emptyReason: matches.length === 0 ? "no_match" : "none",
      };
    } catch {
      // Fall through to substring search.
    }
  }

  const fallback = fallbackOrbitSearch(trimmed, items);
  return {
    matches: fallback,
    usedFallback: true,
    emptyReason: fallback.length === 0 ? "no_match" : "none",
  };
}

/** Pure helper exported for offline tests. */
export function parseOrbitSearchResponseForTest(raw: unknown): OrbitSearchMatch[] {
  return parseAiMatches(raw);
}
