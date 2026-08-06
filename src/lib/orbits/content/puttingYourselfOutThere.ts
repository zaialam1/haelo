import { defineOrbit } from "../defineOrbit";
import type { OrbitDefinition } from "../types";

export const PUTTING_YOURSELF_OUT_THERE_ORBITS: readonly OrbitDefinition[] = [
  defineOrbit({
    orbitKey: "putting_yourself_out_there_i_have_an_idea",
    title: "I Have an Idea",
    regionKey: "putting_yourself_out_there",
    shortDescription: "You want to explain something you're excited about.",
    situation: "You want to explain something you're excited about.",
    openingTitle: "I Have an Idea",
    openingBody: `Ideas can feel obvious inside your own head and suddenly confusing when you try to explain them.

This Orbit helps you find the heart of your idea and practice sharing it.`,
    sortOrder: 1,
    questions: [
      {
        planet: "explore",
        prompt: "What is your idea? Explain it however it comes out.",
        explanation: "The first version only needs to exist.",
      },
      {
        planet: "express",
        prompt: "What part excites you most?",
        explanation: "Your energy can reveal the strongest part.",
      },
      {
        planet: "express",
        prompt: "Explain it in 30 seconds.",
        explanation: "Shortening it forces you to identify what matters most.",
      },
      {
        planet: "stand",
        prompt:
          "What do you believe about the idea even if someone doesn't immediately get it?",
        explanation:
          "Original ideas sometimes require tolerating uncertainty from others.",
      },
      {
        planet: "connect",
        prompt: "Why might someone else care?",
        explanation:
          "Good communication connects your enthusiasm to the listener.",
      },
      {
        planet: "express",
        prompt:
          "Pitch it as if the person listening is genuinely curious.",
        explanation: "Combine clarity, confidence, and excitement.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "putting_yourself_out_there_new_room",
    title: "New Room",
    regionKey: "putting_yourself_out_there",
    shortDescription: "You're walking into a new place, group, or situation.",
    situation: "You're walking into a new place, group, or situation.",
    openingTitle: "New Room",
    openingBody: `Walking into a new group can make you suddenly see yourself through everyone else's eyes.

This Orbit helps you enter something new without feeling like you have to invent a different person.`,
    sortOrder: 2,
    questions: [
      {
        planet: "explore",
        prompt: "What are you walking into?",
        explanation: "Give the nerves context.",
      },
      {
        planet: "express",
        prompt: "What are you most nervous about?",
        explanation:
          "A specific fear is easier to work with than “this is awkward.”",
      },
      {
        planet: "connect",
        prompt: "What kind of person would you actually like to meet there?",
        explanation:
          "Shift attention from being judged toward finding connection.",
      },
      {
        planet: "explore",
        prompt: "What version of yourself are you tempted to perform?",
        explanation:
          "New spaces can make us edit ourselves before anyone reacts.",
      },
      {
        planet: "connect",
        prompt: "What is one simple way you could start a conversation?",
        explanation:
          "Connection usually starts smaller than an amazing first impression.",
      },
      {
        planet: "stand",
        prompt:
          "What part of yourself do you not want to shrink just to fit in?",
        explanation: "Belonging shouldn't require disappearing.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "putting_yourself_out_there_this_matters_to_me",
    title: "This Matters to Me",
    regionKey: "putting_yourself_out_there",
    shortDescription: "Something important to you still needs clearer words.",
    situation: "Something important to you still needs clearer words.",
    openingTitle: "This Matters to Me",
    openingBody: `Some things feel important before you know how to explain why.

This Orbit helps you find the words for something you genuinely care about.`,
    sortOrder: 3,
    questions: [
      {
        planet: "explore",
        prompt:
          "What is something you care about more than people probably realize?",
        explanation: "Start with the thing itself.",
      },
      {
        planet: "explore",
        prompt: "Where do you think that feeling comes from?",
        explanation: "Origins can reveal meaning.",
      },
      {
        planet: "express",
        prompt: "Tell a story that captures why this matters to you.",
        explanation:
          "Stories often communicate meaning better than explanations.",
      },
      {
        planet: "stand",
        prompt: "What do you believe about this that you would defend?",
        explanation: "Values become clearer when challenged.",
      },
      {
        planet: "connect",
        prompt:
          "How would you explain it to someone who doesn't care about it yet?",
        explanation:
          "Understanding the listener makes communication stronger.",
      },
      {
        planet: "express",
        prompt:
          "Explain what this means to you without trying to sound impressive.",
        explanation:
          "Authentic explanations are often simpler than polished ones.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "putting_yourself_out_there_big_opportunity",
    title: "Big Opportunity",
    regionKey: "putting_yourself_out_there",
    shortDescription: "You're preparing to put yourself forward for something that matters.",
    situation: "You're preparing to put yourself forward for something that matters.",
    openingTitle: "Big Opportunity",
    openingBody: `Wanting something can make the possibility of not getting it feel much bigger.

This Orbit helps you separate excitement from pressure and practice showing up as yourself.`,
    sortOrder: 4,
    questions: [
      {
        planet: "explore",
        prompt: "What is the opportunity?",
        explanation: "Name what you're actually going after.",
      },
      {
        planet: "express",
        prompt: "Why do you want it?",
        explanation:
          "Your motivation can become an anchor when nerves appear.",
      },
      {
        planet: "explore",
        prompt: "What are you most afraid might happen?",
        explanation: "Fear becomes easier to manage when specific.",
      },
      {
        planet: "stand",
        prompt: "What do you know you're capable of bringing?",
        explanation:
          "Confidence can be grounded in evidence rather than hype.",
      },
      {
        planet: "express",
        prompt:
          "How would you introduce yourself if you didn't need to prove everything at once?",
        explanation:
          "You don't have to perform an entire identity in one moment.",
      },
      {
        planet: "connect",
        prompt:
          "What do you want the people on the other side to understand about you?",
        explanation:
          "Opportunities involve communication, not just evaluation.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "putting_yourself_out_there_tell_my_story",
    title: "Tell My Story",
    regionKey: "putting_yourself_out_there",
    shortDescription: "You want to share a story about yourself with more clarity.",
    situation: "You want to share a story about yourself with more clarity.",
    openingTitle: "Tell My Story",
    openingBody: `You have thousands of moments you could use to explain who you are.

The hard part is figuring out which ones actually say something meaningful.`,
    sortOrder: 5,
    questions: [
      {
        planet: "explore",
        prompt: "What is one experience that changed something about you?",
        explanation: "Stories become meaningful when something shifts.",
      },
      {
        planet: "explore",
        prompt: "What did you think before that experience?",
        explanation: "The “before” makes the change visible.",
      },
      {
        planet: "express",
        prompt:
          "Tell the story as if you're talking to someone who knows nothing about it.",
        explanation: "Give the story a real beginning, middle, and end.",
      },
      {
        planet: "express",
        prompt: "What did the experience teach you?",
        explanation: "Meaning comes from reflection, not just events.",
      },
      {
        planet: "connect",
        prompt: "Why might someone else relate to this story?",
        explanation: "Personal stories can still create connection.",
      },
      {
        planet: "stand",
        prompt: "What does this story say about who you are now?",
        explanation: "Practice owning the meaning without shrinking it.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "putting_yourself_out_there_i_want_to_lead",
    title: "I Want to Lead",
    regionKey: "putting_yourself_out_there",
    shortDescription: "You want to step into a leadership role or take initiative.",
    situation: "You want to step into a leadership role or take initiative.",
    openingTitle: "I Want to Lead",
    openingBody: `Leadership isn't only about being the loudest person in the room.

This Orbit helps you figure out why you want to lead and what kind of leader you actually want to be.`,
    sortOrder: 6,
    questions: [
      {
        planet: "explore",
        prompt: "Why do you want to lead this?",
        explanation: "Motivation matters.",
      },
      {
        planet: "stand",
        prompt: "What would you be willing to take responsibility for?",
        explanation:
          "Leadership includes ownership, not just influence.",
      },
      {
        planet: "connect",
        prompt: "What do the people you'd be leading actually need?",
        explanation: "Leadership is relational.",
      },
      {
        planet: "express",
        prompt: "What would you want the group to believe or work toward?",
        explanation: "Leaders need to communicate direction.",
      },
      {
        planet: "stand",
        prompt: "What would you do if people disagreed with you?",
        explanation:
          "Leadership becomes real when agreement isn't automatic.",
      },
      {
        planet: "connect",
        prompt: "How do you want people to feel working with you?",
        explanation: "The experience you create matters too.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "putting_yourself_out_there_showing_something_i_made",
    title: "Showing Something I Made",
    regionKey: "putting_yourself_out_there",
    shortDescription: "You're about to share something you created.",
    situation: "You're about to share something you created.",
    openingTitle: "Showing Something I Made",
    openingBody: `Making something and showing it to someone are two completely different experiences.

This Orbit helps you prepare for the vulnerable part where your work leaves your head and enters someone else's world.`,
    sortOrder: 7,
    questions: [
      {
        planet: "express",
        prompt: "What did you make?",
        explanation: "Describe it in your own words first.",
      },
      {
        planet: "explore",
        prompt: "What part are you most proud of?",
        explanation:
          "Your own opinion should exist before the audience reacts.",
      },
      {
        planet: "stand",
        prompt: "What part are you nervous people might judge?",
        explanation: "Naming vulnerability can reduce its control over you.",
      },
      {
        planet: "express",
        prompt:
          "What do you want someone to notice or understand about the work?",
        explanation: "Reveal your intention.",
      },
      {
        planet: "connect",
        prompt: "What kind of feedback would actually be helpful?",
        explanation: "Not all feedback serves the same purpose.",
      },
      {
        planet: "stand",
        prompt:
          "Introduce what you made without apologizing for it first.",
        explanation:
          "You don't have to insult your work before anyone else sees it.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "putting_yourself_out_there_speaking_in_front_of_people",
    title: "Speaking in Front of People",
    regionKey: "putting_yourself_out_there",
    shortDescription: "You need to speak in front of a group.",
    situation: "You need to speak in front of a group.",
    openingTitle: "Speaking in Front of People",
    openingBody: `Sometimes you know exactly what you want to say until a room full of people is looking at you.

This Orbit helps you prepare your message — and your relationship with the audience — before you step up.`,
    sortOrder: 8,
    questions: [
      {
        planet: "explore",
        prompt: "What are you speaking about?",
        explanation: "Reconnect with the subject instead of the fear.",
      },
      {
        planet: "express",
        prompt:
          "What is the most important idea you want people to remember?",
        explanation: "One clear message gives your talk an anchor.",
      },
      {
        planet: "stand",
        prompt: "What are you afraid the audience might think about you?",
        explanation: "Naming imagined judgment can reduce its power.",
      },
      {
        planet: "connect",
        prompt: "What does your audience actually need from you?",
        explanation: "Shift attention from yourself toward communication.",
      },
      {
        planet: "express",
        prompt: "Practice your opening out loud.",
        explanation: "A confident start can make everything after it easier.",
      },
      {
        planet: "stand",
        prompt:
          "Say the opening again without rushing to get it over with.",
        explanation: "Taking up time is part of taking up space.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "putting_yourself_out_there_talking_to_someone_new",
    title: "Talking to Someone New",
    regionKey: "putting_yourself_out_there",
    shortDescription: "You want to talk with someone you're just getting to know.",
    situation: "You want to talk with someone you're just getting to know.",
    openingTitle: "Talking to Someone New",
    openingBody: `You don't need the perfect opening line.

You mostly need somewhere to begin. This Orbit helps you take the pressure off making an impression and focus on creating an actual conversation.`,
    sortOrder: 9,
    questions: [
      {
        planet: "explore",
        prompt: "What makes you want to talk to this person?",
        explanation: "Know what draws you toward the interaction.",
      },
      {
        planet: "connect",
        prompt: "What is one genuine question you could ask them?",
        explanation:
          "Curiosity is often easier than performing confidence.",
      },
      {
        planet: "express",
        prompt: "What is something about yourself you could naturally share?",
        explanation: "Conversation works when both people contribute.",
      },
      {
        planet: "connect",
        prompt:
          "How could you keep the conversation going if they seem interested?",
        explanation: "Connection usually grows through follow-up.",
      },
      {
        planet: "explore",
        prompt: "What are you worried might be awkward?",
        explanation:
          "Naming the fear keeps it from silently running the interaction.",
      },
      {
        planet: "connect",
        prompt: "Practice how you might actually start talking to them.",
        explanation: "Make the first step familiar.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "putting_yourself_out_there_take_the_chance",
    title: "Take the Chance",
    regionKey: "putting_yourself_out_there",
    shortDescription: "There's a chance in front of you, and you're deciding whether to take it.",
    situation: "There's a chance in front of you, and you're deciding whether to take it.",
    openingTitle: "Take the Chance",
    openingBody: `Sometimes you know you want to try something and still keep finding reasons not to.

This Orbit doesn't tell you whether you should do it. It helps you understand what is pulling you forward and what is holding you back.`,
    sortOrder: 10,
    questions: [
      {
        planet: "explore",
        prompt: "What chance are you thinking about taking?",
        explanation: "Name the possibility clearly.",
      },
      {
        planet: "express",
        prompt: "What excites you about it?",
        explanation: "Remember why it caught your attention.",
      },
      {
        planet: "explore",
        prompt: "What are you afraid might happen?",
        explanation:
          "Fear deserves to be understood, not automatically obeyed.",
      },
      {
        planet: "stand",
        prompt:
          "What would you regret more: trying and failing or never finding out? Why?",
        explanation:
          "Different risks matter differently to different people.",
      },
      {
        planet: "stand",
        prompt: "If you decided to do it, what is the first actual step?",
        explanation: "Courage becomes more concrete when it has an action.",
      },
      {
        planet: "express",
        prompt:
          "Imagine you took the chance. Tell me why you're glad you tried.",
        explanation:
          "Hearing the possibility out loud can clarify how much you want it.",
      },
    ],
  }),
];
