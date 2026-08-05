import {
  getDailyQuestionForDate,
  getQuestionById,
  pickMainSessionQuestions,
  pickPlanetSessionQuestions,
} from "@/lib/questions/bank";
import type { BankQuestion } from "@/lib/questions/types";
import type { SessionType } from "@/lib/topics/types";
import { isPlanet } from "@/lib/prompts";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";

export type SpeakMode = SessionType;

export type ResolvedSpeakSession = {
  mode: SpeakMode;
  questions: BankQuestion[];
  topicId: string | null;
  doneHref: string;
  /** Voice planet label when practicing a single planet */
  planetLabel?: string;
};

export function resolveSpeakSession(params: {
  mode?: string;
  topicId?: string;
  q?: string;
  planet?: string;
}): ResolvedSpeakSession | { error: string } {
  const planetParam = params.planet;

  // Planet practice from Express / Stand / Connect / Explore pages
  if (planetParam && isPlanet(planetParam)) {
    const questions = pickPlanetSessionQuestions(planetParam, 3);
    if (questions.length === 0) {
      return { error: "No prompts available for this planet yet." };
    }
    const planet = getVoicePlanetById(planetParam);
    return {
      mode: "main",
      questions,
      topicId: planetParam,
      doneHref: `/${planetParam}`,
      planetLabel: planet?.label,
    };
  }

  const mode = (params.mode ?? "main") as string;

  if (mode === "daily") {
    const question = getDailyQuestionForDate();
    return {
      mode: "daily",
      questions: [question],
      topicId: question.topicId,
      doneHref: "/home",
    };
  }

  if (mode === "focus") {
    const topicId = params.topicId;
    if (!topicId) {
      return { error: "Focus sessions need a topic." };
    }
    const ids = (params.q ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length !== 3) {
      return { error: "Pick exactly three questions to start a focus session." };
    }
    const questions: BankQuestion[] = [];
    for (const id of ids) {
      const q = getQuestionById(id);
      if (!q || q.topicId !== topicId) {
        return { error: "One or more focus questions are invalid." };
      }
      questions.push(q);
    }
    return {
      mode: "focus",
      questions,
      topicId,
      doneHref: `/topics/${topicId}`,
    };
  }

  // main
  return {
    mode: "main",
    questions: pickMainSessionQuestions(),
    topicId: null,
    doneHref: "/home",
  };
}
