/**
 * Offline tests for individual session analysis:
 * speech metrics, quote grounding, prompt contract, parse grounding.
 *
 * Does not call OpenAI (deterministic).
 */
import assert from "node:assert/strict";
import { buildSessionAnalysisInput } from "../src/lib/sessions/analysisInput";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPayload,
  parseAnalysisJson,
} from "../src/lib/sessions/analysisProvider";
import {
  collectObservationEvidence,
  groundEvidenceQuotes,
  isQuoteGroundedInTranscript,
  resolveQuoteAgainstTranscript,
  stripUngroundedQuotes,
} from "../src/lib/sessions/quoteGrounding";
import { deriveSpeechMetrics } from "../src/lib/sessions/speechMetrics";
import { planetLensSummary } from "../src/lib/sessions/analysisPrompt";

let passed = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`ok — ${name}`);
  } catch (e) {
    console.error(`FAIL — ${name}`);
    throw e;
  }
}

// --- Speech metrics ---
check("deriveSpeechMetrics counts words, hedges, fillers, WPM", () => {
  const transcript =
    "I guess I just kind of want them to stop. Like, I don't know, maybe they should stop joking about it.";
  const metrics = deriveSpeechMetrics(transcript, 30);
  assert.ok(metrics.wordCount > 10);
  assert.equal(metrics.durationSeconds, 30);
  assert.ok(metrics.wordsPerMinute !== null && metrics.wordsPerMinute > 0);
  assert.ok(metrics.hedgeTotal >= 3);
  assert.ok((metrics.hedgeCounts["i guess"] ?? 0) >= 1);
  assert.ok((metrics.fillerCounts.like ?? 0) >= 1);
});

check("deriveSpeechMetrics handles empty transcript", () => {
  const metrics = deriveSpeechMetrics("", null);
  assert.equal(metrics.wordCount, 0);
  assert.equal(metrics.wordsPerMinute, null);
});

// --- Quote grounding ---
check("isQuoteGroundedInTranscript matches verbatim excerpts", () => {
  const transcript =
    "We've been friends since sixth grade. I don't want them to keep joking about it.";
  assert.equal(
    isQuoteGroundedInTranscript(
      "I don't want them to keep joking about it.",
      transcript,
    ),
    true,
  );
  assert.equal(
    isQuoteGroundedInTranscript(
      "We've been friends since sixth grade.",
      transcript,
    ),
    true,
  );
  assert.equal(
    isQuoteGroundedInTranscript(
      "Maybe if you could just not do it as much.",
      transcript,
    ),
    false,
  );
});

check("resolveQuoteAgainstTranscript recovers punctuation drift", () => {
  const transcript = "I don't want them to keep joking about it.";
  const resolved = resolveQuoteAgainstTranscript(
    "I dont want them to keep joking about it",
    transcript,
  );
  assert.ok(resolved);
  assert.match(resolved!, /don'?t want them to keep joking/i);
});

check("groundEvidenceQuotes drops invented quotes", () => {
  const transcript =
    "I still want to be friends, I just don't want this to keep happening.";
  const evidence = groundEvidenceQuotes(
    [
      { text: "I still want to be friends" },
      { text: "You should think about their feelings" },
      { text: "I just don't want this to keep happening." },
    ],
    transcript,
    { maxItems: 2, fallbackSnippet: false },
  );
  assert.equal(evidence.length, 2);
  assert.ok(
    evidence.every((e) => isQuoteGroundedInTranscript(e.text, transcript)),
  );
  assert.ok(!evidence.some((e) => e.text.includes("feelings")));
});

check("groundEvidenceQuotes does not invent fallback snippets by default", () => {
  const transcript =
    "Everyone was talking and I just stopped trying to join in.";
  const evidence = groundEvidenceQuotes(
    [{ text: "totally fabricated quote" }],
    transcript,
  );
  assert.equal(evidence.length, 0);
});

check("collectObservationEvidence pulls grounded inline quotes", () => {
  const transcript =
    "Everyone was talking and I just stopped trying to join in.";
  const evidence = collectObservationEvidence(
    [],
    'When you said "Everyone was talking and I just stopped trying to join in," it got specific.',
    transcript,
  );
  assert.equal(evidence.length, 1);
  assert.ok(isQuoteGroundedInTranscript(evidence[0].text, transcript));
});

check("stripUngroundedQuotes demotes invented quotes", () => {
  const transcript = "I want them to stop.";
  const text =
    'You softened your ask when you said "Maybe if you could just not do it as much." Then you got clearer.';
  const cleaned = stripUngroundedQuotes(text, transcript);
  assert.ok(!cleaned.includes('"Maybe if you could just not do it as much."'));
  assert.ok(cleaned.includes("Maybe if you could just not do it as much."));
});

check("stripUngroundedQuotes keeps grounded quotes", () => {
  const transcript = "I want them to stop.";
  const text = 'Your clearest line was "I want them to stop."';
  const cleaned = stripUngroundedQuotes(text, transcript);
  assert.ok(cleaned.includes('"I want them to stop."'));
});

// --- Prompt contract ---
check("system prompt focuses on communication not life advice", () => {
  assert.match(ANALYSIS_SYSTEM_PROMPT, /HOW they communicate/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /NOT[\s\S]*therapist/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /STAND/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /CONNECT/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /EXPLORE/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /EXPRESS/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /do NOT hear the recording/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /verbatim/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /Almost always include 1 short verbatim/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /evidence array/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /warm/i);
});

check("planetLensSummary covers all four planets", () => {
  for (const planet of ["stand", "connect", "explore", "express"] as const) {
    const lens = planetLensSummary(planet);
    assert.ok(lens.length > 20, planet);
  }
});

// --- Analysis input / payload ---
check("Universe analysis input includes speech metrics, no acoustic audio", () => {
  const transcript =
    "So a lot happened at lunch and then at the end I don't want them to keep joking about it.";
  const input = buildSessionAnalysisInput({
    sessionId: "s1",
    planet: "stand",
    promptText: "What boundary do you need to name?",
    transcript,
    sourceType: "planet",
    attemptNumber: 1,
    durationSeconds: 45,
  });
  assert.ok(input.speechMetrics);
  assert.equal(input.acousticMetrics.available, false);
  assert.equal(input.sourceType, "planet");

  const payload = buildAnalysisUserPayload(input);
  assert.equal(payload.planet, "stand");
  assert.ok(payload.speechMetrics);
  assert.equal(
    (payload.acousticMetrics as { available: boolean }).available,
    false,
  );
  assert.match(String(payload.planetLens), /directness/i);
});

check("Orbit analysis input includes orbit context without changing primary focus", () => {
  const input = buildSessionAnalysisInput({
    sessionId: "s2",
    planet: "connect",
    promptText: "What do you want your friend to understand?",
    transcript:
      "I felt left out when the group chat went quiet after I shared something.",
    sourceType: "orbit",
    attemptNumber: 1,
    durationSeconds: 40,
    orbit: {
      orbitTitle: "Something feels off",
      orbitSituation: "A friendship has started to feel uneven.",
      orbitQuestionKey: "q1",
    },
  });
  const payload = buildAnalysisUserPayload(input);
  assert.equal(payload.sourceType, "orbit");
  const ctx = payload.questionContext as {
    orbit?: { orbitTitle: string };
  };
  assert.equal(ctx.orbit?.orbitTitle, "Something feels off");
  assert.match(
    String((payload.notes as { orbitGuidance?: string }).orbitGuidance),
    /communication/i,
  );
});

// --- Scenario-shaped parse tests (mock model JSON) ---
check("Stand scenario: grounded request quote kept; invented empathy quote dropped", () => {
  const transcript = `Okay so yesterday at school they kept joking about my voice and I laughed along because I didn't want it to be weird and then later I thought about it a lot. I don't want them to keep joking about it.`;
  const parsed = parseAnalysisJson(
    {
      strength: {
        title: "You named the boundary",
        description: "By the end you stated what you actually want.",
      },
      observation: {
        title: "The ask arrived late",
        description:
          'You spent most of the response explaining what happened, but your clearest sentence was "I don\'t want them to keep joking about it."',
      },
      evidence: [
        { text: "I don't want them to keep joking about it." },
        { text: "You should think about why your friend made the joke." },
      ],
      experiment: {
        title: "Lead with the ask",
        instruction:
          "Start with one sentence that states your boundary, then add the lunch context.",
      },
    },
    transcript,
    false,
  );
  assert.ok(
    parsed.evidence.some((e) =>
      isQuoteGroundedInTranscript(e.text, transcript),
    ),
  );
  assert.ok(
    !parsed.evidence.some((e) => e.text.toLowerCase().includes("should think")),
  );
  assert.match(
    parsed.observation.description,
    /don'?t want them to keep joking/i,
  );
  assert.match(parsed.experiment.instruction, /boundary|ask|start/i);
  assert.doesNotMatch(parsed.experiment.instruction, /friend'?s feelings/i);
});

check("observation inline quote becomes evidence when evidence array is empty", () => {
  const transcript =
    "I still want to be friends, I just don't want this to keep happening.";
  const parsed = parseAnalysisJson(
    {
      strength: {
        title: "Clear hope",
        description: "You kept the friendship in view.",
      },
      observation: {
        title: "Your main point landed late",
        description:
          'Your main point became clear when you said "I still want to be friends, I just don\'t want this to keep happening."',
      },
      evidence: [],
      experiment: {
        title: "Bring it earlier",
        instruction: "Say that sentence first, then add one detail.",
      },
    },
    transcript,
    false,
  );
  assert.equal(parsed.evidence.length, 1);
  assert.ok(isQuoteGroundedInTranscript(parsed.evidence[0].text, transcript));
});

check("Connect scenario: suggests context for the listener, not empathy homework", () => {
  const transcript =
    "I felt really left out and it hurt. I still want to be friends, I just don't want this to keep happening.";
  const parsed = parseAnalysisJson(
    {
      strength: {
        title: "Your feeling was clear",
        description: "You named the impact without hedging.",
      },
      observation: {
        title: "The situation stayed vague",
        description:
          'Your main point became clear when you said "I still want to be friends, I just don\'t want this to keep happening." A listener may still need one concrete detail about what happened.',
      },
      evidence: [
        {
          text: "I still want to be friends, I just don't want this to keep happening.",
        },
      ],
      experiment: {
        title: "Add one concrete detail",
        instruction:
          "Before the feeling, give one short example of what happened so a listener can follow the message.",
      },
    },
    transcript,
    false,
  );
  assert.match(parsed.experiment.instruction, /example|detail|listener/i);
  assert.doesNotMatch(
    parsed.experiment.instruction,
    /think about how your friend might feel/i,
  );
  assert.ok(parsed.evidence.length >= 1);
});

check("Explore scenario: notices recurring idea without forcing a conclusion", () => {
  const transcript =
    "Part of me wants to stay on the team. Then again I don't think I actually want to do it. Maybe I should stick it out. But I don't think I actually want to do it.";
  const parsed = parseAnalysisJson(
    {
      strength: {
        title: "You kept searching",
        description: "You let more than one possibility stay on the table.",
      },
      observation: {
        title: "One line kept returning",
        description:
          'You mentioned both wanting to stay and wanting something different, but you returned to "I don\'t think I actually want to do it."',
      },
      evidence: [{ text: "I don't think I actually want to do it." }],
      experiment: {
        title: "Stay with the recurring line",
        instruction:
          "On a retry, say the recurring sentence once early, then explore what makes that feel true — without forcing a final decision.",
      },
    },
    transcript,
    false,
  );
  assert.match(
    parsed.observation.description,
    /returned|recurring|want to do it/i,
  );
  assert.doesNotMatch(parsed.experiment.instruction, /decide once and for all/i);
  assert.ok(parsed.evidence.length >= 1);
});

check("Express scenario: concrete example is the evidence", () => {
  const transcript =
    "It was awkward. Everyone was talking and I just stopped trying to join in. The whole thing felt weird.";
  const parsed = parseAnalysisJson(
    {
      strength: {
        title: "One moment got specific",
        description: "Your example made the feeling easier to picture.",
      },
      observation: {
        title: "The example carried the meaning",
        description:
          'When you said "Everyone was talking and I just stopped trying to join in," the response became much more concrete than "awkward."',
      },
      evidence: [
        { text: "Everyone was talking and I just stopped trying to join in" },
        { text: "We've been friends since sixth grade." },
      ],
      experiment: {
        title: "Use that level of detail again",
        instruction:
          "Keep the concrete scene, and replace the vague words awkward/weird with one more specific sensory or emotional detail.",
      },
    },
    transcript,
    false,
  );
  assert.ok(parsed.evidence.length >= 1);
  assert.ok(parsed.evidence.length <= 2);
  assert.ok(
    parsed.evidence.some((e) =>
      isQuoteGroundedInTranscript(e.text, transcript),
    ),
  );
  assert.ok(
    parsed.evidence.some((e) => /stopped trying to join in/i.test(e.text)),
  );
  assert.ok(!parsed.evidence.some((e) => /sixth grade/i.test(e.text)));
});

check("Delivery-oriented experiment can cite speech metrics without inventing audio", () => {
  const transcript =
    "I want to tell them the truth. I want them to stop. That is what I mean.";
  const input = buildSessionAnalysisInput({
    sessionId: "s3",
    planet: "stand",
    promptText: "Say the boundary.",
    transcript,
    sourceType: "planet",
    attemptNumber: 1,
    durationSeconds: 8,
  });
  assert.ok(input.speechMetrics?.wordsPerMinute);
  assert.ok((input.speechMetrics?.wordsPerMinute ?? 0) > 100);
  assert.equal(input.acousticMetrics.available, false);
  const payload = buildAnalysisUserPayload(input);
  assert.match(
    String((payload.notes as { audioAccess: string }).audioAccess),
    /does not receive the audio/i,
  );
});

console.log(`\n${passed} checks passed.`);
