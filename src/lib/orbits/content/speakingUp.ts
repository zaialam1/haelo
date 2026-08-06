import { defineOrbit } from "../defineOrbit";
import type { OrbitDefinition } from "../types";

export const SPEAKING_UP_ORBITS: readonly OrbitDefinition[] = [
  defineOrbit({
    orbitKey: "speaking_up_draw_the_line",
    title: "Draw the Line",
    regionKey: "speaking_up",
    shortDescription: "Setting a boundary.",
    situation: "Setting a boundary.",
    openingTitle: "Draw the Line",
    openingBody: `Sometimes you know something bothers you, but actually saying “stop” feels much harder.

This Orbit helps you figure out where your line is and practice communicating it without turning yourself into someone you're not.`,
    sortOrder: 1,
    questions: [
      {
        planet: "explore",
        prompt: "What keeps happening that you don't want to keep happening?",
        explanation: "A boundary starts with identifying a behavior clearly.",
      },
      {
        planet: "explore",
        prompt: "Why does this matter to you?",
        explanation:
          "Understanding the reason helps you stand behind what you're asking for.",
      },
      {
        planet: "express",
        prompt: "How does it affect you when it happens?",
        explanation:
          "Putting the impact into words makes the boundary easier to understand.",
      },
      {
        planet: "stand",
        prompt:
          "What exactly do you want them to stop, start, or do differently?",
        explanation: "A specific request is stronger than “just be better.”",
      },
      {
        planet: "stand",
        prompt:
          "Say what you need without using “maybe,” “sorry,” or pretending it doesn't matter.",
        explanation: "This lets you hear your boundary without shrinking it.",
      },
      {
        planet: "connect",
        prompt:
          "Now say it in a way that stays firm while still sounding like you.",
        explanation:
          "Being clear and maintaining connection aren't opposites.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "speaking_up_i_need_to_ask",
    title: "I Need to Ask",
    regionKey: "speaking_up",
    shortDescription:
      "Asking for help, flexibility, clarification, permission, or support.",
    situation:
      "Asking for help, flexibility, clarification, permission, or support.",
    openingTitle: "I Need to Ask",
    openingBody: `Sometimes asking feels harder than needing.

This Orbit helps you get clear about what you want and practice making the request without apologizing for having one.`,
    sortOrder: 2,
    questions: [
      {
        planet: "explore",
        prompt: "What do you need right now?",
        explanation: "Make the request clear to yourself first.",
      },
      {
        planet: "express",
        prompt: "Why would this help you?",
        explanation:
          "Knowing your reason helps you explain the ask simply.",
      },
      {
        planet: "explore",
        prompt: "What makes asking uncomfortable?",
        explanation:
          "The fear around the request may be different from the request itself.",
      },
      {
        planet: "stand",
        prompt: "What is the simplest version of your ask?",
        explanation: "Clear requests are easier to respond to.",
      },
      {
        planet: "stand",
        prompt:
          "Practice asking without immediately taking the request back.",
        explanation:
          "You don't need to erase your ask before someone has answered.",
      },
      {
        planet: "connect",
        prompt:
          "How could you ask clearly while respecting the other person's position?",
        explanation: "Self-advocacy and consideration can coexist.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "speaking_up_i_disagree",
    title: "I Disagree",
    regionKey: "speaking_up",
    shortDescription: "Expressing an unpopular or different opinion.",
    situation: "Expressing an unpopular or different opinion.",
    openingTitle: "I Disagree",
    openingBody: `Having an opinion feels different when everyone around you has another one.

This Orbit helps you figure out what you actually believe and practice saying it without turning disagreement into a fight.`,
    sortOrder: 3,
    questions: [
      {
        planet: "explore",
        prompt: "What do you actually think?",
        explanation: "Start with your view before everyone else's reaction.",
      },
      {
        planet: "explore",
        prompt: "Why do you think that?",
        explanation:
          "Understanding your reasoning makes your position stronger.",
      },
      {
        planet: "express",
        prompt: "What part of your opinion is hardest to explain?",
        explanation:
          "You may know what you believe before knowing how to communicate it.",
      },
      {
        planet: "stand",
        prompt:
          "Say your opinion clearly without weakening it because someone might disagree.",
        explanation: "Practice hearing yourself take a real position.",
      },
      {
        planet: "connect",
        prompt:
          "What part of the other side can you genuinely understand?",
        explanation:
          "Understanding another view doesn't require abandoning yours.",
      },
      {
        planet: "stand",
        prompt:
          "Explain your opinion again while leaving room for disagreement.",
        explanation:
          "Confidence doesn't require certainty that everyone else is wrong.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "speaking_up_talking_to_a_teacher",
    title: "Talking to a Teacher",
    regionKey: "speaking_up",
    shortDescription:
      "Asking a teacher for help, clarification, reconsideration, or discussing a problem.",
    situation:
      "Asking a teacher for help, clarification, reconsideration, or discussing a problem.",
    openingTitle: "Talking to a Teacher",
    openingBody: `Talking to an adult with authority can make a simple question feel much bigger.

This Orbit helps you figure out what you need to communicate before you're standing in front of them.`,
    sortOrder: 4,
    questions: [
      {
        planet: "explore",
        prompt: "What do you need to talk to your teacher about?",
        explanation: "Define the actual issue.",
      },
      {
        planet: "express",
        prompt:
          "What part of the situation has been frustrating or difficult?",
        explanation:
          "Your experience matters, even if you communicate it respectfully.",
      },
      {
        planet: "stand",
        prompt: "What do you want your teacher to know?",
        explanation: "Identify your central message.",
      },
      {
        planet: "stand",
        prompt: "What are you asking them to do, if anything?",
        explanation:
          "Know whether you're asking for help, clarification, or change.",
      },
      {
        planet: "connect",
        prompt:
          "What might your teacher need to understand the situation from their side?",
        explanation: "Useful context can improve the conversation.",
      },
      {
        planet: "express",
        prompt: "Practice the first 30 seconds of the conversation.",
        explanation: "Starting is often the hardest part.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "speaking_up_saying_no",
    title: "Saying No",
    regionKey: "speaking_up",
    shortDescription: "Turning down something you don't want to do.",
    situation: "Turning down something the user doesn't want to do.",
    openingTitle: "Saying No",
    openingBody: `“No” is a complete idea.

But sometimes actually saying it feels like you need a whole legal defense.

This Orbit helps you understand why you're saying no and practice doing it without becoming harsh or disappearing into excuses.`,
    sortOrder: 5,
    questions: [
      {
        planet: "explore",
        prompt: "What are you being asked to do?",
        explanation: "Start with the situation itself.",
      },
      {
        planet: "explore",
        prompt: "Why don't you want to do it?",
        explanation: "Knowing your reason can strengthen your decision.",
      },
      {
        planet: "stand",
        prompt: "What are you afraid will happen if you say no?",
        explanation:
          "The reaction you're imagining may be making this difficult.",
      },
      {
        planet: "stand",
        prompt: "Say no in the simplest way you can.",
        explanation: "Practice without over-explaining.",
      },
      {
        planet: "connect",
        prompt: "Is there anything you genuinely want to offer instead?",
        explanation:
          "An alternative can be kind when authentic, but isn't required.",
      },
      {
        planet: "stand",
        prompt: "Say your final answer in a way that sounds like you.",
        explanation:
          "A boundary works best when you can actually imagine saying it.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "speaking_up_that_joke_isnt_funny_to_me",
    title: "That Joke Isn't Funny to Me",
    regionKey: "speaking_up",
    shortDescription:
      "Calling out teasing, jokes, comments, or behavior that crosses a line.",
    situation:
      "Calling out teasing, jokes, comments, or behavior that crosses a line.",
    openingTitle: "That Joke Isn't Funny to Me",
    openingBody: `Sometimes everyone else is laughing and you're the person wondering whether you're “allowed” to be bothered.

You are.

This Orbit helps you figure out what crossed the line and how you might say it.`,
    sortOrder: 6,
    questions: [
      {
        planet: "express",
        prompt: "What was said or done?",
        explanation: "Put the behavior itself into words.",
      },
      {
        planet: "explore",
        prompt: "What about it bothered you?",
        explanation:
          "Understanding the impact helps you communicate beyond “I didn't like it.”",
      },
      {
        planet: "stand",
        prompt:
          "What would you want them to know about how it landed?",
        explanation:
          "Their intention and your experience can be different.",
      },
      {
        planet: "stand",
        prompt: "What do you want them to do differently next time?",
        explanation: "Make the boundary concrete.",
      },
      {
        planet: "connect",
        prompt:
          "How could you say it without turning the person into the behavior?",
        explanation:
          "Challenge the action without attacking the whole person.",
      },
      {
        planet: "stand",
        prompt: "Practice saying the message directly.",
        explanation: "Hear what standing up for yourself sounds like.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "speaking_up_i_deserve_credit",
    title: "I Deserve Credit",
    regionKey: "speaking_up",
    shortDescription:
      "Someone is taking credit for or overlooking your work.",
    situation:
      "Someone is taking credit for or overlooking the user's work.",
    openingTitle: "I Deserve Credit",
    openingBody: `Speaking up about your own contribution can feel awkward.

But staying silent can leave other people with the wrong story.

This Orbit helps you advocate for your work without feeling like you need to brag.`,
    sortOrder: 7,
    questions: [
      {
        planet: "explore",
        prompt: "What did you contribute?",
        explanation: "Start with the facts.",
      },
      {
        planet: "express",
        prompt:
          "What bothers you about how the situation is being represented?",
        explanation: "Understand why speaking up matters.",
      },
      {
        planet: "stand",
        prompt: "What do you want people to know about your contribution?",
        explanation: "Decide what needs correcting.",
      },
      {
        planet: "connect",
        prompt:
          "How could you add your perspective without unnecessarily attacking someone else?",
        explanation:
          "Correct the record without creating another conflict.",
      },
      {
        planet: "stand",
        prompt:
          "What would you say if someone minimized your contribution?",
        explanation: "Prepare for resistance.",
      },
      {
        planet: "express",
        prompt:
          "Practice explaining your contribution confidently and simply.",
        explanation: "Owning your work is not exaggerating it.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "speaking_up_i_need_more_time",
    title: "I Need More Time",
    regionKey: "speaking_up",
    shortDescription:
      "Asking for time, space, an extension, or time to think.",
    situation: "Asking for time, space, an extension, or time to think.",
    openingTitle: "I Need More Time",
    openingBody: `Sometimes the most responsible answer isn't yes or no.

It's “I need a little more time.”

This Orbit helps you communicate that before pressure makes the decision for you.`,
    sortOrder: 8,
    questions: [
      {
        planet: "explore",
        prompt: "What do you need more time for?",
        explanation: "Get clear about the decision or task.",
      },
      {
        planet: "express",
        prompt: "What is making the current timeline difficult?",
        explanation: "Understand the pressure.",
      },
      {
        planet: "stand",
        prompt: "How much time do you actually need?",
        explanation: "A specific request is easier to respond to.",
      },
      {
        planet: "connect",
        prompt:
          "What does the other person need from you while they wait?",
        explanation: "Respect their needs too.",
      },
      {
        planet: "stand",
        prompt: "Practice asking for the extra time directly.",
        explanation:
          "You don't have to pretend you can meet an unrealistic timeline.",
      },
      {
        planet: "explore",
        prompt: "What will you do with the additional time if you get it?",
        explanation: "Know how you'll use the space you're requesting.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "speaking_up_stop_pressuring_me",
    title: "Stop Pressuring Me",
    regionKey: "speaking_up",
    shortDescription: "Peer pressure or pressure from another person.",
    situation: "Peer pressure or pressure from another person.",
    openingTitle: "Stop Pressuring Me",
    openingBody: `Sometimes you already know your answer.

The hard part is continuing to believe it when someone keeps pushing.

This Orbit helps you hold onto your decision under pressure.`,
    sortOrder: 9,
    questions: [
      {
        planet: "explore",
        prompt: "What are they trying to get you to do?",
        explanation: "Name the pressure clearly.",
      },
      {
        planet: "express",
        prompt: "What does the pressure make you feel?",
        explanation:
          "Pressure can create guilt, fear, embarrassment, or confusion.",
      },
      {
        planet: "stand",
        prompt: "What do you actually want to do?",
        explanation: "Reconnect with your own answer.",
      },
      {
        planet: "stand",
        prompt: "What do you want to say when they push again?",
        explanation: "Prepare your response.",
      },
      {
        planet: "connect",
        prompt:
          "Is there anything you want them to understand about why you're saying no?",
        explanation: "Explain only if you genuinely want to.",
      },
      {
        planet: "stand",
        prompt: "Say your answer as if they asked you one more time.",
        explanation: "Practice staying consistent.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "speaking_up_i_need_to_say_this",
    title: "I Need to Say This",
    regionKey: "speaking_up",
    shortDescription:
      "A difficult conversation that doesn't fit another Orbit.",
    situation: "A difficult conversation that does not fit another Orbit.",
    openingTitle: "I Need to Say This",
    openingBody: `You've been carrying something you want another person to know.

Maybe you keep rewriting the conversation in your head.

This Orbit gives you somewhere to say it first.`,
    sortOrder: 10,
    questions: [
      {
        planet: "explore",
        prompt: "What is the conversation you know you need to have?",
        explanation: "Name it without worrying about wording yet.",
      },
      {
        planet: "express",
        prompt: "What are you feeling about having it?",
        explanation:
          "Your emotions may explain why you've been avoiding it.",
      },
      {
        planet: "explore",
        prompt:
          "What is the single most important thing you want them to understand?",
        explanation: "Find the central message.",
      },
      {
        planet: "stand",
        prompt:
          "What are you afraid you won't be able to say once you're actually there?",
        explanation:
          "That's often the sentence worth practicing most.",
      },
      {
        planet: "connect",
        prompt:
          "What do you want the relationship to feel like after the conversation?",
        explanation:
          "Your goal can influence how you communicate.",
      },
      {
        planet: "stand",
        prompt:
          "Start the conversation out loud right now. What would you say first?",
        explanation:
          "Practicing the opening makes the real conversation more familiar.",
      },
    ],
  }),
];
