# Halo Brand Voice Guide

This is the authoritative style guide for all user-facing language in Halo.

Halo helps teenagers become more comfortable speaking, expressing themselves, and communicating in real situations through short voice exercises, interesting questions, and specific feedback.

Halo should sound like a thoughtful person, not a product trying to inspire you.

The product name in the app is **Halo**. Keep that spelling in all user-facing copy.

Runtime AI prompts use a condensed version of these rules in `src/lib/ai/brandVoice.ts`. Keep that file in sync when this guide changes.

---

## Halo's voice

### The personality

Halo is:

**Smart, not academic.**
It respects teenagers' intelligence without using overly sophisticated language.

**Warm, not sentimental.**
It can be supportive without making everything emotional.

**Confident, not motivational.**
It does not cheerlead, pep-talk, or narrate someone's "journey."

**Playful, not childish.**
It can have personality and occasional humor without sounding like it is trying to be trendy.

**Curious, not intrusive.**
It asks interesting questions without pressuring users to reveal personal information.

**Specific, not generic.**
If a sentence could sit under anyone's recording or on any page, cut it.

**Natural, not artificially polished.**
Prefer ordinary sentences over balanced, three-part, poster-ready phrasing.

**Honest, not performative.**
It doesn't pretend to know how someone feels.

**Minimal, not empty.**
Use fewer words without deleting instructions people need to finish a task.

---

## Writing rules

These are permanent rules for all new copy:

1. Never use em dashes in user-facing text (`—`, `&mdash;`, `&#8212;`, `\u2014`).
2. Avoid stylistic en dashes used as sentence breaks. Normal hyphens in compound words and numeric ranges written with a plain hyphen (`1-100`) are fine.
3. Use contractions where natural.
4. Prefer short, direct sentences.
5. Avoid unnecessary subtitles. If the heading already explains the screen, delete the supporting sentence.
6. Never use generic motivational language.
7. Avoid therapy-speak.
8. Don't overexplain obvious functionality.
9. Don't compliment users without a specific reason.
10. Don't make assumptions about their feelings, progress, personality, or mental state.
11. Don't write like a corporate wellness company.
12. Don't sound like an AI assistant.
13. Avoid excessive exclamation points.
14. Don't use forced teenage slang.
15. Avoid unnecessary celestial metaphors in instructions. Feature names (Universe, Journey, Orbits) are fine; "your constellation is waiting" is not.
16. Never add copy merely to fill space.
17. Make instructions unambiguous.
18. Prioritize specificity over abstract encouragement.
19. Preserve warmth and personality.
20. When in doubt, use fewer words.
21. These rules apply to static UI, questions, errors, empty states, AI prompts, and generated feedback.

### Em dashes

Never use `—` in anything a user will read.

Do not simply swap an em dash for a comma. Rewrite the sentence so it sounds natural.

BAD: "Your voice matters—even when speaking feels difficult."

BETTER: "Speaking up isn't always easy."

Developer comments, DESIGN.md section labels, and code that strips dashes from model output may still mention the character. User-facing strings may not.

---

## Writing test

Before adding any new user-facing text, ask:

1. Would a smart, thoughtful teenager think this sounds natural?
2. Would a great human editor keep this sentence?
3. Is this sentence actually doing something useful?
4. Could it sound less like AI?
5. If I deleted it, would anything be lost?

If the copy fails any of these tests, revise it.

---

## Feedback style

Feedback should read like a helpful observation, not a psychological assessment.

BAD: "You demonstrated impressive self-awareness and emotional intelligence."

GOOD: "You gave a specific example, which made your point easier to follow."

BAD: "Your confidence is blossoming."

GOOD: "Your pace was steadier this time."

BAD: "Keep embracing your unique voice."

GOOD: "Try pausing after your first point."

### Feedback principles

1. Observation before encouragement.
2. Specificity before positivity.
3. Useful suggestions before generic affirmations.
4. Plain language before metaphors.
5. Honesty before praise.

Every observation must be supported by actual available data.

Do not invent feedback. Do not infer personality, mental health, or underlying emotions from someone's voice. Avoid presenting uncertain interpretations as facts.

All AI-generated feedback must follow the runtime rules in `src/lib/ai/brandVoice.ts` via `withBrandVoice(...)`.

---

## Interface style

Buttons should be short and clear.

Headings should be confident and uncomplicated.

Subtitles should be rare. If a subtitle isn't necessary for understanding or using the interface, delete it. Keep safety messaging, accessibility instructions, consent information, and anything required to complete a task.

Instructions should explain only what the user needs to know.

Empty states should be useful, not inspirational.

Success messages should confirm what happened.

Error messages should explain what happened and how to recover when possible.

Loading messages should be brief and accurate.

Never sacrifice usability, accessibility, or precision in the pursuit of minimalism.

---

## Question style

Questions should feel like a genuinely interesting conversation.

They should not feel like homework.

They should not try to manufacture emotional depth.

They should give users room to interpret and respond in their own way.

Preserve variety: some questions should be light, some practical, some reflective, and some challenging.

Favor questions that are specific, thought-provoking, conversational, relevant to real teenage experiences, occasionally surprising, open-ended, easy to understand, and interesting to answer out loud.

---

## Personality in practice

Halo should have a distinctive writing voice, but it should never constantly announce that personality.

The product's personality should come through in subtle word choices, interesting questions, and thoughtful feedback.

Halo does not need to tell users that their voices matter every time they open the app.

The experience should convey that without repeatedly saying it.

---

## Phrases to avoid

These patterns (and close cousins) should not appear in user-facing copy:

- "Your journey starts here"
- "Find your voice"
- "Your voice matters"
- "Every voice deserves to be heard"
- "Discover your authentic self"
- "Unlock your potential"
- "Embrace the journey"
- "Take a moment to reflect"
- "There's no right or wrong answer"
- "Every step is progress"
- "You showed incredible courage"
- "Thank you for sharing"
- "What a powerful reflection"
- "You're doing amazing"
- "This is a safe space"
- "Remember, growth takes time"
- "Let's explore"
- "It's okay to feel..."
- "As you continue your journey..."
- "One step at a time"
- "You have the power to..."
- "This is an opportunity to grow"

Replace them with concrete, useful language, or delete them.

---

## Where copy lives

User-facing language can appear in:

- App pages and components under `src/app` and `src/components`
- Content libraries under `src/lib/prompts`, `src/lib/questions`, `src/lib/orbits/content`, `src/lib/planets`, `src/lib/gamification`
- Runtime AI prompts under `src/lib/sessions`, `src/lib/myVoice`, `src/lib/orbits`
- Auth, onboarding, settings, professional, and guest flows

If content is stored in the database or generated at runtime, the generation instructions still must follow this guide.

---

## Automated checks

Run copy quality checks with:

```bash
npm run check:copy
```

See `scripts/check-copy-quality.ts` for what is flagged and how to extend the phrase list.
