import { defineOrbit } from "../defineOrbit";
import type { OrbitDefinition } from "../types";

export const FIGURING_THINGS_OUT_ORBITS: readonly OrbitDefinition[] = [
  defineOrbit({
    orbitKey: "figuring_things_out_i_dont_know_what_i_want",
    title: "I Don't Know What I Want",
    regionKey: "figuring_things_out",
    shortDescription: "You're unsure what you actually want right now.",
    situation: "You're unsure what you actually want right now.",
    openingTitle: "I Don't Know What I Want",
    openingBody: `Not knowing doesn't mean you have nothing to say.

Sometimes your own answer is buried underneath expectations, fear, excitement, and everyone else's opinions.`,
    sortOrder: 1,
    questions: [
      {
        planet: "explore",
        prompt: "What decision or question are you trying to figure out?",
        explanation: "Define the uncertainty.",
      },
      {
        planet: "explore",
        prompt: "What things are pulling you in different directions?",
        explanation: "Confusion often contains competing wants.",
      },
      {
        planet: "express",
        prompt: "How does each option make you feel?",
        explanation:
          "Feelings can reveal something a pros-and-cons list misses.",
      },
      {
        planet: "explore",
        prompt:
          "If nobody ever found out what you chose, what would you want?",
        explanation:
          "Removing the audience can make your preference easier to hear.",
      },
      {
        planet: "stand",
        prompt: "Whose opinion is influencing you most?",
        explanation:
          "Other people's opinions can matter without becoming your decision.",
      },
      {
        planet: "explore",
        prompt: "What feels clearer now?",
        explanation: "You do not need a final answer to make progress.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "figuring_things_out_everyone_else_seems_ahead",
    title: "Everyone Else Seems Ahead",
    regionKey: "figuring_things_out",
    shortDescription: "It feels like everyone else is further along than you.",
    situation: "It feels like everyone else is further along than you.",
    openingTitle: "Everyone Else Seems Ahead",
    openingBody: `It's easy to compare the inside of your life to the outside of everyone else's.

This Orbit helps you figure out what the comparison is actually pointing toward.`,
    sortOrder: 2,
    questions: [
      {
        planet: "explore",
        prompt: "Who or what have you been comparing yourself to?",
        explanation: "Make the comparison specific.",
      },
      {
        planet: "express",
        prompt: "What do you feel when you compare yourself?",
        explanation:
          "Comparison may contain envy, fear, admiration, sadness, or motivation.",
      },
      {
        planet: "explore",
        prompt: "What do you think they have that you wish you had?",
        explanation: "Envy can reveal something you genuinely want.",
      },
      {
        planet: "explore",
        prompt: "How much do you actually know about their experience?",
        explanation: "What you see isn't the whole story.",
      },
      {
        planet: "stand",
        prompt:
          "What would you still want even if nobody else were doing it?",
        explanation: "Separate your goals from the race around you.",
      },
      {
        planet: "express",
        prompt: "What does doing well look like for you right now?",
        explanation:
          "Your definition matters more than an invisible scoreboard.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "figuring_things_out_something_is_changing",
    title: "Something Is Changing",
    regionKey: "figuring_things_out",
    shortDescription: "Something in your life is shifting, and you're trying to keep up.",
    situation: "Something in your life is shifting, and you're trying to keep up.",
    openingTitle: "Something Is Changing",
    openingBody: `Change can feel exciting, sad, terrifying, freeing, or all of those things at once.

This Orbit gives you room to notice what's changing without deciding immediately whether it's good or bad.`,
    sortOrder: 3,
    questions: [
      {
        planet: "explore",
        prompt: "What feels different right now?",
        explanation: "Name the transition.",
      },
      {
        planet: "express",
        prompt: "What feelings come up when you think about it?",
        explanation: "Contradictory feelings are allowed.",
      },
      {
        planet: "explore",
        prompt: "What are you afraid you might lose?",
        explanation: "Fear often points toward something you value.",
      },
      {
        planet: "express",
        prompt:
          "Is there anything about the change you're excited about but feel weird admitting?",
        explanation: "Excitement and sadness can coexist.",
      },
      {
        planet: "stand",
        prompt: "What part of yourself do you want to keep through this change?",
        explanation:
          "A new environment doesn't have to rewrite everything about you.",
      },
      {
        planet: "explore",
        prompt: "What might you be moving toward?",
        explanation: "Looking forward can reveal possibilities.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "figuring_things_out_what_do_i_actually_care_about",
    title: "What Do I Actually Care About?",
    regionKey: "figuring_things_out",
    shortDescription: "You're trying to figure out what genuinely matters to you.",
    situation: "You're trying to figure out what genuinely matters to you.",
    openingTitle: "What Do I Actually Care About?",
    openingBody: `Sometimes you're so busy doing things that you don't stop to ask why any of them matter.

This Orbit is about noticing what feels genuinely important to you.`,
    sortOrder: 4,
    questions: [
      {
        planet: "explore",
        prompt: "What are three things you spend a lot of time thinking about?",
        explanation: "Attention can reveal what already matters.",
      },
      {
        planet: "explore",
        prompt: "When do you feel most interested, energized, or alive?",
        explanation: "Energy can point toward genuine curiosity.",
      },
      {
        planet: "express",
        prompt: "Tell me about something that made you feel proud recently.",
        explanation: "Pride can reveal the standards you care about.",
      },
      {
        planet: "explore",
        prompt:
          "What makes you angry because you think it shouldn't be that way?",
        explanation: "Frustration can reveal values too.",
      },
      {
        planet: "stand",
        prompt:
          "What matters to you even if people around you don't really care about it?",
        explanation:
          "Values become clearer when they aren't socially rewarded.",
      },
      {
        planet: "express",
        prompt: "Finish this idea: “I think a good life includes…”",
        explanation: "The point is hearing your answer.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "figuring_things_out_who_am_i_around_different_people",
    title: "Who Am I Around Different People?",
    regionKey: "figuring_things_out",
    shortDescription: "You notice yourself changing depending on who you're with.",
    situation: "You notice yourself changing depending on who you're with.",
    openingTitle: "Who Am I Around Different People?",
    openingBody: `Most people aren't exactly the same around everyone. That isn't automatically fake.

This Orbit helps you notice which differences feel natural and which ones make you feel like you're disappearing.`,
    sortOrder: 5,
    questions: [
      {
        planet: "explore",
        prompt: "Who are you most different around?",
        explanation:
          "Identify where your voice shifts most noticeably.",
      },
      {
        planet: "express",
        prompt: "How do you sound or act differently with them?",
        explanation: "Describe the difference without judging it yet.",
      },
      {
        planet: "explore",
        prompt: "Which version of you feels easiest?",
        explanation: "Ease can reveal where you feel safe.",
      },
      {
        planet: "connect",
        prompt: "What do different people bring out in you?",
        explanation: "Relationships genuinely influence communication.",
      },
      {
        planet: "stand",
        prompt: "Is there any version of yourself you feel pressured to perform?",
        explanation:
          "Adaptation and self-erasure are not the same thing.",
      },
      {
        planet: "explore",
        prompt: "What feels consistent across all the different versions of you?",
        explanation:
          "Your voice can change while still belonging to the same person.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "figuring_things_out_i_changed_my_mind",
    title: "I Changed My Mind",
    regionKey: "figuring_things_out",
    shortDescription: "Your perspective shifted, and you're making sense of that.",
    situation: "Your perspective shifted, and you're making sense of that.",
    openingTitle: "I Changed My Mind",
    openingBody: `Changing your mind isn't automatically weakness. Sometimes it's evidence that you learned something.

This Orbit helps you understand what changed and whether you actually believe something different now.`,
    sortOrder: 6,
    questions: [
      {
        planet: "explore",
        prompt: "What did you used to believe or want?",
        explanation: "Start with your earlier position honestly.",
      },
      {
        planet: "express",
        prompt: "How strongly did you feel about it then?",
        explanation:
          "Understanding your old certainty makes the change easier to see.",
      },
      {
        planet: "explore",
        prompt: "What caused you to start thinking differently?",
        explanation: "Identify what shifted your perspective.",
      },
      {
        planet: "stand",
        prompt: "What do you believe now?",
        explanation: "Give your current position a real voice.",
      },
      {
        planet: "connect",
        prompt:
          "Is there anyone you feel awkward telling you've changed your mind? Why?",
        explanation:
          "Social pressure can keep us attached to old positions.",
      },
      {
        planet: "explore",
        prompt: "What did changing your mind teach you about yourself?",
        explanation: "The process may matter as much as the answer.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "figuring_things_out_big_decision",
    title: "Big Decision",
    regionKey: "figuring_things_out",
    shortDescription: "You're choosing between options that both matter.",
    situation: "You're choosing between options that both matter.",
    openingTitle: "Big Decision",
    openingBody: `Some choices feel bigger because they seem like they're deciding your whole future. Usually they aren't.

But they still deserve real thought.`,
    sortOrder: 7,
    questions: [
      {
        planet: "explore",
        prompt: "What are you choosing between?",
        explanation: "Define the decision.",
      },
      {
        planet: "explore",
        prompt: "What does each option give you?",
        explanation: "Look beyond a simple good-versus-bad framing.",
      },
      {
        planet: "express",
        prompt: "What scares you about each option?",
        explanation:
          "Fear can influence decisions without deserving the final vote.",
      },
      {
        planet: "stand",
        prompt: "If you had to choose today, which way would you lean?",
        explanation: "A temporary forced choice can reveal instinct.",
      },
      {
        planet: "explore",
        prompt: "What future are you imagining for each option?",
        explanation:
          "Notice whether those imagined futures are realistic or exaggerated.",
      },
      {
        planet: "explore",
        prompt:
          "What information do you still genuinely need before deciding?",
        explanation:
          "Separate useful uncertainty from endless overthinking.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "figuring_things_out_am_i_doing_this_for_me",
    title: "Am I Doing This for Me?",
    regionKey: "figuring_things_out",
    shortDescription: "You're wondering whether a goal is really yours.",
    situation: "You're wondering whether a goal is really yours.",
    openingTitle: "Am I Doing This for Me?",
    openingBody: `Sometimes it's hard to tell where your own ambition ends and everyone else's expectations begin.

This Orbit helps you separate the two.`,
    sortOrder: 8,
    questions: [
      {
        planet: "explore",
        prompt: "What are you working toward right now?",
        explanation: "Identify the goal.",
      },
      {
        planet: "explore",
        prompt: "Where did the idea that you should want this come from?",
        explanation: "Goals often have histories.",
      },
      {
        planet: "express",
        prompt: "How do you feel when you imagine actually achieving it?",
        explanation:
          "Excitement, relief, dread, pride, or emptiness can tell you something.",
      },
      {
        planet: "stand",
        prompt: "Would you still want this if nobody were impressed?",
        explanation: "Remove status from the equation.",
      },
      {
        planet: "explore",
        prompt: "What part of the goal genuinely belongs to you?",
        explanation:
          "A goal can be partly yours and partly influenced by others.",
      },
      {
        planet: "stand",
        prompt:
          "What would you choose differently if you trusted your own preferences more?",
        explanation: "Give your own voice more space.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "figuring_things_out_i_feel_stuck",
    title: "I Feel Stuck",
    regionKey: "figuring_things_out",
    shortDescription: "You know something needs to change but don't know how to move.",
    situation: "You know something needs to change but don't know how to move.",
    openingTitle: "I Feel Stuck",
    openingBody: `Sometimes you don't need a giant breakthrough.

You need to figure out what is actually keeping you in the same place.`,
    sortOrder: 9,
    questions: [
      {
        planet: "express",
        prompt: "What feels stuck right now?",
        explanation: "Put the feeling into a specific area of your life.",
      },
      {
        planet: "explore",
        prompt: "What have you already tried?",
        explanation: "Recognize what you've already done.",
      },
      {
        planet: "explore",
        prompt: "What are you waiting for before you move?",
        explanation:
          "Sometimes we create a condition that may never arrive.",
      },
      {
        planet: "stand",
        prompt: "What is one decision you've been avoiding?",
        explanation:
          "Avoided choices can create the feeling of being trapped.",
      },
      {
        planet: "explore",
        prompt: "What is the smallest next step that would actually count?",
        explanation: "Progress doesn't have to be dramatic.",
      },
      {
        planet: "express",
        prompt:
          "What would you tell yourself if you were talking to a friend in the same situation?",
        explanation: "Distance can make your thinking easier to hear.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "figuring_things_out_what_kind_of_person_do_i_want_to_be",
    title: "What Kind of Person Do I Want to Be?",
    regionKey: "figuring_things_out",
    shortDescription: "You're thinking about the kind of person you want to become.",
    situation: "You're thinking about the kind of person you want to become.",
    openingTitle: "What Kind of Person Do I Want to Be?",
    openingBody: `You don't need to know exactly who you're becoming.

But it can be interesting to think about what qualities you want to carry with you.`,
    sortOrder: 10,
    questions: [
      {
        planet: "explore",
        prompt: "Who is someone you genuinely respect?",
        explanation: "Admiration can reveal qualities that matter to you.",
      },
      {
        planet: "express",
        prompt: "What is it about them that you respect?",
        explanation: "Look underneath achievements or image.",
      },
      {
        planet: "explore",
        prompt: "What qualities do you already see in yourself?",
        explanation: "Growth isn't only about what's missing.",
      },
      {
        planet: "stand",
        prompt:
          "What is one value you want to keep even when it's inconvenient?",
        explanation: "Values matter most when they cost something.",
      },
      {
        planet: "connect",
        prompt: "How do you want people to feel when they're around you?",
        explanation: "Who you become affects others too.",
      },
      {
        planet: "explore",
        prompt: "Finish this: “I want to become someone who…”",
        explanation: "This is a snapshot, not a permanent definition.",
      },
    ],
  }),
];
